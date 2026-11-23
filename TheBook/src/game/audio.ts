export type AudioZone =
  | 'title_intro'
  | 'title_menu'
  | 'village'
  | 'library'
  | 'finale'
  | 'seashore'
  | 'mountain'
  | 'house'
  | 'night'
  | 'portal_tunnel'
  | 'ch3_house'
  | 'woods'
  | 'elarion'
  | 'ch3_library'
  | 'escape'
  | 'bells'
  | 'pelicon_desert'
  | 'pelicon_battle'
  | 'pelicon_castle'
  | 'pelicon_reunion'
  | 'pelicon_town'
  | 'silent';

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private dialogueGain: GainNode | null = null;
  private zoneGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;
  private brookGain: GainNode | null = null;
  private riverSubFilter: BiquadFilterNode | null = null;
  private riverSubGain: GainNode | null = null;
  private riverCurrentFilter: BiquadFilterNode | null = null;
  private riverCurrentGain: GainNode | null = null;
  private riverBabbleFilter: BiquadFilterNode | null = null;
  private riverBabbleGain: GainNode | null = null;
  private riverPanner: StereoPannerNode | null = null;
  private forestWindFilter: BiquadFilterNode | null = null;
  private forestWindGain: GainNode | null = null;
  private forestLeafFilter: BiquadFilterNode | null = null;
  private forestLeafGain: GainNode | null = null;
  private forestPanner: StereoPannerNode | null = null;
  private libraryGain: GainNode | null = null;
  private flyGain: GainNode | null = null;
  private flyFilter: BiquadFilterNode | null = null;
  private oceanGain: GainNode | null = null;
  private oceanFilter: BiquadFilterNode | null = null;
  private fireGain: GainNode | null = null;

  private musicTimer: number | null = null;
  private birdTimer: number | null = null;
  private oceanTimer: number | null = null;
  private currentZone: AudioZone = 'title_intro';
  private ch1RiverProx = 0;
  private ch1ForestProx = 0;
  private ch1AmbienceActive = false;
  private volume = 0.75;
  private musicVol = 0.8;
  private sfxVol = 0.85;
  private dialogueVol = 0.9;
  private muted = false;
  private initialized = false;
  private noteIndex = 0;

  public unlock(): void {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.setupGraph();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  private setupGraph(): void {
    if (!this.ctx || this.initialized) return;
    this.initialized = true;

    const ctx = this.ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : this.volume;
    this.masterGain.connect(ctx.destination);

    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = this.musicVol;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = ctx.createGain();
    this.sfxGain.gain.value = this.sfxVol;
    this.sfxGain.connect(this.masterGain);

    this.dialogueGain = ctx.createGain();
    this.dialogueGain.gain.value = this.dialogueVol;
    this.dialogueGain.connect(this.masterGain);

    this.zoneGain = ctx.createGain();
    this.zoneGain.gain.value = 0.7;
    this.zoneGain.connect(this.sfxGain);

    // Procedural noise buffer for wind, brook water, ocean surf, fire, and flight airflow
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.04 * white) / 1.04;
      lastOut = data[i];
    }

    // Secondary longer uncorrelated pink/brown noise buffer for lush river & forest canopy loops
    const longSize = ctx.sampleRate * 4;
    const longNoiseBuffer = ctx.createBuffer(1, longSize, ctx.sampleRate);
    const lData = longNoiseBuffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < longSize; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + w * 0.029;
      b1 = 0.985 * b1 + w * 0.032;
      b2 = 0.95 * b2 + w * 0.048;
      lData[i] = Math.max(-1, Math.min(1, (b0 + b1 + b2 + w * 0.06) * 0.72));
    }

    // Wind ambience
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = noiseBuffer;
    windSrc.loop = true;
    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.value = 340;
    this.windFilter.Q.value = 1.6;
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0.09;
    windSrc.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.zoneGain);
    windSrc.start();

    // Flowing brook shimmer (zone bed)
    const brookSrc = ctx.createBufferSource();
    brookSrc.buffer = noiseBuffer;
    brookSrc.loop = true;
    const brookFilter = ctx.createBiquadFilter();
    brookFilter.type = 'bandpass';
    brookFilter.frequency.value = 1150;
    brookFilter.Q.value = 0.9;
    this.brookGain = ctx.createGain();
    this.brookGain.gain.value = 0.045;
    brookSrc.connect(brookFilter);
    brookFilter.connect(this.brookGain);
    this.brookGain.connect(this.zoneGain);
    brookSrc.start();

    // --- Chapter 1 Dedicated Procedural River Current Loop (Spatialized + LFO Flow) ---
    this.riverPanner = ctx.createStereoPanner();
    this.riverPanner.pan.value = 0;
    this.riverPanner.connect(this.zoneGain);

    // Layer A: Deep surging current / waterfall weight
    const riverSubSrc = ctx.createBufferSource();
    riverSubSrc.buffer = longNoiseBuffer;
    riverSubSrc.loop = true;
    this.riverSubFilter = ctx.createBiquadFilter();
    this.riverSubFilter.type = 'lowpass';
    this.riverSubFilter.frequency.value = 280;
    this.riverSubFilter.Q.value = 0.8;
    this.riverSubGain = ctx.createGain();
    this.riverSubGain.gain.value = 0.0;
    riverSubSrc.connect(this.riverSubFilter);
    this.riverSubFilter.connect(this.riverSubGain);
    this.riverSubGain.connect(this.riverPanner);
    riverSubSrc.start();

    // Layer B: Mid swirling river current
    const riverCurrSrc = ctx.createBufferSource();
    riverCurrSrc.buffer = longNoiseBuffer;
    riverCurrSrc.loop = true;
    riverCurrSrc.playbackRate.value = 1.07;
    this.riverCurrentFilter = ctx.createBiquadFilter();
    this.riverCurrentFilter.type = 'bandpass';
    this.riverCurrentFilter.frequency.value = 620;
    this.riverCurrentFilter.Q.value = 1.15;
    this.riverCurrentGain = ctx.createGain();
    this.riverCurrentGain.gain.value = 0.0;
    riverCurrSrc.connect(this.riverCurrentFilter);
    this.riverCurrentFilter.connect(this.riverCurrentGain);
    this.riverCurrentGain.connect(this.riverPanner);
    riverCurrSrc.start();

    // Layer C: Sparkling stone-bed brook babble
    const riverBabbleSrc = ctx.createBufferSource();
    riverBabbleSrc.buffer = noiseBuffer;
    riverBabbleSrc.loop = true;
    riverBabbleSrc.playbackRate.value = 1.21;
    this.riverBabbleFilter = ctx.createBiquadFilter();
    this.riverBabbleFilter.type = 'bandpass';
    this.riverBabbleFilter.frequency.value = 1650;
    this.riverBabbleFilter.Q.value = 1.5;
    this.riverBabbleGain = ctx.createGain();
    this.riverBabbleGain.gain.value = 0.0;
    riverBabbleSrc.connect(this.riverBabbleFilter);
    this.riverBabbleFilter.connect(this.riverBabbleGain);
    this.riverBabbleGain.connect(this.riverPanner);
    riverBabbleSrc.start();

    // Slow organic river surge LFOs
    const riverLfo1 = ctx.createOscillator();
    riverLfo1.type = 'sine';
    riverLfo1.frequency.value = 0.37;
    const riverLfo1Depth = ctx.createGain();
    riverLfo1Depth.gain.value = 165;
    riverLfo1.connect(riverLfo1Depth);
    riverLfo1Depth.connect(this.riverCurrentFilter.frequency);
    riverLfo1.start();

    const riverLfo2 = ctx.createOscillator();
    riverLfo2.type = 'sine';
    riverLfo2.frequency.value = 0.71;
    const riverLfo2Depth = ctx.createGain();
    riverLfo2Depth.gain.value = 340;
    riverLfo2.connect(riverLfo2Depth);
    riverLfo2Depth.connect(this.riverBabbleFilter.frequency);
    riverLfo2.start();

    // --- Chapter 1 Dedicated Procedural Forest Wind Loop (Canopy Breeze + Leaf Rustle) ---
    this.forestPanner = ctx.createStereoPanner();
    this.forestPanner.pan.value = 0;
    this.forestPanner.connect(this.zoneGain);

    const forestBreezeSrc = ctx.createBufferSource();
    forestBreezeSrc.buffer = longNoiseBuffer;
    forestBreezeSrc.loop = true;
    forestBreezeSrc.playbackRate.value = 0.89;
    this.forestWindFilter = ctx.createBiquadFilter();
    this.forestWindFilter.type = 'bandpass';
    this.forestWindFilter.frequency.value = 360;
    this.forestWindFilter.Q.value = 1.45;
    this.forestWindGain = ctx.createGain();
    this.forestWindGain.gain.value = 0.0;
    forestBreezeSrc.connect(this.forestWindFilter);
    this.forestWindFilter.connect(this.forestWindGain);
    this.forestWindGain.connect(this.forestPanner);
    forestBreezeSrc.start();

    const forestLeafSrc = ctx.createBufferSource();
    forestLeafSrc.buffer = noiseBuffer;
    forestLeafSrc.loop = true;
    forestLeafSrc.playbackRate.value = 1.33;
    this.forestLeafFilter = ctx.createBiquadFilter();
    this.forestLeafFilter.type = 'bandpass';
    this.forestLeafFilter.frequency.value = 2450;
    this.forestLeafFilter.Q.value = 1.8;
    this.forestLeafGain = ctx.createGain();
    this.forestLeafGain.gain.value = 0.0;
    forestLeafSrc.connect(this.forestLeafFilter);
    this.forestLeafFilter.connect(this.forestLeafGain);
    this.forestLeafGain.connect(this.forestPanner);
    forestLeafSrc.start();

    // Multi-second forest gust swell LFOs
    const forestGustLfo = ctx.createOscillator();
    forestGustLfo.type = 'sine';
    forestGustLfo.frequency.value = 0.14;
    const gustFreqDepth = ctx.createGain();
    gustFreqDepth.gain.value = 140;
    forestGustLfo.connect(gustFreqDepth);
    gustFreqDepth.connect(this.forestWindFilter.frequency);
    const gustLeafFreqDepth = ctx.createGain();
    gustLeafFreqDepth.gain.value = 520;
    forestGustLfo.connect(gustLeafFreqDepth);
    gustLeafFreqDepth.connect(this.forestLeafFilter.frequency);
    const gustPanDepth = ctx.createGain();
    gustPanDepth.gain.value = 0.35;
    forestGustLfo.connect(gustPanDepth);
    gustPanDepth.connect(this.forestPanner.pan);
    forestGustLfo.start();

    // Ocean surf layer for Chapter 2 seashore & coastal mountain
    const oceanSrc = ctx.createBufferSource();
    oceanSrc.buffer = noiseBuffer;
    oceanSrc.loop = true;
    this.oceanFilter = ctx.createBiquadFilter();
    this.oceanFilter.type = 'lowpass';
    this.oceanFilter.frequency.value = 420;
    this.oceanGain = ctx.createGain();
    this.oceanGain.gain.value = 0.0;
    oceanSrc.connect(this.oceanFilter);
    this.oceanFilter.connect(this.oceanGain);
    this.oceanGain.connect(this.zoneGain);
    oceanSrc.start();

    // Indoor fireplace crackle bed
    const fireSrc = ctx.createBufferSource();
    fireSrc.buffer = noiseBuffer;
    fireSrc.loop = true;
    const fireFilter = ctx.createBiquadFilter();
    fireFilter.type = 'bandpass';
    fireFilter.frequency.value = 760;
    fireFilter.Q.value = 1.1;
    this.fireGain = ctx.createGain();
    this.fireGain.gain.value = 0.0;
    fireSrc.connect(fireFilter);
    fireFilter.connect(this.fireGain);
    this.fireGain.connect(this.zoneGain);
    fireSrc.start();

    // Ench Library resonant harmonic bed
    const libOsc1 = ctx.createOscillator();
    const libOsc2 = ctx.createOscillator();
    libOsc1.type = 'sine';
    libOsc2.type = 'triangle';
    libOsc1.frequency.value = 110;
    libOsc2.frequency.value = 164.81;
    const libFilter = ctx.createBiquadFilter();
    libFilter.type = 'lowpass';
    libFilter.frequency.value = 420;
    this.libraryGain = ctx.createGain();
    this.libraryGain.gain.value = 0.0;
    libOsc1.connect(libFilter);
    libOsc2.connect(libFilter);
    libFilter.connect(this.libraryGain);
    this.libraryGain.connect(this.zoneGain);
    libOsc1.start();
    libOsc2.start();

    // Flight wind whoosh layer
    const flySrc = ctx.createBufferSource();
    flySrc.buffer = noiseBuffer;
    flySrc.loop = true;
    this.flyFilter = ctx.createBiquadFilter();
    this.flyFilter.type = 'bandpass';
    this.flyFilter.frequency.value = 500;
    this.flyFilter.Q.value = 2.0;
    this.flyGain = ctx.createGain();
    this.flyGain.gain.value = 0.0;
    flySrc.connect(this.flyFilter);
    this.flyFilter.connect(this.flyGain);
    this.flyGain.connect(this.sfxGain);
    flySrc.start();

    this.startMusicLoop();
    this.startBirdLoop();
    this.startOceanWaveLoop();
  }

  public isUnlocked(): boolean {
    return Boolean(this.ctx && this.ctx.state === 'running');
  }

  public setVolume(vol: number, muted: boolean): void {
    this.volume = Math.max(0, Math.min(1, vol));
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.muted ? 0 : this.volume,
        this.ctx.currentTime,
        0.05
      );
    }
  }

  public setChannelVolumes(params: {
    master: number;
    music: number;
    sfx: number;
    dialogue: number;
    muted: boolean;
  }): void {
    this.volume = Math.max(0, Math.min(1, params.master));
    this.musicVol = Math.max(0, Math.min(1, params.music));
    this.sfxVol = Math.max(0, Math.min(1, params.sfx));
    this.dialogueVol = Math.max(0, Math.min(1, params.dialogue));
    this.muted = params.muted;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.masterGain?.gain.setTargetAtTime(this.muted ? 0 : this.volume, now, 0.05);
    this.musicGain?.gain.setTargetAtTime(this.musicVol, now, 0.05);
    this.sfxGain?.gain.setTargetAtTime(this.sfxVol, now, 0.05);
    this.dialogueGain?.gain.setTargetAtTime(this.dialogueVol, now, 0.05);
  }

  public setZone(zone: AudioZone): void {
    this.currentZone = zone;
    if (
      !this.ctx ||
      !this.windGain ||
      !this.brookGain ||
      !this.libraryGain ||
      !this.oceanGain ||
      !this.fireGain
    ) {
      return;
    }
    const now = this.ctx.currentTime;
    const windVal =
      zone === 'title_intro'
        ? 0.055
        : zone === 'title_menu'
        ? 0.032
        : zone === 'village'
        ? 0.09
        : zone === 'seashore'
        ? 0.075
        : zone === 'mountain'
        ? 0.11
        : zone === 'house' || zone === 'ch3_house'
        ? 0.025
        : zone === 'night' || zone === 'woods'
        ? 0.058
        : zone === 'portal_tunnel'
        ? 0.08
        : zone === 'escape'
        ? 0.075
        : zone === 'bells'
        ? 0.068
        : zone === 'pelicon_desert' || zone === 'pelicon_battle'
        ? 0.125
        : zone === 'pelicon_town'
        ? 0.055
        : zone === 'pelicon_castle' || zone === 'pelicon_reunion'
        ? 0.018
        : zone === 'library' || zone === 'elarion' || zone === 'ch3_library'
        ? 0.022
        : zone === 'finale'
        ? 0.03
        : 0;
    const brookVal = zone === 'village' ? 0.05 : zone === 'mountain' ? 0.028 : zone === 'woods' || zone === 'elarion' ? 0.026 : 0;
    const libVal =
      zone === 'title_intro' || zone === 'title_menu'
        ? 0.095
        : zone === 'library' || zone === 'ch3_library'
        ? 0.085
        : zone === 'finale' || zone === 'portal_tunnel'
        ? 0.13
        : zone === 'woods' || zone === 'elarion' || zone === 'bells' || zone === 'pelicon_reunion'
        ? 0.06
        : zone === 'escape' || zone === 'pelicon_battle'
        ? 0.09
        : 0;
    const oceanVal =
      zone === 'seashore' ? 0.14 : zone === 'mountain' ? 0.055 : zone === 'house' ? 0.012 : 0;
    const fireVal = zone === 'house' ? 0.05 : zone === 'night' || zone === 'ch3_house' || zone === 'pelicon_battle' ? 0.028 : 0;

    this.windGain.gain.setTargetAtTime(windVal, now, 0.7);
    this.brookGain.gain.setTargetAtTime(brookVal, now, 0.7);
    this.libraryGain.gain.setTargetAtTime(libVal, now, 0.7);
    this.oceanGain.gain.setTargetAtTime(oceanVal, now, 0.7);
    this.fireGain.gain.setTargetAtTime(fireVal, now, 0.7);
  }

  public updateFlightAudio(isFlying: boolean, speed: number, brookProximity = 0.3): void {
    if (!this.ctx || !this.flyGain || !this.flyFilter) return;
    const now = this.ctx.currentTime;
    if (isFlying) {
      const norm = Math.min(1, speed / 18);
      this.flyGain.gain.setTargetAtTime(0.04 + norm * 0.14, now, 0.08);
      this.flyFilter.frequency.setTargetAtTime(360 + norm * 780, now, 0.08);
    } else {
      this.flyGain.gain.setTargetAtTime(0, now, 0.12);
    }

    if (this.brookGain && this.currentZone === 'village') {
      this.brookGain.gain.setTargetAtTime(0.02 + brookProximity * 0.06, now, 0.25);
    }
  }

  public updateChapter1Ambience(params: {
    active: boolean;
    riverProximity: number;
    waterfallProximity: number;
    riverPan: number;
    forestProximity: number;
    gustPhase: number;
  }): void {
    this.ch1AmbienceActive = params.active;
    this.ch1RiverProx = params.active ? params.riverProximity : 0;
    this.ch1ForestProx = params.active ? params.forestProximity : 0;

    if (
      !this.ctx ||
      !this.riverSubGain ||
      !this.riverSubFilter ||
      !this.riverCurrentGain ||
      !this.riverBabbleGain ||
      !this.riverPanner ||
      !this.forestWindGain ||
      !this.forestLeafGain
    ) {
      return;
    }

    const now = this.ctx.currentTime;
    if (!params.active) {
      this.riverSubGain.gain.setTargetAtTime(0, now, 0.35);
      this.riverCurrentGain.gain.setTargetAtTime(0, now, 0.35);
      this.riverBabbleGain.gain.setTargetAtTime(0, now, 0.35);
      this.forestWindGain.gain.setTargetAtTime(0, now, 0.35);
      this.forestLeafGain.gain.setTargetAtTime(0, now, 0.35);
      return;
    }

    const rProx = Math.max(0, Math.min(1, params.riverProximity));
    const wfProx = Math.max(0, Math.min(1, params.waterfallProximity));
    const fProx = Math.max(0, Math.min(1, params.forestProximity));
    const gustMod = 0.78 + 0.22 * Math.sin(params.gustPhase * 0.65);

    // River current intensity ramps strongly as Nate nears riverbanks, bridges, or waterwheel waterfalls
    const combinedWater = Math.min(1, rProx * 0.95 + wfProx * 0.45);
    this.riverPanner.pan.setTargetAtTime(params.riverPan, now, 0.18);
    this.riverSubFilter.frequency.setTargetAtTime(220 + wfProx * 210 + rProx * 70, now, 0.25);
    this.riverSubGain.gain.setTargetAtTime(0.015 + combinedWater * 0.14 + wfProx * 0.08, now, 0.22);
    this.riverCurrentGain.gain.setTargetAtTime(0.012 + rProx * 0.105 + wfProx * 0.04, now, 0.22);
    this.riverBabbleGain.gain.setTargetAtTime(0.008 + rProx * 0.085, now, 0.2);

    // Forest canopy wind + crisp rustling leaves swell inside wooded valley corridor
    this.forestWindGain.gain.setTargetAtTime(fProx * 0.11 * gustMod, now, 0.32);
    this.forestLeafGain.gain.setTargetAtTime(Math.max(0, fProx - 0.18) * 0.055 * gustMod, now, 0.32);
  }

  private startOceanWaveLoop(): void {
    if (this.oceanTimer !== null) return;
    this.oceanTimer = window.setInterval(() => {
      if (!this.ctx || !this.oceanFilter || !this.oceanGain) return;
      if (
        this.currentZone !== 'seashore' &&
        this.currentZone !== 'mountain' &&
        this.currentZone !== 'house'
      ) {
        return;
      }
      const now = this.ctx.currentTime;
      const baseFreq = this.currentZone === 'seashore' ? 320 : 240;
      const peakFreq = this.currentZone === 'seashore' ? 880 : 460;
      this.oceanFilter.frequency.setValueAtTime(baseFreq, now);
      this.oceanFilter.frequency.linearRampToValueAtTime(peakFreq, now + 1.8);
      this.oceanFilter.frequency.linearRampToValueAtTime(baseFreq, now + 4.4);
    }, 4600);
  }

  private startMusicLoop(): void {
    if (this.musicTimer !== null) return;
    const titleIntroScale = [146.83, 220.0, 261.63, 293.66, 329.63, 440.0, 523.25, 329.63];
    const titleMenuScale = [196.0, 246.94, 293.66, 349.23, 440.0, 523.25, 440.0, 293.66];
    const villageScale = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 659.25, 440.0];
    const libraryScale = [220.0, 261.63, 329.63, 392.0, 493.88, 523.25, 659.25, 392.0];
    const finaleScale = [146.83, 220.0, 261.63, 311.13, 392.0, 466.16, 523.25, 293.66];
    const seashoreScale = [246.94, 293.66, 329.63, 392.0, 440.0, 493.88, 587.33, 392.0];
    const mountainScale = [196.0, 246.94, 293.66, 329.63, 392.0, 440.0, 493.88, 329.63];
    const houseScale = [261.63, 329.63, 392.0, 440.0, 523.25, 392.0, 329.63, 293.66];
    const ch3HouseScale = [220.0, 246.94, 293.66, 329.63, 392.0, 329.63, 293.66, 246.94];
    const woodsScale = [220.0, 261.63, 311.13, 392.0, 440.0, 523.25, 440.0, 311.13];
    const elarionScale = [174.61, 220.0, 261.63, 329.63, 392.0, 440.0, 329.63, 220.0];
    const escapeScale = [146.83, 174.61, 220.0, 233.08, 293.66, 233.08, 220.0, 174.61];
    const bellsScale = [261.63, 329.63, 392.0, 493.88, 587.33, 659.25, 493.88, 392.0];
    const peliconDesertScale = [220.0, 233.08, 277.18, 293.66, 349.23, 392.0, 293.66, 233.08];
    const peliconBattleScale = [146.83, 174.61, 220.0, 246.94, 293.66, 329.63, 220.0, 174.61];
    const peliconCastleScale = [196.0, 246.94, 293.66, 369.99, 440.0, 369.99, 293.66, 246.94];
    const peliconReunionScale = [261.63, 329.63, 392.0, 440.0, 523.25, 493.88, 440.0, 392.0];
    const peliconTownScale = [293.66, 369.99, 440.0, 523.25, 587.33, 440.0, 392.0, 329.63];

    this.musicTimer = window.setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running' || this.muted || this.currentZone === 'silent') {
        return;
      }
      const scale =
        this.currentZone === 'title_intro'
          ? titleIntroScale
          : this.currentZone === 'title_menu'
          ? titleMenuScale
          : this.currentZone === 'village'
          ? villageScale
          : this.currentZone === 'library' || this.currentZone === 'ch3_library'
          ? libraryScale
          : this.currentZone === 'finale' || this.currentZone === 'portal_tunnel'
          ? finaleScale
          : this.currentZone === 'seashore'
          ? seashoreScale
          : this.currentZone === 'mountain'
          ? mountainScale
          : this.currentZone === 'house' || this.currentZone === 'night'
          ? houseScale
          : this.currentZone === 'ch3_house'
          ? ch3HouseScale
          : this.currentZone === 'woods'
          ? woodsScale
          : this.currentZone === 'elarion'
          ? elarionScale
          : this.currentZone === 'escape'
          ? escapeScale
          : this.currentZone === 'bells'
          ? bellsScale
          : this.currentZone === 'pelicon_desert'
          ? peliconDesertScale
          : this.currentZone === 'pelicon_battle'
          ? peliconBattleScale
          : this.currentZone === 'pelicon_castle'
          ? peliconCastleScale
          : this.currentZone === 'pelicon_reunion'
          ? peliconReunionScale
          : this.currentZone === 'pelicon_town'
          ? peliconTownScale
          : villageScale;

      const freq = scale[this.noteIndex % scale.length];
      this.noteIndex++;
      const fastTempo = this.currentZone === 'escape' || this.currentZone === 'pelicon_battle';
      this.playPluck(
        freq,
        fastTempo
          ? 1.1
          : this.currentZone === 'title_intro' ||
            this.currentZone === 'title_menu' ||
            this.currentZone === 'night' ||
            this.currentZone === 'woods' ||
            this.currentZone === 'elarion' ||
            this.currentZone === 'pelicon_reunion'
          ? 2.8
          : this.currentZone === 'finale'
          ? 1.8
          : 2.3,
        this.currentZone === 'house' || this.currentZone === 'ch3_house'
          ? 0.032
          : fastTempo
          ? 0.052
          : 0.042,
        this.currentZone === 'title_intro' ||
          this.currentZone === 'title_menu' ||
          this.currentZone === 'library' ||
          this.currentZone === 'seashore' ||
          this.currentZone === 'woods' ||
          this.currentZone === 'elarion' ||
          this.currentZone === 'ch3_library' ||
          this.currentZone === 'bells' ||
          this.currentZone === 'pelicon_reunion'
          ? 'sine'
          : 'triangle',
        'music'
      );

      if (this.noteIndex % 4 === 1) {
        this.playPadChord(freq * 0.5, fastTempo ? 2.1 : 3.8);
      }
    }, 1050);
  }

  private startBirdLoop(): void {
    if (this.birdTimer !== null) return;
    this.birdTimer = window.setInterval(() => {
      if (!this.ctx || this.ctx.state !== 'running' || this.muted) {
        return;
      }
      if (this.currentZone === 'village') {
        const birdChance = this.ch1AmbienceActive ? 0.3 + this.ch1ForestProx * 0.45 : 0.45;
        if (Math.random() < birdChance) {
          this.playBirdChirp();
        }
        if (this.ch1AmbienceActive && this.ch1RiverProx > 0.38 && Math.random() < this.ch1RiverProx * 0.72) {
          this.playWaterRippleAccent(this.ch1RiverProx);
        }
      } else if (this.currentZone === 'woods' && Math.random() > 0.45) {
        this.playBirdChirp();
      } else if (
        (this.currentZone === 'seashore' || this.currentZone === 'mountain') &&
        Math.random() > 0.48
      ) {
        this.playSeabirdCall();
      }
      if (this.currentZone === 'woods' && Math.random() > 0.58) {
        this.playWhisperCue();
      }
    }, 2600);
  }

  private playWaterRippleAccent(strength: number): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const drops = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < drops; i++) {
      const t = now + i * (0.14 + Math.random() * 0.12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const f = 540 + Math.random() * 520;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 1.48, t + 0.065);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.015 * strength, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.09);
    }
  }

  private playPluck(
    freq: number,
    duration: number,
    gainLevel: number,
    type: OscillatorType,
    bus: 'music' | 'sfx' | 'dialogue' = 'sfx'
  ): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    const targetBus =
      bus === 'music'
        ? this.musicGain ?? this.masterGain
        : bus === 'dialogue'
        ? this.dialogueGain ?? this.masterGain
        : this.sfxGain ?? this.masterGain;
    gain.connect(targetBus);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  private playPadChord(baseFreq: number, duration: number): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    [1, 1.5].forEach((mult) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * mult, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.022, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(this.musicGain ?? this.masterGain);
      osc.start(now);
      osc.stop(now + duration + 0.1);
    });
  }

  private playBirdChirp(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const chirps = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < chirps; i++) {
      const t = now + i * 0.13;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startF = 2100 + Math.random() * 900;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startF, t);
      osc.frequency.exponentialRampToValueAtTime(startF * 1.35, t + 0.06);
      osc.frequency.exponentialRampToValueAtTime(startF * 0.9, t + 0.1);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.025, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  }

  private playSeabirdCall(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const t = now + i * 0.38;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const f = 1450 + Math.random() * 350;
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.linearRampToValueAtTime(f * 1.18, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(f * 0.72, t + 0.3);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.022, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.34);
    }
  }

  public playFootstep(surface: 'grass' | 'stone' | 'wood' | 'sand'): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const base =
      surface === 'stone'
        ? 145
        : surface === 'wood'
        ? 112
        : surface === 'sand'
        ? 72
        : 88;
    osc.frequency.setValueAtTime(base + Math.random() * 20, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.07);
    gain.gain.setValueAtTime(surface === 'wood' ? 0.055 : 0.042, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playJump(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.14);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playVoiceCue(speaker: 'Nate' | 'Jafr' | 'Mother'): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    if (speaker === 'Jafr') {
      const notes = [440, 523.25, 587.33, 659.25];
      for (let i = 0; i < 4; i++) {
        window.setTimeout(() => {
          const f = notes[(i + Math.floor(Math.random() * 2)) % notes.length];
          this.playPluck(f, 0.16, 0.04, 'sine', 'dialogue');
        }, i * 75);
      }
    } else if (speaker === 'Nate') {
      this.playPluck(261.63, 0.25, 0.035, 'triangle', 'dialogue');
    } else {
      this.playPluck(329.63, 0.25, 0.035, 'sine', 'dialogue');
    }
  }

  public playObserveToggle(entering: boolean): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const freqs = entering ? [392, 587.33, 783.99] : [587.33, 392];
    freqs.forEach((f, i) => {
      window.setTimeout(() => this.playPluck(f, 0.35, 0.045, 'sine'), i * 55);
    });
  }

  public playWoodenCreak(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(115, now);
    osc.frequency.linearRampToValueAtTime(165, now + 0.25);
    osc.frequency.linearRampToValueAtTime(92, now + 0.65);
    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 340;
    gain.gain.setValueAtTime(0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
    osc.connect(lpf);
    lpf.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.75);
  }

  public playBoxOpen(): void {
    this.playWoodenCreak();
    window.setTimeout(() => this.playPluck(523.25, 0.45, 0.055, 'triangle'), 220);
  }

  public playItemCollect(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    [587.33, 783.99, 1046.5].forEach((f, i) => {
      window.setTimeout(() => this.playPluck(f, 0.5, 0.06, 'sine'), i * 85);
    });
  }

  public playFlightToggle(starting: boolean): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const notes = starting ? [440, 554.37, 659.25, 880] : [659.25, 440, 329.63];
    notes.forEach((f, idx) => {
      window.setTimeout(() => {
        this.playPluck(f, 0.6, 0.065, 'sine');
      }, idx * 55);
    });
  }

  public playMagicChime(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => {
      window.setTimeout(() => {
        this.playPluck(f, 1.1, 0.07, 'sine');
      }, i * 75);
    });
  }

  public playDoorOpen(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 1.1);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 180;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.25);
    this.playMagicChime();
  }

  public playPortalCrescendo(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;

    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(55, now);
    sub.frequency.exponentialRampToValueAtTime(165, now + 4.5);
    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(120, now);
    lpf.frequency.exponentialRampToValueAtTime(1800, now + 4.5);
    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.linearRampToValueAtTime(0.16, now + 3.8);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 6.2);
    sub.connect(lpf);
    lpf.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 6.3);

    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      window.setTimeout(() => this.playPluck(f, 3.0, 0.08, 'sine'), 1400 + idx * 240);
    });
  }

  public playRuneIgnite(index: number): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const runeNotes = [293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];
    const freq = runeNotes[index % runeNotes.length];
    this.playPluck(freq, 0.9, 0.06, 'sine');
    this.playPluck(freq * 1.5, 0.7, 0.028, 'triangle');
  }

  public playPortalInvestigate(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this.playPadChord(146.83, 3.2);
    [440, 523.25, 659.25, 880].forEach((f, i) => {
      window.setTimeout(() => this.playPluck(f, 1.4, 0.055, 'sine'), i * 110);
    });
  }

  public playPortalGateway(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this.playPortalCrescendo();
    this.playPadChord(220, 4.5);
  }

  public playBellToll(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    [220, 329.63, 440, 659.25].forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.09 / (idx + 1), now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 4.3);
    });
  }

  public playDoorKnock(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    [0, 0.22, 0.44].forEach((offset) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(52, t + 0.08);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.11);
    });
  }

  public playClockTick(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this.playPluck(880, 0.12, 0.035, 'triangle');
    window.setTimeout(() => this.playPluck(660, 0.12, 0.03, 'triangle'), 240);
  }

  public playWhisperCue(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const notes = [440, 493.88, 523.25];
    notes.forEach((f, idx) => {
      window.setTimeout(() => this.playPluck(f, 1.4, 0.018, 'sine'), idx * 210);
    });
  }

  public playPuzzleRotate(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this.playPluck(329.63, 0.3, 0.055, 'triangle');
    window.setTimeout(() => this.playPluck(493.88, 0.35, 0.04, 'sine'), 65);
  }

  public playPuzzleSolve(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this.playPadChord(196.0, 3.6);
    [392.0, 493.88, 587.33, 783.99, 987.77].forEach((f, idx) => {
      window.setTimeout(() => this.playPluck(f, 1.5, 0.065, 'sine'), idx * 120);
    });
  }

  public playMemoryVision(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this.playPadChord(164.81, 5.2);
    [523.25, 659.25, 783.99, 987.77, 1174.66].forEach((f, idx) => {
      window.setTimeout(() => this.playPluck(f, 2.1, 0.05, 'sine'), idx * 160);
    });
  }

  public playKeyTurn(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this.playPluck(783.99, 0.28, 0.06, 'triangle');
    window.setTimeout(() => this.playPluck(1046.5, 0.65, 0.07, 'sine'), 140);
    window.setTimeout(() => this.playDoorOpen(), 320);
  }

  public playShadowWarning(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this.playPadChord(110.0, 3.4);
    this.playBellToll();
  }

  public playUiClick(): void {
    this.playPluck(587.33, 0.16, 0.045, 'triangle');
  }

  public playSwordSwing(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.16);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  public playSwordHit(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this.playPluck(740, 0.22, 0.065, 'triangle');
    this.playPluck(1108.73, 0.26, 0.045, 'sine');
  }

  public playFireBow(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);
    gain.gain.setValueAtTime(0.075, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
    this.playPluck(880, 0.25, 0.04, 'triangle');
  }

  public playArcaneBow(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this.playPluck(523.25, 0.35, 0.06, 'sine');
    this.playPluck(783.99, 0.35, 0.055, 'triangle');
  }

  public playArcaneBurst(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const sub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(190, now);
    sub.frequency.exponentialRampToValueAtTime(52, now + 0.45);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
    sub.connect(gain);
    gain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 0.5);
    [659.25, 880, 1174.66].forEach((f, i) => {
      window.setTimeout(() => this.playPluck(f, 0.45, 0.045, 'sine'), i * 45);
    });
  }

  public playCrowdCheer(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    [392, 493.88, 587.33, 783.99, 987.77].forEach((f, i) => {
      window.setTimeout(() => this.playPluck(f, 0.85, 0.055, 'triangle'), i * 95);
    });
    this.playPadChord(293.66, 2.8);
  }

  public playSnailMove(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this.playPluck(680, 0.14, 0.04, 'sine');
    window.setTimeout(() => this.playPluck(860, 0.16, 0.035, 'sine'), 85);
  }

  public playMagicAwaken(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this.playPadChord(220, 4.4);
    [440, 554.37, 659.25, 880, 1108.73, 1318.51].forEach((f, i) => {
      window.setTimeout(() => this.playPluck(f, 1.5, 0.06, 'sine'), i * 115);
    });
  }

  public playSwordBlock(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this.playPluck(1318.5, 0.24, 0.08, 'triangle');
    this.playPluck(1975.5, 0.28, 0.055, 'sine');
    window.setTimeout(() => this.playPluck(880, 0.18, 0.04, 'triangle'), 45);
  }

  public playBowDraw(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(240, now + 0.14);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playUiHover(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this.playPluck(880, 0.07, 0.018, 'sine', 'sfx');
  }

  public playBookOpen(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const low = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    low.type = 'triangle';
    low.frequency.setValueAtTime(92, now);
    low.frequency.exponentialRampToValueAtTime(146.83, now + 0.6);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.07, now + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    low.connect(g);
    g.connect(this.sfxGain ?? this.masterGain);
    low.start(now);
    low.stop(now + 1.15);
    [293.66, 349.23, 440, 587.33].forEach((f, idx) => {
      window.setTimeout(() => this.playPluck(f, 1.4, 0.045, 'sine', 'music'), idx * 140);
    });
  }

  public playPageTurn(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * 0.28);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.sin((i / len) * Math.PI);
      ch[i] = (Math.random() * 2 - 1) * env * 0.45;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1450, now);
    filter.frequency.linearRampToValueAtTime(2400, now + 0.22);
    filter.Q.value = 1.4;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.075, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.sfxGain ?? this.masterGain);
    src.start(now);
  }

  public playBookClose(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(125, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.34);
    g.gain.setValueAtTime(0.11, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    osc.connect(g);
    g.connect(this.sfxGain ?? this.masterGain);
    osc.start(now);
    osc.stop(now + 0.4);
    this.playPluck(293.66, 1.3, 0.04, 'sine', 'music');
  }

  public playTitleReveal(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    this.playPadChord(146.83, 4.4);
    this.playPadChord(220.0, 4.0);
    [293.66, 440.0, 523.25, 659.25, 880.0].forEach((f, idx) => {
      window.setTimeout(() => this.playPluck(f, 2.2, 0.055, 'sine', 'music'), idx * 110);
    });
  }

  public playDodgeWhoosh(): void {
    if (!this.ctx || !this.masterGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(85, now + 0.2);
    gain.gain.setValueAtTime(0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.sfxGain ?? this.masterGain);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  public dispose(): void {
    if (this.musicTimer !== null) clearInterval(this.musicTimer);
    if (this.birdTimer !== null) clearInterval(this.birdTimer);
    if (this.oceanTimer !== null) clearInterval(this.oceanTimer);
    this.musicTimer = null;
    this.birdTimer = null;
    this.oceanTimer = null;
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}
