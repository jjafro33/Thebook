import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SoundEngine } from './audio';
import {
  animateEita,
  animateJafrExpression,
  animateLumi,
  animateMotherNpc,
  animateNate,
  animateOrvellan,
  animatePeliconWarrior,
  animateSneh,
  createEitaModel,
  createJafrModel,
  createNateModel,
  createEnchLibraryInterior,
  createPeliconWarriorModel,
  createSnehModel,
  type EitaRig,
  type JafrRig,
  type LibraryDynamicObjects,
  type NateCh2Pose,
  type NateRig,
  type PeliconWarriorRig,
  type SnehRig,
} from './models';
import {
  CH2_BED_POS,
  CH2_BOX_POS,
  CH2_DOOR_POS,
  CH2_INTERIOR_SPAWN,
  CH2_PORTAL_POS,
  CH2_SHORE_START_POS,
  CH2_TENT_POS,
  clampToCh2Corridor,
  createChapter2World,
  getCh2WalkSurface,
  updateChapter2Atmosphere,
  type Chapter2WorldObjects,
} from './chapter2World';
import {
  CH3_ARCHIVE_POS,
  CH3_BOOK_TOWER_POS,
  CH3_ELARION_SPAWN,
  CH3_EXTERIOR_DOOR_POS,
  CH3_INTERIOR_BED_POS,
  CH3_INTERIOR_DOOR_POS,
  CH3_LETTER_POS,
  CH3_LUMI_POS,
  CH3_NORTHERN_GATE_POS,
  CH3_ORVELLAN_POS,
  CH3_SIGN_POS,
  CH3_SPAWN_POS,
  CH3_STAIR_DESCENT_POS,
  CH3_STATUE_POS,
  CH3_STONES_PLATFORM_POS,
  CH3_VALLEY_SPAWN,
  clampToCh3Bounds,
  createChapter3World,
  getCh3WalkSurface,
  type Chapter3WorldObjects,
} from './chapter3World';
import {
  CH4_AGNES_CHURCH_POS,
  CH4_ARCANE_BOW_POS,
  CH4_BALCONY_EITA_POS,
  CH4_CASTLE_DOOR_POS,
  CH4_CASTLE_EXIT_DOOR_POS,
  CH4_CASTLE_INTERIOR_SPAWN,
  CH4_COURTYARD_POS,
  CH4_DESERT_SPAWN,
  CH4_DROPPED_SWORD_POS,
  CH4_EITA_DOOR_POS,
  CH4_EITA_ROOM_POS,
  CH4_FIRE_BOW_POS,
  CH4_JOURNAL_POS,
  CH4_OUTSKIRTS_POS,
  CH4_ROAD_ZONE_Z,
  CH4_SHELF_POS,
  CH4_TOWN_PLAZA_POS,
  CH4_WALL_ZONE_Z,
  CH4_WOUNDED_WARRIOR_POS,
  clampToCh4Bounds,
  createChapter4World,
  getCh4DesertTerrainHeight,
  getCh4WalkSurface,
  type Chapter4WorldObjects,
} from './chapter4World';
import { createProceduralTextures, type ProceduralTextures } from './textures';
import { createTitleWorld, updateTitleWorld, type TitleWorldRig } from './titleWorld';
import {
  DEFAULT_CH2_FLAGS,
  DEFAULT_CH3_FLAGS,
  DEFAULT_CH4_FLAGS,
  DEFAULT_KEY_BINDINGS,
  type ChapterNumber,
  type Ch2StoryFlags,
  type Ch3QuestEntry,
  type Ch3StoryFlags,
  type Ch3SubZone,
  type Ch4StoryFlags,
  type Ch4SubZone,
  type Ch4WeaponMode,
  type DialogueChoice,
  type DialogueEmotion,
  type DialogueLine,
  type GameMode,
  type GameSettings,
  type HudState,
  type IntroStage,
  type InventoryItem,
  type LetterModalContent,
  type MemoryPuzzleUiState,
  type MinimapMarker,
  type MinimapState,
  type ObservationMarker,
  type PortraitId,
  type SaveProgress,
  type SceneId,
} from './types';
import { createBrookVillageWorld, type VillageWorldObjects } from './villageWorld';
import {
  clampToGuidedCorridor,
  getBrookDistance,
  getChapter1AudioContext,
  getNearestPathInfo,
  getWalkSurfaceHeight,
  JOURNEY_CURVE,
  LIBRARY_PLAZA_POS,
  TOTAL_JOURNEY_METERS,
} from './worldPath';

const _vecA = new THREE.Vector3();
const _vecB = new THREE.Vector3();
const _camTargetPos = new THREE.Vector3();
const _camLookTarget = new THREE.Vector3();
const _projVec = new THREE.Vector3();

const MISSION_DIALOGUE: DialogueLine[] = [
  {
    speaker: 'Mother',
    portrait: 'mother',
    emotion: 'calm',
    text: 'Nate! Your Sensei told me about a book. You need to collect it from the Ench Library.',
  },
  {
    speaker: 'Nate',
    portrait: 'nate',
    emotion: 'happy',
    text: 'Okay, Mom!',
    note: 'Jafr wiggles his eyestalks eagerly beside Nate.',
  },
  {
    speaker: 'Mother',
    portrait: 'mother',
    emotion: 'concerned',
    text: 'Make sure you bring the correct book.',
  },
  {
    speaker: 'Nate',
    portrait: 'nate',
    emotion: 'happy',
    text: "Don't worry!",
  },
];

const PORTAL_DISCOVERY_DIALOGUE: DialogueLine[] = [
  {
    speaker: 'Jafr',
    portrait: 'jafr',
    emotion: 'surprised',
    text: 'Nate! Look over there!',
    note: 'Jafr turns toward a strange blue-violet shimmer on the rocky platform beside the house.',
  },
  {
    speaker: 'Jafr',
    portrait: 'jafr',
    emotion: 'curious',
    text: 'What is that strange thing?',
    note: 'High upon the terrace stands an ancient carved circular stone archway.',
  },
  {
    speaker: 'Jafr',
    portrait: 'jafr',
    emotion: 'surprised',
    text: 'That looks like some kind of ancient portal!',
    note: 'Carved runes ignite one by one as the swirling blue-cyan energy field stirs.',
  },
  {
    speaker: 'Jafr',
    portrait: 'jafr',
    emotion: 'curious',
    text: 'Do you think it leads somewhere?',
    note: 'Nate stares in wide-eyed astonishment.',
  },
  {
    speaker: 'Jafr',
    portrait: 'jafr',
    emotion: 'happy',
    text: "Well... I guess there's only one way to find out!",
    note: 'Head up the stone steps beside the house and press E to investigate the portal.',
  },
];

const MORNING_LETTER_CONTENT: LetterModalContent = {
  title: 'The Forgotten Letter',
  sender: 'The Last Keeper',
  body: [
    'To the boy who came from the Book...',
    'If you are reading this, the door has chosen to open. Follow what was left behind before the seventh bell tolls.',
  ],
  footer: '– The Last Keeper',
  goldenSymbol: true,
};

const CH3_ARRIVAL_LINES: DialogueLine[] = [
  { speaker: 'Nate', portrait: 'nate', emotion: 'surprised', text: 'Where are we now?', note: 'Sunlight filters faintly through an unfamiliar misty clearing.' },
  { speaker: 'Jafr', portrait: 'jafr', emotion: 'curious', text: "This isn't the island..." },
  { speaker: 'Jafr', portrait: 'jafr', emotion: 'concerned', text: "That house... we didn't see it before." },
  { speaker: 'Jafr', portrait: 'jafr', emotion: 'calm', text: 'Wait. The Book brought us here for a reason. Let us check inside the house and rest first.' },
];

export interface SaveCheckpointPayload {
  chapter: ChapterNumber;
  checkpointScene: SceneId;
  chapter1Completed: boolean;
  chapter2Completed: boolean;
  chapter3Completed: boolean;
  chapter4Completed?: boolean;
  distanceRemaining: number;
  playerPosition?: { x: number; y: number; z: number } | null;
  playerYaw?: number;
  energy?: number;
  timeOfDay?: number;
  inventory?: InventoryItem[];
  storyFlags?: Ch2StoryFlags;
  ch3Flags?: Ch3StoryFlags;
  ch4Flags?: Ch4StoryFlags;
}

export class GameEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private isSoftwareGl: boolean;
  private frameId = 0;
  private disposed = false;

  private tex: ProceduralTextures;
  private sound = new SoundEngine();

  private village: VillageWorldObjects;
  private library: LibraryDynamicObjects;
  private ch2World: Chapter2WorldObjects;
  private ch3World: Chapter3WorldObjects;
  private ch4World: Chapter4WorldObjects;
  private titleWorld: TitleWorldRig;
  private nate: NateRig;
  private jafr: JafrRig;
  private eita: EitaRig;
  private sneh: SnehRig;
  private ch4WoundedWarrior: PeliconWarriorRig;

  // Lighting
  private hemiLight: THREE.HemisphereLight;
  private sunLight: THREE.DirectionalLight;

  // Particles
  private weatherPoints: THREE.Points;
  private weatherPositions: Float32Array;
  private flyTrailPoints: THREE.Points;
  private flyTrailPositions: Float32Array;
  private flyTrailIdx = 0;
  private portalGroup: THREE.Group;
  private portalRings: THREE.Mesh[] = [];

  // Player state
  private playerPos = new THREE.Vector3(0, 0, 0);
  private playerVel = new THREE.Vector3(0, 0, 0);
  private playerYaw = Math.PI; // Facing -Z along path
  private camYaw = Math.PI;
  private camPitch = 0.28;
  private isGrounded = true;
  private isFlying = false;
  private fallPeakY = 0;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private footstepAccum = 0;
  private hasBook = false;
  private isSitting = false;
  private shocked = false;

  // Jafr companion state
  private jafrPos = new THREE.Vector3(0.9, 0, 0.5);
  private jafrYaw = Math.PI;
  private jafrMood: 'curious' | 'excited' | 'talking' | 'resting' | 'sleeping' | 'alert' = 'curious';

  // Chapter 2 state
  private energy = 100;
  private timeOfDay = 0.05; // 0.0 Sunset -> 0.45 Evening -> 0.78 Night -> 1.0 Morning
  private ch2Flags: Ch2StoryFlags = { ...DEFAULT_CH2_FLAGS };
  private inventory: InventoryItem[] = [];
  private inventoryOpen = false;
  private itemToast: string | null = null;
  private itemToastTimer = 0;
  private observationMode = false;
  private ch2DoorOpening = false;
  private ch2DoorTimer = 0;
  private boxAnimTimer = 0;
  private boxOpening = false;
  private discoveryTimer = 0;
  private restModalOpen = false;
  private isResting = false;
  private isSleeping = false;
  private sleepTimer = 0;
  private jafrRevealStep = 0;
  private ch2Dialogue: DialogueLine | null = null;
  private ch2DialogueTimer = 0;
  private autosaveTimer = 0;
  private saveStatus: 'idle' | 'saving' | 'saved' = 'idle';
  private saveStatusTimer = 0;
  private checkpointBannerTimer = 0;
  private jafrStatusText = 'Perched on right shoulder';
  private ch2PostCompleteExplore = false;
  private ch2PortalCompleted = false;

  // Chapter 2 Portal Discovery, Investigation & Gateway Finale states
  private portalDiscoveryActive = false;
  private portalDiscoveryTimer = 0;
  private portalDiscoveryStep = 0;
  private litRunesCount = 0;
  private portalInvestigateActive = false;
  private portalInvestigateTimer = 0;
  private portalFinaleActive = false;
  private portalFinaleTimer = 0;
  private portalFinaleStep = 0;

  // Chapter 3 state
  private ch3Flags: Ch3StoryFlags = { ...DEFAULT_CH3_FLAGS };
  private letterOpen: LetterModalContent | null = null;
  private ch3PortalTunnelActive = false;
  private ch3PortalTunnelTimer = 0;
  private ch3ArrivalLineStep = 0;
  private ch3MorningWakeActive = false;
  private ch3MorningWakeTimer = 0;
  private ch3DoorAnimActive = false;
  private ch3DoorAnimTimer = 0;
  private ch3ClockAnimTimer = 0;
  private ch3CompassLookTimer = 0;
  private ch3PuzzleOpen = false;
  private ch3PuzzleFeedback: string | null = null;
  private ch3MemoryVisionActive = false;
  private ch3MemoryVisionTimer = 0;
  private ch3OrvellanMenuActive = false;
  private ch3OrvellanChoiceDialogue: DialogueLine | null = null;
  private ch3ArchiveCinematicActive = false;
  private ch3ArchiveTimer = 0;
  private ch3ArchiveNamesVisible = false;
  private ch3EscapeTimer = 0;
  private ch3EscapeJafrWarn1 = false;
  private ch3EscapeJafrWarn2 = false;
  private ch3BellFinaleActive = false;
  private ch3BellFinaleTimer = 0;
  private ch3BellFinalePhase: 'gate' | 'valley' = 'gate';
  private ch3BannerTimer = 0;
  private ch3BannerTitle: string | null = null;
  private ch3BannerSubtitle: string | null = null;
  private questLogOpen = false;
  private whiteFadeAlpha = 0;

  // Chapter 4 state
  private ch4Flags: Ch4StoryFlags = { ...DEFAULT_CH4_FLAGS };
  private ch4Health = 100;
  private stamina = 100;
  private ch4SwordSwingTimer = 0;
  private ch4SwordHitTimer = 0;
  private ch4ComboStep = 0;
  private ch4ComboResetTimer = 0;
  private ch4IsBlocking = false;
  private ch4DodgeTimer = 0;
  private ch4DodgeDir = new THREE.Vector3();
  private ch4BowCooldown = 0;
  private ch4IsAiming = false;
  private mouseLeftDown = false;
  private autoDialogue = false;
  private autoDialogueTimer = 0;
  private missionCamLook = new THREE.Vector3(-0.3, 1.25, 6.5);
  private ch4CutscenePhase:
    | 'none'
    | 'portal'
    | 'fall_intro'
    | 'wounded'
    | 'victory'
    | 'balcony'
    | 'reunion'
    | 'magic_awaken'
    | 'outskirts_end' = 'none';
  private ch4CutsceneTimer = 0;
  private ch4CutsceneStep = 0;
  private ch4BannerTitle: string | null = null;
  private ch4BannerSubtitle: string | null = null;
  private ch4BannerTimer = 0;
  private ch4Warriors: Array<{
    id: string;
    team: 'ally' | 'enemy';
    zone: 1 | 2 | 3;
    rig: PeliconWarriorRig;
    pos: THREE.Vector3;
    yaw: number;
    hp: number;
    maxHp: number;
    cooldown: number;
    dead: boolean;
    vanishTimer: number;
    phase: number;
    homePos: THREE.Vector3;
  }> = [];
  private ch4Projectiles: Array<{
    kind: 'fire' | 'arcane' | 'enemy';
    mesh: THREE.Group;
    pos: THREE.Vector3;
    vel: THREE.Vector3;
    life: number;
  }> = [];
  private ch4VfxRings: Array<{
    mesh: THREE.Mesh;
    life: number;
    maxLife: number;
    targetScale: number;
  }> = [];
  private ch4EitaPos = new THREE.Vector3();
  private ch4EitaYaw = 0;
  private ch4EitaWalkPhase = 0;
  private ch4EitaWalking = false;
  private ch4EitaExpression: DialogueEmotion | 'gentle' | 'smile' | 'hug' = 'gentle';
  private ch4EitaTalking = false;
  private ch4SnehPos = new THREE.Vector3();
  private ch4SnehMode: 'idle' | 'crawl' | 'talk' | 'roll' = 'idle';
  private ch4SnehAttachedToEita = false;
  private ch4JafrDetached = false;
  private ch4JafrDetachedPos = new THREE.Vector3();
  private ch4JournalCollected = false;
  private ch4LastWallCheck = 0;

  // Game progression & timers
  private mode: GameMode = 'title';
  private sceneId: SceneId = 'title';
  private sceneTimer = 0;
  private totalTime = 0;
  private dialogueIdx = 0;
  private tutorialFlyTime = 0;
  private doorOpening = false;
  private doorOpenProgress = 0;
  private fadeAlpha = 0;
  private portalGlowAlpha = 0;
  private ambientBubble: DialogueLine | null = null;
  private ambientTimer = 0;
  private greetingStep = 0;
  private gameOverReason: string | null = null;
  private latestCheckpoint: SceneId = 'scene_3_journey';
  private introStage: IntroStage = 'intro_dark';
  private introElapsed = 0;
  private introCueFlags = {
    opened: false,
    pages: [false, false, false, false, false],
    title: false,
    closed: false,
  };
  private titlePointerNdc = { x: 0, y: 0 };

  // Input state
  private keys = new Set<string>();
  private isDragging = false;
  private pointerLocked = false;
  private settings: GameSettings;

  // Callbacks to React UI
  private onHudUpdate: (hud: HudState) => void;
  private onSaveCheckpoint: (payload: SaveCheckpointPayload) => void;
  private lastHudEmit = 0;
  private lastHudKey = '';

  constructor(
    container: HTMLElement,
    initialSettings: GameSettings,
    onHudUpdate: (hud: HudState) => void,
    onSaveCheckpoint: (payload: SaveCheckpointPayload) => void
  ) {
    this.container = container;
    this.settings = {
      ...initialSettings,
      keyBindings: { ...DEFAULT_KEY_BINDINGS, ...(initialSettings.keyBindings ?? {}) },
    };
    this.onHudUpdate = onHudUpdate;
    this.onSaveCheckpoint = onSaveCheckpoint;

    // 1. Software WebGL probe
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.98;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    this.renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x95b6c2);
    this.scene.fog = new THREE.FogExp2(0x95b6c2, 0.0038);

    const aspect = (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(58, aspect, 0.15, 650);

    // Mandatory studio environment reflection
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Textures & Audio
    this.tex = createProceduralTextures(this.renderer.capabilities.getMaxAnisotropy());
    this.sound.setChannelVolumes({
      master: this.settings.masterVolume,
      music: this.settings.musicVolume,
      sfx: this.settings.sfxVolume,
      dialogue: this.settings.dialogueVolume,
      muted: this.settings.muted,
    });

    // Lighting rig
    this.hemiLight = new THREE.HemisphereLight(0xcbe8f6, 0x3b5832, 0.78);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff1d6, 1.45);
    this.sunLight.position.set(28, 48, 20);
    this.sunLight.castShadow = !this.isSoftwareGl;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    const d = 34;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 140;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight, this.sunLight.target);

    // Worlds
    this.titleWorld = createTitleWorld(this.tex);
    this.titleWorld.group.visible = false;
    this.scene.add(this.titleWorld.group);

    this.village = createBrookVillageWorld(this.tex);
    this.scene.add(this.village.group);

    this.library = createEnchLibraryInterior(this.tex);
    this.library.group.visible = false;
    this.scene.add(this.library.group);

    this.ch2World = createChapter2World(this.tex);
    this.ch2World.group.visible = false;
    this.scene.add(this.ch2World.group);

    this.ch3World = createChapter3World(this.tex);
    this.ch3World.group.visible = false;
    this.scene.add(this.ch3World.group);

    this.ch4World = createChapter4World(this.tex);
    this.ch4World.group.visible = false;
    this.scene.add(this.ch4World.group);

    // Characters
    this.nate = createNateModel(this.tex);
    this.jafr = createJafrModel(this.tex);
    this.eita = createEitaModel(this.tex);
    this.eita.root.visible = false;
    this.sneh = createSnehModel(this.tex);
    this.sneh.root.visible = false;
    this.ch4WoundedWarrior = createPeliconWarriorModel(this.tex, 'wounded');
    this.ch4WoundedWarrior.root.visible = false;
    this.scene.add(this.nate.root, this.jafr.root, this.eita.root, this.sneh.root, this.ch4WoundedWarrior.root);
    this.initCh4Warriors();

    // Weather / Magic Snowfall-like Particles
    const pCount = 420;
    this.weatherPositions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      this.weatherPositions[i * 3] = (Math.random() - 0.5) * 60;
      this.weatherPositions[i * 3 + 1] = Math.random() * 28;
      this.weatherPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    const weatherGeo = new THREE.BufferGeometry();
    weatherGeo.setAttribute('position', new THREE.BufferAttribute(this.weatherPositions, 3));
    this.weatherPoints = new THREE.Points(
      weatherGeo,
      new THREE.PointsMaterial({
        map: this.tex.softParticle,
        color: 0xe6f4fa,
        size: 0.28,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      })
    );
    this.weatherPoints.frustumCulled = false;
    this.scene.add(this.weatherPoints);

    // Flying Trail Particles
    const trailCount = 90;
    this.flyTrailPositions = new Float32Array(trailCount * 3);
    for (let i = 0; i < trailCount; i++) {
      this.flyTrailPositions[i * 3 + 1] = -999;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(this.flyTrailPositions, 3));
    this.flyTrailPoints = new THREE.Points(
      trailGeo,
      new THREE.PointsMaterial({
        map: this.tex.softParticle,
        color: 0x72efdd,
        size: 0.42,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      })
    );
    this.flyTrailPoints.frustumCulled = false;
    this.scene.add(this.flyTrailPoints);

    // Final Cinematic Portal Rings
    this.portalGroup = new THREE.Group();
    this.portalGroup.visible = false;
    for (let r = 0; r < 5; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.1 + r * 0.75, 0.06, 8, 36),
        new THREE.MeshBasicMaterial({
          color: r % 2 === 0 ? 0xffd166 : 0x6fe7ff,
          transparent: true,
          opacity: 0.85,
        })
      );
      this.portalGroup.add(ring);
      this.portalRings.push(ring);
    }
    this.scene.add(this.portalGroup);

    if (!this.isSoftwareGl) {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      this.composer = new EffectComposer(this.renderer);
      this.composer.setPixelRatio(this.renderer.getPixelRatio());
      this.composer.setSize(w, h);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(w, h),
        0.055, // crisp AAA highlight bloom with zero halo washout
        0.30,
        1.10
      );
      this.composer.addPass(this.bloomPass);
      this.composer.addPass(new OutputPass());
      this.renderer.compile(this.scene, this.camera);
    }

    this.applyGraphicsSettings();
    this.bindEvents();
    this.enterScene('title');
    this.startLoop();
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleWindowBlur);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);

    const dom = this.renderer.domElement;
    dom.addEventListener('mousedown', this.handleMouseDown);
    dom.addEventListener('contextmenu', this.handleContextMenu);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    dom.addEventListener('webglcontextlost', this.handleContextLost);
  }

  private handleContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
  };

  private handleContextLost = (e: Event): void => {
    e.preventDefault();
  };

  private handleResize = (): void => {
    if (this.disposed) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer?.setSize(w, h);
    this.bloomPass?.resolution.set(w, h);
  };

  private handleWindowBlur = (): void => {
    this.keys.clear();
    this.isDragging = false;
  };

  private handlePointerLockChange = (): void => {
    this.pointerLocked = document.pointerLockElement === this.renderer.domElement;
    // Open Pause Menu when user presses ESC to release pointer lock, unless exiting lock for an active modal/cutscene/sequence
    if (
      !this.pointerLocked &&
      this.mode === 'playing' &&
      this.isPlayableScene() &&
      !this.restModalOpen &&
      !this.inventoryOpen &&
      !this.letterOpen &&
      !this.ch3PuzzleOpen &&
      !this.questLogOpen &&
      !this.ch3OrvellanMenuActive &&
      !this.ch3PortalTunnelActive &&
      !this.ch3MorningWakeActive &&
      !this.ch3DoorAnimActive &&
      !this.ch3MemoryVisionActive &&
      !this.ch3ArchiveCinematicActive &&
      !this.isResting &&
      !this.isSleeping &&
      !this.boxOpening &&
      !this.ch2DoorOpening &&
      !this.portalDiscoveryActive &&
      !this.portalInvestigateActive &&
      !this.portalFinaleActive &&
      !this.ch3BellFinaleActive &&
      this.ch4CutscenePhase === 'none' &&
      !this.doorOpening
    ) {
      this.setPaused(true);
    }
    this.emitHud(true);
  };

  private handleMouseDown = (e: MouseEvent): void => {
    this.sound.unlock();
    if (this.mode !== 'playing') return;
    if (this.sceneId === 'scene_2_mission') {
      this.advanceDialogue();
      return;
    }
    if (this.sceneId === 'ch2_scene_2_jafr_reveal') {
      this.advanceCh2RevealStep();
      return;
    }
    if (this.portalDiscoveryActive) {
      this.advancePortalDiscoveryStep();
      return;
    }
    if (this.portalFinaleActive && this.portalFinaleStep < 2) {
      this.advancePortalFinaleDialogue();
      return;
    }
    if (this.ch3PortalTunnelActive && this.ch3PortalTunnelTimer >= 8.2) {
      this.advanceCh3ArrivalDialogue();
      return;
    }
    if (this.isChapter4Scene() && this.ch4CutscenePhase !== 'none') {
      this.advanceCh4CutsceneStep();
      return;
    }
    if (
      this.restModalOpen ||
      this.inventoryOpen ||
      this.letterOpen ||
      this.ch3PuzzleOpen ||
      this.questLogOpen ||
      this.ch3OrvellanMenuActive
    ) {
      return;
    }
    if (this.isPlayableScene()) {
      this.isDragging = true;
      if (e.button === 0) {
        this.mouseLeftDown = true;
        if (
          this.isChapter4Scene() &&
          (this.ch4Flags.activeWeapon === 'fire_bow' || this.ch4Flags.activeWeapon === 'arcane_bow')
        ) {
          this.ch4IsAiming = true;
          this.ch4IsBlocking = false;
          this.sound.playBowDraw();
          this.emitHud(true);
        }
        if (!this.pointerLocked) {
          try {
            void this.renderer.domElement.requestPointerLock?.();
          } catch {
            // Fallback to drag-look if pointer lock is blocked
          }
        }
      } else if (e.button === 2 && this.isChapter4Scene()) {
        this.triggerCh4PrimaryAttack();
      }
    }
  };

  private handleMouseUp = (e?: MouseEvent): void => {
    this.isDragging = false;
    if (!e || e.button === 0) {
      this.mouseLeftDown = false;
      if (this.ch4IsAiming) {
        this.ch4IsAiming = false;
        this.emitHud(true);
      }
    }
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (this.mode === 'title') {
      this.titlePointerNdc = {
        x: (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1,
        y: -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1),
      };
      return;
    }
    if (this.mode !== 'playing' || !this.isPlayableScene()) return;
    if (
      this.restModalOpen ||
      this.inventoryOpen ||
      this.letterOpen ||
      this.ch3PuzzleOpen ||
      this.questLogOpen ||
      this.ch3OrvellanMenuActive ||
      this.ch3PortalTunnelActive ||
      this.ch3MorningWakeActive ||
      this.ch3DoorAnimActive ||
      this.ch3MemoryVisionActive ||
      this.ch3ArchiveCinematicActive ||
      this.ch3BellFinaleActive ||
      this.ch4CutscenePhase !== 'none' ||
      this.portalDiscoveryActive ||
      this.portalInvestigateActive ||
      this.portalFinaleActive
    ) {
      return;
    }
    if (!this.pointerLocked && !this.isDragging) return;
    const sens = 0.0024 * this.settings.mouseSensitivity;
    this.camYaw -= e.movementX * sens;
    const ySign = this.settings.invertY ? -1 : 1;
    this.camPitch = THREE.MathUtils.clamp(
      this.camPitch + e.movementY * sens * ySign,
      -0.45,
      1.15
    );
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    this.sound.unlock();
    const code = e.code;

    if (code === 'Escape') {
      if (this.ch3PuzzleOpen) {
        this.closeMemoryPuzzle();
        return;
      }
      if (this.questLogOpen) {
        this.questLogOpen = false;
        this.emitHud(true);
        return;
      }
      if (this.ch3OrvellanMenuActive) {
        this.ch3OrvellanMenuActive = false;
        this.ch3OrvellanChoiceDialogue = null;
        this.emitHud(true);
        return;
      }
      if (this.letterOpen) {
        this.closeLetterModal();
        return;
      }
      if (this.restModalOpen) {
        this.restModalOpen = false;
        this.emitHud(true);
        return;
      }
      if (this.inventoryOpen) {
        this.inventoryOpen = false;
        this.emitHud(true);
        return;
      }
      if (this.mode === 'playing') {
        this.setPaused(true);
      } else if (this.mode === 'paused') {
        this.setPaused(false);
      }
      return;
    }

    if (this.mode === 'title') {
      if (this.introStage !== 'menu' && (code === 'Space' || code === 'Escape')) {
        e.preventDefault();
        this.skipTitleIntro();
      }
      return;
    }

    if (this.mode !== 'playing') return;

    const kb = this.settings.keyBindings;

    if (
      ['Space', 'ArrowUp', 'ArrowDown', 'Enter', 'Tab'].includes(code) ||
      code === kb.bag
    ) {
      if (document.activeElement?.tagName !== 'BUTTON') {
        e.preventDefault();
      }
    }

    const wasDown = this.keys.has(code);
    this.keys.add(code);

    if (wasDown) return; // edge-triggered actions below

    if (this.sceneId === 'scene_1_intro' && code === 'Space') {
      this.enterScene('scene_2_mission');
      return;
    }

    if (this.sceneId === 'ch2_scene_1_seashore' && code === 'Space' && this.sceneTimer > 4.0) {
      this.enterScene('ch2_scene_2_jafr_reveal');
      return;
    }

    if (this.sceneId === 'ch2_scene_2_jafr_reveal' && (code === 'Space' || code === 'Enter')) {
      this.advanceCh2RevealStep();
      return;
    }

    if (this.portalDiscoveryActive && (code === 'Space' || code === 'Enter')) {
      this.advancePortalDiscoveryStep();
      return;
    }

    if (this.portalFinaleActive && this.portalFinaleStep < 2 && (code === 'Space' || code === 'Enter')) {
      this.advancePortalFinaleDialogue();
      return;
    }

    if (this.ch3PortalTunnelActive && this.ch3PortalTunnelTimer >= 8.2 && (code === 'Space' || code === 'Enter')) {
      this.advanceCh3ArrivalDialogue();
      return;
    }

    if (this.isChapter4Scene() && this.ch4CutscenePhase !== 'none' && (code === 'Space' || code === 'Enter')) {
      this.advanceCh4CutsceneStep();
      return;
    }

    if (this.letterOpen && (code === 'Space' || code === 'Enter' || code === kb.interact)) {
      this.closeLetterModal();
      return;
    }

    if (this.sceneId === 'scene_2_mission') {
      if (code === 'Space' || code === kb.interact || code === 'Enter') {
        this.advanceDialogue();
      }
      return;
    }

    // Rest Modal quick keyboard shortcuts (A / B)
    if (this.restModalOpen) {
      if (code === 'KeyA' || code === 'Digit1') {
        this.selectRestOption('rest');
      } else if (code === 'KeyB' || code === 'Digit2') {
        this.selectRestOption('sleep');
      }
      return;
    }

    // Stand up from resting
    if (this.isResting && (code === 'KeyF' || code === 'Space' || code === 'Enter')) {
      this.standUpFromRest();
      return;
    }

    // Toggle Chapter 2 / Chapter 3 / Chapter 4 Inventory
    if ((this.isChapter2Scene() || this.isChapter3Scene() || this.isChapter4Scene()) && this.isPlayableScene() && code === kb.bag) {
      this.toggleInventory();
      return;
    }

    // Toggle Chapter 3 / Chapter 4 Quest Tracker
    if ((this.isChapter3Scene() || this.isChapter4Scene()) && this.isPlayableScene() && code === kb.quests) {
      this.toggleQuestLog();
      return;
    }

    // Chapter 4 Bow Switching (N), Weapon Hotkeys (1 / 2 / 3), Guard, Dodge-Dash
    if (this.isChapter4Scene() && this.isPlayableScene() && this.ch4CutscenePhase === 'none') {
      if (code === 'KeyN') {
        this.switchCh4Bow();
        return;
      }
      if (code === 'Digit1' && this.ch4Flags.swordCollected) {
        this.selectCh4Weapon('sword');
        return;
      }
      if (code === 'Digit2' && this.ch4Flags.fireBowCollected) {
        this.selectCh4Weapon('fire_bow');
        return;
      }
      if (code === 'Digit3' && this.ch4Flags.arcaneBowUnlocked) {
        this.selectCh4Weapon('arcane_bow');
        return;
      }
      if (code === kb.guard && this.ch4Flags.swordCollected && !this.ch4IsAiming) {
        this.triggerCh4Block(true);
        return;
      }
      if (code === kb.dodge) {
        this.triggerCh4Dodge();
        return;
      }
    }

    // Toggle Observation Mode for Chapter 2, 3 & 4
    if (
      (this.isChapter2Scene() || this.isChapter3Scene() || this.isChapter4Scene()) &&
      this.isPlayableScene() &&
      !this.isResting &&
      !this.isSleeping &&
      !this.boxOpening &&
      !this.ch3PuzzleOpen &&
      !this.ch3PortalTunnelActive &&
      !this.ch3MorningWakeActive &&
      !this.ch3DoorAnimActive &&
      !this.ch3MemoryVisionActive &&
      !this.ch3ArchiveCinematicActive &&
      !this.ch3BellFinaleActive &&
      this.ch4CutscenePhase === 'none' &&
      !this.portalDiscoveryActive &&
      !this.portalInvestigateActive &&
      !this.portalFinaleActive &&
      code === kb.observe
    ) {
      if (this.isChapter3Scene() && (this.ch3Flags.subZone === 'house_interior' || this.ch3Flags.subZone === 'tunnel')) {
        return;
      }
      if (this.isChapter4Scene() && this.ch4Flags.subZone === 'tunnel') {
        return;
      }
      this.observationMode = !this.observationMode;
      if (this.observationMode) {
        if (this.isChapter2Scene()) this.ch2Flags.observationUsed = true;
        if (this.isChapter3Scene()) this.ch3Flags.observationUsedCh3 = true;
      }
      this.sound.playObserveToggle(this.observationMode);
      this.emitHud(true);
      return;
    }

    if (
      code === 'Space' &&
      this.isPlayableScene() &&
      !this.isFlying &&
      !this.isResting &&
      !this.isSleeping &&
      this.ch4CutscenePhase === 'none'
    ) {
      this.jumpBufferTimer = 0.14;
    }

    // Toggle Flying in Library (Scenes 6, 7, 8)
    if (
      code === 'KeyI' &&
      (this.sceneId === 'scene_6_flying_tutorial' ||
        this.sceneId === 'scene_7_find_book' ||
        this.sceneId === 'scene_8_flying_chair')
    ) {
      this.isFlying = !this.isFlying;
      this.sound.playFlightToggle(this.isFlying);
      if (this.isFlying) {
        this.playerVel.y = Math.max(this.playerVel.y, 3.2);
        this.isGrounded = false;
      } else {
        this.fallPeakY = this.playerPos.y;
      }
      this.emitHud(true);
    }

    // Scene 4: Enter the Ench Library
    if (code === 'Enter' && this.sceneId === 'scene_4_entrance' && !this.doorOpening) {
      const dist = this.playerPos.distanceTo(LIBRARY_PLAZA_POS);
      if (dist < 14) {
        this.doorOpening = true;
        this.doorOpenProgress = 0;
        this.sound.playDoorOpen();
      }
    }

    // Scene 3: Interacting near unrelated village houses reminds player of mission
    if (code === kb.interact && this.sceneId === 'scene_3_journey') {
      const info = getNearestPathInfo(this.playerPos.x, this.playerPos.z);
      if (info.u < 0.25) {
        this.ambientBubble = {
          speaker: 'Nate',
          text: 'No time to visit neighbors—Mom said to head straight to the Ench Library!',
        };
        this.ambientTimer = 2.8;
        this.emitHud(true);
      }
    }

    // Scene 7: Collect Mysterious Book
    if (code === kb.interact && this.sceneId === 'scene_7_find_book') {
      const dist = this.playerPos.distanceTo(this.library.targetBookPos);
      if (dist < 4.8) {
        this.hasBook = true;
        this.isFlying = false;
        this.library.targetBookGroup.visible = false;
        this.library.targetBeacon.visible = false;
        this.sound.playMagicChime();
        this.latestCheckpoint = 'scene_8_flying_chair';
        this.emitSave('scene_8_flying_chair', false, 0);
        this.enterScene('scene_8_flying_chair');
      }
    }

    // Scene 8: Sit on Flying Chair
    if (code === 'Enter' && this.sceneId === 'scene_8_flying_chair') {
      const dist = this.playerPos.distanceTo(this.library.targetChairPos);
      if (dist < 4.8) {
        this.sound.playMagicChime();
        this.enterScene('scene_9_finale');
      }
    }

    // Chapter 2: Enter or Exit Mountain House (ENTER)
    if (
      code === 'Enter' &&
      this.isChapter2Scene() &&
      this.isPlayableScene() &&
      !this.ch2DoorOpening &&
      !this.portalDiscoveryActive &&
      !this.portalInvestigateActive &&
      !this.portalFinaleActive
    ) {
      if (!this.ch2Flags.insideHouse && this.playerPos.distanceTo(CH2_DOOR_POS) < 4.4) {
        this.ch2DoorOpening = true;
        this.ch2DoorTimer = 0;
        this.observationMode = false;
        this.sound.playWoodenCreak();
      } else if (
        this.ch2Flags.insideHouse &&
        this.playerPos.z > -103.8 &&
        Math.abs(this.playerPos.x) < 1.8
      ) {
        this.ch2Flags.insideHouse = false;
        this.ch2World.houseInteriorGroup.visible = false;
        this.ch2World.houseExteriorGroup.visible = true;
        this.ch2World.doorPivot.rotation.y = 0;
        this.playerPos.set(0, getCh2WalkSurface(0, -100.8, false).y, -100.8);
        this.playerYaw = 0;
        this.camYaw = 0;
        this.sound.playWoodenCreak();
        this.sound.setZone('mountain');
        if (this.ch2Flags.itemsCollected && !this.ch2Flags.portalDiscovered) {
          this.startPortalDiscoveryCutscene();
        } else {
          this.emitHud(true);
        }
      }
    }

    // Chapter 2: Open Supply Box
    if (
      code === kb.interact &&
      this.isChapter2Scene() &&
      this.ch2Flags.insideHouse &&
      !this.ch2Flags.itemsCollected &&
      !this.boxOpening
    ) {
      if (this.playerPos.distanceTo(CH2_BOX_POS) < 3.2) {
        this.boxOpening = true;
        this.boxAnimTimer = 0;
        this.ch2Flags.boxOpened = true;
        this.sound.playBoxOpen();
        this.emitHud(true);
      }
    }

    // Chapter 2: Investigate or Enter Mysterious Ancient Portal
    if (
      code === kb.interact &&
      this.isChapter2Scene() &&
      !this.ch2Flags.insideHouse &&
      this.isPlayableScene() &&
      !this.portalDiscoveryActive &&
      !this.portalInvestigateActive &&
      !this.portalFinaleActive
    ) {
      if (this.playerPos.distanceTo(CH2_PORTAL_POS) < 5.5) {
        if (!this.ch2Flags.portalDiscovered) {
          if (this.ch2Flags.itemsCollected) {
            this.startPortalDiscoveryCutscene();
          } else {
            this.ch2Dialogue = {
              speaker: 'Jafr',
              text: "Whoa, look at that stone arch! Let's check inside the Mountain House for supplies first!",
            };
            this.ch2DialogueTimer = 4.2;
            this.sound.playVoiceCue('Jafr');
          }
        } else if (!this.ch2Flags.portalInvestigated) {
          this.portalInvestigateActive = true;
          this.portalInvestigateTimer = 0;
          this.observationMode = false;
          this.sound.playPortalInvestigate();
          this.jafrMood = 'curious';
          this.jafrStatusText = 'Studying glowing runes';
          if (document.pointerLockElement) document.exitPointerLock?.();
        } else {
          const readyForGateway =
            this.ch2Flags.itemsCollected && (this.ch2Flags.sleptOnce || this.ch2Flags.firstCheckpointSaved);
          if (!readyForGateway) {
            this.ch2Dialogue = {
              speaker: 'Jafr',
              text: 'Before we step through this gateway, let us rest or sleep at the bed inside the house to save our strength!',
            };
            this.ch2DialogueTimer = 4.8;
            this.sound.playVoiceCue('Jafr');
          } else {
            this.startPortalGatewayFinale();
          }
        }
        this.emitHud(true);
      }
    }

    // Chapter 2: Rest or Sleep on Right-Side Bed
    if (
      (code === 'KeyF' || code === kb.interact) &&
      this.isChapter2Scene() &&
      this.ch2Flags.insideHouse &&
      !this.isResting &&
      !this.isSleeping &&
      !this.boxOpening &&
      !this.ch2DoorOpening
    ) {
      if (this.playerPos.distanceTo(CH2_BED_POS) < 3.5) {
        this.restModalOpen = true;
        if (document.pointerLockElement) {
          document.exitPointerLock?.();
        }
        this.emitHud(true);
        return;
      }
    }

    // Chapter 3 Door & Bed & Interactions
    if (
      this.isChapter3Scene() &&
      this.isPlayableScene() &&
      !this.ch3PortalTunnelActive &&
      !this.ch3MorningWakeActive &&
      !this.ch3DoorAnimActive &&
      !this.ch3MemoryVisionActive &&
      !this.ch3ArchiveCinematicActive &&
      !this.ch3BellFinaleActive &&
      !this.ch3PuzzleOpen &&
      !this.ch3OrvellanMenuActive
    ) {
      if (code === 'Enter') {
        this.handleChapter3Door();
      } else if (code === 'KeyF' && this.ch3Flags.subZone === 'house_interior') {
        if (this.playerPos.distanceTo(CH3_INTERIOR_BED_POS) < 3.6 && !this.ch3Flags.sleptInHouse) {
          this.startCh3MorningWakeSequence();
        }
      } else if (code === kb.interact) {
        this.handleChapter3Interact();
      }
    }

    // Chapter 4 Interactions & Doors
    if (this.isChapter4Scene() && this.isPlayableScene() && this.ch4CutscenePhase === 'none') {
      if (code === kb.interact) {
        this.handleChapter4Interact();
      } else if (code === 'Enter') {
        this.handleChapter4Door();
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
    if (e.code === this.settings.keyBindings.guard && this.ch4IsBlocking) {
      this.ch4IsBlocking = false;
      this.emitHud(true);
    }
  };

  private isChapter2Scene(id: SceneId = this.sceneId): boolean {
    return id.startsWith('ch2_');
  }

  private isChapter3Scene(id: SceneId = this.sceneId): boolean {
    return id.startsWith('ch3_');
  }

  private isChapter4Scene(id: SceneId = this.sceneId): boolean {
    return id.startsWith('ch4_');
  }

  private isPlayableScene(): boolean {
    return (
      this.sceneId === 'scene_3_journey' ||
      this.sceneId === 'scene_4_entrance' ||
      this.sceneId === 'scene_6_flying_tutorial' ||
      this.sceneId === 'scene_7_find_book' ||
      this.sceneId === 'scene_8_flying_chair' ||
      this.sceneId === 'ch2_scene_3_explore' ||
      this.sceneId === 'ch2_scene_4_house_interior' ||
      this.sceneId === 'ch2_scene_5_supply_box' ||
      this.sceneId === 'ch2_scene_6_rest_sleep' ||
      this.sceneId === 'ch2_scene_7_portal' ||
      (this.sceneId === 'ch2_complete' && this.ch2PostCompleteExplore) ||
      this.sceneId === 'ch3_scene_1_arrival' ||
      this.sceneId === 'ch3_scene_2_whispering_woods' ||
      this.sceneId === 'ch3_scene_elarion' ||
      this.sceneId === 'ch3_scene_3_silent_bells' ||
      this.sceneId === 'ch4_scene_1_arrival' ||
      this.sceneId === 'ch4_scene_2_battlefield' ||
      this.sceneId === 'ch4_scene_3_castle_interior' ||
      this.sceneId === 'ch4_scene_4_pelicon_town'
    );
  }

  public updateSettings(next: GameSettings): void {
    this.settings = {
      ...next,
      keyBindings: { ...DEFAULT_KEY_BINDINGS, ...(next.keyBindings ?? {}) },
    };
    this.sound.setChannelVolumes({
      master: this.settings.masterVolume,
      music: this.settings.musicVolume,
      sfx: this.settings.sfxVolume,
      dialogue: this.settings.dialogueVolume,
      muted: this.settings.muted,
    });

    if (this.settings.displayMode === 'fullscreen' && !document.fullscreenElement) {
      try {
        void document.documentElement.requestFullscreen?.().catch(() => {});
      } catch {
        // Ignore fullscreen rejection in restricted iframes
      }
    } else if (this.settings.displayMode === 'windowed' && document.fullscreenElement) {
      try {
        void document.exitFullscreen?.().catch(() => {});
      } catch {
        // Ignore
      }
    }

    this.applyGraphicsSettings();
  }

  private applyGraphicsSettings(): void {
    if (this.isSoftwareGl) return;
    const baseDpr = window.devicePixelRatio || 1;
    const scalePr =
      this.settings.resolutionScale === '1080p'
        ? Math.min(baseDpr, 1.25)
        : this.settings.resolutionScale === '1440p'
        ? Math.min(baseDpr, 1.6)
        : Math.min(baseDpr, 2);
    const pr = this.settings.graphicsQuality === 'high' ? scalePr : 1;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.renderer.setPixelRatio(pr);
    this.composer?.setPixelRatio(pr);
    this.composer?.setSize(w, h);
    this.bloomPass?.resolution.set(w, h);
    if (this.bloomPass) {
      this.bloomPass.enabled = this.settings.effectsQuality !== 'medium';
    }
    this.renderer.shadowMap.enabled =
      this.settings.graphicsQuality === 'high' && this.settings.shadowQuality !== 'medium';
    this.renderer.shadowMap.autoUpdate = true;
  }

  public setPaused(paused: boolean): void {
    if (
      this.sceneId === 'title' ||
      this.sceneId === 'chapter_complete' ||
      this.sceneId === 'ch3_complete' ||
      this.sceneId === 'ch4_complete' ||
      (this.sceneId === 'ch2_complete' && !this.ch2PostCompleteExplore)
    ) {
      return;
    }
    this.mode = paused ? 'paused' : 'playing';
    if (paused) {
      this.keys.clear();
      this.mouseLeftDown = false;
      this.ch4IsAiming = false;
      this.sound.updateChapter1Ambience({
        active: false,
        riverProximity: 0,
        waterfallProximity: 0,
        riverPan: 0,
        forestProximity: 0,
        gustPhase: this.totalTime,
      });
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    }
    this.emitHud(true);
  }

  public startNewGame(): void {
    this.sound.unlock();
    this.sound.playUiClick();
    this.hasBook = false;
    this.isFlying = false;
    this.isSitting = false;
    this.shocked = false;
    this.latestCheckpoint = 'scene_1_intro';
    this.enterScene('scene_1_intro');
  }

  public startChapter2(): void {
    this.sound.unlock();
    this.sound.playUiClick();
    this.resetCh2State();
    this.latestCheckpoint = 'ch2_scene_1_seashore';
    this.enterScene('ch2_scene_1_seashore');
  }

  public startChapter3FromPortal(): void {
    this.sound.unlock();
    this.sound.playUiClick();
    // Preserve Nate's inventory, energy, and Jafr companion directly from Chapter 2 portal arrival
    if (this.energy < 50) this.energy = 85;
    this.resetCh3State(true);
    this.latestCheckpoint = 'ch3_scene_1_arrival';
    this.enterScene('ch3_scene_1_arrival');
  }

  public startChapter4FromValley(): void {
    this.sound.unlock();
    this.sound.playUiClick();
    if (this.energy < 60) this.energy = 100;
    this.resetCh4State(true);
    this.latestCheckpoint = 'ch4_scene_1_arrival';
    this.enterScene('ch4_scene_1_arrival');
  }

  public closeLetterModal(): void {
    this.letterOpen = null;
    this.sound.playUiClick();
    if (this.isChapter3Scene() && this.ch3Flags.letterCollected && !this.ch3Flags.clockTriggered) {
      this.ch3Flags.letterRead = true;
      this.ch3Flags.clockTriggered = true;
      this.ch3Flags.act = Math.max(this.ch3Flags.act, 2);
      this.ch3ClockAnimTimer = 0.01;
      this.sound.playClockTick();
      window.setTimeout(() => {
        if (!this.disposed) this.sound.playClockTick();
      }, 420);
      this.jafrMood = 'alert';
      this.jafrStatusText = 'Startled by the Seventh Bell letter';
      this.ch2Dialogue = {
        speaker: 'Jafr',
        text: 'Who is the Last Keeper?! Look through the window—the old clock inside just struck 7:00 AM and the golden seal is glowing!',
        note: 'Step off the porch to inspect the glowing footprints outside (press V for Observation Mode).',
      };
      this.ch2DialogueTimer = 6.2;
      this.emitSave(this.sceneId, true, 0, true, false);
    }
    this.emitHud(true);
  }

  public toggleQuestLog(): void {
    if (!this.isChapter3Scene() && !this.isChapter4Scene()) return;
    this.questLogOpen = !this.questLogOpen;
    if (this.questLogOpen && document.pointerLockElement) {
      document.exitPointerLock?.();
    }
    this.sound.playUiClick();
    this.emitHud(true);
  }

  public selectDialogueChoice(choiceId: string): void {
    if (!this.ch3OrvellanMenuActive) return;
    this.sound.playUiClick();
    if (choiceId === 'proceed_archive') {
      this.ch3OrvellanMenuActive = false;
      this.ch3OrvellanChoiceDialogue = null;
      this.startCh3ArchiveCinematic();
      return;
    }
    if (!this.ch3Flags.orvellanAskedTopics.includes(choiceId)) {
      this.ch3Flags.orvellanAskedTopics.push(choiceId);
    }
    if (choiceId === 'ask_book') {
      this.ch3OrvellanChoiceDialogue = {
        speaker: 'Orvellan',
        portrait: 'orvellan',
        emotion: 'calm',
        text: 'THE BOOK is not merely paper and ink—it is a living vessel woven from Aurelia’s memories. It chooses only a Reader whose presence can awaken sealed worlds.',
      };
    } else if (choiceId === 'ask_elarion') {
      this.ch3OrvellanChoiceDialogue = {
        speaker: 'Orvellan',
        portrait: 'orvellan',
        emotion: 'sad',
        text: 'Elarion once shimmered beneath crystal skies. When the Bell Keeper’s shadow fell, we folded our streets into ink so the silent bells could hold back the dark.',
      };
    } else if (choiceId === 'ask_final_page') {
      this.ch3OrvellanChoiceDialogue = {
        speaker: 'Orvellan',
        portrait: 'orvellan',
        emotion: 'curious',
        text: 'The Final Page remains unwritten until the seventh bell of the Valley is answered. Come—see what the Archive of Readers has already recorded about you.',
      };
    }
    this.sound.playVoiceCue('Mother');
    this.emitHud(true);
  }

  public rotateMemoryPuzzleStone(index: 0 | 1 | 2): void {
    if (!this.ch3PuzzleOpen || this.ch3Flags.stonesSolved) return;
    this.sound.playPuzzleRotate();
    const next = [...this.ch3Flags.stoneRotations] as [number, number, number];
    next[index] = (next[index] + 1) % 4;
    this.ch3Flags.stoneRotations = next;
    const dial = this.ch3World.memoryStones[index]?.runeDial;
    if (dial) {
      dial.rotation.z = next[index] * (Math.PI / 2);
    }
    this.ch3PuzzleFeedback = null;
    this.emitHud(true);
  }

  public confirmMemoryPuzzle(): void {
    if (!this.ch3PuzzleOpen || this.ch3Flags.stonesSolved) return;
    if (this.ch3Flags.collectedFragments.length < 3) {
      const missing = (['sun', 'moon', 'star'] as const).filter(
        (id) => !this.ch3Flags.collectedFragments.includes(id)
      );
      this.sound.playUiClick();
      this.ch3PuzzleFeedback = `You still need ${missing.map((m) => m.toUpperCase()).join(', ')} Symbol Fragment(s) from the nearby ruins!`;
      this.emitHud(true);
      return;
    }
    const [r0, r1, r2] = this.ch3Flags.stoneRotations;
    if (r0 !== 0 || r1 !== 0 || r2 !== 0) {
      this.sound.playUiClick();
      this.ch3PuzzleFeedback = 'The runes hum but do not align yet. Rotate Sun, Moon, and Star to Dawn (0° North).';
      this.emitHud(true);
      return;
    }
    // Puzzle Solved!
    this.ch3PuzzleOpen = false;
    this.ch3PuzzleFeedback = null;
    this.ch3Flags.stonesSolved = true;
    this.ch3Flags.memoryStonesCollected = 3;
    this.ch3Flags.act = Math.max(this.ch3Flags.act, 5);
    this.sound.playPuzzleSolve();

    // Illuminate monoliths & platform runes & reveal hidden staircase
    this.ch3World.memoryStones.forEach((st) => {
      st.collected = true;
      (st.crystal.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.72;
      (st.runeDial.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.68;
    });
    this.ch3World.platformRunes.forEach((pr) => {
      (pr.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.62;
    });
    this.ch3World.stairTrapdoor.visible = false;
    this.ch3World.hiddenStairGroup.visible = true;

    if (!this.ch3Flags.memoryCrystalObtained) {
      this.ch3Flags.memoryCrystalObtained = true;
      if (!this.inventory.some((it) => it.id === 'memory_crystal')) {
        this.inventory.push({
          id: 'memory_crystal',
          name: 'Memory Crystal',
          description: 'Lumi’s luminous crystal. Reveals echoes of the forgotten past when activated.',
          quantity: 1,
          energyRestore: 0,
        });
      }
    }
    this.itemToast = 'MEMORY STONES ALIGNED · OBTAINED MEMORY CRYSTAL';
    this.itemToastTimer = 4.2;
    this.jafrMood = 'excited';
    this.jafrStatusText = 'Marveling at the hidden staircase!';
    this.ch2Dialogue = {
      speaker: 'Lumi',
      text: 'The Three Memory Stones remember! Take this Memory Crystal and descend the hidden staircase into Elarion—the forgotten city beneath the mountain.',
      note: 'Stand at the center staircase and press E to descend.',
    };
    this.ch2DialogueTimer = 6.5;
    this.emitSave(this.sceneId, true, 0, true, false);
    this.emitHud(true);
  }

  public closeMemoryPuzzle(): void {
    this.ch3PuzzleOpen = false;
    this.ch3PuzzleFeedback = null;
    this.sound.playUiClick();
    this.emitHud(true);
  }

  public continueMorningExploration(): void {
    this.sound.unlock();
    this.sound.playUiClick();
    this.ch2PostCompleteExplore = true;
    this.mode = 'playing';
    this.fadeAlpha = 0;
    this.sceneId = 'ch2_scene_7_portal';
    this.sound.setZone(this.ch2Flags.insideHouse ? 'house' : 'mountain');
    this.emitHud(true);
  }

  public toggleAutoDialogue(): void {
    this.autoDialogue = !this.autoDialogue;
    this.autoDialogueTimer = 0;
    this.sound.playUiClick();
    this.emitHud(true);
  }

  public toggleObservationMode(): void {
    if (!this.isChapter2Scene() && !this.isChapter3Scene() && !this.isChapter4Scene()) return;
    if (!this.isPlayableScene() || this.isResting || this.isSleeping || this.boxOpening) return;
    if (this.isChapter3Scene() && (this.ch3Flags.subZone === 'house_interior' || this.ch3Flags.subZone === 'tunnel')) return;
    if (this.isChapter4Scene() && this.ch4Flags.subZone === 'tunnel') return;
    this.observationMode = !this.observationMode;
    if (this.observationMode) {
      if (this.isChapter2Scene()) this.ch2Flags.observationUsed = true;
      if (this.isChapter3Scene()) this.ch3Flags.observationUsedCh3 = true;
    }
    this.sound.playObserveToggle(this.observationMode);
    this.emitHud(true);
  }

  public triggerCh4Block(active: boolean): void {
    if (!this.isChapter4Scene() || !this.isPlayableScene() || this.ch4CutscenePhase !== 'none') {
      if (this.ch4IsBlocking) {
        this.ch4IsBlocking = false;
        this.emitHud(true);
      }
      return;
    }
    if (active && (!this.ch4Flags.swordCollected || this.ch4IsAiming || this.ch4DodgeTimer > 0)) return;
    if (this.ch4IsBlocking !== active) {
      this.ch4IsBlocking = active;
      if (active) {
        this.ch4Flags.activeWeapon = 'sword';
        this.sound.playSwordBlock();
      }
      this.emitHud(true);
    }
  }

  public triggerCh4Dodge(): void {
    if (!this.isChapter4Scene() || !this.isPlayableScene() || this.ch4CutscenePhase !== 'none') return;
    if (this.ch4DodgeTimer > 0 || this.stamina < 24) return;
    this.stamina = Math.max(0, this.stamina - 24);
    this.ch4DodgeTimer = 0.34;
    this.ch4IsBlocking = false;
    this.ch4IsAiming = false;

    const fwdInput = (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0);
    const strInput = (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);
    const sinY = Math.sin(this.camYaw);
    const cosY = Math.cos(this.camYaw);
    const dx = -sinY * fwdInput + cosY * strInput;
    const dz = -cosY * fwdInput - sinY * strInput;
    if (Math.hypot(dx, dz) > 0.05) {
      this.ch4DodgeDir.set(dx, 0, dz).normalize();
      this.playerYaw = Math.atan2(this.ch4DodgeDir.x, this.ch4DodgeDir.z);
    } else {
      this.ch4DodgeDir.set(Math.sin(this.playerYaw), 0, Math.cos(this.playerYaw)).normalize();
    }
    this.sound.playDodgeWhoosh();
    this.spawnCh4VfxRing(
      new THREE.Vector3(this.playerPos.x, this.playerPos.y + 0.15, this.playerPos.z),
      0xfbbf24,
      1.6,
      0.26
    );
    this.emitHud(true);
  }

  public skipDialogueSequence(): void {
    this.sound.playUiClick();
    this.autoDialogueTimer = 0;
    if (this.sceneId === 'scene_1_intro') {
      this.enterScene('scene_2_mission');
      return;
    }
    if (this.sceneId === 'scene_2_mission') {
      this.latestCheckpoint = 'scene_3_journey';
      this.emitSave('scene_3_journey', false, TOTAL_JOURNEY_METERS);
      this.enterScene('scene_3_journey');
      return;
    }
    if (this.sceneId === 'ch2_scene_2_jafr_reveal') {
      this.enterScene('ch2_scene_3_explore');
      return;
    }
    if (this.portalDiscoveryActive) {
      this.finishPortalDiscovery();
      this.emitHud(true);
      return;
    }
    if (this.portalFinaleActive && this.portalFinaleStep < 2) {
      this.portalFinaleStep = 2;
      this.portalFinaleTimer = 5.6;
      this.sound.playPortalGateway();
      this.emitHud(true);
      return;
    }
    if (this.ch3PortalTunnelActive && this.ch3PortalTunnelTimer >= 8.2) {
      this.finishCh3ArrivalCinematic();
      this.emitHud(true);
      return;
    }
    if (this.isChapter4Scene() && this.ch4CutscenePhase !== 'none') {
      const ph = this.ch4CutscenePhase;
      if (ph === 'fall_intro') {
        this.ch4CutsceneStep = 1;
        this.applyCh4StepEnter();
      } else if (ph === 'wounded') {
        this.ch4CutsceneStep = 6;
        this.applyCh4StepEnter();
      } else if (ph === 'victory') {
        this.ch4CutsceneStep = 2;
        this.applyCh4StepEnter();
      } else if (ph === 'balcony') {
        this.ch4CutsceneStep = 3;
        this.applyCh4StepEnter();
      } else if (ph === 'reunion') {
        this.ch4CutsceneStep = 12;
        this.ch4JafrDetached = false;
        this.ch4SnehAttachedToEita = true;
        this.sneh.root.visible = true;
        this.ch4SnehMode = 'idle';
        this.applyCh4StepEnter();
      }
      this.emitHud(true);
    }
  }

  public toggleInventory(): void {
    if (!this.isChapter2Scene() && !this.isChapter3Scene() && !this.isChapter4Scene()) return;
    this.inventoryOpen = !this.inventoryOpen;
    if (this.inventoryOpen && document.pointerLockElement) {
      document.exitPointerLock?.();
    }
    this.sound.playUiClick();
    this.emitHud(true);
  }

  public useInventoryItem(itemId: InventoryItem['id']): void {
    const idx = this.inventory.findIndex((it) => it.id === itemId && it.quantity > 0);
    if (idx === -1) return;
    const item = this.inventory[idx];
    if (itemId === 'pelicon_sword' || itemId === 'fire_bow' || itemId === 'arcane_bow') {
      if (this.isChapter4Scene()) {
        const mode: Ch4WeaponMode =
          itemId === 'pelicon_sword' ? 'sword' : itemId === 'fire_bow' ? 'fire_bow' : 'arcane_bow';
        this.selectCh4Weapon(mode);
        this.inventoryOpen = false;
      } else {
        this.itemToast = `${item.name.toUpperCase()} — EQUIPPED IN CHAPTER 4`;
        this.itemToastTimer = 2.6;
        this.emitHud(true);
      }
      return;
    }
    if (itemId === 'eita_journal') {
      this.inventoryOpen = false;
      this.letterOpen = {
        title: "Eita Yusa's Story Journal",
        sender: 'Princess Eita of Pelicon (Brook Village)',
        body: [
          'Age 4: I tumbled through the golden pages and woke up beside the quiet dunes of Pelicon with little Sneh.',
          'Age 16: Today, Leon found me again. Sneh and Jafr finally reunited too—and maybe, through Agnes’s Church, we can finally go home.',
        ],
        footer: '– Eita Yusa',
        goldenSymbol: true,
      };
      this.emitHud(true);
      return;
    }
    if (itemId === 'memory_crystal') {
      this.inventoryOpen = false;
      if (this.isChapter3Scene() && this.ch3Flags.subZone === 'elarion' && !this.ch3Flags.statueMemoryViewed) {
        if (this.playerPos.distanceTo(CH3_STATUE_POS) < 9.5) {
          this.startCh3MemoryVision();
          return;
        }
        this.sound.playMemoryVision();
        this.itemToast = 'MEMORY CRYSTAL PULSES TOWARD THE WIZARD STATUE';
        this.itemToastTimer = 3.6;
      } else {
        this.sound.playMemoryVision();
        this.itemToast = 'MEMORY CRYSTAL ECHOES SOFTLY IN YOUR HAND';
        this.itemToastTimer = 3.2;
      }
      this.emitHud(true);
      return;
    }
    if (item.energyRestore <= 0) {
      this.itemToast = `${item.name.toUpperCase()} — STORY ARTIFACT`;
      this.itemToastTimer = 2.4;
      this.emitHud(true);
      return;
    }
    this.energy = Math.min(100, this.energy + item.energyRestore);
    this.ch4Health = Math.min(100, this.ch4Health + Math.round(item.energyRestore * 0.8));
    item.quantity -= 1;
    if (item.quantity <= 0) {
      this.inventory.splice(idx, 1);
    }
    this.sound.playItemCollect();
    this.itemToast = `USED ${item.name.toUpperCase()} (+${item.energyRestore} ENERGY)`;
    this.itemToastTimer = 2.6;
    this.emitHud(true);
  }

  public selectRestOption(option: 'rest' | 'sleep'): void {
    this.restModalOpen = false;
    this.ch2Flags.firstCheckpointSaved = true;
    if (option === 'rest') {
      this.isResting = true;
      this.jafrMood = 'resting';
      this.jafrStatusText = 'Relaxing beside Nate';
      this.playerPos.set(CH2_BED_POS.x - 0.88, 15.84, CH2_BED_POS.z + 0.25);
      this.playerYaw = -Math.PI / 2;
      this.camYaw = -Math.PI / 2;
      this.ch2Dialogue = {
        speaker: 'Jafr',
        text: 'Catch your breath, Nate. Press F or Space whenever you are ready to stand up.',
      };
      this.ch2DialogueTimer = 4.0;
      this.latestCheckpoint = 'ch2_scene_6_rest_sleep';
      this.saveStatus = 'saved';
      this.saveStatusTimer = 3.6;
      this.checkpointBannerTimer = 3.8;
      this.emitSave('ch2_scene_6_rest_sleep', true, 0, this.ch2PortalCompleted);
    } else {
      this.isResting = false;
      this.isSleeping = true;
      this.sleepTimer = 0;
      this.jafrMood = 'sleeping';
      this.jafrStatusText = 'Sleeping nearby';
      this.sound.setZone('night');
      this.playerPos.set(CH2_BED_POS.x, 16.46, CH2_BED_POS.z + 0.14);
      this.playerYaw = 0;
      this.camYaw = -Math.PI / 2;
    }
    this.emitHud(true);
  }

  public standUpFromRest(): void {
    if (!this.isResting) return;
    this.isResting = false;
    this.jafrMood = 'curious';
    this.playerPos.set(CH2_BED_POS.x - 1.35, 15.66, CH2_BED_POS.z);
    this.playerYaw = -Math.PI / 2;
    this.camYaw = -Math.PI / 2;
    this.emitHud(true);
  }

  public loadSceneFromCheckpoint(targetScene: SceneId, savedProgress?: SaveProgress | null): void {
    this.sound.unlock();
    this.sound.playUiClick();
    if (this.isChapter2Scene(targetScene)) {
      this.resetCh2State();
      if (savedProgress && savedProgress.chapter === 2) {
        this.applySavedCh2Progress(savedProgress);
      }
    } else if (this.isChapter3Scene(targetScene)) {
      this.resetCh3State(false);
      if (savedProgress && savedProgress.chapter === 3) {
        this.applySavedCh3Progress(savedProgress);
      } else if (savedProgress && savedProgress.inventory) {
        this.inventory = savedProgress.inventory.map((it) => ({ ...it }));
        this.energy = savedProgress.energy ?? 100;
      }
    } else if (this.isChapter4Scene(targetScene)) {
      this.resetCh4State(false);
      if (savedProgress && savedProgress.chapter === 4) {
        this.applySavedCh4Progress(savedProgress);
      } else if (savedProgress && savedProgress.inventory) {
        this.inventory = savedProgress.inventory.map((it) => ({ ...it }));
        this.energy = savedProgress.energy ?? 100;
      }
    }
    this.latestCheckpoint = targetScene;
    this.enterScene(targetScene, savedProgress ?? undefined);
  }

  public restartLatestCheckpoint(): void {
    this.sound.playUiClick();
    this.gameOverReason = null;
    this.enterScene(this.latestCheckpoint);
  }

  public returnToTitle(): void {
    this.sound.playUiClick();
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
    this.enterScene('title');
    this.introElapsed = 17.5;
    this.introStage = 'menu';
    this.sound.setZone('title_menu');
    this.emitHud(true);
  }

  public skipTitleIntro(): void {
    this.sound.unlock();
    if (this.sceneId !== 'title' || this.introStage === 'menu') return;
    this.introElapsed = 17.5;
    this.introStage = 'menu';
    this.sound.setZone('title_menu');
    this.sound.playUiClick();
    this.emitHud(true);
  }

  public replayTitleIntro(): void {
    this.sound.unlock();
    this.sound.playUiClick();
    if (this.sceneId !== 'title') {
      this.enterScene('title');
    }
    this.introElapsed = 0;
    this.introStage = 'intro_dark';
    this.introCueFlags = {
      opened: false,
      pages: [false, false, false, false, false],
      title: false,
      closed: false,
    };
    this.sound.setZone('title_intro');
    this.emitHud(true);
  }

  public playMenuHover(): void {
    this.sound.playUiHover();
  }

  public playMenuClick(): void {
    this.sound.unlock();
    this.sound.playUiClick();
  }

  public unlockAudio(): void {
    this.sound.unlock();
  }

  public advanceDialogue(): void {
    this.autoDialogueTimer = 0;
    if (this.sceneId === 'ch2_scene_2_jafr_reveal') {
      this.advanceCh2RevealStep();
      return;
    }
    if (this.portalDiscoveryActive) {
      this.advancePortalDiscoveryStep();
      return;
    }
    if (this.portalFinaleActive && this.portalFinaleStep < 2) {
      this.advancePortalFinaleDialogue();
      return;
    }
    if (this.ch3PortalTunnelActive && this.ch3PortalTunnelTimer >= 8.2) {
      this.advanceCh3ArrivalDialogue();
      return;
    }
    if (this.isChapter4Scene() && this.ch4CutscenePhase !== 'none') {
      this.advanceCh4CutsceneStep();
      return;
    }
    if (this.sceneId !== 'scene_2_mission') return;
    this.sound.playUiClick();
    if (this.dialogueIdx < MISSION_DIALOGUE.length - 1) {
      this.dialogueIdx++;
      this.sound.playVoiceCue(MISSION_DIALOGUE[this.dialogueIdx].speaker as 'Nate' | 'Mother');
      this.emitHud(true);
    } else {
      // Transition from inside cottage to doorstep (1000m start)
      this.latestCheckpoint = 'scene_3_journey';
      this.emitSave('scene_3_journey', false, TOTAL_JOURNEY_METERS);
      this.enterScene('scene_3_journey');
    }
  }

  private resetCh2State(): void {
    this.energy = 35;
    this.timeOfDay = 0.04;
    this.ch2Flags = { ...DEFAULT_CH2_FLAGS };
    this.inventory = [];
    this.inventoryOpen = false;
    this.itemToast = null;
    this.itemToastTimer = 0;
    this.observationMode = false;
    this.ch2DoorOpening = false;
    this.ch2DoorTimer = 0;
    this.boxAnimTimer = 0;
    this.boxOpening = false;
    this.discoveryTimer = 0;
    this.restModalOpen = false;
    this.isResting = false;
    this.isSleeping = false;
    this.sleepTimer = 0;
    this.jafrRevealStep = 0;
    this.ch2Dialogue = null;
    this.ch2DialogueTimer = 0;
    this.autosaveTimer = 0;
    this.saveStatus = 'idle';
    this.saveStatusTimer = 0;
    this.checkpointBannerTimer = 0;
    this.jafrMood = 'curious';
    this.jafrStatusText = 'Perched on right shoulder';
    this.ch2PostCompleteExplore = false;
    this.ch2PortalCompleted = false;
    this.portalDiscoveryActive = false;
    this.portalDiscoveryTimer = 0;
    this.portalDiscoveryStep = 0;
    this.litRunesCount = 0;
    this.portalInvestigateActive = false;
    this.portalInvestigateTimer = 0;
    this.portalFinaleActive = false;
    this.portalFinaleTimer = 0;
    this.portalFinaleStep = 0;

    this.ch2World.doorPivot.rotation.y = 0;
    this.ch2World.boxLidPivot.rotation.x = 0;
    this.ch2World.boxTonicMesh.visible = true;
    this.ch2World.boxFruitMeshes.forEach((m) => {
      m.visible = true;
    });
    this.ch2World.houseExteriorGroup.visible = true;
    this.ch2World.houseInteriorGroup.visible = false;
    this.ch2World.portalEnergyUniforms.uIntensity.value = 0.14;
    this.ch2World.portalEnergyUniforms.uExpand.value = 1.0;
    this.ch2World.portalLight.intensity = 4.5;
    this.ch2World.portalRuneMeshes.forEach((r) => {
      (r.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.08;
    });
  }

  private resetCh3State(preserveCarryOver: boolean): void {
    this.ch3Flags = {
      ...DEFAULT_CH3_FLAGS,
      collectedOptionalIds: [],
      collectedFragments: [],
      stoneRotations: [2, 1, 3],
      collectedStoneIds: [],
      inspectedElarionIds: [],
      orvellanAskedTopics: [],
      escapeSwitchIds: [],
    };
    this.letterOpen = null;
    this.ch3PortalTunnelActive = false;
    this.ch3PortalTunnelTimer = 0;
    this.ch3ArrivalLineStep = 0;
    this.ch3MorningWakeActive = false;
    this.ch3MorningWakeTimer = 0;
    this.ch3DoorAnimActive = false;
    this.ch3DoorAnimTimer = 0;
    this.ch3ClockAnimTimer = 0;
    this.ch3CompassLookTimer = 0;
    this.ch3PuzzleOpen = false;
    this.ch3PuzzleFeedback = null;
    this.ch3MemoryVisionActive = false;
    this.ch3MemoryVisionTimer = 0;
    this.ch3OrvellanMenuActive = false;
    this.ch3OrvellanChoiceDialogue = null;
    this.ch3ArchiveCinematicActive = false;
    this.ch3ArchiveTimer = 0;
    this.ch3ArchiveNamesVisible = false;
    this.ch3EscapeTimer = 0;
    this.ch3EscapeJafrWarn1 = false;
    this.ch3EscapeJafrWarn2 = false;
    this.ch3BellFinaleActive = false;
    this.ch3BellFinaleTimer = 0;
    this.ch3BellFinalePhase = 'gate';
    this.ch3BannerTimer = 0;
    this.ch3BannerTitle = null;
    this.ch3BannerSubtitle = null;
    this.questLogOpen = false;
    this.whiteFadeAlpha = 0;
    this.inventoryOpen = false;
    this.ch2Dialogue = null;
    this.ch2DialogueTimer = 0;
    this.itemToast = null;
    this.itemToastTimer = 0;
    if (!preserveCarryOver) {
      this.energy = 100;
      this.inventory = [
        {
          id: 'energy_tonic',
          name: 'Energy Tonic',
          description: 'Luminous herbal elixir carried over from Chapter 2.',
          quantity: 1,
          energyRestore: 55,
        },
        {
          id: 'fruit',
          name: 'Island Fruit',
          description: 'Fresh wild island fruit carried in Nate’s bag.',
          quantity: 2,
          energyRestore: 20,
        },
      ];
    }

    // Reset Chapter 3 world visual states
    this.ch3World.letterEnvelopeGroup.visible = true;
    this.ch3World.exteriorDoorPivot.rotation.y = 0;
    this.ch3World.interiorDoorPivot.rotation.y = 0;
    this.ch3World.clockHourHand.rotation.z = 0.5;
    this.ch3World.clockMinuteHand.rotation.z = 1.2;
    this.ch3World.collectibles.forEach((c) => {
      c.collected = false;
      c.group.visible = true;
    });
    this.ch3World.fragments.forEach((f) => {
      f.collected = false;
      f.group.visible = true;
    });
    this.ch3World.lumiRig.root.position.copy(CH3_LUMI_POS);
    this.ch3World.memoryStones.forEach((st, idx) => {
      st.collected = false;
      st.crystal.visible = true;
      (st.crystal.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6;
      st.runeDial.rotation.z = this.ch3Flags.stoneRotations[idx] * (Math.PI / 2);
      (st.runeDial.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.45;
      st.ring.visible = true;
    });
    this.ch3World.platformRunes.forEach((pr) => {
      (pr.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.15;
    });
    this.ch3World.stairTrapdoor.visible = true;
    this.ch3World.hiddenStairGroup.visible = false;
    this.ch3World.memoryVisionGroup.visible = false;
    this.ch3World.orvellanRig.root.visible = true;
    this.ch3World.archiveBookLeftPage.rotation.y = 0.35;
    this.ch3World.archiveBookRightPage.rotation.y = -0.35;
    this.ch3World.escapeBarriers.forEach((b) => {
      b.visible = false;
    });
    this.ch3World.escapeSwitches.forEach((sw) => {
      sw.activated = false;
      sw.crystal.visible = true;
      sw.ring.visible = true;
    });
    this.ch3World.bellKeeperShadow.visible = false;
    this.ch3World.escapeDust.visible = false;
    this.ch3World.leftGatePivot.rotation.y = 0;
    this.ch3World.rightGatePivot.rotation.y = 0;
    this.ch3World.gateRunes.forEach((gr) => {
      (gr.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
    });
    this.ch3World.goldenKeyMesh.visible = false;
    this.ch3World.valleyBells.forEach((b) => {
      b.rotation.z = 0;
    });
    this.jafrMood = 'curious';
    this.jafrStatusText = 'Perched on right shoulder';
  }

  private applySavedCh2Progress(save: SaveProgress): void {
    if (typeof save.energy === 'number') this.energy = save.energy;
    if (typeof save.timeOfDay === 'number') this.timeOfDay = save.timeOfDay;
    if (save.inventory) this.inventory = save.inventory.map((it) => ({ ...it }));
    if (save.storyFlags) this.ch2Flags = { ...DEFAULT_CH2_FLAGS, ...save.storyFlags };
    if (this.ch2Flags.itemsCollected) {
      this.ch2World.boxLidPivot.rotation.x = -1.45;
      this.ch2World.boxTonicMesh.visible = false;
      this.ch2World.boxFruitMeshes.forEach((m) => {
        m.visible = false;
      });
    }
    if (this.ch2Flags.portalDiscovered) {
      this.ch2World.portalEnergyUniforms.uIntensity.value = this.ch2Flags.portalInvestigated ? 0.85 : 0.62;
      this.ch2World.portalLight.intensity = this.ch2Flags.portalInvestigated ? 12.5 : 8.5;
      this.ch2World.portalRuneMeshes.forEach((r) => {
        (r.material as THREE.MeshStandardMaterial).emissiveIntensity = this.ch2Flags.portalInvestigated ? 0.72 : 0.55;
      });
    }
    this.ch2World.houseInteriorGroup.visible = this.ch2Flags.insideHouse;
    this.ch2World.houseExteriorGroup.visible = !this.ch2Flags.insideHouse;
  }

  private applySavedCh3Progress(save: SaveProgress): void {
    if (typeof save.energy === 'number') this.energy = save.energy;
    if (save.inventory) this.inventory = save.inventory.map((it) => ({ ...it }));
    if (save.ch3Flags) {
      this.ch3Flags = { ...DEFAULT_CH3_FLAGS, ...save.ch3Flags };
      this.ch3World.letterEnvelopeGroup.visible = !this.ch3Flags.letterCollected;
      if (this.ch3Flags.clockTriggered) {
        this.ch3World.clockHourHand.rotation.z = -(7 / 12) * Math.PI * 2;
        this.ch3World.clockMinuteHand.rotation.z = 0;
      }
      this.ch3World.collectibles.forEach((c) => {
        c.collected = this.ch3Flags.collectedOptionalIds.includes(c.id);
        c.group.visible = !c.collected;
      });
      this.ch3World.fragments.forEach((f) => {
        f.collected = this.ch3Flags.collectedFragments.includes(f.id);
        f.group.visible = !f.collected;
      });
      this.ch3World.memoryStones.forEach((st, idx) => {
        st.collected = this.ch3Flags.stonesSolved;
        st.runeDial.rotation.z = this.ch3Flags.stoneRotations[idx] * (Math.PI / 2);
        (st.crystal.material as THREE.MeshStandardMaterial).emissiveIntensity = this.ch3Flags.stonesSolved ? 0.72 : 0.42;
        (st.runeDial.material as THREE.MeshStandardMaterial).emissiveIntensity = this.ch3Flags.stonesSolved ? 0.68 : 0.35;
      });
      if (this.ch3Flags.stonesSolved) {
        this.ch3World.platformRunes.forEach((pr) => {
          (pr.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.62;
        });
        this.ch3World.stairTrapdoor.visible = false;
        this.ch3World.hiddenStairGroup.visible = true;
      }
      this.ch3World.escapeSwitches.forEach((sw) => {
        const done = this.ch3Flags.escapeSwitchIds.includes(sw.id);
        sw.activated = done;
        sw.crystal.visible = !done;
        sw.ring.visible = !done;
      });
      if (this.ch3Flags.escapeActive) {
        this.ch3World.escapeBarriers.forEach((b, i) => {
          const sw = this.ch3World.escapeSwitches[i];
          b.visible = !sw?.activated;
        });
        this.ch3World.bellKeeperShadow.visible = true;
        this.ch3World.escapeDust.visible = true;
      }
      if (this.ch3Flags.lumiMet && !this.ch3Flags.stonesSolved) {
        this.ch3World.lumiRig.root.position.set(4.5, 0.2, -70);
      }
    }
  }

  private emitSave(
    scene: SceneId,
    ch1Complete: boolean,
    dist: number,
    ch2Complete = false,
    ch3Complete = false,
    ch4Complete = false
  ): void {
    const isCh4 = this.isChapter4Scene(scene);
    const isCh3 = this.isChapter3Scene(scene);
    const isCh2 = this.isChapter2Scene(scene);
    this.onSaveCheckpoint({
      chapter: isCh4 ? 4 : isCh3 ? 3 : isCh2 ? 2 : 1,
      checkpointScene: scene,
      chapter1Completed: ch1Complete || isCh2 || isCh3 || isCh4,
      chapter2Completed: ch2Complete || isCh3 || isCh4,
      chapter3Completed: ch3Complete || isCh4,
      chapter4Completed: ch4Complete,
      distanceRemaining: dist,
      playerPosition:
        isCh2 || isCh3 || isCh4
          ? { x: this.playerPos.x, y: this.playerPos.y, z: this.playerPos.z }
          : null,
      playerYaw: isCh2 || isCh3 || isCh4 ? this.playerYaw : undefined,
      energy: isCh2 || isCh3 || isCh4 ? Math.round(this.energy) : undefined,
      timeOfDay: isCh2 ? this.timeOfDay : undefined,
      inventory: isCh2 || isCh3 || isCh4 ? this.inventory.map((it) => ({ ...it })) : undefined,
      storyFlags: isCh2 ? { ...this.ch2Flags } : undefined,
      ch3Flags: isCh3 ? { ...this.ch3Flags } : undefined,
      ch4Flags: isCh4 ? { ...this.ch4Flags } : undefined,
    });
  }

  private setRealm(realm: 'title' | 'village' | 'library' | 'chapter2' | 'chapter3' | 'chapter4'): void {
    this.titleWorld.group.visible = realm === 'title';
    this.nate.root.visible = realm !== 'title';
    this.jafr.root.visible = realm !== 'title';
    this.eita.root.visible = realm === 'chapter4' && this.eita.root.visible;
    this.sneh.root.visible = realm === 'chapter4' && this.sneh.root.visible;
    if (realm !== 'chapter4') {
      this.ch4World.group.visible = false;
      this.eita.root.visible = false;
      this.sneh.root.visible = false;
      this.ch4WoundedWarrior.root.visible = false;
      this.ch4Warriors.forEach((w) => {
        w.rig.root.visible = false;
      });
    }
    if (realm === 'title') {
      this.village.group.visible = false;
      this.library.group.visible = false;
      this.ch2World.group.visible = false;
      this.ch3World.group.visible = false;
      this.weatherPoints.visible = false;
      this.scene.background = new THREE.Color(0x050811);
      this.scene.fog = new THREE.FogExp2(0x050811, 0.015);
      this.hemiLight.color.setHex(0x88b4e8);
      this.hemiLight.groundColor.setHex(0x1e1928);
      this.hemiLight.intensity = 0.72;
      this.sunLight.intensity = 0.85;
      this.sunLight.color.setHex(0xfde6b4);
      if (this.bloomPass) {
        this.bloomPass.strength = 0.075;
        this.bloomPass.radius = 0.34;
        this.bloomPass.threshold = 1.06;
      }
      this.sound.setZone(this.introStage === 'menu' ? 'title_menu' : 'title_intro');
    } else if (realm === 'village') {
      this.village.group.visible = true;
      this.library.group.visible = false;
      this.ch2World.group.visible = false;
      this.ch3World.group.visible = false;
      this.weatherPoints.visible = true;
      this.scene.background = new THREE.Color(0x95b6c2);
      this.scene.fog = new THREE.FogExp2(0x95b6c2, 0.0038);
      this.hemiLight.color.setHex(0xcbe8f6);
      this.hemiLight.groundColor.setHex(0x3b5832);
      this.hemiLight.intensity = 0.78;
      this.sunLight.intensity = 1.45;
      this.sunLight.color.setHex(0xfff1d6);
      if (this.bloomPass) {
        this.bloomPass.strength = 0.05;
        this.bloomPass.radius = 0.30;
        this.bloomPass.threshold = 1.10;
      }
      this.sound.setZone('village');
    } else if (realm === 'library') {
      this.village.group.visible = false;
      this.library.group.visible = true;
      this.ch2World.group.visible = false;
      this.ch3World.group.visible = false;
      this.weatherPoints.visible = true;
      this.scene.background = new THREE.Color(0x0d1526);
      this.scene.fog = new THREE.FogExp2(0x0d1526, 0.0065);
      this.hemiLight.color.setHex(0x88b4e8);
      this.hemiLight.groundColor.setHex(0x281e38);
      this.hemiLight.intensity = 0.82;
      this.sunLight.intensity = 0.55;
      if (this.bloomPass) {
        this.bloomPass.strength = 0.06;
        this.bloomPass.radius = 0.32;
        this.bloomPass.threshold = 1.10;
      }
      this.sound.setZone('library');
    } else if (realm === 'chapter3') {
      this.village.group.visible = false;
      this.library.group.visible = false;
      this.ch2World.group.visible = false;
      this.ch3World.group.visible = true;
      this.weatherPoints.visible = false;
      this.setCh3SubZone(this.ch3Flags.subZone);
    } else if (realm === 'chapter4') {
      this.village.group.visible = false;
      this.library.group.visible = false;
      this.ch2World.group.visible = false;
      this.ch3World.group.visible = false;
      this.ch4World.group.visible = true;
      this.weatherPoints.visible = false;
      this.setCh4SubZone(this.ch4Flags.subZone);
    } else {
      this.village.group.visible = false;
      this.library.group.visible = false;
      this.ch2World.group.visible = true;
      this.ch3World.group.visible = false;
      this.weatherPoints.visible = false;
      this.scene.background = new THREE.Color(0xc97b62);
      this.scene.fog = new THREE.FogExp2(0xc97b62, 0.0036);
      this.hemiLight.color.setHex(0xffd6b0);
      this.hemiLight.groundColor.setHex(0x2e4532);
      this.hemiLight.intensity = 0.85;
      this.sunLight.intensity = 1.45;
      if (this.bloomPass) {
        this.bloomPass.strength = 0.055;
        this.bloomPass.radius = 0.30;
        this.bloomPass.threshold = 1.10;
      }
      updateChapter2Atmosphere(
        this.ch2World,
        this.timeOfDay,
        this.totalTime,
        this.scene,
        this.hemiLight,
        this.sunLight,
        this.ch2Flags.insideHouse
      );
    }
  }

  private setCh3SubZone(sub: Ch3SubZone): void {
    this.ch3Flags.subZone = sub;
    this.ch3World.tunnelGroup.visible = sub === 'tunnel';
    this.ch3World.houseInteriorGroup.visible = sub === 'house_interior';
    this.ch3World.surfaceGroup.visible = sub === 'surface';
    this.ch3World.elarionGroup.visible = sub === 'elarion';
    this.ch3World.valleyGroup.visible = sub === 'valley';
    this.ch3World.skyDome.visible = sub !== 'tunnel' && sub !== 'house_interior';

    if (sub === 'tunnel') {
      this.scene.background = new THREE.Color(0xe0f2fe);
      this.scene.fog = new THREE.FogExp2(0xe0f2fe, 0.014);
      this.hemiLight.color.setHex(0xf8fafc);
      this.hemiLight.groundColor.setHex(0x93c5fd);
      this.hemiLight.intensity = 1.25;
      this.sunLight.intensity = 0.8;
      this.sound.setZone('portal_tunnel');
    } else if (sub === 'house_interior') {
      this.scene.background = new THREE.Color(0x1f1916);
      this.scene.fog = new THREE.FogExp2(0x1f1916, 0.02);
      this.hemiLight.color.setHex(0xffe0b2);
      this.hemiLight.groundColor.setHex(0x3b2a20);
      this.hemiLight.intensity = 0.85;
      this.sunLight.intensity = 0.55;
      this.sound.setZone('ch3_house');
    } else if (sub === 'surface') {
      this.scene.background = new THREE.Color(0x1b2b3e);
      this.scene.fog = new THREE.FogExp2(0x1b2b3e, 0.0056);
      (this.ch3World.skyDome.material as THREE.MeshBasicMaterial).color.setHex(0x1a283f);
      this.hemiLight.color.setHex(0x98c4e8);
      this.hemiLight.groundColor.setHex(0x1f362d);
      this.hemiLight.intensity = 0.92;
      this.sunLight.intensity = 1.15;
      this.sunLight.color.setHex(0xdceeff);
      this.sound.setZone(this.playerPos.z < -4 ? 'woods' : 'ch3_house');
    } else if (sub === 'elarion') {
      const darkWarning = this.ch3Flags.warningTriggered || this.ch3Flags.escapeActive;
      this.scene.background = new THREE.Color(darkWarning ? 0x070a14 : 0x0c1629);
      this.scene.fog = new THREE.FogExp2(darkWarning ? 0x070a14 : 0x0c1629, darkWarning ? 0.011 : 0.0075);
      (this.ch3World.skyDome.material as THREE.MeshBasicMaterial).color.setHex(0x0c1629);
      this.hemiLight.color.setHex(darkWarning ? 0x5c7299 : 0x7dd3fc);
      this.hemiLight.groundColor.setHex(0x151e30);
      this.hemiLight.intensity = darkWarning ? 0.52 : 0.78;
      this.sunLight.intensity = darkWarning ? 0.35 : 0.65;
      this.sound.setZone(this.ch3Flags.escapeActive ? 'escape' : this.ch3Flags.orvellanMet ? 'ch3_library' : 'elarion');
    } else if (sub === 'valley') {
      this.scene.background = new THREE.Color(0x1f2f46);
      this.scene.fog = new THREE.FogExp2(0x1f2f46, 0.0034);
      (this.ch3World.skyDome.material as THREE.MeshBasicMaterial).color.setHex(0x223650);
      this.hemiLight.color.setHex(0xfde68a);
      this.hemiLight.groundColor.setHex(0x1e3a3a);
      this.hemiLight.intensity = 1.0;
      this.sunLight.intensity = 1.35;
      this.sunLight.color.setHex(0xffedd5);
      this.sound.setZone('bells');
    }

    if (this.bloomPass) {
      this.bloomPass.strength = 0.065;
      this.bloomPass.radius = 0.32;
      this.bloomPass.threshold = 1.08;
    }
  }

  public enterScene(id: SceneId, savedProgress?: SaveProgress): void {
    const keepFlight = this.sceneId === 'scene_6_flying_tutorial' && id === 'scene_7_find_book';
    const keepCh2World = this.isChapter2Scene(this.sceneId) && this.isChapter2Scene(id);
    const keepCh3World = this.isChapter3Scene(this.sceneId) && this.isChapter3Scene(id);
    this.sceneId = id;
    this.sceneTimer = 0;
    this.fadeAlpha =
      id === 'scene_5_library_cinematic' || id === 'ch2_scene_1_seashore' ? 1 : 0;
    this.whiteFadeAlpha = 0;
    this.portalGlowAlpha = 0;
    this.doorOpening = false;
    this.doorOpenProgress = 0;
    if (!keepFlight) {
      this.isFlying = false;
      this.playerVel.set(0, 0, 0);
      for (let i = 0; i < this.flyTrailPositions.length; i += 3) {
        this.flyTrailPositions[i + 1] = -999;
      }
      this.flyTrailPoints.geometry.attributes.position.needsUpdate = true;
    }
    this.isSitting = false;
    this.shocked = false;
    this.portalGroup.visible = false;
    this.ambientBubble = null;
    this.greetingStep = 0;
    this.gameOverReason = null;
    this.isResting = false;
    this.isSleeping = false;
    this.restModalOpen = false;
    this.inventoryOpen = false;
    this.letterOpen = null;
    this.ch3PuzzleOpen = false;
    this.questLogOpen = false;
    this.ch3OrvellanMenuActive = false;
    this.boxOpening = false;
    this.ch2DoorOpening = false;
    this.observationMode = false;
    this.discoveryTimer = 0;

    // Reset dynamic character/prop/light states cleanly across restarts & replays
    this.nate.root.scale.setScalar(1);
    this.nate.heldBook.position.set(0, 1.02, 0.42);
    this.nate.heldBookLeftPage.rotation.y = 0.45;
    this.nate.heldBookRightPage.rotation.y = -0.45;
    const baseLibLights = [95, 75, 55];
    this.library.libraryLights.forEach((lt, idx) => {
      lt.intensity = baseLibLights[idx] ?? 65;
    });
    this.village.libraryExterior.leftDoorPivot.rotation.y = 0;
    this.village.libraryExterior.rightDoorPivot.rotation.y = 0;

    if (id === 'title') {
      this.setRealm('title');
    } else if (
      id === 'scene_1_intro' ||
      id === 'scene_2_mission' ||
      id === 'scene_3_journey' ||
      id === 'scene_4_entrance'
    ) {
      this.setRealm('village');
    } else if (this.isChapter2Scene(id)) {
      this.setRealm('chapter2');
    } else if (this.isChapter3Scene(id)) {
      this.setRealm('chapter3');
    } else if (this.isChapter4Scene(id)) {
      this.setRealm('chapter4');
    } else {
      this.setRealm('library');
    }

    if (id === 'title') {
      this.mode = 'title';
      this.hasBook = false;
      this.introElapsed = 0;
      this.introStage = 'intro_dark';
      this.introCueFlags = {
        opened: false,
        pages: [false, false, false, false, false],
        title: false,
        closed: false,
      };
      this.sound.setZone('title_intro');
      this.playerPos.set(0, 0, 0);
      this.nate.root.position.copy(this.playerPos);
      this.jafrPos.set(0.9, 0, 0.4);
      this.jafr.root.position.copy(this.jafrPos);
    } else if (id === 'scene_1_intro') {
      this.mode = 'playing';
      this.hasBook = false;
      this.playerPos.set(0.6, 0.18, 6.2);
      this.playerYaw = -2.4;
      this.nate.root.position.copy(this.playerPos);
      this.jafrPos.set(1.25, 0.18, 6.5);
    } else if (id === 'scene_2_mission') {
      this.mode = 'playing';
      this.dialogueIdx = 0;
      this.autoDialogueTimer = 0;
      this.playerPos.set(0.6, 0.18, 6.2);
      this.playerYaw = -1.2;
      this.nate.root.position.copy(this.playerPos);
      this.nate.root.rotation.y = this.playerYaw;
      this.jafrPos.set(1.3, 0.18, 6.4);
      this.jafr.root.position.copy(this.jafrPos);
      this.camera.position.set(1.65, 1.88, 3.65);
      this.missionCamLook.set(-0.55, 1.25, 6.55);
      this.camera.lookAt(this.missionCamLook);
    } else if (id === 'scene_3_journey') {
      this.mode = 'playing';
      this.hasBook = false;
      this.playerPos.set(0, getWalkSurfaceHeight(0, 0).y, 0);
      this.playerYaw = Math.PI;
      this.camYaw = Math.PI;
      this.camPitch = 0.28;
      this.jafrPos.set(0.95, this.playerPos.y, 0.8);
      this.latestCheckpoint = 'scene_3_journey';
    } else if (id === 'scene_4_entrance') {
      this.mode = 'playing';
      this.hasBook = false;
      const startPt = JOURNEY_CURVE.getPointAt(0.992);
      this.playerPos.set(startPt.x, getWalkSurfaceHeight(startPt.x, startPt.z).y, startPt.z);
      this.playerYaw = Math.PI;
      this.camYaw = Math.PI;
      this.camPitch = 0.22;
      this.jafrPos.set(this.playerPos.x + 1.0, this.playerPos.y, this.playerPos.z + 0.8);
      this.latestCheckpoint = 'scene_4_entrance';
      this.emitSave('scene_4_entrance', false, 0);
    } else if (id === 'scene_5_library_cinematic') {
      this.mode = 'playing';
      this.hasBook = false;
      this.library.targetBookGroup.visible = true;
      this.library.targetBeacon.visible = true;
      this.library.npcs.forEach((n) => {
        n.greeted = false;
      });
      this.playerPos.set(0, 0, 30);
      this.playerYaw = Math.PI;
      this.jafrPos.set(1.1, 0, 30.8);
    } else if (id === 'scene_6_flying_tutorial') {
      this.mode = 'playing';
      this.hasBook = false;
      this.tutorialFlyTime = 0;
      this.library.targetBookGroup.visible = true;
      this.library.targetBeacon.visible = true;
      this.library.npcs.forEach((n) => {
        n.greeted = false;
      });
      this.playerPos.set(0, 0, 28);
      this.playerYaw = Math.PI;
      this.camYaw = Math.PI;
      this.camPitch = 0.22;
      this.fallPeakY = 0;
      this.jafrPos.set(1.1, 0, 28.8);
      this.latestCheckpoint = 'scene_6_flying_tutorial';
      this.emitSave('scene_6_flying_tutorial', false, 0);
    } else if (id === 'scene_7_find_book') {
      this.mode = 'playing';
      this.hasBook = false;
      this.library.targetBookGroup.visible = true;
      this.library.targetBeacon.visible = true;
      const radial = Math.hypot(this.playerPos.x, this.playerPos.z);
      if (radial < 7.5 || radial > 38.5) {
        this.playerPos.set(0, 0, 26);
        this.playerYaw = Math.PI;
        this.camYaw = Math.PI;
        this.camPitch = 0.22;
        this.jafrPos.set(1.1, 0, 26.8);
        this.library.npcs.forEach((n) => {
          n.greeted = false;
        });
      }
      this.latestCheckpoint = 'scene_7_find_book';
    } else if (id === 'scene_8_flying_chair') {
      this.mode = 'playing';
      this.hasBook = true;
      this.library.targetBookGroup.visible = false;
      this.library.targetBeacon.visible = false;
      if (this.playerPos.y < 10) {
        this.playerPos.set(0, 22, -20);
        this.playerYaw = -Math.PI / 2;
        this.camYaw = -Math.PI / 2;
        this.camPitch = 0.22;
        this.jafrPos.set(1.1, 22, -19.2);
      }
      this.latestCheckpoint = 'scene_8_flying_chair';
    } else if (id === 'scene_9_finale') {
      this.mode = 'playing';
      this.hasBook = true;
      this.isSitting = true;
      this.isFlying = false;
      this.sound.setZone('finale');
      this.sound.playPortalCrescendo();
      this.playerPos.copy(this.library.targetChairPos).add(new THREE.Vector3(0, 0.35, 0));
      this.playerYaw = -0.45;
      this.portalGroup.position.copy(this.playerPos).add(new THREE.Vector3(-0.3, 1.1, 0.5));
      this.portalGroup.rotation.y = this.playerYaw;
    } else if (id === 'chapter_complete') {
      this.mode = 'complete';
      this.fadeAlpha = 1;
      this.sound.setZone('silent');
      this.emitSave('scene_9_finale', true, 0);
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    } else if (id === 'ch2_scene_1_seashore') {
      this.mode = 'playing';
      this.resetCh2State();
      this.hasBook = false;
      this.playerPos.copy(CH2_SHORE_START_POS);
      this.playerYaw = Math.PI;
      this.nate.root.position.copy(this.playerPos);
      this.nate.root.rotation.y = this.playerYaw;
      this.sound.setZone('seashore');
      this.latestCheckpoint = 'ch2_scene_1_seashore';
    } else if (id === 'ch2_scene_2_jafr_reveal') {
      this.mode = 'playing';
      this.hasBook = false;
      this.jafrRevealStep = 0;
      this.playerPos.copy(CH2_SHORE_START_POS);
      this.playerYaw = Math.PI;
      this.camYaw = Math.PI;
      this.camPitch = 0.24;
      this.nate.root.position.copy(this.playerPos);
      this.nate.root.rotation.y = this.playerYaw;
      this.jafrPos.set(this.playerPos.x + 0.45, this.playerPos.y + 0.65, this.playerPos.z + 0.12);
      this.sound.setZone('seashore');
      this.sound.playVoiceCue('Jafr');
      this.latestCheckpoint = 'ch2_scene_2_jafr_reveal';
    } else if (id === 'ch2_scene_3_explore') {
      this.mode = 'playing';
      this.hasBook = false;
      if (!keepCh2World) {
        if (savedProgress?.playerPosition) {
          this.playerPos.set(
            savedProgress.playerPosition.x,
            savedProgress.playerPosition.y,
            savedProgress.playerPosition.z
          );
          this.playerYaw = savedProgress.playerYaw ?? Math.PI;
        } else {
          this.playerPos.copy(CH2_SHORE_START_POS);
          this.playerYaw = Math.PI;
        }
        this.camYaw = this.playerYaw;
        this.camPitch = 0.25;
      }
      this.ch2Flags.insideHouse = false;
      this.ch2World.houseExteriorGroup.visible = true;
      this.ch2World.houseInteriorGroup.visible = false;
      this.sound.setZone(this.playerPos.z < -10 ? 'mountain' : 'seashore');
      this.latestCheckpoint = 'ch2_scene_3_explore';
      this.emitSave('ch2_scene_3_explore', true, Math.round(this.playerPos.distanceTo(CH2_DOOR_POS)));
    } else if (id === 'ch2_scene_4_house_interior' || id === 'ch2_scene_5_supply_box' || id === 'ch2_scene_6_rest_sleep') {
      this.mode = 'playing';
      this.hasBook = false;
      this.ch2Flags.houseDiscovered = true;
      this.ch2Flags.insideHouse = true;
      this.ch2World.houseExteriorGroup.visible = false;
      this.ch2World.houseInteriorGroup.visible = true;
      if (!keepCh2World) {
        if (savedProgress?.playerPosition) {
          this.playerPos.set(
            savedProgress.playerPosition.x,
            savedProgress.playerPosition.y,
            savedProgress.playerPosition.z
          );
          this.playerYaw = savedProgress.playerYaw ?? Math.PI;
        } else {
          this.playerPos.copy(CH2_INTERIOR_SPAWN);
          this.playerYaw = Math.PI;
          if (id === 'ch2_scene_6_rest_sleep') {
            // Direct Chapter Select jump to Scene 6 starts with supply box already gathered
            this.ch2Flags.boxOpened = true;
            this.ch2Flags.itemsCollected = true;
            this.ch2World.boxLidPivot.rotation.x = -1.45;
            this.ch2World.boxTonicMesh.visible = false;
            this.ch2World.boxFruitMeshes.forEach((m) => {
              m.visible = false;
            });
            this.inventory = [
              {
                id: 'energy_tonic',
                name: 'Energy Tonic',
                description: 'Luminous herbal elixir that restores stamina immediately.',
                quantity: 1,
                energyRestore: 55,
              },
              {
                id: 'fruit',
                name: 'Island Fruit',
                description: 'Fresh wild island fruit. Restores energy and hunger.',
                quantity: 3,
                energyRestore: 20,
              },
            ];
          }
        }
        this.camYaw = this.playerYaw;
        this.camPitch = 0.22;
      }
      this.sound.setZone('house');
      this.latestCheckpoint = id;
      this.emitSave(id, true, 0);
    } else if (id === 'ch2_scene_7_portal') {
      this.mode = 'playing';
      this.hasBook = false;
      this.ch2Flags.houseDiscovered = true;
      this.ch2Flags.insideHouse = false;
      this.ch2Flags.itemsCollected = true;
      this.ch2Flags.sleptOnce = true;
      this.ch2Flags.firstCheckpointSaved = true;
      this.ch2World.houseExteriorGroup.visible = true;
      this.ch2World.houseInteriorGroup.visible = false;
      if (!keepCh2World) {
        if (savedProgress?.playerPosition) {
          this.playerPos.set(
            savedProgress.playerPosition.x,
            savedProgress.playerPosition.y,
            savedProgress.playerPosition.z
          );
          this.playerYaw = savedProgress.playerYaw ?? 0;
        } else {
          this.playerPos.set(0, getCh2WalkSurface(0, -100.5, false).y, -100.5);
          this.playerYaw = 0;
        }
        this.camYaw = this.playerYaw;
        this.camPitch = 0.22;
        this.timeOfDay = 1.0;
        if (!this.ch2Flags.portalDiscovered) {
          this.startPortalDiscoveryCutscene();
        }
      }
      this.sound.setZone('mountain');
      this.latestCheckpoint = 'ch2_scene_7_portal';
      this.emitSave('ch2_scene_7_portal', true, 0);
    } else if (id === 'ch2_complete') {
      this.mode = 'complete';
      this.ch2PostCompleteExplore = false;
      this.fadeAlpha = this.ch2PortalCompleted ? 1 : 0;
      this.sound.setZone(this.ch2PortalCompleted ? 'silent' : 'house');
      this.emitSave(
        this.ch2PortalCompleted ? 'ch2_scene_7_portal' : 'ch2_scene_6_rest_sleep',
        true,
        0,
        this.ch2PortalCompleted
      );
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    } else if (
      id === 'ch3_scene_1_arrival' ||
      id === 'ch3_scene_2_whispering_woods' ||
      id === 'ch3_scene_elarion' ||
      id === 'ch3_scene_3_silent_bells'
    ) {
      this.mode = 'playing';
      this.hasBook = false;
      if (id === 'ch3_scene_1_arrival') {
        if (!savedProgress && !this.ch3Flags.portalSequenceDone) {
          this.setCh3SubZone('tunnel');
          this.ch3PortalTunnelActive = true;
          this.ch3PortalTunnelTimer = 0;
          this.ch3ArrivalLineStep = 0;
          this.whiteFadeAlpha = 1;
          this.playerPos.set(0, 0, 10);
          this.playerYaw = Math.PI;
        } else {
          this.setCh3SubZone(this.ch3Flags.subZone === 'tunnel' ? 'surface' : this.ch3Flags.subZone);
          if (savedProgress?.playerPosition && savedProgress.chapter === 3) {
            this.playerPos.set(
              savedProgress.playerPosition.x,
              savedProgress.playerPosition.y,
              savedProgress.playerPosition.z
            );
            this.playerYaw = savedProgress.playerYaw ?? Math.PI;
          } else {
            this.playerPos.copy(CH3_SPAWN_POS);
            this.playerYaw = Math.PI;
          }
          this.camYaw = this.playerYaw;
          this.camPitch = 0.24;
        }
      } else if (id === 'ch3_scene_2_whispering_woods') {
        this.ch3Flags.portalSequenceDone = true;
        this.ch3Flags.sleptInHouse = true;
        this.ch3Flags.doorOpenedOnce = true;
        this.ch3Flags.letterCollected = true;
        this.ch3Flags.letterRead = true;
        this.ch3Flags.clockTriggered = true;
        this.ch3Flags.footprintsDiscovered = true;
        this.ch3Flags.act = Math.max(this.ch3Flags.act, 3);
        this.ch3World.letterEnvelopeGroup.visible = false;
        this.setCh3SubZone('surface');
        if (!keepCh3World) {
          if (savedProgress?.playerPosition && savedProgress.chapter === 3) {
            this.playerPos.set(
              savedProgress.playerPosition.x,
              savedProgress.playerPosition.y,
              savedProgress.playerPosition.z
            );
            this.playerYaw = savedProgress.playerYaw ?? Math.PI;
          } else {
            this.playerPos.set(0, 0, -10);
            this.playerYaw = Math.PI;
          }
          this.camYaw = this.playerYaw;
          this.camPitch = 0.24;
        }
      } else if (id === 'ch3_scene_elarion') {
        this.ch3Flags.portalSequenceDone = true;
        this.ch3Flags.stonesSolved = true;
        this.ch3Flags.memoryStonesCollected = 3;
        this.ch3Flags.memoryCrystalObtained = true;
        this.ch3Flags.elarionEntered = true;
        this.ch3Flags.act = Math.max(this.ch3Flags.act, 5);
        if (!this.inventory.some((it) => it.id === 'memory_crystal')) {
          this.inventory.push({
            id: 'memory_crystal',
            name: 'Memory Crystal',
            description: 'Lumi’s luminous crystal. Reveals echoes of the forgotten past when activated.',
            quantity: 1,
            energyRestore: 0,
          });
        }
        this.setCh3SubZone('elarion');
        if (!keepCh3World) {
          if (savedProgress?.playerPosition && savedProgress.chapter === 3 && savedProgress.ch3Flags?.subZone === 'elarion') {
            this.playerPos.set(
              savedProgress.playerPosition.x,
              savedProgress.playerPosition.y,
              savedProgress.playerPosition.z
            );
            this.playerYaw = savedProgress.playerYaw ?? Math.PI;
          } else if (this.ch3Flags.escapeActive) {
            this.playerPos.set(0, 0, -76);
            this.playerYaw = Math.PI;
          } else {
            this.playerPos.copy(CH3_ELARION_SPAWN);
            this.playerYaw = Math.PI;
          }
          this.camYaw = this.playerYaw;
          this.camPitch = 0.24;
          if (!this.ch3Flags.escapeActive) {
            this.ch3BannerTitle = 'ELARION · THE FORGOTTEN CITY';
            this.ch3BannerSubtitle = 'Subterranean Sanctuary of Aurelia';
            this.ch3BannerTimer = 4.2;
          }
        }
      } else if (id === 'ch3_scene_3_silent_bells') {
        this.ch3Flags.portalSequenceDone = true;
        this.ch3Flags.stonesSolved = true;
        this.ch3Flags.gateKeyObtained = true;
        this.ch3Flags.escapeActive = false;
        this.ch3Flags.act = 10;
        this.setCh3SubZone('valley');
        this.playerPos.copy(CH3_VALLEY_SPAWN);
        this.playerYaw = Math.PI;
        this.camYaw = Math.PI;
        this.camPitch = 0.18;
        this.ch3BellFinalePhase = 'valley';
        this.ch3BellFinaleActive = true;
        this.ch3BellFinaleTimer = 0;
        this.ch3BannerTitle = 'THE VALLEY OF SILENT BELLS';
        this.ch3BannerSubtitle = 'Act 10 · Beyond the Northern Gate';
        this.ch3BannerTimer = 4.5;
      }
      this.latestCheckpoint = id;
      this.emitSave(id, true, 0, true, false);
    } else if (id === 'ch3_complete') {
      this.mode = 'complete';
      this.fadeAlpha = 1;
      this.whiteFadeAlpha = 0;
      this.sound.setZone('silent');
      this.emitSave('ch3_scene_3_silent_bells', true, 0, true, true);
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    } else if (
      id === 'ch4_scene_1_arrival' ||
      id === 'ch4_scene_2_battlefield' ||
      id === 'ch4_scene_3_castle_interior' ||
      id === 'ch4_scene_4_pelicon_town'
    ) {
      this.mode = 'playing';
      this.hasBook = false;
      const keepCh4World = this.isChapter4Scene(this.sceneId);
      if (id === 'ch4_scene_1_arrival') {
        if (!savedProgress && !this.ch4Flags.arrivalDone) {
          this.setCh4SubZone('tunnel');
          this.ch4CutscenePhase = 'portal';
          this.ch4CutsceneTimer = 0;
          this.ch4CutsceneStep = 0;
          this.playerPos.set(0, 0, 0);
          this.playerYaw = Math.PI;
          this.eita.root.visible = false;
          this.sneh.root.visible = false;
          this.ch4WoundedWarrior.root.visible = false;
        } else {
          this.setCh4SubZone('desert');
          this.ch4Flags.arrivalDone = true;
          this.ch4WoundedWarrior.root.visible = true;
          this.ch4WoundedWarrior.root.position.set(
            CH4_WOUNDED_WARRIOR_POS.x,
            getCh4DesertTerrainHeight(CH4_WOUNDED_WARRIOR_POS.x, CH4_WOUNDED_WARRIOR_POS.z),
            CH4_WOUNDED_WARRIOR_POS.z
          );
          if (savedProgress?.playerPosition && savedProgress.chapter === 4) {
            this.playerPos.set(
              savedProgress.playerPosition.x,
              savedProgress.playerPosition.y,
              savedProgress.playerPosition.z
            );
            this.playerYaw = savedProgress.playerYaw ?? Math.PI;
          } else {
            this.playerPos.set(
              CH4_DESERT_SPAWN.x,
              getCh4DesertTerrainHeight(CH4_DESERT_SPAWN.x, CH4_DESERT_SPAWN.z),
              CH4_DESERT_SPAWN.z
            );
            this.playerYaw = Math.PI;
          }
          this.camYaw = this.playerYaw;
          this.camPitch = 0.24;
        }
      } else if (id === 'ch4_scene_2_battlefield') {
        this.ch4Flags.arrivalDone = true;
        this.ch4Flags.woundedWarriorDone = true;
        this.ch4Flags.swordCollected = true;
        this.ch4Flags.act = Math.max(this.ch4Flags.act, 3);
        if (this.ch4Flags.activeWeapon === 'none') this.ch4Flags.activeWeapon = 'sword';
        this.grantCh4Item('pelicon_sword');
        this.ch4WoundedWarrior.root.visible = true;
        this.ch4WoundedWarrior.root.position.set(
          CH4_WOUNDED_WARRIOR_POS.x,
          getCh4DesertTerrainHeight(CH4_WOUNDED_WARRIOR_POS.x, CH4_WOUNDED_WARRIOR_POS.z),
          CH4_WOUNDED_WARRIOR_POS.z
        );
        this.ch4WoundedWarrior.struckArrow.visible = true;
        this.setCh4SubZone('desert');
        if (!keepCh4World) {
          if (savedProgress?.playerPosition && savedProgress.chapter === 4 && this.ch4Flags.subZone === 'desert') {
            this.playerPos.set(
              savedProgress.playerPosition.x,
              savedProgress.playerPosition.y,
              savedProgress.playerPosition.z
            );
            this.playerYaw = savedProgress.playerYaw ?? Math.PI;
          } else {
            this.playerPos.set(0, getCh4DesertTerrainHeight(0, 96), 96);
            this.playerYaw = Math.PI;
          }
          this.camYaw = this.playerYaw;
          this.camPitch = 0.24;
        }
        this.ch4BannerTitle = 'THE BATTLEFIELD OF PELICON';
        this.ch4BannerSubtitle = 'Right Click: Sword / Bow · Left Click: Aim Bow';
        this.ch4BannerTimer = 4.5;
      } else if (id === 'ch4_scene_3_castle_interior') {
        this.ch4Flags.arrivalDone = true;
        this.ch4Flags.woundedWarriorDone = true;
        this.ch4Flags.swordCollected = true;
        this.ch4Flags.wallCleared = true;
        this.ch4Flags.fireBowCollected = true;
        this.ch4Flags.marketCleared = true;
        this.ch4Flags.arcaneBowUnlocked = true;
        this.ch4Flags.castleRoadCleared = true;
        this.ch4Flags.victoryAchieved = true;
        this.ch4Flags.balconyEitaSeen = true;
        this.ch4Flags.castleEntered = true;
        this.ch4Flags.act = Math.max(this.ch4Flags.act, 7);
        this.grantCh4Item('pelicon_sword');
        this.grantCh4Item('fire_bow');
        this.grantCh4Item('arcane_bow');
        this.grantCh4Item('pelicon_emblem');
        if (this.ch4Flags.activeWeapon === 'none') this.ch4Flags.activeWeapon = 'sword';
        this.ch4Warriors.forEach((w) => {
          if (w.team === 'enemy') {
            w.dead = true;
            w.hp = 0;
            w.rig.root.visible = false;
          }
        });
        this.setCh4SubZone('castle_interior');
        this.ch4WoundedWarrior.root.visible = false;
        if (!keepCh4World) {
          if (savedProgress?.playerPosition && savedProgress.chapter === 4 && this.ch4Flags.subZone === 'castle_interior') {
            this.playerPos.set(
              savedProgress.playerPosition.x,
              savedProgress.playerPosition.y,
              savedProgress.playerPosition.z
            );
            this.playerYaw = savedProgress.playerYaw ?? Math.PI;
          } else {
            this.playerPos.copy(CH4_CASTLE_INTERIOR_SPAWN);
            this.playerYaw = Math.PI;
          }
          this.camYaw = this.playerYaw;
          this.camPitch = 0.22;
        }
        if (this.ch4Flags.eitaCompanionActive) {
          this.eita.root.visible = true;
          this.sneh.root.visible = true;
          this.ch4SnehAttachedToEita = true;
          this.ch4EitaPos.copy(this.playerPos).add(new THREE.Vector3(1.2, 0, 0.8));
        } else {
          this.eita.root.visible = true;
          this.ch4EitaPos.set(0, 3.8, -32.2);
          this.ch4EitaYaw = 0;
          this.sneh.root.visible = false;
        }
        this.ch4BannerTitle = 'PELICON ROYAL CASTLE';
        this.ch4BannerSubtitle = "Ascend the Grand Staircase to Princess Eita's Room";
        this.ch4BannerTimer = 4.4;
      } else if (id === 'ch4_scene_4_pelicon_town') {
        this.ch4Flags.arrivalDone = true;
        this.ch4Flags.woundedWarriorDone = true;
        this.ch4Flags.swordCollected = true;
        this.ch4Flags.wallCleared = true;
        this.ch4Flags.fireBowCollected = true;
        this.ch4Flags.marketCleared = true;
        this.ch4Flags.arcaneBowUnlocked = true;
        this.ch4Flags.castleRoadCleared = true;
        this.ch4Flags.victoryAchieved = true;
        this.ch4Flags.balconyEitaSeen = true;
        this.ch4Flags.castleEntered = true;
        this.ch4Flags.eitaRoomEntered = true;
        this.ch4Flags.reunionDone = true;
        this.ch4Flags.powerAwakened = true;
        this.ch4Flags.eitaCompanionActive = true;
        this.ch4Flags.castleEscaped = true;
        this.ch4Flags.act = Math.max(this.ch4Flags.act, 11);
        this.grantCh4Item('pelicon_sword');
        this.grantCh4Item('fire_bow');
        this.grantCh4Item('arcane_bow');
        this.grantCh4Item('pelicon_emblem');
        this.grantCh4Item('eita_journal');
        this.ch4Warriors.forEach((w) => {
          if (w.team === 'enemy') {
            w.dead = true;
            w.hp = 0;
            w.rig.root.visible = false;
          }
        });
        this.setCh4SubZone('desert');
        this.sound.setZone('pelicon_town');
        this.ch4WoundedWarrior.root.visible = false;
        this.eita.root.visible = true;
        this.sneh.root.visible = true;
        this.ch4SnehAttachedToEita = true;
        this.playerPos.set(-28, getCh4DesertTerrainHeight(-28, -92), -92);
        this.playerYaw = Math.PI / 2;
        this.camYaw = Math.PI / 2;
        this.camPitch = 0.22;
        this.ch4EitaPos.set(-26.5, getCh4DesertTerrainHeight(-26.5, -90.6), -90.6);
        this.ch4BannerTitle = 'PELICON TOWN CELEBRATION';
        this.ch4BannerSubtitle = "Walk West with Eita, Jafr & Sneh toward Agnes's Church";
        this.ch4BannerTimer = 4.6;
      }
      this.latestCheckpoint = id;
      this.emitSave(id, true, 0, true, true, false);
    } else if (id === 'ch4_complete') {
      this.mode = 'complete';
      this.fadeAlpha = 1;
      this.whiteFadeAlpha = 0;
      this.sound.setZone('silent');
      this.emitSave('ch4_scene_4_pelicon_town', true, 0, true, true, true);
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    }

    this.emitHud(true);
  }

  private startLoop(): void {
    const tick = () => {
      if (this.disposed) return;
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05);

      if (this.mode !== 'paused') {
        this.update(dt);
      }

      if (this.composer && !this.isSoftwareGl && this.settings.graphicsQuality === 'high') {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private update(dt: number): void {
    this.totalTime += dt;
    this.sceneTimer += dt;

    if (this.itemToastTimer > 0) {
      this.itemToastTimer -= dt;
      if (this.itemToastTimer <= 0) this.itemToast = null;
    }
    if (this.ch2DialogueTimer > 0) {
      this.ch2DialogueTimer -= dt;
      if (this.ch2DialogueTimer <= 0) this.ch2Dialogue = null;
    }
    if (this.saveStatusTimer > 0) {
      this.saveStatusTimer -= dt;
      if (this.saveStatusTimer <= 0) this.saveStatus = 'idle';
    }
    if (this.checkpointBannerTimer > 0) {
      this.checkpointBannerTimer = Math.max(0, this.checkpointBannerTimer - dt);
    }
    if (this.ch3BannerTimer > 0) {
      this.ch3BannerTimer = Math.max(0, this.ch3BannerTimer - dt);
      if (this.ch3BannerTimer <= 0) {
        this.ch3BannerTitle = null;
        this.ch3BannerSubtitle = null;
      }
    }
    if (this.ch4BannerTimer > 0) {
      this.ch4BannerTimer = Math.max(0, this.ch4BannerTimer - dt);
      if (this.ch4BannerTimer <= 0) {
        this.ch4BannerTitle = null;
        this.ch4BannerSubtitle = null;
      }
    }
    if (this.ch4SwordSwingTimer > 0) this.ch4SwordSwingTimer = Math.max(0, this.ch4SwordSwingTimer - dt);
    if (this.ch4SwordHitTimer > 0) this.ch4SwordHitTimer = Math.max(0, this.ch4SwordHitTimer - dt);
    if (this.ch4ComboResetTimer > 0) {
      this.ch4ComboResetTimer -= dt;
      if (this.ch4ComboResetTimer <= 0) this.ch4ComboStep = 0;
    }
    if (this.ch4DodgeTimer > 0) {
      this.ch4DodgeTimer = Math.max(0, this.ch4DodgeTimer - dt);
    } else {
      this.stamina = Math.min(100, this.stamina + (this.ch4IsBlocking ? 7 : 18) * dt);
    }
    if (this.ch4BowCooldown > 0) this.ch4BowCooldown = Math.max(0, this.ch4BowCooldown - dt);

    // Auto-Dialogue progression when toggled on
    const canAutoAdvance =
      this.autoDialogue &&
      !this.ch3OrvellanMenuActive &&
      (this.sceneId === 'scene_2_mission' ||
        this.sceneId === 'ch2_scene_2_jafr_reveal' ||
        this.portalDiscoveryActive ||
        (this.portalFinaleActive && this.portalFinaleStep < 2) ||
        (this.ch3PortalTunnelActive && this.ch3PortalTunnelTimer >= 8.2) ||
        (this.isChapter4Scene() &&
          this.ch4CutscenePhase !== 'none' &&
          this.ch4CutscenePhase !== 'portal' &&
          this.ch4CutscenePhase !== 'magic_awaken' &&
          !(this.ch4CutscenePhase === 'outskirts_end' && this.ch4CutsceneStep >= 3)));
    if (canAutoAdvance) {
      this.autoDialogueTimer += dt;
      if (this.autoDialogueTimer >= 3.2) {
        this.autoDialogueTimer = 0;
        this.advanceDialogue();
      }
    } else {
      this.autoDialogueTimer = 0;
    }

    // Update environmental animations
    this.updateAmbientWorld(dt);
    this.updateWeatherParticles(dt);

    if (this.sceneId === 'title') {
      this.updateTitleSequence(dt);
      return;
    }

    if (this.sceneId === 'scene_1_intro') {
      this.updateScene1Intro(dt);
    } else if (this.sceneId === 'scene_2_mission') {
      this.updateScene2Mission(dt);
    } else if (this.sceneId === 'ch2_scene_1_seashore') {
      this.updateCh2Scene1Seashore();
    } else if (this.sceneId === 'ch2_scene_2_jafr_reveal') {
      this.updateCh2Scene2JafrReveal();
    } else if (this.isPlayableScene()) {
      if (this.isChapter2Scene() && this.portalDiscoveryActive) {
        this.updatePortalDiscoveryCutscene(dt);
      } else if (this.isChapter2Scene() && this.portalInvestigateActive) {
        this.updatePortalInvestigateCutscene(dt);
      } else if (this.isChapter2Scene() && this.portalFinaleActive) {
        this.updatePortalGatewayFinale(dt);
      } else if (this.isChapter3Scene() && this.ch3PortalTunnelActive) {
        this.updateCh3PortalArrival(dt);
      } else if (this.isChapter3Scene() && this.ch3MorningWakeActive) {
        this.updateCh3MorningWake(dt);
      } else if (this.isChapter3Scene() && this.ch3DoorAnimActive) {
        this.updateCh3DoorAnim(dt);
      } else if (this.isChapter3Scene() && this.ch3MemoryVisionActive) {
        this.updateCh3MemoryVision(dt);
      } else if (this.isChapter3Scene() && this.ch3ArchiveCinematicActive) {
        this.updateCh3ArchiveAndWarning(dt);
      } else if (this.isChapter3Scene() && this.ch3BellFinaleActive) {
        this.updateCh3BellFinale(dt);
      } else if (this.isChapter4Scene() && this.ch4CutscenePhase !== 'none') {
        this.updateCh4Cutscene(dt);
      } else if (this.isChapter2Scene() && this.isSleeping) {
        this.updateCh2SleepingSequence(dt);
      } else if (this.isChapter2Scene() && this.isResting) {
        this.updateCh2RestingState(dt);
      } else if (this.isChapter2Scene() && this.boxOpening) {
        this.updateCh2BoxOpenSequence(dt);
      } else if (this.isChapter2Scene() && this.ch2DoorOpening) {
        this.updateCh2DoorTransition(dt);
      } else if (this.isChapter2Scene() && this.discoveryTimer > 0) {
        this.updateCh2DiscoveryFocus(dt);
      } else if (
        this.ch3PuzzleOpen ||
        this.ch3OrvellanMenuActive ||
        this.questLogOpen ||
        this.letterOpen ||
        this.inventoryOpen
      ) {
        // Keep camera still while inspecting modals
      } else {
        this.updatePlayableMovement(dt);
        this.updateThirdPersonCamera(dt);
        this.updatePlayableProgression(dt);
        this.updateCh2Autosave(dt);
      }
    } else if (this.sceneId === 'scene_5_library_cinematic') {
      this.updateScene5LibraryCinematic();
    } else if (this.sceneId === 'scene_9_finale') {
      this.updateScene9Finale(dt);
    }

    if (this.isChapter4Scene()) {
      this.updateCh4EntitiesAndCompanions(dt);
    }
    this.updateJafr(dt);
    this.updateDirectionalShadowFollow();
    this.emitHud(false);
  }

  private updateAmbientWorld(dt: number): void {
    if (this.village.group.visible) {
      this.village.skyDome.position.set(this.camera.position.x, -12, this.camera.position.z);
      this.village.brookUniforms.uTime.value = this.totalTime;
      this.village.waterfallUniforms.uTime.value = this.totalTime;
      this.village.waterwheels.forEach((wheel) => {
        wheel.rotation.x -= dt * 1.1;
      });
      this.village.banners.forEach((banner, idx) => {
        banner.rotation.x = Math.sin(this.totalTime * 2.1 + idx) * 0.08;
      });
      this.tex.water.offset.y = (this.totalTime * 0.28) % 1;
      this.tex.waterNormal.offset.y = (this.totalTime * 0.36) % 1;
      this.tex.waterNormal.offset.x = Math.sin(this.totalTime * 0.4) * 0.08;
      this.village.grassUniforms.uTime.value = this.totalTime;
      this.village.libraryExterior.runeRing.rotation.z += dt * 0.35;
      this.village.libraryBeaconRing.scale.setScalar(1 + Math.sin(this.totalTime * 2.5) * 0.1);
      this.village.pathMarkers.forEach((lantern, idx) => {
        lantern.rotation.z = Math.sin(this.totalTime * 1.6 + idx) * 0.035;
      });
      // Mother expressive realistic animation & blinking
      const motherLine = this.sceneId === 'scene_2_mission' ? MISSION_DIALOGUE[this.dialogueIdx] : null;
      animateMotherNpc(this.village.motherNpc, this.totalTime, {
        talking: motherLine?.speaker === 'Mother',
        emotion: motherLine?.speaker === 'Mother' ? motherLine.emotion : 'calm',
        lookAtYaw: this.sceneId === 'scene_2_mission' ? 0.14 : Math.sin(this.totalTime * 0.7) * 0.12,
      });

      // Chapter 1 location-responsive procedural River Current & Forest Wind ambient audio
      const listenerPos = this.isPlayableScene() ? this.playerPos : this.camera.position;
      const listenerYaw = this.isPlayableScene()
        ? this.camYaw
        : Math.atan2(
            this.camera.position.x - this.playerPos.x,
            this.camera.position.z - this.playerPos.z
          );
      const ch1Ctx = getChapter1AudioContext(listenerPos.x, listenerPos.z, listenerYaw);
      this.sound.updateChapter1Ambience({
        active: this.mode !== 'paused',
        riverProximity: ch1Ctx.riverProximity,
        waterfallProximity: ch1Ctx.waterfallProximity,
        riverPan: ch1Ctx.riverPan,
        forestProximity: ch1Ctx.forestProximity,
        gustPhase: this.totalTime,
      });
    } else {
      this.sound.updateChapter1Ambience({
        active: false,
        riverProximity: 0,
        waterfallProximity: 0,
        riverPan: 0,
        forestProximity: 0,
        gustPhase: this.totalTime,
      });
    }

    if (this.library.group.visible) {
      this.library.floorRune.rotation.z += dt * 0.08;
      this.library.astrolabeRings.forEach((ring, i) => {
        ring.rotation.y += dt * (0.2 + i * 0.12) * (i % 2 === 0 ? 1 : -1);
        ring.rotation.z += dt * 0.07;
      });
      // Floating books flap & orbit
      this.library.floatingBooks.forEach((fb) => {
        const a = this.totalTime * fb.orbitSpeed + fb.phase;
        fb.group.position.set(
          Math.cos(a) * fb.orbitRadius,
          fb.baseY + Math.sin(this.totalTime * 1.8 + fb.phase) * 0.9,
          Math.sin(a) * fb.orbitRadius
        );
        fb.group.rotation.y = -a;
        const flap = 0.4 + Math.sin(this.totalTime * 5 + fb.phase) * 0.35;
        fb.leftWing.rotation.y = flap;
        fb.rightWing.rotation.y = -flap;
      });
      // Flying chairs bob softly
      this.library.flyingChairs.forEach((fc) => {
        fc.group.position.y =
          fc.basePos.y + Math.sin(this.totalTime * 1.6 + fc.phase) * (fc.isTarget ? 0.18 : 0.45);
        if (!fc.isTarget) {
          fc.group.rotation.y += dt * 0.12;
        }
      });
      // Target book hover
      if (this.library.targetBookGroup.visible) {
        this.library.targetBookGroup.position.y =
          this.library.targetBookPos.y + 1.85 + Math.sin(this.totalTime * 2.4) * 0.22;
        this.library.targetBookGroup.rotation.y += dt * 0.9;
      }
      // Living NPCs
      this.library.npcs.forEach((npc) => {
        if (npc.mode === 'fly' && npc.orbitRadius && npc.orbitSpeed) {
          const a = this.totalTime * npc.orbitSpeed + npc.phase;
          npc.group.position.set(
            Math.cos(a) * npc.orbitRadius,
            npc.basePos.y + Math.sin(this.totalTime * 2 + npc.phase) * 1.2,
            Math.sin(a) * npc.orbitRadius
          );
          npc.group.rotation.y = -a;
          npc.leftArm.rotation.z = -0.45;
          npc.rightArm.rotation.z = 0.45;
        } else if (npc.mode === 'discuss') {
          npc.rightArm.rotation.x = -0.4 + Math.sin(this.totalTime * 3.5 + npc.phase) * 0.25;
          npc.head.rotation.y = Math.sin(this.totalTime * 1.5 + npc.phase) * 0.2;
        } else {
          npc.head.rotation.x = 0.15 + Math.sin(this.totalTime * 1.2 + npc.phase) * 0.08;
        }
      });
    }

    if (this.ch2World.group.visible) {
      this.ch2World.skyDome.position.set(this.camera.position.x, -8, this.camera.position.z);
      this.tex.water.offset.y = (this.totalTime * 0.18) % 1;
      this.tex.waterNormal.offset.y = (this.totalTime * 0.25) % 1;
      this.tex.waterNormal.offset.x = Math.sin(this.totalTime * 0.3) * 0.08;
      updateChapter2Atmosphere(
        this.ch2World,
        this.timeOfDay,
        this.totalTime,
        this.scene,
        this.hemiLight,
        this.sunLight,
        this.ch2Flags.insideHouse
      );
      this.ch2World.highlightRings.forEach((hr, idx) => {
        const showPortalRing = hr.id !== 'portal' || this.ch2Flags.portalDiscovered;
        hr.ring.visible = this.observationMode && !this.ch2Flags.insideHouse && showPortalRing;
        if (hr.ring.visible) {
          hr.ring.rotation.z += dt * 0.65;
          hr.ring.scale.setScalar(1 + Math.sin(this.totalTime * 3 + idx) * 0.06);
        }
      });
    }

    if (this.ch3World.group.visible) {
      this.ch3World.skyDome.position.set(this.camera.position.x, -8, this.camera.position.z);

      // Tunnel animation
      if (this.ch3World.tunnelGroup.visible) {
        this.ch3World.tunnelRings.forEach((r, idx) => {
          r.rotation.z += dt * (idx % 2 === 0 ? 0.9 : -0.75);
        });
        this.ch3World.tunnelPages.forEach((p, idx) => {
          p.rotation.y += dt * (1.2 + (idx % 3) * 0.4);
          p.rotation.x += dt * 0.6;
        });
      }

      // House interior clock animation sweeping to 7:00 AM after reading letter
      if (this.ch3ClockAnimTimer > 0) {
        this.ch3ClockAnimTimer += dt;
        const p = Math.min(1, this.ch3ClockAnimTimer / 2.2);
        this.ch3World.clockHourHand.rotation.z = THREE.MathUtils.lerp(0.5, -(7 / 12) * Math.PI * 2, p);
        this.ch3World.clockMinuteHand.rotation.z = THREE.MathUtils.lerp(1.2, -Math.PI * 4, p);
        if (p >= 1) this.ch3ClockAnimTimer = 0;
      }

      // Surface world animations
      if (this.ch3World.surfaceGroup.visible) {
        this.tex.water.offset.y = (this.totalTime * 0.2) % 1;
        this.tex.waterNormal.offset.y = (this.totalTime * 0.26) % 1;
        animateLumi(
          this.ch3World.lumiRig,
          this.totalTime,
          this.ch2Dialogue?.speaker === 'Lumi'
        );
        this.ch3World.letterHighlight.scale.setScalar(1 + Math.sin(this.totalTime * 3.0) * 0.09);
        this.ch3World.letterGoldenSymbol.rotation.z += dt * 0.9;

        // Footprints glow brighter in Observation Mode (V)
        const targetFpOpacity = this.observationMode ? 0.95 : 0.45 + Math.sin(this.totalTime * 3.0) * 0.14;
        this.ch3World.footprintMeshes.forEach((fp, idx) => {
          const mat = fp.material as THREE.MeshBasicMaterial;
          mat.opacity = this.observationMode
            ? 0.88 + Math.sin(this.totalTime * 5 + idx) * 0.1
            : targetFpOpacity;
        });

        this.ch3World.collectibles.forEach((col, idx) => {
          if (!col.collected) {
            col.ring.scale.setScalar(1 + Math.sin(this.totalTime * 3 + idx) * 0.08);
            if (col.needle) col.needle.rotation.y = Math.sin(this.totalTime * 2) * 0.15;
          }
        });
        this.ch3World.fragments.forEach((frag, idx) => {
          if (!frag.collected) {
            frag.group.children[1].rotation.y += dt * 1.4;
            frag.group.children[1].position.y = 1.25 + Math.sin(this.totalTime * 2.5 + idx) * 0.14;
          }
        });
        this.ch3World.memoryStones.forEach((st, idx) => {
          st.crystal.rotation.y += dt * (this.ch3Flags.stonesSolved ? 2.4 : 1.0);
          st.crystal.position.y = 4.25 + Math.sin(this.totalTime * 2.1 + idx) * 0.14;
          st.ring.rotation.z += dt * 0.6;
          st.ring.visible = !this.ch3Flags.stonesSolved;
        });
        this.ch3World.swayTrees.forEach((tr) => {
          tr.group.rotation.z = Math.sin(this.totalTime * 1.2 + tr.phase) * 0.03;
        });
      }

      // Elarion animations
      if (this.ch3World.elarionGroup.visible) {
        animateOrvellan(
          this.ch3World.orvellanRig,
          this.totalTime,
          this.ch3OrvellanMenuActive || this.ch2Dialogue?.speaker === 'Orvellan',
          false
        );
        this.ch3World.elarionFloatingBooks.forEach((fb) => {
          fb.group.position.y = fb.basePos.y + Math.sin(this.totalTime * 1.6 + fb.phase) * 0.35;
          fb.group.rotation.y += dt * 0.45;
        });
        this.ch3World.archiveBookGroup.position.y = 2.35 + Math.sin(this.totalTime * 1.8) * 0.14;
        if (this.ch3Flags.escapeActive) {
          this.ch3World.escapeLights.forEach((lt, idx) => {
            lt.intensity = 6 + Math.abs(Math.sin(this.totalTime * (8 + idx * 1.7))) * 14;
          });
          this.ch3World.escapeSwitches.forEach((sw, idx) => {
            if (!sw.activated) {
              sw.crystal.rotation.y += dt * 2.2;
              sw.ring.scale.setScalar(1.3 + Math.sin(this.totalTime * 5 + idx) * 0.15);
            }
          });
          this.ch3World.bellKeeperShadow.position.z =
            -113 + Math.sin(this.totalTime * 2.4) * 1.5;
          // Falling cavern dust
          const arr = this.ch3World.escapeDust.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < arr.length; i += 3) {
            arr[i + 1] -= dt * 5.2;
            if (arr[i + 1] < 0) arr[i + 1] = 14;
          }
          this.ch3World.escapeDust.geometry.attributes.position.needsUpdate = true;
        }
      }

      // Observation ground rings in Ch 3
      this.ch3World.observationAnchors.forEach((oa, idx) => {
        oa.ring.visible = this.observationMode && oa.subZone === this.ch3Flags.subZone;
        if (oa.ring.visible) {
          oa.ring.rotation.z += dt * 0.8;
          oa.ring.scale.setScalar(1 + Math.sin(this.totalTime * 3 + idx) * 0.08);
        }
      });

      // Valley bells sway gently
      if (this.ch3World.valleyGroup.visible) {
        this.ch3World.valleyBells.forEach((bell, idx) => {
          bell.rotation.z = Math.sin(this.totalTime * 1.8 + idx * 0.8) * 0.14;
        });
      }
    }

    if (this.ch4World.group.visible) {
      this.ch4World.skyDome.position.set(this.camera.position.x, -12, this.camera.position.z);
      this.ch4World.updateVisuals(this.totalTime, dt, this.ch4Flags, this.ch4Flags.subZone);
      if (this.ch4Flags.subZone === 'castle_interior') {
        animatePeliconWarrior(this.ch4World.guardLeft, this.totalTime, 'idle', 0);
        animatePeliconWarrior(this.ch4World.guardRight, this.totalTime, 'idle', 1.4);
        this.ch4World.journalPickupMesh.visible = this.ch4Flags.eitaRoomEntered && !this.ch4JournalCollected;
        if (this.ch4World.journalPickupMesh.visible) {
          this.ch4World.journalPickupMesh.position.y = CH4_JOURNAL_POS.y + 0.98 + Math.sin(this.totalTime * 2.5) * 0.04;
        }
      }
    }
  }

  private updateWeatherParticles(dt: number): void {
    const center = this.sceneId === 'title' ? this.camera.position : this.playerPos;
    const count = this.weatherPositions.length / 3;
    const isLib = this.library.group.visible;

    for (let i = 0; i < count; i++) {
      let x = this.weatherPositions[i * 3];
      let y = this.weatherPositions[i * 3 + 1];
      let z = this.weatherPositions[i * 3 + 2];

      y += (isLib ? 0.45 : -1.55) * dt;
      x += Math.sin(this.totalTime + i) * (isLib ? 0.18 : 0.45) * dt;

      if (!isLib && y < center.y - 2) {
        x = center.x + (Math.random() - 0.5) * 58;
        y = center.y + 18 + Math.random() * 12;
        z = center.z + (Math.random() - 0.5) * 58;
      } else if (isLib && y > center.y + 24) {
        x = center.x + (Math.random() - 0.5) * 50;
        y = center.y - 6;
        z = center.z + (Math.random() - 0.5) * 50;
      }

      this.weatherPositions[i * 3] = x;
      this.weatherPositions[i * 3 + 1] = y;
      this.weatherPositions[i * 3 + 2] = z;
    }
    this.weatherPoints.geometry.attributes.position.needsUpdate = true;
  }

  private updateTitleSequence(dt: number): void {
    let stageChanged = false;
    if (this.introStage !== 'menu') {
      this.introElapsed += dt;
      const t = this.introElapsed;
      const prevStage = this.introStage;

      if (t < 1.8) {
        this.introStage = 'intro_dark';
      } else if (t < 4.4) {
        this.introStage = 'intro_library';
      } else if (t < 9.8) {
        this.introStage = 'intro_book';
      } else if (t < 14.5) {
        this.introStage = 'intro_title';
      } else if (t < 17.5) {
        this.introStage = 'intro_close';
      } else {
        this.introStage = 'menu';
        this.sound.setZone('title_menu');
      }
      stageChanged = prevStage !== this.introStage;

      if (t >= 4.4 && !this.introCueFlags.opened) {
        this.introCueFlags.opened = true;
        this.sound.playBookOpen();
      }
      const pageTimes = [5.4, 6.2, 7.0, 7.8, 8.6];
      pageTimes.forEach((pt, idx) => {
        if (t >= pt && !this.introCueFlags.pages[idx]) {
          this.introCueFlags.pages[idx] = true;
          this.sound.playPageTurn();
        }
      });
      if (t >= 9.8 && !this.introCueFlags.title) {
        this.introCueFlags.title = true;
        this.sound.playTitleReveal();
      }
      if (t >= 14.5 && !this.introCueFlags.closed) {
        this.introCueFlags.closed = true;
        this.sound.playBookClose();
      }
    }

    updateTitleWorld(
      this.titleWorld,
      this.camera,
      this.hemiLight,
      this.sunLight,
      this.introStage,
      this.introElapsed,
      this.totalTime,
      dt,
      this.titlePointerNdc.x,
      this.titlePointerNdc.y
    );

    this.emitHud(stageChanged);
  }

  private updateScene1Intro(dt: number): void {
    const t = this.sceneTimer;
    if (t < 3.8) {
      const p = t / 3.8;
      this.camera.position.set(
        THREE.MathUtils.lerp(-24, 34, p),
        THREE.MathUtils.lerp(18, 12, p),
        THREE.MathUtils.lerp(-180, -110, p)
      );
      this.camera.lookAt(8, 2, -65);
    } else if (t < 7.6) {
      const p = (t - 3.8) / 3.8;
      this.camera.position.set(
        THREE.MathUtils.lerp(34, 6, p),
        THREE.MathUtils.lerp(12, 4.2, p),
        THREE.MathUtils.lerp(-110, -14, p)
      );
      this.camera.lookAt(0, 2.2, 4);
    } else if (t < 9.1) {
      const p = THREE.MathUtils.smoothstep(t, 7.6, 9.1);
      this.camera.position.set(
        THREE.MathUtils.lerp(6, 0.25, p),
        THREE.MathUtils.lerp(4.2, 1.85, p),
        THREE.MathUtils.lerp(-14, 0.2, p)
      );
      this.camera.lookAt(-0.15, 1.45, 5.8);
    } else if (t < 10.6) {
      const p = THREE.MathUtils.smoothstep(t, 9.1, 10.6);
      this.camera.position.set(
        THREE.MathUtils.lerp(0.25, 1.65, p),
        THREE.MathUtils.lerp(1.85, 1.88, p),
        THREE.MathUtils.lerp(0.2, 3.65, p)
      );
      this.camera.lookAt(-0.55, 1.25, 6.55);
    } else {
      this.enterScene('scene_2_mission');
    }
    animateNate(this.nate, dt, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: true,
      isFlying: false,
      isSitting: false,
      hasBook: false,
      shocked: false,
    });
  }

  private updateScene2Mission(dt: number): void {
    const line = MISSION_DIALOGUE[this.dialogueIdx] ?? MISSION_DIALOGUE[0];
    const motherSpeaking = line.speaker === 'Mother';

    // Upper-mid cinematic dialogue framing keeping bottom 24% completely clear for dialogue UI
    if (motherSpeaking) {
      _camTargetPos.set(1.65, 1.88, 3.65);
      _camLookTarget.set(-0.55, 1.25, 6.55);
    } else {
      _camTargetPos.set(-1.65, 1.78, 3.75);
      _camLookTarget.set(0.55, 1.18, 6.3);
    }
    const camBlend = 1 - Math.exp(-4.2 * dt);
    this.camera.position.lerp(_camTargetPos, camBlend);
    this.missionCamLook.lerp(_camLookTarget, camBlend);
    this.camera.lookAt(this.missionCamLook);

    animateNate(this.nate, dt, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: true,
      isFlying: false,
      isSitting: false,
      hasBook: false,
      shocked: false,
      ch2Pose: !motherSpeaking ? 'gesture' : 'normal',
    });
  }

  private updatePlayableMovement(dt: number): void {
    const forwardInput =
      (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0);
    const strafeInput =
      (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);
    const isCh2 = this.ch2World.group.visible;
    const isExhausted = isCh2 && this.energy < 45;
    const isRunning = !isExhausted && (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'));

    // Camera-relative horizontal basis
    const sinY = Math.sin(this.camYaw);
    const cosY = Math.cos(this.camYaw);
    _vecA.set(-sinY, 0, -cosY); // forward on XZ
    _vecB.set(cosY, 0, -sinY); // right on XZ

    const moveX = _vecA.x * forwardInput + _vecB.x * strafeInput;
    const moveZ = _vecA.z * forwardInput + _vecB.z * strafeInput;
    const moveLen = Math.hypot(moveX, moveZ);

    const maxSpeed = this.isFlying
      ? isRunning
        ? 18
        : 13.5
      : isExhausted
      ? 4.4
      : isRunning
      ? 14.0
      : 8.5;
    const targetVx = moveLen > 0.01 ? (moveX / moveLen) * maxSpeed : 0;
    const targetVz = moveLen > 0.01 ? (moveZ / moveLen) * maxSpeed : 0;

    const accel = this.isFlying ? 4.5 : this.isGrounded ? 12.0 : 5.0;
    const damp = 1 - Math.exp(-accel * dt);
    if (this.ch4World.group.visible && this.ch4DodgeTimer > 0) {
      const dashSpd = 18.0 * (0.45 + 0.55 * (this.ch4DodgeTimer / 0.34));
      this.playerVel.x = this.ch4DodgeDir.x * dashSpd;
      this.playerVel.z = this.ch4DodgeDir.z * dashSpd;
    } else {
      const speedScale = this.ch4World.group.visible && this.ch4IsBlocking ? 0.52 : 1.0;
      this.playerVel.x = THREE.MathUtils.lerp(this.playerVel.x, targetVx * speedScale, damp);
      this.playerVel.z = THREE.MathUtils.lerp(this.playerVel.z, targetVz * speedScale, damp);
    }

    const horizSpeed = Math.hypot(this.playerVel.x, this.playerVel.z);
    if (horizSpeed > 0.25) {
      const targetYaw = Math.atan2(this.playerVel.x, this.playerVel.z);
      let diff = targetYaw - this.playerYaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.playerYaw += diff * (1 - Math.exp(-12 * dt));
    }

    if (this.isFlying) {
      const ascend = this.keys.has('ArrowUp') ? 1 : 0;
      const descend = this.keys.has('ArrowDown') ? 1 : 0;
      const targetVy = (ascend - descend) * 9.5;
      this.playerVel.y = THREE.MathUtils.lerp(this.playerVel.y, targetVy, 1 - Math.exp(-6 * dt));
      this.playerPos.addScaledVector(this.playerVel, dt);
      this.playerPos.y = THREE.MathUtils.clamp(this.playerPos.y, 0.5, 48);
      this.fallPeakY = this.playerPos.y;

      // Spawn flying trail particles
      const idx = (this.flyTrailIdx % (this.flyTrailPositions.length / 3)) * 3;
      this.flyTrailPositions[idx] = this.playerPos.x + (Math.random() - 0.5) * 0.4;
      this.flyTrailPositions[idx + 1] = this.playerPos.y + 0.6 + (Math.random() - 0.5) * 0.3;
      this.flyTrailPositions[idx + 2] = this.playerPos.z + (Math.random() - 0.5) * 0.4;
      this.flyTrailIdx++;
      this.flyTrailPoints.geometry.attributes.position.needsUpdate = true;
    } else {
      // Gravity & Coyote Jump
      if (this.isGrounded) {
        this.coyoteTimer = 0.12;
        this.fallPeakY = this.playerPos.y;
      } else {
        this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
        this.fallPeakY = Math.max(this.fallPeakY, this.playerPos.y);
      }

      if (this.jumpBufferTimer > 0) {
        this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
        if (this.coyoteTimer > 0) {
          this.playerVel.y = isExhausted ? 6.8 : 9.2;
          this.isGrounded = false;
          this.coyoteTimer = 0;
          this.jumpBufferTimer = 0;
          this.sound.playJump();
        }
      }

      this.playerVel.y -= 24.0 * dt;
      this.playerPos.addScaledVector(this.playerVel, dt);
    }

    // Realm collision & floor clamping
    let surfaceKind: 'grass' | 'stone' | 'wood' | 'sand' = 'stone';
    let groundY = 0;
    if (this.village.group.visible) {
      clampToGuidedCorridor(this.playerPos);
      const surf = getWalkSurfaceHeight(this.playerPos.x, this.playerPos.z);
      groundY = surf.y;
      surfaceKind = surf.surface;
    } else if (this.ch2World.group.visible) {
      clampToCh2Corridor(this.playerPos, this.ch2Flags.insideHouse);
      const surf = getCh2WalkSurface(this.playerPos.x, this.playerPos.z, this.ch2Flags.insideHouse);
      groundY = surf.y;
      surfaceKind = surf.surface;
    } else if (this.ch3World.group.visible) {
      const barriers = [
        this.ch3Flags.escapeActive && !this.ch3World.escapeSwitches[0]?.activated,
        this.ch3Flags.escapeActive && !this.ch3World.escapeSwitches[1]?.activated,
      ];
      clampToCh3Bounds(this.playerPos, this.ch3Flags.subZone, barriers);
      const surf = getCh3WalkSurface(this.playerPos.x, this.playerPos.z, this.ch3Flags.subZone);
      groundY = surf.y;
      surfaceKind = surf.surface;
    } else if (this.ch4World.group.visible) {
      clampToCh4Bounds(this.playerPos, this.ch4Flags.subZone, this.ch4Flags);
      groundY = getCh4WalkSurface(this.playerPos.x, this.playerPos.z, this.ch4Flags.subZone, this.ch4Flags);
      surfaceKind = this.ch4Flags.subZone === 'castle_interior' ? 'stone' : 'sand';
    } else {
      // Keep inside Ench Library rotunda & outside the central stone spire
      let r = Math.hypot(this.playerPos.x, this.playerPos.z);
      if (r > 38.5) {
        const sc = 38.5 / r;
        this.playerPos.x *= sc;
        this.playerPos.z *= sc;
        r = 38.5;
      }
      if (r < 5.6 && this.playerPos.y < 6.2) {
        if (r < 0.001) {
          this.playerPos.set(0, this.playerPos.y, 5.6);
        } else {
          const sc = 5.6 / r;
          this.playerPos.x *= sc;
          this.playerPos.z *= sc;
        }
        r = 5.6;
      }
      // Solid floor collision for the 3 Library gallery tiers
      const tierHeights = [10, 21, 33];
      for (let tIdx = 0; tIdx < tierHeights.length; tIdx++) {
        const ty = tierHeights[tIdx];
        const innerR = 25 + tIdx * 1.8;
        if (r >= innerR - 0.3 && r <= 42 && this.playerPos.y >= ty - 0.6) {
          groundY = Math.max(groundY, ty);
        }
      }
      // Check floating platforms if above
      for (const plat of this.library.walkablePlatforms) {
        const d = Math.hypot(this.playerPos.x - plat.x, this.playerPos.z - plat.z);
        if (d <= plat.radius && this.playerPos.y >= plat.y - 0.6) {
          groundY = Math.max(groundY, plat.y);
        }
      }
    }

    if (!this.isFlying && this.playerPos.y <= groundY) {
      const fallHeight = this.fallPeakY - groundY;
      this.playerPos.y = groundY;
      this.playerVel.y = 0;
      this.isGrounded = true;

      // Dangerous height fall check in Library
      if (this.library.group.visible && fallHeight > 14.5) {
        this.triggerGameOver('You fell from a dangerous height in the Ench Library!');
        return;
      }
      this.fallPeakY = groundY;
    } else if (this.playerPos.y > groundY + 0.15) {
      this.isGrounded = false;
    }

    // Footstep SFX
    if (this.isGrounded && !this.isFlying && horizSpeed > 0.8) {
      this.footstepAccum += horizSpeed * dt;
      if (this.footstepAccum > (isRunning ? 3.2 : 2.5)) {
        this.footstepAccum = 0;
        this.sound.playFootstep(surfaceKind);
      }
    }

    const brookProx = this.village.group.visible
      ? Math.max(0, 1 - getBrookDistance(this.playerPos.x, this.playerPos.z).dist / 35)
      : 0;
    this.sound.updateFlightAudio(this.isFlying, horizSpeed, brookProx);

    this.nate.root.position.copy(this.playerPos);
    this.nate.root.rotation.y = this.ch4IsAiming ? this.camYaw : this.playerYaw;
    animateNate(this.nate, dt, this.totalTime, {
      speed: horizSpeed,
      isRunning,
      isGrounded: this.isGrounded,
      isFlying: this.isFlying,
      isSitting: false,
      hasBook: this.hasBook,
      shocked: false,
      ch2Pose: isExhausted ? 'exhausted' : 'normal',
      ch4Weapon: this.ch4World.group.visible ? this.ch4Flags.activeWeapon : 'none',
      hasSwordCollected: this.ch4World.group.visible && this.ch4Flags.swordCollected,
      swordSwingTimer: this.ch4SwordSwingTimer,
      swordComboStep: this.ch4ComboStep,
      isBlocking: this.ch4World.group.visible && this.ch4IsBlocking,
      isDodging: this.ch4World.group.visible && this.ch4DodgeTimer > 0,
      bowAiming: this.ch4World.group.visible && this.ch4IsAiming,
      hitReactionTimer: this.ch4SwordHitTimer,
    });
  }

  private triggerGameOver(reason: string): void {
    this.mode = 'gameover';
    this.gameOverReason = reason;
    this.isFlying = false;
    this.sound.updateFlightAudio(false, 0, 0);
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
    this.emitHud(true);
  }

  private updateThirdPersonCamera(dt: number): void {
    const camDist = this.ch2Flags.insideHouse
      ? 4.0
      : this.ch4IsAiming
      ? 3.4
      : this.observationMode
      ? 8.4
      : this.isFlying
      ? 6.8
      : 5.4;
    const lookHeight = this.observationMode && !this.ch2Flags.insideHouse ? 2.2 : this.isFlying ? 1.5 : 1.35;

    const horizDist = Math.cos(this.camPitch) * camDist;
    const vertOffset =
      Math.sin(this.camPitch) * camDist +
      (this.observationMode && !this.ch2Flags.insideHouse ? 2.8 : 1.5);

    _camTargetPos.set(
      this.playerPos.x + Math.sin(this.camYaw) * horizDist,
      this.playerPos.y + vertOffset,
      this.playerPos.z + Math.cos(this.camYaw) * horizDist
    );

    if (this.village.group.visible) {
      const minCamY = getWalkSurfaceHeight(_camTargetPos.x, _camTargetPos.z).y + 0.8;
      if (_camTargetPos.y < minCamY) _camTargetPos.y = minCamY;
    } else if (this.ch2World.group.visible) {
      if (this.ch2Flags.insideHouse) {
        _camTargetPos.x = THREE.MathUtils.clamp(_camTargetPos.x, -4.5, 4.5);
        _camTargetPos.z = THREE.MathUtils.clamp(_camTargetPos.z, -114.4, -102.6);
        _camTargetPos.y = THREE.MathUtils.clamp(_camTargetPos.y, 16.4, 19.6);
      } else {
        const minCamY = getCh2WalkSurface(_camTargetPos.x, _camTargetPos.z, false).y + 0.9;
        if (_camTargetPos.y < minCamY) _camTargetPos.y = minCamY;
      }
    } else if (this.ch3World.group.visible) {
      if (this.ch3Flags.subZone === 'house_interior') {
        _camTargetPos.x = THREE.MathUtils.clamp(_camTargetPos.x, -4.3, 4.3);
        _camTargetPos.z = THREE.MathUtils.clamp(_camTargetPos.z, 5.1, 13.7);
        _camTargetPos.y = THREE.MathUtils.clamp(_camTargetPos.y, 1.1, 4.0);
      } else {
        const minCamY = getCh3WalkSurface(_camTargetPos.x, _camTargetPos.z, this.ch3Flags.subZone).y + 0.9;
        if (_camTargetPos.y < minCamY) _camTargetPos.y = minCamY;
      }
    } else if (this.ch4World.group.visible) {
      if (this.ch4Flags.subZone === 'castle_interior') {
        _camTargetPos.x = THREE.MathUtils.clamp(_camTargetPos.x, -10.2, 10.2);
        _camTargetPos.z = THREE.MathUtils.clamp(_camTargetPos.z, -36.8, 22.0);
        const minInteriorY = getCh4WalkSurface(_camTargetPos.x, _camTargetPos.z, 'castle_interior', this.ch4Flags) + 0.9;
        _camTargetPos.y = THREE.MathUtils.clamp(_camTargetPos.y, minInteriorY, 10.8);
      } else {
        const minCamY = getCh4DesertTerrainHeight(_camTargetPos.x, _camTargetPos.z) + 0.9;
        if (_camTargetPos.y < minCamY) _camTargetPos.y = minCamY;
      }
    } else {
      _camTargetPos.y = THREE.MathUtils.clamp(_camTargetPos.y, 0.8, 54);
      const r = Math.hypot(_camTargetPos.x, _camTargetPos.z);
      if (r > 41) {
        _camTargetPos.x *= 41 / r;
        _camTargetPos.z *= 41 / r;
      }
    }

    const posDamp = 1 - Math.exp(-12 * dt);
    this.camera.position.lerp(_camTargetPos, posDamp);

    _camLookTarget.set(this.playerPos.x, this.playerPos.y + lookHeight, this.playerPos.z);
    this.camera.lookAt(_camLookTarget);

    // Dynamic subtle FOV adjustment for bow aiming, observation, sprinting, or flying
    const speed = Math.hypot(this.playerVel.x, this.playerVel.z);
    const targetFov =
      this.ch4World.group.visible && this.ch4IsAiming
        ? 46
        : this.observationMode
        ? 72
        : this.isFlying
        ? 64
        : speed > 11
        ? 62
        : 58;
    if (Math.abs(this.camera.fov - targetFov) > 0.05) {
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, 1 - Math.exp(-8 * dt));
      this.camera.updateProjectionMatrix();
    }
  }

  private updatePlayableProgression(dt: number): void {
    if (this.ambientTimer > 0) {
      this.ambientTimer -= dt;
      if (this.ambientTimer <= 0) {
        if (this.greetingStep === 1) {
          this.ambientBubble = { speaker: 'Nate', text: 'Something like that!' };
          this.ambientTimer = 2.6;
          this.greetingStep = 2;
        } else {
          this.ambientBubble = null;
        }
      }
    }

    if (this.sceneId === 'scene_3_journey') {
      const info = getNearestPathInfo(this.playerPos.x, this.playerPos.z);
      if (info.distanceRemaining <= 10) {
        this.sound.playMagicChime();
        this.enterScene('scene_4_entrance');
      }
    } else if (this.sceneId === 'scene_4_entrance') {
      if (this.doorOpening) {
        this.doorOpenProgress += dt * 0.55;
        const swing = THREE.MathUtils.smoothstep(this.doorOpenProgress, 0, 1) * (Math.PI * 0.48);
        this.village.libraryExterior.leftDoorPivot.rotation.y = -swing;
        this.village.libraryExterior.rightDoorPivot.rotation.y = swing;
        this.fadeAlpha = THREE.MathUtils.smoothstep(this.doorOpenProgress, 0.55, 1.0);
        if (this.doorOpenProgress >= 1.08) {
          this.enterScene('scene_5_library_cinematic');
        }
      }
    } else if (this.sceneId === 'scene_6_flying_tutorial') {
      if (this.isFlying) {
        this.tutorialFlyTime += dt;
        if (this.playerPos.y > 2.4 || this.tutorialFlyTime > 3.0) {
          this.enterScene('scene_7_find_book');
        }
      }
    } else if (this.sceneId === 'scene_7_find_book') {
      for (const npc of this.library.npcs) {
        if (npc.greeting && !npc.greeted) {
          if (this.playerPos.distanceTo(npc.group.position) < 9.5) {
            npc.greeted = true;
            this.ambientBubble = npc.greeting;
            this.ambientTimer = 2.8;
            if (npc.greeting.speaker === 'Student 2') {
              this.greetingStep = 1;
            }
            break;
          }
        }
      }
    } else if (this.isChapter2Scene()) {
      if (!this.ch2Flags.insideHouse) {
        // Sunset -> Evening smooth transition as Nate ascends the mountain path toward shelter
        if (!this.ch2Flags.sleptOnce) {
          const ascentProgress = THREE.MathUtils.clamp((-this.playerPos.z + 8) / 105, 0, 1);
          const targetEvening = 0.04 + ascentProgress * 0.41;
          if (targetEvening > this.timeOfDay) {
            this.timeOfDay = THREE.MathUtils.lerp(this.timeOfDay, targetEvening, 1 - Math.exp(-1.5 * dt));
          }
        }
        // Switch audio ambiance between shoreline surf and mountain breeze
        const desiredZone = this.playerPos.z < -28 ? 'mountain' : 'seashore';
        this.sound.setZone(desiredZone);

        // Scene 3: First sight of the Mountain House & outside Tent
        if (!this.ch2Flags.houseDiscovered) {
          const toHouseX = CH2_DOOR_POS.x - this.playerPos.x;
          const toHouseZ = CH2_DOOR_POS.z - this.playerPos.z;
          const distH = Math.hypot(toHouseX, toHouseZ) || 1;
          const camForwardX = -Math.sin(this.camYaw);
          const camForwardZ = -Math.cos(this.camYaw);
          const lookDot = (camForwardX * toHouseX + camForwardZ * toHouseZ) / distH;

          if (this.playerPos.z <= -76 || (this.playerPos.z <= -48 && lookDot >= 0.8)) {
            this.ch2Flags.houseDiscovered = true;
            this.observationMode = false;
            this.discoveryTimer = 3.2;
            this.camYaw = Math.atan2(-toHouseX, -toHouseZ);
            this.jafrMood = 'excited';
            this.jafrStatusText = 'Excited! Shelter spotted';
            this.sound.playVoiceCue('Jafr');
            this.ch2Dialogue = {
              speaker: 'Jafr',
              text: 'That house looks abandoned. Maybe we can find something useful there.',
            };
            this.ch2DialogueTimer = 4.8;
            this.emitSave('ch2_scene_3_explore', true, Math.round(this.playerPos.distanceTo(CH2_DOOR_POS)));
          }
        } else if (
          this.ch2Flags.itemsCollected &&
          !this.ch2Flags.portalDiscovered &&
          this.playerPos.distanceTo(CH2_PORTAL_POS) < 10.5
        ) {
          // Safety trigger if Nate climbs toward the platform after gathering supplies
          this.startPortalDiscoveryCutscene();
        }
      }

      // Context-sensitive Jafr companion behavior reactions
      if (!this.isResting && !this.isSleeping && this.discoveryTimer <= 0) {
        if (this.ch2Flags.insideHouse) {
          if (!this.ch2Flags.itemsCollected && this.playerPos.distanceTo(CH2_BOX_POS) < 4.5) {
            this.jafrMood = 'curious';
            this.jafrStatusText = 'Curious near the supply box';
          } else if (this.ch2Flags.itemsCollected && this.playerPos.distanceTo(CH2_BED_POS) < 4.5) {
            this.jafrMood = 'curious';
            this.jafrStatusText = 'Looking at the wooden bed';
          } else {
            this.jafrMood = 'curious';
            this.jafrStatusText = 'Perched on right shoulder';
          }
        } else if (this.playerPos.distanceTo(CH2_PORTAL_POS) < 7.5 && this.ch2Flags.portalDiscovered) {
          this.jafrMood = 'alert';
          this.jafrStatusText = 'Fascinated by the portal runes';
        } else if (this.playerPos.z > 4) {
          this.jafrMood = 'curious';
          this.jafrStatusText = 'Looking toward the waves';
        } else {
          this.jafrMood = 'curious';
          this.jafrStatusText = 'Perched on right shoulder';
        }
      }
    } else if (this.isChapter3Scene()) {
      this.fadeAlpha = Math.max(0, this.fadeAlpha - dt * 1.4);
      this.whiteFadeAlpha = Math.max(0, this.whiteFadeAlpha - dt * 1.2);

      // Gentle camera turn when collecting Broken Compass
      if (this.ch3CompassLookTimer > 0) {
        this.ch3CompassLookTimer -= dt;
        const targetYaw = Math.PI;
        let diff = targetYaw - this.camYaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.camYaw += diff * (1 - Math.exp(-3.5 * dt));
      }

      if (this.ch3Flags.subZone === 'surface') {
        this.sound.setZone(this.playerPos.z < -4 ? 'woods' : 'ch3_house');

        // Notice footprints upon stepping off porch
        if (this.ch3Flags.letterRead && !this.ch3Flags.footprintsDiscovered && this.playerPos.z > 15.6) {
          this.ch3Flags.footprintsDiscovered = true;
          this.jafrMood = 'curious';
          this.jafrStatusText = 'Spotted glowing footprints!';
          this.ch2Dialogue = {
            speaker: 'Jafr',
            text: 'Look on the grass, Nate! Glowing footprints! Press V to enter Observation Mode and trace where they go!',
          };
          this.ch2DialogueTimer = 5.6;
        }

        // Entering Whispering Woods triggers whisper audio
        if (!this.ch3Flags.whisperHeard && this.playerPos.z < -4) {
          this.ch3Flags.whisperHeard = true;
          this.sceneId = 'ch3_scene_2_whispering_woods';
          this.ch3Flags.act = Math.max(this.ch3Flags.act, 3);
          this.sound.playWhisperCue();
          this.jafrMood = 'alert';
          this.jafrStatusText = 'Listening to the Whispering Woods';
          this.ch2Dialogue = {
            speaker: 'Jafr',
            text: 'Shh... did you hear that? The trees... they’re whispering!',
          };
          this.ch2DialogueTimer = 4.8;
          this.ch3BannerTitle = 'THE WHISPERING WOODS';
          this.ch3BannerSubtitle = 'Act 3 · Follow Lumi & the Ancient Trail';
          this.ch3BannerTimer = 4.0;
          this.emitSave('ch3_scene_2_whispering_woods', true, 0, true, false);
        }

        // Lumi gently glides toward Memory Stones Platform once met
        if (this.ch3Flags.lumiMet && !this.ch3Flags.stonesSolved) {
          const targetLumi = new THREE.Vector3(4.8, 0.2, -70);
          this.ch3World.lumiRig.root.position.lerp(targetLumi, 1 - Math.exp(-0.55 * dt));
        }
      } else if (this.ch3Flags.subZone === 'elarion') {
        // Auto-save checkpoint upon stepping into Elarion
        if (!this.ch3Flags.elarionEntered) {
          this.ch3Flags.elarionEntered = true;
          this.emitSave('ch3_scene_elarion', true, 0, true, false);
        }

        // High-tension escape countdown & Bell tolls 4 -> 7
        if (this.ch3Flags.escapeActive) {
          this.ch3EscapeTimer += dt;
          const t = this.ch3EscapeTimer;
          if (t > 14 && this.ch3Flags.escapeBellsRung < 4) {
            this.ch3Flags.escapeBellsRung = 4;
            this.sound.playBellToll();
            this.ch2Dialogue = {
              speaker: 'Jafr',
              text: 'Left! No, your other left! Hit the waystone crystals to drop the barriers!',
            };
            this.ch2DialogueTimer = 4.4;
          } else if (t > 28 && this.ch3Flags.escapeBellsRung < 5) {
            this.ch3Flags.escapeBellsRung = 5;
            this.sound.playBellToll();
          } else if (t > 42 && this.ch3Flags.escapeBellsRung < 6) {
            this.ch3Flags.escapeBellsRung = 6;
            this.sound.playBellToll();
            this.ch2Dialogue = {
              speaker: 'Jafr',
              text: "Nate, hurry! That bell isn't getting quieter!",
            };
            this.ch2DialogueTimer = 4.2;
          } else if (t > 58 && this.ch3Flags.escapeBellsRung < 7) {
            // 7th Bell Tolls -> Catch & reset cleanly to Escape Start!
            this.sound.playShadowWarning();
            this.ch3EscapeTimer = 0;
            this.ch3Flags.escapeBellsRung = 3;
            this.ch3Flags.escapeSwitchIds = [];
            this.ch3World.escapeSwitches.forEach((sw, idx) => {
              sw.activated = false;
              sw.crystal.visible = true;
              sw.ring.visible = true;
              this.ch3World.escapeBarriers[idx].visible = true;
            });
            this.playerPos.set(0, 0, -76);
            this.playerYaw = Math.PI;
            this.camYaw = Math.PI;
            this.itemToast = 'THE SEVENTH BELL TOLLED · TRY THE ESCAPE AGAIN!';
            this.itemToastTimer = 4.2;
            this.ch2Dialogue = {
              speaker: 'Orvellan',
              text: 'Time folded back! Run north, shatter the two crystal barriers, and unlock the Northern Gate!',
            };
            this.ch2DialogueTimer = 5.0;
          }
          if (!this.ch3EscapeJafrWarn1 && this.playerPos.z < -85) {
            this.ch3EscapeJafrWarn1 = true;
            this.ch2Dialogue = {
              speaker: 'Jafr',
              text: 'There is a purple rune barrier ahead! Touch the glowing crystal on the left!',
            };
            this.ch2DialogueTimer = 4.0;
          }
          if (!this.ch3EscapeJafrWarn2 && this.playerPos.z < -100) {
            this.ch3EscapeJafrWarn2 = true;
            this.ch2Dialogue = {
              speaker: 'Jafr',
              text: 'Almost there! Hit the crystal on the right, then unlock the Northern Gate!',
            };
            this.ch2DialogueTimer = 4.0;
          }
        }
      }
    } else if (this.isChapter4Scene()) {
      const f = this.ch4Flags;
      if (f.subZone === 'desert') {
        if (
          !f.woundedWarriorDone &&
          this.ch4CutscenePhase === 'none' &&
          this.playerPos.distanceTo(CH4_WOUNDED_WARRIOR_POS) < 4.5
        ) {
          this.ch4CutscenePhase = 'wounded';
          this.ch4CutsceneTimer = 0;
          this.ch4CutsceneStep = 0;
          this.sound.playVoiceCue('Nate');
          if (document.pointerLockElement) document.exitPointerLock?.();
          this.emitHud(true);
        } else if (
          f.victoryAchieved &&
          !f.balconyEitaSeen &&
          this.ch4CutscenePhase === 'none' &&
          this.playerPos.z < -72
        ) {
          this.startCh4BalconyCutscene();
        } else if (
          f.castleEscaped &&
          !f.townCelebrated &&
          this.playerPos.x < -38
        ) {
          f.townCelebrated = true;
          f.act = Math.max(f.act, 11);
          this.sound.playCrowdCheer();
          this.ch4BannerTitle = 'PELICON TOWN';
          this.ch4BannerSubtitle = 'Citizens Celebrate Freedom · Head West Toward the Outskirts';
          this.ch4BannerTimer = 4.8;
          this.ch2Dialogue = {
            speaker: 'Town Citizens',
            text: 'Long live Princess Eita! Thank you, hero! Pelicon is free!',
          };
          this.ch2DialogueTimer = 5.5;
          this.emitSave('ch4_scene_4_pelicon_town', true, 0, true, true, false);
        } else if (
          f.castleEscaped &&
          this.ch4CutscenePhase === 'none' &&
          this.playerPos.distanceTo(CH4_OUTSKIRTS_POS) < 8.5
        ) {
          f.act = 12;
          this.ch4CutscenePhase = 'outskirts_end';
          this.ch4CutsceneTimer = 0;
          this.ch4CutsceneStep = 0;
          this.sound.playMagicChime();
          if (document.pointerLockElement) document.exitPointerLock?.();
          this.emitHud(true);
        }
      }
    }
  }

  private advanceCh2RevealStep(): void {
    this.sound.playUiClick();
    if (this.jafrRevealStep < 4) {
      this.jafrRevealStep++;
      const tBounds = [0, 3.6, 7.0, 10.2, 13.2];
      this.sceneTimer = tBounds[this.jafrRevealStep];
      // Nate cannot speak to Jafr here (step 2) — only Jafr emits voice cues
      if (this.jafrRevealStep !== 2) {
        this.sound.playVoiceCue('Jafr');
      }
    } else {
      this.enterScene('ch2_scene_3_explore');
    }
  }

  private updateCh2Scene1Seashore(): void {
    const t = this.sceneTimer;
    let pose: NateCh2Pose = 'lying';
    let pocketOpen = false;

    if (t < 2.2) {
      // Shot 1: Completely black screen + distant ocean surf
      this.fadeAlpha = 1;
      this.camera.position.set(14, 7.5, 22);
      this.camera.lookAt(0, 1.5, -18);
    } else if (t < 6.4) {
      // Shot 2: Gradual reveal of vast ocean, sunset & mysterious island
      this.fadeAlpha = 1 - THREE.MathUtils.smoothstep(t, 2.2, 4.2);
      const p = (t - 2.2) / 4.2;
      this.camera.position.set(
        THREE.MathUtils.lerp(24, 9, p),
        THREE.MathUtils.lerp(11, 4.2, p),
        THREE.MathUtils.lerp(28, 22, p)
      );
      this.camera.lookAt(0, THREE.MathUtils.lerp(3.5, 1.2, p), THREE.MathUtils.lerp(-40, 12, p));
    } else if (t < 9.8) {
      // Shot 3: Dolly toward Nate lying near shoreline
      this.fadeAlpha = 0;
      const p = THREE.MathUtils.smoothstep(t, 6.4, 9.8);
      this.camera.position.set(
        THREE.MathUtils.lerp(9, 2.3, p),
        THREE.MathUtils.lerp(4.2, 1.15, p),
        THREE.MathUtils.lerp(22, 16.5, p)
      );
      this.camera.lookAt(0, 0.72, 14.5);
    } else if (t < 12.6) {
      // Shot 4: Ocean surf gently reaches Nate's chin
      const surfWave = Math.sin((t - 9.8) * 1.4);
      this.ch2World.oceanMesh.position.z = surfWave * 1.1;
      this.camera.position.set(1.65, 0.95, 15.6);
      this.camera.lookAt(0, 0.68, 14.0);
    } else if (t < 15.2) {
      // Shot 5: Focus on Universal Snail Pocket (US Pocket)
      this.ch2World.oceanMesh.position.z = THREE.MathUtils.lerp(
        this.ch2World.oceanMesh.position.z,
        0,
        0.12
      );
      this.camera.position.set(1.35, 1.05, 14.95);
      this.camera.lookAt(0.28, 0.78, 14.5);
      pocketOpen = t > 14.5;
    } else if (t < 19.6) {
      // Shot 6: Nate suddenly wakes up, touches chin, looks around confused!
      if (Math.abs(t - 15.25) < 0.04) {
        this.sound.playVoiceCue('Nate');
      }
      pose = 'waking';
      this.camera.position.set(-1.7, 1.45, 12.2);
      this.camera.lookAt(0, 1.05, 14.5);
    } else {
      this.enterScene('ch2_scene_2_jafr_reveal');
    }

    this.nate.root.position.copy(this.playerPos);
    this.nate.root.rotation.y = this.playerYaw;
    animateNate(this.nate, 0.016, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: true,
      isFlying: false,
      isSitting: false,
      hasBook: false,
      shocked: t >= 15.2 && t < 16.4,
      ch2Pose: pose,
      pocketOpen,
    });
  }

  private updateCh2Scene2JafrReveal(): void {
    const t = this.sceneTimer;
    this.fadeAlpha = 0;
    this.jafrRevealStep =
      t < 3.6 ? 0 : t < 7.0 ? 1 : t < 10.2 ? 2 : t < 13.2 ? 3 : 4;

    if (t >= 17.0) {
      this.enterScene('ch2_scene_3_explore');
      return;
    }

    const pose: NateCh2Pose =
      this.jafrRevealStep === 2 || this.jafrRevealStep === 4 ? 'gesture' : 'exhausted';
    this.nate.root.position.copy(this.playerPos);
    this.nate.root.rotation.y = this.playerYaw;
    animateNate(this.nate, 0.016, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: true,
      isFlying: false,
      isSitting: false,
      hasBook: false,
      shocked: false,
      ch2Pose: pose,
      pocketOpen: true,
    });

    // Camera frames Nate & Jafr closely during the conversation, smoothly blending toward third-person at the end
    const camAngle = this.playerYaw + (this.jafrRevealStep >= 2 ? -0.38 : 0.42);
    const camDist = this.jafrRevealStep >= 4 ? THREE.MathUtils.lerp(2.7, 5.4, (t - 13.2) / 3.8) : 2.6;
    _camTargetPos.set(
      this.playerPos.x + Math.sin(camAngle) * camDist,
      this.playerPos.y + 1.55,
      this.playerPos.z + Math.cos(camAngle) * camDist
    );
    this.camera.position.lerp(_camTargetPos, 0.09);
    this.camera.lookAt(this.playerPos.x, this.playerPos.y + 1.25, this.playerPos.z);
  }

  private updateCh2DiscoveryFocus(dt: number): void {
    this.discoveryTimer -= dt;
    animateNate(this.nate, dt, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: true,
      isFlying: false,
      isSitting: false,
      hasBook: false,
      shocked: false,
      ch2Pose: 'gesture',
    });
    _camLookTarget.set(CH2_DOOR_POS.x - 1.5, CH2_DOOR_POS.y + 2.4, CH2_DOOR_POS.z);
    _camTargetPos.set(
      this.playerPos.x + 2.4,
      this.playerPos.y + 2.5,
      this.playerPos.z + 4.4
    );
    this.camera.position.lerp(_camTargetPos, 1 - Math.exp(-5 * dt));
    this.camera.lookAt(_camLookTarget);
  }

  private updateCh2DoorTransition(dt: number): void {
    this.ch2DoorTimer += dt;
    const swing = THREE.MathUtils.smoothstep(this.ch2DoorTimer, 0, 0.85) * 1.45;
    this.ch2World.doorPivot.rotation.y = -swing;
    this.fadeAlpha = THREE.MathUtils.smoothstep(this.ch2DoorTimer, 0.55, 0.95);
    if (this.ch2DoorTimer >= 1.0) {
      this.ch2DoorOpening = false;
      this.ch2Flags.insideHouse = true;
      this.ch2World.houseExteriorGroup.visible = false;
      this.ch2World.houseInteriorGroup.visible = true;
      this.playerPos.copy(CH2_INTERIOR_SPAWN);
      this.playerYaw = Math.PI;
      this.camYaw = Math.PI;
      this.fadeAlpha = 0;
      this.sound.setZone('house');
      this.enterScene('ch2_scene_5_supply_box');
    }
  }

  private updateCh2BoxOpenSequence(dt: number): void {
    this.boxAnimTimer += dt;
    this.playerPos.lerp(new THREE.Vector3(CH2_BOX_POS.x + 1.05, 15.66, CH2_BOX_POS.z + 0.6), 1 - Math.exp(-8 * dt));
    this.playerYaw = Math.atan2(CH2_BOX_POS.x - this.playerPos.x, CH2_BOX_POS.z - this.playerPos.z);
    this.nate.root.position.copy(this.playerPos);
    this.nate.root.rotation.y = this.playerYaw;
    animateNate(this.nate, dt, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: true,
      isFlying: false,
      isSitting: false,
      hasBook: false,
      shocked: false,
      ch2Pose: 'kneel',
    });

    const lidOpen = THREE.MathUtils.smoothstep(this.boxAnimTimer, 0.3, 1.35) * -1.45;
    this.ch2World.boxLidPivot.rotation.x = lidOpen;
    this.camera.position.lerp(
      new THREE.Vector3(CH2_BOX_POS.x + 2.1, CH2_BOX_POS.y + 1.85, CH2_BOX_POS.z + 2.3),
      1 - Math.exp(-6 * dt)
    );
    this.camera.lookAt(CH2_BOX_POS.x, CH2_BOX_POS.y + 0.65, CH2_BOX_POS.z);

    if (this.boxAnimTimer >= 2.7) {
      this.boxOpening = false;
      this.ch2Flags.itemsCollected = true;
      this.ch2World.boxTonicMesh.visible = false;
      this.ch2World.boxFruitMeshes.forEach((m) => {
        m.visible = false;
      });
      this.inventory = [
        {
          id: 'energy_tonic',
          name: 'Energy Tonic',
          description: 'Luminous herbal elixir that restores stamina immediately.',
          quantity: 1,
          energyRestore: 55,
        },
        {
          id: 'fruit',
          name: 'Island Fruit',
          description: 'Fresh wild island fruit. Restores energy and hunger.',
          quantity: 3,
          energyRestore: 20,
        },
      ];
      this.sound.playItemCollect();
      this.itemToast = '+1 ENERGY TONIC · +3 FRUITS';
      this.itemToastTimer = 3.8;
      this.jafrMood = 'excited';
      this.jafrStatusText = 'Happy with supplies!';
      this.sound.playVoiceCue('Jafr');
      this.ch2Dialogue = {
        speaker: 'Jafr',
        text: "Great! At least we won't go hungry tonight.",
        note: 'An old wooden bed waits on the right side of the room.',
      };
      this.ch2DialogueTimer = 5.0;
      this.enterScene('ch2_scene_6_rest_sleep');
    }
  }

  private updateCh2RestingState(dt: number): void {
    this.energy = Math.min(100, this.energy + dt * 12);
    this.nate.root.position.copy(this.playerPos);
    this.nate.root.rotation.y = this.playerYaw;
    animateNate(this.nate, dt, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: false,
      isFlying: false,
      isSitting: false,
      hasBook: false,
      shocked: false,
      ch2Pose: 'sitBed',
    });
    _camTargetPos.set(CH2_BED_POS.x - 2.6, CH2_BED_POS.y + 1.8, CH2_BED_POS.z + 1.9);
    this.camera.position.lerp(_camTargetPos, 1 - Math.exp(-5 * dt));
    this.camera.lookAt(CH2_BED_POS.x, CH2_BED_POS.y + 0.9, CH2_BED_POS.z);
  }

  private updateCh2SleepingSequence(dt: number): void {
    this.sleepTimer += dt;
    const t = this.sleepTimer;

    this.nate.root.position.copy(this.playerPos);
    this.nate.root.rotation.y = this.playerYaw;
    animateNate(this.nate, dt, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: false,
      isFlying: false,
      isSitting: false,
      hasBook: false,
      shocked: false,
      ch2Pose: 'sleepBed',
    });

    if (t < 2.2) {
      this.fadeAlpha = THREE.MathUtils.smoothstep(t, 0.8, 2.2);
      this.timeOfDay = THREE.MathUtils.lerp(this.timeOfDay, 0.78, dt * 1.5);
    } else if (t < 4.5) {
      this.fadeAlpha = 1;
      // Night -> Morning transition while asleep
      this.timeOfDay = THREE.MathUtils.lerp(0.78, 1.0, THREE.MathUtils.smoothstep(t, 2.2, 4.3));
      this.energy = 100;
    } else if (t < 6.4) {
      this.timeOfDay = 1.0;
      this.fadeAlpha = 1 - THREE.MathUtils.smoothstep(t, 4.5, 6.2);
    } else {
      const wasSlept = this.ch2Flags.sleptOnce;
      this.isSleeping = false;
      this.ch2Flags.sleptOnce = true;
      this.ch2Flags.firstCheckpointSaved = true;
      this.energy = 100;
      this.jafrMood = 'excited';
      this.jafrStatusText = 'Refreshed for morning!';
      this.playerPos.set(CH2_BED_POS.x - 1.5, 15.66, CH2_BED_POS.z);
      this.playerYaw = -Math.PI / 2;
      this.camYaw = -Math.PI / 2;
      this.sound.playMagicChime();
      this.saveStatus = 'saved';
      this.saveStatusTimer = 3.6;
      this.checkpointBannerTimer = 3.8;
      if (!wasSlept) {
        this.ch2PortalCompleted = false;
        this.enterScene('ch2_complete');
      } else {
        this.fadeAlpha = 0;
        this.sound.setZone('house');
        this.ch2Dialogue = {
          speaker: 'Jafr',
          text: 'Morning already! We feel completely rested and ready for what lies ahead.',
        };
        this.ch2DialogueTimer = 4.2;
        this.emitSave(this.sceneId, true, 0, this.ch2PortalCompleted);
      }
      return;
    }

    _camTargetPos.set(CH2_BED_POS.x - 2.4, CH2_BED_POS.y + 2.2, CH2_BED_POS.z + 2.2);
    this.camera.position.lerp(_camTargetPos, 1 - Math.exp(-4 * dt));
    this.camera.lookAt(CH2_BED_POS.x, CH2_BED_POS.y + 0.65, CH2_BED_POS.z);
  }

  private startPortalDiscoveryCutscene(): void {
    this.portalDiscoveryActive = true;
    this.portalDiscoveryTimer = 0;
    this.portalDiscoveryStep = 0;
    this.litRunesCount = 0;
    this.observationMode = false;
    this.jafrMood = 'alert';
    this.jafrStatusText = 'Noticed a strange light!';
    this.sound.playVoiceCue('Jafr');
    if (document.pointerLockElement) document.exitPointerLock?.();
    this.emitHud(true);
  }

  private advancePortalDiscoveryStep(): void {
    this.sound.playUiClick();
    if (this.portalDiscoveryStep < PORTAL_DISCOVERY_DIALOGUE.length - 1) {
      this.portalDiscoveryStep++;
      const stepStarts = [0, 2.5, 5.2, 8.6, 11.6];
      this.portalDiscoveryTimer = stepStarts[this.portalDiscoveryStep];
      this.sound.playVoiceCue('Jafr');
      if (this.portalDiscoveryStep >= 2) {
        this.litRunesCount = 8;
        this.ch2World.portalRuneMeshes.forEach((rm) => {
          (rm.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.68;
        });
      }
    } else {
      this.finishPortalDiscovery();
    }
    this.emitHud(true);
  }

  private finishPortalDiscovery(): void {
    this.portalDiscoveryActive = false;
    this.ch2Flags.portalDiscovered = true;
    this.litRunesCount = 8;
    this.ch2World.portalRuneMeshes.forEach((rm) => {
      (rm.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.68;
    });
    this.ch2World.portalEnergyUniforms.uIntensity.value = 0.62;
    this.ch2World.portalLight.intensity = 8.5;
    this.jafrMood = 'curious';
    this.jafrStatusText = 'Curious about the ancient portal';
    this.sceneId = 'ch2_scene_7_portal';
    this.latestCheckpoint = 'ch2_scene_7_portal';
    this.emitSave('ch2_scene_7_portal', true, Math.round(this.playerPos.distanceTo(CH2_PORTAL_POS)));
  }

  private updatePortalDiscoveryCutscene(dt: number): void {
    this.portalDiscoveryTimer += dt;
    const t = this.portalDiscoveryTimer;

    this.portalDiscoveryStep = t < 2.5 ? 0 : t < 5.2 ? 1 : t < 8.6 ? 2 : t < 11.6 ? 3 : 4;
    if (t >= 14.8) {
      this.finishPortalDiscovery();
      return;
    }

    // Light up runes sequentially during step 2 (5.2s..8.4s)
    if (t >= 5.2) {
      const targetLit = Math.min(8, Math.floor((t - 5.2) / 0.36) + 1);
      while (this.litRunesCount < targetLit) {
        const idx = this.litRunesCount;
        (this.ch2World.portalRuneMeshes[idx].material as THREE.MeshStandardMaterial).emissiveIntensity = 0.68;
        this.sound.playRuneIgnite(idx);
        this.litRunesCount++;
      }
      this.ch2World.portalEnergyUniforms.uIntensity.value = THREE.MathUtils.lerp(
        0.16,
        0.62,
        THREE.MathUtils.clamp((t - 5.2) / 3.0, 0, 1)
      );
      this.ch2World.portalLight.intensity = THREE.MathUtils.lerp(
        4.0,
        8.5,
        THREE.MathUtils.clamp((t - 5.2) / 3.0, 0, 1)
      );
    }

    // Face Nate toward the portal on the right rocky platform
    this.playerYaw = Math.atan2(
      CH2_PORTAL_POS.x - this.playerPos.x,
      CH2_PORTAL_POS.z - this.playerPos.z
    );
    this.nate.root.position.copy(this.playerPos);
    this.nate.root.rotation.y = this.playerYaw;
    animateNate(this.nate, dt, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: true,
      isFlying: false,
      isSitting: false,
      hasBook: false,
      shocked: t >= 8.4,
      ch2Pose: t >= 8.4 ? 'gesture' : 'normal',
    });

    if (t < 2.5) {
      // Close shot of Nate & Jafr noticing the light
      _camTargetPos.set(this.playerPos.x - 1.6, this.playerPos.y + 1.55, this.playerPos.z + 2.3);
      _camLookTarget.set(this.playerPos.x + 0.3, this.playerPos.y + 1.25, this.playerPos.z);
    } else if (t < 8.6) {
      // Slow cinematic pan over to the elevated rocky platform & rune ignition
      const panP = THREE.MathUtils.smoothstep(t, 2.5, 5.4);
      _camTargetPos.set(
        THREE.MathUtils.lerp(this.playerPos.x + 2.0, CH2_PORTAL_POS.x - 4.2, panP),
        THREE.MathUtils.lerp(this.playerPos.y + 2.6, CH2_PORTAL_POS.y + 3.4, panP),
        THREE.MathUtils.lerp(this.playerPos.z + 4.5, CH2_PORTAL_POS.z + 7.2, panP)
      );
      _camLookTarget.set(
        THREE.MathUtils.lerp(this.playerPos.x + 4, CH2_PORTAL_POS.x, panP),
        THREE.MathUtils.lerp(this.playerPos.y + 2.0, CH2_PORTAL_POS.y + 3.0, panP),
        THREE.MathUtils.lerp(this.playerPos.z - 1, CH2_PORTAL_POS.z, panP)
      );
    } else {
      // Surprised reaction of Nate & curious Jafr
      _camTargetPos.set(this.playerPos.x + 1.9, this.playerPos.y + 1.6, this.playerPos.z + 2.2);
      _camLookTarget.set(this.playerPos.x, this.playerPos.y + 1.22, this.playerPos.z);
    }
    this.camera.position.lerp(_camTargetPos, 1 - Math.exp(-4.5 * dt));
    this.camera.lookAt(_camLookTarget);
  }

  private updatePortalInvestigateCutscene(dt: number): void {
    this.portalInvestigateTimer += dt;
    const t = this.portalInvestigateTimer;

    this.playerYaw = Math.atan2(
      CH2_PORTAL_POS.x - this.playerPos.x,
      CH2_PORTAL_POS.z - this.playerPos.z
    );
    this.nate.root.position.copy(this.playerPos);
    this.nate.root.rotation.y = this.playerYaw;
    animateNate(this.nate, dt, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: true,
      isFlying: false,
      isSitting: false,
      hasBook: false,
      shocked: t > 2.2,
      ch2Pose: t < 2.2 ? 'kneel' : 'gesture',
    });

    // Brighter runes & stronger vortex during investigation
    const surge = THREE.MathUtils.smoothstep(t, 0, 3.0);
    this.ch2World.portalEnergyUniforms.uIntensity.value = THREE.MathUtils.lerp(0.62, 0.85, surge);
    this.ch2World.portalLight.intensity = THREE.MathUtils.lerp(8.5, 12.5, surge);
    this.ch2World.portalRuneMeshes.forEach((rm, idx) => {
      (rm.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.62 + surge * 0.14 + Math.sin(this.totalTime * 4 + idx) * 0.08;
    });

    if (t < 2.4) {
      // Close-up of carved glowing runes along the stone frame
      _camTargetPos.set(CH2_PORTAL_POS.x - 1.8, CH2_PORTAL_POS.y + 3.6, CH2_PORTAL_POS.z + 3.1);
      _camLookTarget.set(CH2_PORTAL_POS.x, CH2_PORTAL_POS.y + 3.4, CH2_PORTAL_POS.z);
    } else {
      // Wide close-up framing floating stones & pulsing vortex core
      const angle = -0.35 + (t - 2.4) * 0.25;
      _camTargetPos.set(
        CH2_PORTAL_POS.x + Math.sin(angle) * 5.8,
        CH2_PORTAL_POS.y + 2.8,
        CH2_PORTAL_POS.z + Math.cos(angle) * 5.8
      );
      _camLookTarget.set(CH2_PORTAL_POS.x, CH2_PORTAL_POS.y + 3.0, CH2_PORTAL_POS.z);
    }
    this.camera.position.lerp(_camTargetPos, 1 - Math.exp(-5 * dt));
    this.camera.lookAt(_camLookTarget);

    if (t >= 4.8) {
      this.portalInvestigateActive = false;
      this.ch2Flags.portalInvestigated = true;
      this.jafrMood = 'excited';
      this.jafrStatusText = 'Portal ready to enter';
      this.sound.playVoiceCue('Jafr');
      this.ch2Dialogue = {
        speaker: 'Jafr',
        text: 'The runes answered THE BOOK! Rest at the house bed first if needed, then press E to enter the portal!',
      };
      this.ch2DialogueTimer = 5.0;
      this.emitSave('ch2_scene_7_portal', true, 0);
    }
  }

  private startPortalGatewayFinale(): void {
    this.portalFinaleActive = true;
    this.portalFinaleTimer = 0;
    this.portalFinaleStep = 0;
    this.observationMode = false;
    this.ch2Flags.portalEntered = true;
    this.jafrMood = 'excited';
    this.jafrStatusText = 'Clinging to Nate!';
    this.sound.playVoiceCue('Jafr');
    if (document.pointerLockElement) document.exitPointerLock?.();
    this.emitHud(true);
  }

  private advancePortalFinaleDialogue(): void {
    this.sound.playUiClick();
    if (this.portalFinaleStep === 0) {
      this.portalFinaleStep = 1;
      this.portalFinaleTimer = 2.8;
      this.sound.playVoiceCue('Jafr');
    } else if (this.portalFinaleStep === 1) {
      this.portalFinaleStep = 2;
      this.portalFinaleTimer = 5.6;
      this.sound.playPortalGateway();
    }
    this.emitHud(true);
  }

  private updatePortalGatewayFinale(dt: number): void {
    this.portalFinaleTimer += dt;
    const t = this.portalFinaleTimer;

    if (t < 2.8) {
      this.portalFinaleStep = 0;
    } else if (t < 5.6) {
      if (this.portalFinaleStep === 0) {
        this.portalFinaleStep = 1;
        this.sound.playVoiceCue('Jafr');
      }
    } else {
      if (this.portalFinaleStep < 2) {
        this.portalFinaleStep = 2;
        this.sound.playPortalGateway();
      }
    }

    if (this.portalFinaleStep < 2) {
      // Face portal for Jafr's final dialogue & Nate's determined nod
      this.playerYaw = Math.atan2(
        CH2_PORTAL_POS.x - this.playerPos.x,
        CH2_PORTAL_POS.z - this.playerPos.z
      );
      this.nate.root.position.copy(this.playerPos);
      this.nate.root.rotation.y = this.playerYaw;
      animateNate(this.nate, dt, this.totalTime, {
        speed: 0,
        isRunning: false,
        isGrounded: true,
        isFlying: false,
        isSitting: false,
        hasBook: false,
        shocked: false,
        ch2Pose: this.portalFinaleStep === 1 ? 'gesture' : 'normal',
      });
      _camTargetPos.set(this.playerPos.x - 1.9, this.playerPos.y + 1.65, this.playerPos.z + 2.8);
      _camLookTarget.set(this.playerPos.x + 0.4, this.playerPos.y + 1.35, this.playerPos.z);
      this.camera.position.lerp(_camTargetPos, 1 - Math.exp(-5 * dt));
      this.camera.lookAt(_camLookTarget);
      return;
    }

    // Final Portal Cinematic (t >= 5.6s)
    const ct = t - 5.6;
    const portalCenter = new THREE.Vector3(CH2_PORTAL_POS.x, CH2_PORTAL_POS.y + 0.1, CH2_PORTAL_POS.z);

    if (ct < 3.0) {
      // Nate & clinging Jafr walk deliberately toward and into the expanding portal!
      const walkP = THREE.MathUtils.smoothstep(ct, 0, 2.8);
      const startWalk = new THREE.Vector3(CH2_PORTAL_POS.x - 1.5, CH2_PORTAL_POS.y + 0.06, CH2_PORTAL_POS.z + 3.2);
      this.playerPos.lerpVectors(startWalk, portalCenter, walkP);
      this.playerYaw = Math.atan2(
        CH2_PORTAL_POS.x - this.playerPos.x,
        CH2_PORTAL_POS.z - this.playerPos.z
      );
      this.nate.root.position.copy(this.playerPos);
      this.nate.root.rotation.y = this.playerYaw;
      animateNate(this.nate, dt, this.totalTime, {
        speed: 4.5,
        isRunning: false,
        isGrounded: true,
        isFlying: false,
        isSitting: false,
        hasBook: false,
        shocked: false,
        ch2Pose: 'normal',
      });
    } else {
      // Vanish into light as portal closes behind them
      const vanishP = THREE.MathUtils.smoothstep(ct, 3.0, 4.6);
      this.nate.root.scale.setScalar(Math.max(0.02, 1 - vanishP));
    }

    // Runes illuminate fiercely, energy field expands, then portal collapses to dark
    const expandP = ct < 4.5 ? THREE.MathUtils.smoothstep(ct, 0, 3.8) : 1 - THREE.MathUtils.smoothstep(ct, 4.5, 6.2);
    this.ch2World.portalEnergyUniforms.uIntensity.value = 0.82 + expandP * 0.28;
    this.ch2World.portalEnergyUniforms.uExpand.value = 1.0 + expandP * 0.85;
    this.ch2World.portalLight.intensity = 10 + expandP * 12;
    this.ch2World.portalRuneMeshes.forEach((rm) => {
      (rm.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.65 + expandP * 0.35;
    });

    // Bright magical light & fade to black
    this.portalGlowAlpha = ct < 4.5 ? THREE.MathUtils.smoothstep(ct, 2.2, 4.2) : 1 - THREE.MathUtils.smoothstep(ct, 4.5, 5.6);
    this.fadeAlpha = THREE.MathUtils.smoothstep(ct, 4.8, 6.4);

    // Orbit camera around portal arch
    const orbitAngle = -0.35 + ct * 0.55;
    const rad = 6.2 - Math.min(1.5, ct * 0.25);
    _camTargetPos.set(
      CH2_PORTAL_POS.x + Math.sin(orbitAngle) * rad,
      CH2_PORTAL_POS.y + 2.8 + Math.sin(ct * 0.5) * 0.4,
      CH2_PORTAL_POS.z + Math.cos(orbitAngle) * rad
    );
    this.camera.position.lerp(_camTargetPos, 1 - Math.exp(-5 * dt));
    this.camera.lookAt(CH2_PORTAL_POS.x, CH2_PORTAL_POS.y + 3.0, CH2_PORTAL_POS.z);

    if (ct >= 6.8) {
      this.portalFinaleActive = false;
      this.ch2PortalCompleted = true;
      this.portalGlowAlpha = 0;
      this.nate.root.scale.setScalar(1);
      this.enterScene('ch2_complete');
    }
  }

  private advanceCh3ArrivalDialogue(): void {
    this.sound.playUiClick();
    if (this.ch3ArrivalLineStep < CH3_ARRIVAL_LINES.length - 1) {
      this.ch3ArrivalLineStep++;
      this.ch3PortalTunnelTimer = 8.4 + this.ch3ArrivalLineStep * 3.1;
      this.sound.playVoiceCue(CH3_ARRIVAL_LINES[this.ch3ArrivalLineStep].speaker === 'Nate' ? 'Nate' : 'Jafr');
    } else {
      this.finishCh3ArrivalCinematic();
    }
    this.emitHud(true);
  }

  private finishCh3ArrivalCinematic(): void {
    this.ch3PortalTunnelActive = false;
    this.ch3Flags.portalSequenceDone = true;
    this.ch3Flags.act = 1;
    this.whiteFadeAlpha = 0;
    this.ch3BannerTitle = 'THE HOUSE OF FORGOTTEN SECRETS';
    this.ch3BannerSubtitle = 'Every forgotten story leaves something behind.';
    this.ch3BannerTimer = 4.8;
    this.emitSave('ch3_scene_1_arrival', true, 0, true, false);
  }

  private updateCh3PortalArrival(dt: number): void {
    this.ch3PortalTunnelTimer += dt;
    const t = this.ch3PortalTunnelTimer;

    if (t < 8.2) {
      // Magical transportation sequence inside Tunnel of Light
      if (t < 1.2) {
        this.whiteFadeAlpha = 1 - THREE.MathUtils.smoothstep(t, 0.2, 1.2);
      } else if (t > 6.8) {
        this.whiteFadeAlpha = THREE.MathUtils.smoothstep(t, 6.8, 7.9);
      } else {
        this.whiteFadeAlpha = 0;
      }

      if (Math.abs(t - 4.6) < 0.04) {
        this.sound.playBellToll();
      }

      this.ch3World.tunnelShadow.visible = t > 4.2 && t < 6.4;
      this.playerPos.set(0, Math.sin(t * 2.5) * 0.25, THREE.MathUtils.lerp(18, -18, t / 8.2));
      this.playerYaw = Math.PI + Math.sin(t * 1.4) * 0.25;
      this.nate.root.position.copy(this.playerPos);
      this.nate.root.rotation.y = this.playerYaw;
      animateNate(this.nate, dt, this.totalTime, {
        speed: 0,
        isRunning: false,
        isGrounded: false,
        isFlying: true,
        isSitting: false,
        hasBook: false,
        shocked: t > 4.3 && t < 6.4,
      });

      const camOrbit = t * 0.85;
      this.camera.position.set(
        this.playerPos.x + Math.sin(camOrbit) * 4.4,
        this.playerPos.y + 1.2 + Math.cos(t * 1.2) * 0.5,
        this.playerPos.z + Math.cos(camOrbit) * 4.4
      );
      this.camera.lookAt(this.playerPos.x, this.playerPos.y + 1.1, this.playerPos.z);

      if (t >= 7.9 && this.ch3Flags.subZone === 'tunnel') {
        this.setCh3SubZone('surface');
        this.playerPos.copy(CH3_SPAWN_POS);
        this.playerYaw = Math.PI;
        this.camYaw = Math.PI;
        this.camPitch = 0.24;
      }
      return;
    }

    // 8.2s+ : Grassy clearing beside unfamiliar wooden house + 4 arrival lines
    this.whiteFadeAlpha = Math.max(0, 1 - THREE.MathUtils.smoothstep(t, 8.2, 9.4));
    const step = Math.min(3, Math.floor((t - 8.2) / 3.1));
    if (step > this.ch3ArrivalLineStep) {
      this.ch3ArrivalLineStep = step;
      this.sound.playVoiceCue(CH3_ARRIVAL_LINES[step].speaker === 'Nate' ? 'Nate' : 'Jafr');
    }

    this.nate.root.position.copy(this.playerPos);
    this.nate.root.rotation.y = this.playerYaw;
    animateNate(this.nate, dt, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: true,
      isFlying: false,
      isSitting: false,
      hasBook: false,
      shocked: false,
      ch2Pose: step >= 2 ? 'gesture' : 'normal',
    });

    _camTargetPos.set(this.playerPos.x - 2.2, this.playerPos.y + 1.9, this.playerPos.z + 4.0);
    this.camera.position.lerp(_camTargetPos, 1 - Math.exp(-5 * dt));
    this.camera.lookAt(0, 2.2, 12);

    if (t >= 20.8) {
      this.finishCh3ArrivalCinematic();
    }
  }

  private startCh3MorningWakeSequence(): void {
    this.ch3MorningWakeActive = true;
    this.ch3MorningWakeTimer = 0;
    this.playerPos.set(CH3_INTERIOR_BED_POS.x, 0.45, CH3_INTERIOR_BED_POS.z);
    this.playerYaw = Math.PI;
    this.jafrMood = 'sleeping';
    this.jafrStatusText = 'Resting beside the bed';
    if (document.pointerLockElement) document.exitPointerLock?.();
    this.emitHud(true);
  }

  private updateCh3MorningWake(dt: number): void {
    this.ch3MorningWakeTimer += dt;
    const t = this.ch3MorningWakeTimer;

    this.nate.root.position.copy(this.playerPos);
    this.nate.root.rotation.y = this.playerYaw;
    animateNate(this.nate, dt, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: false,
      isFlying: false,
      isSitting: false,
      hasBook: false,
      shocked: t > 3.6,
      ch2Pose: t < 3.6 ? 'sleepBed' : 'waking',
    });

    if (t < 1.8) {
      this.fadeAlpha = THREE.MathUtils.smoothstep(t, 0.3, 1.6);
    } else if (t < 3.4) {
      this.fadeAlpha = 1 - THREE.MathUtils.smoothstep(t, 2.2, 3.4);
      this.ch3World.interiorSunbeam.visible = true;
    } else if (t < 5.6) {
      this.fadeAlpha = 0;
      if (Math.abs(t - 3.55) < 0.04) {
        this.sound.playDoorKnock();
      }
      if (Math.abs(t - 4.4) < 0.04) {
        this.sound.playVoiceCue('Jafr');
      }
    } else {
      this.ch3MorningWakeActive = false;
      this.ch3Flags.sleptInHouse = true;
      this.ch3Flags.knockInvestigated = true;
      this.energy = 100;
      this.playerPos.set(CH3_INTERIOR_BED_POS.x + 1.5, 0, CH3_INTERIOR_BED_POS.z);
      this.jafrMood = 'alert';
      this.jafrStatusText = 'Heard knocking at the door!';
      this.ch2Dialogue = {
        speaker: 'Jafr',
        text: 'Nate! Wake up! Someone is knocking at the front door! Go press ENTER at the door to see who it is!',
      };
      this.ch2DialogueTimer = 6.0;
      this.emitSave(this.sceneId, true, 0, true, false);
    }

    _camTargetPos.set(CH3_INTERIOR_BED_POS.x + 2.6, 2.1, CH3_INTERIOR_BED_POS.z + 2.4);
    this.camera.position.lerp(_camTargetPos, 1 - Math.exp(-5 * dt));
    this.camera.lookAt(CH3_INTERIOR_BED_POS.x, 0.9, CH3_INTERIOR_BED_POS.z);
  }

  private updateCh3DoorAnim(dt: number): void {
    this.ch3DoorAnimTimer += dt;
    const t = this.ch3DoorAnimTimer;
    this.ch3World.interiorDoorPivot.rotation.y = -THREE.MathUtils.smoothstep(t, 0, 0.9) * 1.45;
    this.fadeAlpha = THREE.MathUtils.smoothstep(t, 0.65, 1.1);
    if (t >= 1.15) {
      this.ch3DoorAnimActive = false;
      this.ch3Flags.doorOpenedOnce = true;
      this.setCh3SubZone('surface');
      this.ch3World.exteriorDoorPivot.rotation.y = -1.3;
      this.playerPos.set(0, 0.24, 16.0);
      this.playerYaw = 0;
      this.camYaw = Math.PI;
      this.fadeAlpha = 0;
      this.sound.playWhisperCue();
      this.jafrMood = 'curious';
      this.jafrStatusText = 'Looking at the black envelope';
      this.ch2Dialogue = {
        speaker: 'Jafr',
        text: 'Nobody is out here... just the cold wind. Wait—what is that black envelope with a golden seal on the porch?',
      };
      this.ch2DialogueTimer = 6.0;
      this.emitSave(this.sceneId, true, 0, true, false);
    }
  }

  private startCh3MemoryVision(): void {
    this.ch3MemoryVisionActive = true;
    this.ch3MemoryVisionTimer = 0;
    this.ch3World.memoryVisionGroup.visible = true;
    this.sound.playMemoryVision();
    if (document.pointerLockElement) document.exitPointerLock?.();
    this.emitHud(true);
  }

  private updateCh3MemoryVision(dt: number): void {
    this.ch3MemoryVisionTimer += dt;
    const t = this.ch3MemoryVisionTimer;

    // Ghostly bustling citizens wander gently, then dark shadow cloud engulfs them
    this.ch3World.memoryCitizens.forEach((c) => {
      c.group.position.x = c.basePos.x + Math.sin(this.totalTime * 1.4 + c.phase) * 1.4;
      c.group.position.z = c.basePos.z + Math.cos(this.totalTime * 1.1 + c.phase) * 1.1;
      c.group.visible = t < 6.4;
    });

    const cloudMat = this.ch3World.memoryShadowCloud.material as THREE.MeshBasicMaterial;
    if (t > 3.8) {
      cloudMat.opacity = Math.min(0.82, (t - 3.8) * 0.45);
      this.ch3World.memoryShadowCloud.scale.setScalar(1 + (t - 3.8) * 0.35);
      if (Math.abs(t - 4.0) < 0.04) this.sound.playShadowWarning();
    } else {
      cloudMat.opacity = 0;
    }

    const orbit = t * 0.45;
    _camTargetPos.set(Math.sin(orbit) * 14, 7.2, -14 + Math.cos(orbit) * 14);
    this.camera.position.lerp(_camTargetPos, 1 - Math.exp(-4 * dt));
    this.camera.lookAt(0, 2.8, -14);

    if (t >= 7.8) {
      this.ch3MemoryVisionActive = false;
      this.ch3World.memoryVisionGroup.visible = false;
      this.ch3Flags.statueMemoryViewed = true;
      this.ch3Flags.elarionRevealed = true;
      this.ch3Flags.act = Math.max(this.ch3Flags.act, 6);
      this.jafrMood = 'alert';
      this.jafrStatusText = 'Shaken by Elarion’s memory';
      this.ch2Dialogue = {
        speaker: 'Jafr',
        text: 'That black cloud swallowed the whole city! Come on—someone must still be inside that Ancient Library ahead!',
      };
      this.ch2DialogueTimer = 6.2;
      this.emitSave(this.sceneId, true, 0, true, false);
    }
  }

  private startCh3ArchiveCinematic(): void {
    this.ch3ArchiveCinematicActive = true;
    this.ch3ArchiveTimer = 0;
    this.ch3Flags.archiveEntered = true;
    this.ch3Flags.act = 7;
    this.playerPos.set(0, 0, CH3_ARCHIVE_POS.z + 5.5);
    this.playerYaw = Math.PI;
    this.sound.playMagicChime();
    if (document.pointerLockElement) document.exitPointerLock?.();
    this.emitHud(true);
  }

  private updateCh3ArchiveAndWarning(dt: number): void {
    this.ch3ArchiveTimer += dt;
    const t = this.ch3ArchiveTimer;

    this.nate.root.position.copy(this.playerPos);
    this.nate.root.rotation.y = this.playerYaw;
    animateNate(this.nate, dt, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: true,
      isFlying: false,
      isSitting: false,
      hasBook: false,
      shocked: t > 6.5,
      ch2Pose: t > 6.5 ? 'gesture' : 'normal',
    });

    if (t < 6.4) {
      // Act 7: Giant Floating Golden Book opens & reveals NATELEON KENNEDY and JAFR
      const openP = THREE.MathUtils.smoothstep(t, 0.4, 2.2);
      this.ch3World.archiveBookLeftPage.rotation.y = THREE.MathUtils.lerp(0.85, 0.16, openP);
      this.ch3World.archiveBookRightPage.rotation.y = THREE.MathUtils.lerp(-0.85, -0.16, openP);
      if (t > 2.2) {
        this.ch3ArchiveNamesVisible = true;
        this.ch3Flags.readerNamesRevealed = true;
      }
      _camTargetPos.set(2.4, 3.1, CH3_ARCHIVE_POS.z + 4.4);
      this.camera.position.lerp(_camTargetPos, 1 - Math.exp(-5 * dt));
      this.camera.lookAt(0, 2.35, CH3_ARCHIVE_POS.z);
    } else if (t < 13.0) {
      // Act 8: Book slams shut, lights dim, Bells 1-2-3 toll, Mysterious Voice, Shadow outside
      this.ch3ArchiveNamesVisible = false;
      this.ch3World.archiveBookLeftPage.rotation.y = 1.48;
      this.ch3World.archiveBookRightPage.rotation.y = -1.48;
      if (!this.ch3Flags.warningTriggered) {
        this.ch3Flags.warningTriggered = true;
        this.ch3Flags.act = 8;
        this.setCh3SubZone('elarion');
        this.ch3World.bellKeeperShadow.visible = true;
        this.sound.playBellToll();
      }
      if (Math.abs(t - 7.8) < 0.04) {
        this.ch3Flags.escapeBellsRung = 2;
        this.sound.playBellToll();
      }
      if (Math.abs(t - 9.2) < 0.04) {
        this.ch3Flags.escapeBellsRung = 3;
        this.sound.playBellToll();
        this.sound.playShadowWarning();
      }
      if (this.ch3Flags.escapeBellsRung < 1) this.ch3Flags.escapeBellsRung = 1;

      _camTargetPos.set(0, 3.6, CH3_ARCHIVE_POS.z + 8.5);
      this.camera.position.lerp(_camTargetPos, 1 - Math.exp(-4 * dt));
      this.camera.lookAt(0, 2.6, -110);
    } else {
      // Act 9: Orvellan grants Golden Gate Key and Escape begins!
      this.ch3ArchiveCinematicActive = false;
      this.ch3Flags.orvellanConfronted = true;
      this.ch3Flags.gateKeyObtained = true;
      this.ch3Flags.escapeActive = true;
      this.ch3Flags.escapeBellsRung = 3;
      this.ch3Flags.act = 9;
      this.ch3EscapeTimer = 0;
      this.ch3EscapeJafrWarn1 = false;
      this.ch3EscapeJafrWarn2 = false;
      if (!this.inventory.some((it) => it.id === 'golden_gate_key')) {
        this.inventory.push({
          id: 'golden_gate_key',
          name: 'Golden Gate Key',
          description: 'Entrusted by Orvellan. Unlocks the Northern Gate out of Elarion.',
          quantity: 1,
          energyRestore: 0,
        });
      }
      this.ch3World.escapeBarriers.forEach((b, i) => {
        b.visible = !this.ch3World.escapeSwitches[i]?.activated;
      });
      this.ch3World.escapeDust.visible = true;
      this.ch3World.bellKeeperShadow.visible = true;
      this.setCh3SubZone('elarion');
      this.itemToast = 'OBTAINED: GOLDEN GATE KEY · ESCAPE BEFORE THE 7TH BELL!';
      this.itemToastTimer = 4.5;
      this.ch2Dialogue = {
        speaker: 'Orvellan',
        text: 'Take the Golden Gate Key and RUN! Shatter the two barrier crystals and unlock the Northern Gate before the seventh bell!',
      };
      this.ch2DialogueTimer = 6.2;
      this.emitSave(this.sceneId, true, 0, true, false);
    }
  }

  private handleChapter3Door(): void {
    if (this.ch3Flags.subZone === 'surface') {
      if (this.playerPos.distanceTo(CH3_EXTERIOR_DOOR_POS) < 4.0) {
        this.sound.playWoodenCreak();
        this.setCh3SubZone('house_interior');
        this.playerPos.set(0, 0, 12.6);
        this.playerYaw = Math.PI;
        this.camYaw = Math.PI;
        if (!this.ch3Flags.sleptInHouse) {
          this.ch2Dialogue = {
            speaker: 'Jafr',
            text: 'Look, an old wooden bed on the left! Press F or E near the bed to rest until morning.',
          };
          this.ch2DialogueTimer = 5.0;
        }
        this.emitHud(true);
      }
    } else if (this.ch3Flags.subZone === 'house_interior') {
      if (this.playerPos.distanceTo(CH3_INTERIOR_DOOR_POS) < 3.4) {
        if (!this.ch3Flags.sleptInHouse) {
          this.sound.playVoiceCue('Jafr');
          this.ch2Dialogue = {
            speaker: 'Jafr',
            text: "Let's rest on the bed first—we can barely stand after that portal trip!",
          };
          this.ch2DialogueTimer = 4.2;
          this.emitHud(true);
          return;
        }
        if (!this.ch3Flags.doorOpenedOnce) {
          this.ch3DoorAnimActive = true;
          this.ch3DoorAnimTimer = 0;
          this.sound.playWoodenCreak();
          if (document.pointerLockElement) document.exitPointerLock?.();
          this.emitHud(true);
        } else {
          this.sound.playWoodenCreak();
          this.setCh3SubZone('surface');
          this.playerPos.set(0, 0.24, 16.0);
          this.playerYaw = 0;
          this.camYaw = 0;
          this.emitHud(true);
        }
      }
    }
  }

  private handleChapter3Interact(): void {
    const sub = this.ch3Flags.subZone;

    // House Interior interactions (Bed or Door fallback)
    if (sub === 'house_interior') {
      if (this.playerPos.distanceTo(CH3_INTERIOR_BED_POS) < 3.6 && !this.ch3Flags.sleptInHouse) {
        this.startCh3MorningWakeSequence();
        return;
      }
      if (this.playerPos.distanceTo(CH3_INTERIOR_DOOR_POS) < 3.4) {
        this.handleChapter3Door();
        return;
      }
      return;
    }

    // Surface interactions
    if (sub === 'surface') {
      // 1. Collect Black Envelope with Golden Symbol
      if (!this.ch3Flags.letterCollected && this.playerPos.distanceTo(CH3_LETTER_POS) < 3.4) {
        this.ch3Flags.letterCollected = true;
        this.ch3World.letterEnvelopeGroup.visible = false;
        this.letterOpen = MORNING_LETTER_CONTENT;
        this.sound.playItemCollect();
        if (document.pointerLockElement) document.exitPointerLock?.();
        this.emitHud(true);
        return;
      }

      // 2. 4 Optional Collectibles
      for (const col of this.ch3World.collectibles) {
        if (!col.collected && this.playerPos.distanceTo(col.position) < 3.2) {
          col.collected = true;
          col.group.visible = false;
          if (!this.ch3Flags.collectedOptionalIds.includes(col.id)) {
            this.ch3Flags.collectedOptionalIds.push(col.id);
          }
          if (!this.inventory.some((it) => it.id === col.id)) {
            this.inventory.push({
              id: col.id,
              name: col.name,
              description: col.description,
              quantity: 1,
              energyRestore: 0,
            });
          }
          this.sound.playItemCollect();
          this.itemToast = `COLLECTED: ${col.name.toUpperCase()} (${this.ch3Flags.collectedOptionalIds.length}/4)`;
          this.itemToastTimer = 3.8;
          if (col.id === 'broken_compass') {
            this.ch3CompassLookTimer = 2.4;
            this.ch2Dialogue = {
              speaker: 'Nate',
              text: "This compass isn't pointing north... its needle is locked straight onto the Whispering Woods!",
            };
          } else {
            this.ch2Dialogue = {
              speaker: 'Jafr',
              text: `Another clue left behind—${col.name}. Keep it safe in your bag!`,
            };
          }
          this.ch2DialogueTimer = 4.6;
          this.emitSave(this.sceneId, true, 0, true, false);
          this.emitHud(true);
          return;
        }
      }

      // 3. Wooden Sign in Whispering Woods
      if (this.playerPos.distanceTo(CH3_SIGN_POS) < 3.8) {
        this.ch3Flags.signRead = true;
        this.sound.playUiClick();
        this.ch2Dialogue = {
          speaker: 'Wooden Sign',
          text: 'WELCOME TO THE WHISPERING WOODS — THE TREES REMEMBER EVERYTHING.',
        };
        this.ch2DialogueTimer = 5.0;
        this.emitHud(true);
        return;
      }

      // 4. Meet Lumi
      if (this.playerPos.distanceTo(this.ch3World.lumiRig.root.position) < 4.5) {
        this.ch3Flags.lumiMet = true;
        this.ch3Flags.act = Math.max(this.ch3Flags.act, 4);
        this.sceneId = 'ch3_scene_2_whispering_woods';
        this.sound.playMagicChime();
        this.jafrMood = 'excited';
        this.jafrStatusText = 'Listening to Lumi';
        this.ch2Dialogue = {
          speaker: 'Lumi',
          text: 'Greetings, travelers of THE BOOK. Beneath the mountain lies Elarion—the forgotten heart of Aurelia. Gather the Sun, Moon, and Star symbol fragments from the nearby ruins and align the Three Memory Stones!',
        };
        this.ch2DialogueTimer = 7.0;
        this.emitSave('ch3_scene_2_whispering_woods', true, 0, true, false);
        this.emitHud(true);
        return;
      }

      // 5. Collect 3 Symbol Fragments
      for (const frag of this.ch3World.fragments) {
        if (!frag.collected && this.playerPos.distanceTo(frag.position) < 3.4) {
          frag.collected = true;
          frag.group.visible = false;
          if (!this.ch3Flags.collectedFragments.includes(frag.id)) {
            this.ch3Flags.collectedFragments.push(frag.id);
          }
          this.sound.playItemCollect();
          this.itemToast = `FOUND: ${frag.title.toUpperCase()} (${this.ch3Flags.collectedFragments.length}/3)`;
          this.itemToastTimer = 3.8;
          this.ch2Dialogue = {
            speaker: 'Jafr',
            text:
              this.ch3Flags.collectedFragments.length >= 3
                ? 'We found all 3 Symbol Fragments! Hurry back to the Three Memory Stones platform!'
                : `Nice! That is the ${frag.title} (${this.ch3Flags.collectedFragments.length}/3).`,
          };
          this.ch2DialogueTimer = 4.5;
          this.emitSave(this.sceneId, true, 0, true, false);
          this.emitHud(true);
          return;
        }
      }

      // 6. Descend Hidden Staircase once Stones Puzzle Solved
      if (this.ch3Flags.stonesSolved && this.playerPos.distanceTo(CH3_STAIR_DESCENT_POS) < 4.4) {
        this.sound.playMagicChime();
        this.enterScene('ch3_scene_elarion');
        return;
      }

      // 7. Three Memory Stones Platform / Puzzle Modal
      const nearAnyStone = this.ch3World.memoryStones.some(
        (st) => this.playerPos.distanceTo(st.position) < 3.4
      );
      if (nearAnyStone || this.playerPos.distanceTo(CH3_STONES_PLATFORM_POS) < 9.5) {
        if (!this.ch3Flags.stonesSolved) {
          this.ch3PuzzleOpen = true;
          this.ch3PuzzleFeedback = null;
          this.sound.playUiClick();
          if (document.pointerLockElement) document.exitPointerLock?.();
          this.emitHud(true);
          return;
        }
      }
      return;
    }

    // Elarion interactions
    if (sub === 'elarion') {
      // 1. Inspect Elarion Lore Objects
      for (const ins of this.ch3World.elarionInspectables) {
        if (this.playerPos.distanceTo(ins.position) < 3.4) {
          if (!this.ch3Flags.inspectedElarionIds.includes(ins.id)) {
            this.ch3Flags.inspectedElarionIds.push(ins.id);
          }
          this.sound.playUiClick();
          this.ch2Dialogue = { speaker: ins.label, text: ins.text };
          this.ch2DialogueTimer = 6.0;
          this.emitHud(true);
          return;
        }
      }

      // 2. Broken-Faced Wizard Statue -> Memory Vision Cinematic
      if (this.playerPos.distanceTo(CH3_STATUE_POS) < 5.5 && !this.ch3Flags.statueMemoryViewed) {
        this.startCh3MemoryVision();
        return;
      }

      // 3. Speak with Orvellan (Interactive Dialogue Choices)
      if (
        this.playerPos.distanceTo(CH3_ORVELLAN_POS) < 5.2 &&
        !this.ch3Flags.orvellanConfronted &&
        !this.ch3Flags.escapeActive
      ) {
        this.ch3Flags.orvellanMet = true;
        this.sound.setZone('ch3_library');
        this.sound.playVoiceCue('Mother');
        this.ch3OrvellanMenuActive = true;
        this.ch3OrvellanChoiceDialogue = {
          speaker: 'Orvellan',
          text: 'At last, a living soul walks the Library of Elarion. I am Orvellan—the Last Keeper. Ask what you wish to know, young Reader.',
        };
        if (document.pointerLockElement) document.exitPointerLock?.();
        this.emitSave(this.sceneId, true, 0, true, false);
        this.emitHud(true);
        return;
      }

      // 4. Waystone Escape Switches
      if (this.ch3Flags.escapeActive) {
        for (const sw of this.ch3World.escapeSwitches) {
          if (!sw.activated && this.playerPos.distanceTo(sw.position) < 3.8) {
            sw.activated = true;
            sw.crystal.visible = false;
            sw.ring.visible = false;
            this.ch3Flags.escapeSwitchIds.push(sw.id);
            const bar = this.ch3World.escapeBarriers[sw.barrierIndex];
            if (bar) bar.visible = false;
            this.sound.playPuzzleSolve();
            this.itemToast = 'RUNE BARRIER SHATTERED · KEEP RUNNING NORTH!';
            this.itemToastTimer = 3.0;
            this.emitHud(true);
            return;
          }
        }
      }

      // 5. Unlock Northern Gate with Golden Gate Key
      if (this.playerPos.distanceTo(CH3_NORTHERN_GATE_POS) < 5.8) {
        if (!this.ch3Flags.gateKeyObtained) {
          this.sound.playVoiceCue('Jafr');
          this.ch2Dialogue = {
            speaker: 'Jafr',
            text: 'The Northern Gate is sealed tight! Speak with Orvellan in the Ancient Library first!',
          };
          this.ch2DialogueTimer = 4.4;
          this.emitHud(true);
          return;
        }
        this.ch3Flags.northernGateOpened = true;
        this.ch3Flags.escapeActive = false;
        this.ch3BellFinalePhase = 'gate';
        this.ch3BellFinaleActive = true;
        this.ch3BellFinaleTimer = 0;
        this.ch3World.goldenKeyMesh.visible = true;
        this.sound.playKeyTurn();
        if (document.pointerLockElement) document.exitPointerLock?.();
        this.emitHud(true);
      }
    }
  }

  private updateCh3BellFinale(dt: number): void {
    this.ch3BellFinaleTimer += dt;
    const t = this.ch3BellFinaleTimer;

    if (this.ch3BellFinalePhase === 'gate') {
      // Key turn animation, runes blaze, 7th bell tolls, Northern Gate opens
      this.ch3World.goldenKeyMesh.rotation.z = THREE.MathUtils.smoothstep(t, 0, 1.1) * Math.PI;
      if (t > 1.0) {
        this.ch3World.gateRunes.forEach((gr) => {
          (gr.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.72;
        });
      }
      if (Math.abs(t - 1.2) < 0.04) {
        this.ch3Flags.escapeBellsRung = 7;
        this.sound.playBellToll();
      }
      const open = THREE.MathUtils.smoothstep(t, 1.3, 3.4) * (Math.PI * 0.48);
      this.ch3World.leftGatePivot.rotation.y = -open;
      this.ch3World.rightGatePivot.rotation.y = open;

      this.nate.root.position.copy(this.playerPos);
      this.nate.root.rotation.y = this.playerYaw;
      animateNate(this.nate, dt, this.totalTime, {
        speed: 0,
        isRunning: false,
        isGrounded: true,
        isFlying: false,
        isSitting: false,
        hasBook: false,
        shocked: false,
        ch2Pose: 'gesture',
      });

      _camTargetPos.set(
        CH3_NORTHERN_GATE_POS.x + 2.8,
        CH3_NORTHERN_GATE_POS.y + 3.6,
        CH3_NORTHERN_GATE_POS.z + 9.2
      );
      this.camera.position.lerp(_camTargetPos, 1 - Math.exp(-4 * dt));
      this.camera.lookAt(0, 4.2, CH3_NORTHERN_GATE_POS.z);

      this.whiteFadeAlpha = THREE.MathUtils.smoothstep(t, 3.4, 4.8);
      if (t >= 4.9) {
        // Transition seamlessly into Act 10: Valley of Silent Bells
        this.ch3BellFinalePhase = 'valley';
        this.ch3BellFinaleTimer = 0;
        this.ch3Flags.bellsAwakened = true;
        this.ch3Flags.act = 10;
        this.sceneId = 'ch3_scene_3_silent_bells';
        this.setCh3SubZone('valley');
        this.playerPos.copy(CH3_VALLEY_SPAWN);
        this.playerYaw = Math.PI;
        this.ch3BannerTitle = 'THE VALLEY OF SILENT BELLS';
        this.ch3BannerSubtitle = 'Act 10 · Tower of Books';
        this.ch3BannerTimer = 4.6;
        this.ch2Dialogue = null;
      }
      return;
    }

    // Phase: 'valley' — Sweeping panoramic reveal -> Memory Crystal glows -> "Welcome, Reader." -> Nate & Jafr close-up -> Complete
    this.whiteFadeAlpha = Math.max(0, 1 - THREE.MathUtils.smoothstep(t, 0, 1.4));
    this.nate.root.position.copy(this.playerPos);
    this.nate.root.rotation.y = this.playerYaw;
    animateNate(this.nate, dt, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: true,
      isFlying: false,
      isSitting: false,
      hasBook: false,
      shocked: false,
      ch2Pose: 'normal',
    });

    if (t < 6.2) {
      // Sweeping panoramic reveal over silent river, floating bells, and colossal Tower of Books
      const p = t / 6.2;
      this.camera.position.set(
        THREE.MathUtils.lerp(-24, 16, p),
        THREE.MathUtils.lerp(18, 12, p),
        THREE.MathUtils.lerp(14, -20, p)
      );
      this.camera.lookAt(CH3_BOOK_TOWER_POS.x, 18, CH3_BOOK_TOWER_POS.z);
    } else {
      // Mysterious Voice ("Welcome, Reader.") + Close-up on Nate & Jafr
      if (Math.abs(t - 6.3) < 0.04) {
        this.sound.playBellToll();
      }
      this.ch2Dialogue = {
        speaker: 'Mysterious Voice',
        text: 'Welcome, Reader.',
        note: 'The Memory Crystal glows warmly in Nate’s pocket as the colossal Tower of Books beckons across the silent valley.',
      };
      _camTargetPos.set(this.playerPos.x + 1.8, this.playerPos.y + 1.65, this.playerPos.z + 2.5);
      this.camera.position.lerp(_camTargetPos, 1 - Math.exp(-4.5 * dt));
      this.camera.lookAt(this.playerPos.x, this.playerPos.y + 1.32, this.playerPos.z);
    }

    this.fadeAlpha = THREE.MathUtils.smoothstep(t, 10.6, 12.2);
    if (t >= 12.4) {
      this.ch3BellFinaleActive = false;
      this.enterScene('ch3_complete');
    }
  }

  private updateCh2Autosave(dt: number): void {
    if ((!this.isChapter2Scene() && !this.isChapter3Scene() && !this.isChapter4Scene()) || this.sceneId === 'ch2_complete' || this.sceneId === 'ch3_complete' || this.sceneId === 'ch4_complete') return;
    if (
      this.isResting ||
      this.isSleeping ||
      this.boxOpening ||
      this.ch2DoorOpening ||
      this.portalDiscoveryActive ||
      this.portalInvestigateActive ||
      this.portalFinaleActive ||
      this.ch3PortalTunnelActive ||
      this.ch3MorningWakeActive ||
      this.ch3DoorAnimActive ||
      this.ch3MemoryVisionActive ||
      this.ch3ArchiveCinematicActive ||
      this.ch3BellFinaleActive ||
      this.ch4CutscenePhase !== 'none'
    ) {
      return;
    }
    this.autosaveTimer += dt;
    if (this.autosaveTimer >= 180) {
      this.autosaveTimer = 0;
      this.saveStatus = 'saving';
      this.saveStatusTimer = 0.8;
      this.emitSave(this.sceneId, true, 0, this.ch2PortalCompleted || this.isChapter3Scene() || this.isChapter4Scene(), this.isChapter4Scene(), false);
      window.setTimeout(() => {
        if (!this.disposed) {
          this.saveStatus = 'saved';
          this.saveStatusTimer = 3.0;
          this.emitHud(true);
        }
      }, 650);
    }
  }

  // =========================================================================
  // Chapter 4 – THE WAR OF PELICON DESERT (Weapons, AI, Cinematics, Quests)
  // =========================================================================

  private initCh4Warriors(): void {
    this.ch4Warriors.forEach((w) => this.scene.remove(w.rig.root));
    this.ch4Warriors = [];

    const specs: Array<{ id: string; team: 'ally' | 'enemy'; zone: 1 | 2 | 3; x: number; z: number; captain?: boolean }> = [
      // Area 1: Desert Wall
      { id: 'ally_1', team: 'ally', zone: 1, x: -3.2, z: 86 },
      { id: 'ally_2', team: 'ally', zone: 1, x: 3.4, z: 84 },
      { id: 'enemy_1a', team: 'enemy', zone: 1, x: -2.8, z: 79 },
      { id: 'enemy_1b', team: 'enemy', zone: 1, x: 2.8, z: 78 },
      { id: 'enemy_1c', team: 'enemy', zone: 1, x: 0, z: 72 },

      // Area 2: Abandoned Market
      { id: 'ally_3', team: 'ally', zone: 2, x: -4.2, z: 38 },
      { id: 'enemy_2a', team: 'enemy', zone: 2, x: -3.8, z: 30 },
      { id: 'enemy_2b', team: 'enemy', zone: 2, x: 3.8, z: 24 },
      { id: 'enemy_2c', team: 'enemy', zone: 2, x: -1.5, z: 14 },
      { id: 'enemy_2d', team: 'enemy', zone: 2, x: 2.5, z: 8 },

      // Area 3: Castle Road
      { id: 'ally_4', team: 'ally', zone: 3, x: -3.6, z: -20 },
      { id: 'ally_5', team: 'ally', zone: 3, x: 3.6, z: -22 },
      { id: 'enemy_3a', team: 'enemy', zone: 3, x: -4.2, z: -32 },
      { id: 'enemy_3b', team: 'enemy', zone: 3, x: 4.2, z: -36 },
      { id: 'enemy_3c', team: 'enemy', zone: 3, x: -2.0, z: -48 },
      { id: 'enemy_3d', team: 'enemy', zone: 3, x: 2.2, z: -52 },
      { id: 'enemy_captain', team: 'enemy', zone: 3, x: 0, z: -60, captain: true },
    ];

    specs.forEach((s, idx) => {
      const variant = s.team === 'ally' ? 'ally' : s.captain ? 'captain' : 'enemy';
      const rig = createPeliconWarriorModel(this.tex, variant);
      const y = getCh4DesertTerrainHeight(s.x, s.z);
      const pos = new THREE.Vector3(s.x, y, s.z);
      rig.root.position.copy(pos);
      rig.root.rotation.y = s.team === 'ally' ? Math.PI : 0;
      rig.root.visible = false;
      this.scene.add(rig.root);
      this.ch4Warriors.push({
        id: s.id,
        team: s.team,
        zone: s.zone,
        rig,
        pos,
        yaw: s.team === 'ally' ? Math.PI : 0,
        hp: s.captain ? 150 : s.team === 'ally' ? 180 : 80,
        maxHp: s.captain ? 150 : s.team === 'ally' ? 180 : 80,
        cooldown: 0.4 + (idx % 4) * 0.25,
        dead: false,
        vanishTimer: 0,
        phase: idx * 0.7,
        homePos: pos.clone(),
      });
    });
  }

  private resetCh4State(preserveCarryOver: boolean): void {
    this.ch4Flags = { ...DEFAULT_CH4_FLAGS };
    this.ch4Health = 100;
    this.ch4SwordSwingTimer = 0;
    this.ch4SwordHitTimer = 0;
    this.ch4BowCooldown = 0;
    this.ch4IsAiming = false;
    this.ch4CutscenePhase = 'none';
    this.ch4CutsceneTimer = 0;
    this.ch4CutsceneStep = 0;
    this.ch4BannerTitle = null;
    this.ch4BannerSubtitle = null;
    this.ch4BannerTimer = 0;
    this.ch4SnehAttachedToEita = false;
    this.ch4JafrDetached = false;
    this.ch4JournalCollected = false;
    this.ch4LastWallCheck = 0;
    this.ch4EitaExpression = 'gentle';
    this.ch4EitaTalking = false;
    this.ch4EitaWalking = false;

    this.ch4Projectiles.forEach((p) => this.scene.remove(p.mesh));
    this.ch4Projectiles = [];
    this.ch4VfxRings.forEach((r) => this.scene.remove(r.mesh));
    this.ch4VfxRings = [];
    this.initCh4Warriors();
    this.ch4WoundedWarrior.struckArrow.visible = false;
    this.ch4WoundedWarrior.root.visible = false;
    this.eita.root.visible = false;
    this.sneh.root.visible = false;
    this.ch4World.magicAwakenPillars.visible = false;
    (this.ch4World.magicAwakenFloorRing.material as THREE.MeshBasicMaterial).opacity = 0;

    if (!preserveCarryOver) {
      this.energy = 100;
      this.inventory = [
        {
          id: 'energy_tonic',
          name: 'Energy Tonic',
          description: 'Restores health and energy in Pelicon Desert.',
          quantity: 1,
          energyRestore: 55,
        },
      ];
    } else {
      // Remove Ch4-specific collectibles if replaying Ch4 fresh
      this.inventory = this.inventory.filter(
        (it) =>
          it.id !== 'pelicon_sword' &&
          it.id !== 'fire_bow' &&
          it.id !== 'arcane_bow' &&
          it.id !== 'pelicon_emblem' &&
          it.id !== 'eita_journal'
      );
    }
    this.jafrMood = 'curious';
    this.jafrStatusText = 'Perched on right shoulder';
  }

  private applySavedCh4Progress(save: SaveProgress): void {
    if (typeof save.energy === 'number') this.energy = save.energy;
    if (save.inventory) this.inventory = save.inventory.map((it) => ({ ...it }));
    if (save.ch4Flags) {
      this.ch4Flags = { ...DEFAULT_CH4_FLAGS, ...save.ch4Flags };
      this.ch4Warriors.forEach((w) => {
        if (w.team === 'enemy') {
          const cleared =
            (w.zone === 1 && this.ch4Flags.wallCleared) ||
            (w.zone === 2 && this.ch4Flags.marketCleared) ||
            (w.zone === 3 && this.ch4Flags.castleRoadCleared);
          if (cleared) {
            w.dead = true;
            w.hp = 0;
            w.rig.root.visible = false;
          }
        }
      });
    }
  }

  private grantCh4Item(id: 'pelicon_sword' | 'fire_bow' | 'arcane_bow' | 'pelicon_emblem' | 'eita_journal'): void {
    if (this.inventory.some((it) => it.id === id)) return;
    const defs: Record<typeof id, InventoryItem> = {
      pelicon_sword: {
        id: 'pelicon_sword',
        name: 'Pelicon Warrior Sword',
        description: 'Forged desert blade entrusted by a fallen Pelicon guardian. Right-click to strike.',
        quantity: 1,
        energyRestore: 0,
      },
      fire_bow: {
        id: 'fire_bow',
        name: 'Magical Fire Bow',
        description: 'Ancient curved bronze-gold bow with unlimited radiant fire arrows. Left-click to aim, Right-click to fire.',
        quantity: 1,
        energyRestore: 0,
      },
      arcane_bow: {
        id: 'arcane_bow',
        name: 'Arcane Burst Bow',
        description: 'Special Pelicon bow firing glowing violet arrows with wide arcane shockwaves.',
        quantity: 1,
        energyRestore: 0,
      },
      pelicon_emblem: {
        id: 'pelicon_emblem',
        name: 'Pelicon Royal Emblem',
        description: 'Crest of the liberated Desert Kingdom honoring the hero who freed Princess Eita.',
        quantity: 1,
        energyRestore: 0,
      },
      eita_journal: {
        id: 'eita_journal',
        name: "Eita's Story Journal",
        description: 'Princess Eita Yusa’s handwritten diary of growing up inside THE BOOK since age four.',
        quantity: 1,
        energyRestore: 0,
      },
    };
    this.inventory.push(defs[id]);
  }

  private setCh4SubZone(sub: Ch4SubZone): void {
    this.ch4Flags.subZone = sub;
    this.ch4World.setSubZoneVisible(sub);
    if (sub === 'tunnel') {
      this.scene.background = new THREE.Color(0x1f192d);
      this.scene.fog = new THREE.FogExp2(0x1f192d, 0.014);
      this.hemiLight.color.setHex(0xfef3c7);
      this.hemiLight.groundColor.setHex(0x92400e);
      this.hemiLight.intensity = 1.1;
      this.sunLight.intensity = 0.85;
      this.sound.setZone('portal_tunnel');
    } else if (sub === 'castle_interior') {
      this.scene.background = new THREE.Color(0x2a1d17);
      this.scene.fog = new THREE.FogExp2(0x2a1d17, 0.008);
      this.hemiLight.color.setHex(0xfef3c7);
      this.hemiLight.groundColor.setHex(0x78350f);
      this.hemiLight.intensity = 1.05;
      this.sunLight.intensity = 0.9;
      this.sunLight.color.setHex(0xffedd5);
      this.sound.setZone(this.ch4Flags.reunionDone ? 'pelicon_reunion' : 'pelicon_castle');
    } else {
      this.scene.background = new THREE.Color(0xd97746);
      this.scene.fog = new THREE.FogExp2(0xd97746, 0.0036);
      this.hemiLight.color.setHex(0xfde68a);
      this.hemiLight.groundColor.setHex(0x92400e);
      this.hemiLight.intensity = 0.96;
      this.sunLight.intensity = 1.55;
      this.sunLight.color.setHex(0xffd29d);
      this.sound.setZone(
        this.ch4Flags.castleEscaped
          ? 'pelicon_town'
          : this.ch4Flags.victoryAchieved
          ? 'pelicon_castle'
          : this.ch4Flags.swordCollected
          ? 'pelicon_battle'
          : 'pelicon_desert'
      );
    }
    if (this.bloomPass) {
      this.bloomPass.strength = 0.055;
      this.bloomPass.radius = 0.30;
      this.bloomPass.threshold = 1.10;
    }
  }

  public selectCh4Weapon(mode: Ch4WeaponMode): void {
    if (!this.isChapter4Scene()) return;
    if (mode === 'sword' && !this.ch4Flags.swordCollected) return;
    if (mode === 'fire_bow' && !this.ch4Flags.fireBowCollected) return;
    if (mode === 'arcane_bow' && !this.ch4Flags.arcaneBowUnlocked) return;
    this.ch4Flags.activeWeapon = mode;
    this.ch4IsAiming = false;
    if (mode !== 'sword') this.ch4IsBlocking = false;
    this.sound.playUiClick();
    const label =
      mode === 'sword'
        ? 'PELICON WARRIOR SWORD EQUIPPED'
        : mode === 'fire_bow'
        ? 'MAGICAL FIRE BOW EQUIPPED'
        : 'ARCANE BURST BOW EQUIPPED';
    this.itemToast = label;
    this.itemToastTimer = 2.0;
    this.emitHud(true);
  }

  public switchCh4Bow(): void {
    if (!this.isChapter4Scene()) return;
    if (!this.ch4Flags.fireBowCollected && !this.ch4Flags.arcaneBowUnlocked) {
      this.itemToast = 'FIND A MAGICAL BOW ON THE BATTLEFIELD FIRST';
      this.itemToastTimer = 2.2;
      this.emitHud(true);
      return;
    }
    if (this.ch4Flags.activeWeapon === 'fire_bow' && this.ch4Flags.arcaneBowUnlocked) {
      this.selectCh4Weapon('arcane_bow');
    } else if (this.ch4Flags.activeWeapon === 'arcane_bow' && this.ch4Flags.fireBowCollected) {
      this.selectCh4Weapon('fire_bow');
    } else if (this.ch4Flags.fireBowCollected) {
      this.selectCh4Weapon('fire_bow');
    } else if (this.ch4Flags.arcaneBowUnlocked) {
      this.selectCh4Weapon('arcane_bow');
    }
  }

  public triggerCh4PrimaryAttack(): void {
    if (!this.isChapter4Scene() || !this.isPlayableScene() || this.ch4CutscenePhase !== 'none') return;
    const wMode = this.ch4Flags.activeWeapon;
    if (wMode === 'sword' && this.ch4Flags.swordCollected) {
      if (this.ch4SwordSwingTimer > 0.08) return;
      this.ch4IsBlocking = false;
      this.ch4ComboStep = (this.ch4ComboStep + 1) % 3;
      this.ch4ComboResetTimer = 1.1;
      const comboDmg = this.ch4ComboStep === 2 ? 58 : this.ch4ComboStep === 1 ? 45 : 38;
      this.ch4SwordSwingTimer = 0.36;
      this.sound.playSwordSwing();
      // Stylized forward sword arc hit detection
      const fwdX = Math.sin(this.playerYaw);
      const fwdZ = Math.cos(this.playerYaw);
      this.spawnCh4VfxRing(
        new THREE.Vector3(this.playerPos.x + fwdX * 1.4, this.playerPos.y + 1.1, this.playerPos.z + fwdZ * 1.4),
        this.ch4ComboStep === 2 ? 0xf59e0b : 0xfbbf24,
        this.ch4ComboStep === 2 ? 2.25 : 1.8,
        0.24
      );
      let landed = false;
      for (const w of this.ch4Warriors) {
        if (w.dead || w.team !== 'enemy') continue;
        const dx = w.pos.x - this.playerPos.x;
        const dz = w.pos.z - this.playerPos.z;
        const d = Math.hypot(dx, dz);
        if (d < 4.25) {
          const dot = (dx * fwdX + dz * fwdZ) / Math.max(0.01, d);
          if (dot > -0.15) {
            this.damageCh4Enemy(w, comboDmg);
            landed = true;
          }
        }
      }
      if (landed) this.sound.playSwordHit();
    } else if (
      (wMode === 'fire_bow' && this.ch4Flags.fireBowCollected) ||
      (wMode === 'arcane_bow' && this.ch4Flags.arcaneBowUnlocked)
    ) {
      if (this.ch4BowCooldown > 0) return;
      this.ch4BowCooldown = wMode === 'arcane_bow' ? 0.65 : 0.42;
      this.playerYaw = this.camYaw;
      if (wMode === 'fire_bow') {
        this.sound.playFireBow();
        this.spawnCh4Projectile('fire');
      } else {
        this.sound.playArcaneBow();
        this.spawnCh4Projectile('arcane');
      }
    }
  }

  private spawnCh4VfxRing(pos: THREE.Vector3, color: number, targetScale: number, duration: number): void {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.4, 0.85, 24),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(pos);
    this.scene.add(mesh);
    this.ch4VfxRings.push({ mesh, life: duration, maxLife: duration, targetScale });
  }

  private spawnCh4Projectile(kind: 'fire' | 'arcane'): void {
    const mesh = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.85, 6),
      new THREE.MeshBasicMaterial({ color: kind === 'fire' ? 0xfbbf24 : 0xe9d5ff })
    );
    shaft.rotation.x = Math.PI / 2;
    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(kind === 'arcane' ? 0.16 : 0.11, 8, 8),
      new THREE.MeshBasicMaterial({ color: kind === 'fire' ? 0xf97316 : 0xa855f7 })
    );
    tip.position.z = 0.45;
    mesh.add(shaft, tip);

    // Direction from camera look forward along XZ + pitch
    const dir = new THREE.Vector3(
      -Math.sin(this.camYaw) * Math.cos(this.camPitch * 0.55),
      -Math.sin(this.camPitch * 0.4) + 0.03,
      -Math.cos(this.camYaw) * Math.cos(this.camPitch * 0.55)
    ).normalize();

    const startPos = new THREE.Vector3(
      this.playerPos.x + dir.x * 0.9,
      this.playerPos.y + 1.38,
      this.playerPos.z + dir.z * 0.9
    );
    mesh.position.copy(startPos);
    mesh.lookAt(startPos.clone().add(dir));
    this.scene.add(mesh);

    this.ch4Projectiles.push({
      kind,
      mesh,
      pos: startPos,
      vel: dir.multiplyScalar(kind === 'arcane' ? 38 : 44),
      life: 2.2,
    });
  }

  private damageCh4Enemy(
    w: (typeof this.ch4Warriors)[number],
    dmg: number
  ): void {
    w.hp -= dmg;
    this.spawnCh4VfxRing(
      new THREE.Vector3(w.pos.x, w.pos.y + 1.1, w.pos.z),
      0xfbbf24,
      2.2,
      0.32
    );
    if (w.hp <= 0) {
      w.dead = true;
      w.vanishTimer = 0.7;
      this.evaluateCh4BattleProgression();
    }
  }

  private evaluateCh4BattleProgression(): void {
    const aliveIn = (z: 1 | 2 | 3) =>
      this.ch4Warriors.some((w) => w.team === 'enemy' && w.zone === z && !w.dead);

    if (!this.ch4Flags.wallCleared && !aliveIn(1)) {
      this.ch4Flags.wallCleared = true;
      this.ch4Flags.act = Math.max(this.ch4Flags.act, 4);
      this.sound.playMagicChime();
      this.ch4BannerTitle = 'DESERT WALL CLEARED';
      this.ch4BannerSubtitle = 'Advance to the Abandoned Market & Collect the Magical Bow';
      this.ch4BannerTimer = 4.2;
      this.ch2Dialogue = {
        speaker: 'Jafr',
        text: 'Nice sword work, Nate! Look ahead through the arch—there is a glowing Magical Bow on a stone pedestal!',
      };
      this.ch2DialogueTimer = 5.0;
    }

    if (!this.ch4Flags.marketCleared && !aliveIn(2)) {
      this.ch4Flags.marketCleared = true;
      this.sound.playMagicChime();
      this.ch4BannerTitle = 'ABANDONED MARKET LIBERATED';
      this.ch4BannerSubtitle = 'Arcane Burst Bow Unlocked ahead on the Castle Road!';
      this.ch4BannerTimer = 4.4;
      this.ch2Dialogue = {
        speaker: 'Jafr',
        text: 'Look over by the Castle Road pedestal—an Arcane Burst Bow just materialized for us!',
      };
      this.ch2DialogueTimer = 5.2;
    }

    if (!this.ch4Flags.castleRoadCleared && !aliveIn(3)) {
      this.ch4Flags.castleRoadCleared = true;
      this.startCh4VictoryCutscene();
    }
  }

  private handleChapter4Interact(): void {
    const f = this.ch4Flags;
    if (f.subZone === 'desert') {
      if (!f.swordCollected && this.playerPos.distanceTo(CH4_DROPPED_SWORD_POS) < 3.8) {
        f.swordCollected = true;
        f.activeWeapon = 'sword';
        this.grantCh4Item('pelicon_sword');
        this.sound.playItemCollect();
        this.itemToast = 'OBTAINED PELICON WARRIOR SWORD · RIGHT-CLICK TO STRIKE';
        this.itemToastTimer = 3.8;
        this.emitSave(this.sceneId, true, 0, true, true, false);
        this.emitHud(true);
        return;
      }
      if (!f.fireBowCollected && this.playerPos.distanceTo(CH4_FIRE_BOW_POS) < 4.2) {
        f.fireBowCollected = true;
        f.activeWeapon = 'fire_bow';
        f.act = Math.max(f.act, 4);
        this.grantCh4Item('fire_bow');
        this.sound.playItemCollect();
        this.itemToast = 'OBTAINED MAGICAL FIRE BOW · LEFT-CLICK AIM / RIGHT-CLICK SHOOT';
        this.itemToastTimer = 4.2;
        this.emitSave('ch4_scene_2_battlefield', true, 0, true, true, false);
        this.emitHud(true);
        return;
      }
      if (f.marketCleared && !f.arcaneBowUnlocked && this.playerPos.distanceTo(CH4_ARCANE_BOW_POS) < 4.2) {
        f.arcaneBowUnlocked = true;
        f.activeWeapon = 'arcane_bow';
        this.grantCh4Item('arcane_bow');
        this.sound.playItemCollect();
        this.itemToast = 'OBTAINED ARCANE BURST BOW · PRESS N TO SWITCH BOWS';
        this.itemToastTimer = 4.2;
        this.emitSave('ch4_scene_2_battlefield', true, 0, true, true, false);
        this.emitHud(true);
        return;
      }
    } else if (f.subZone === 'castle_interior') {
      if (f.eitaRoomEntered && !this.ch4JournalCollected && this.playerPos.distanceTo(CH4_JOURNAL_POS) < 3.4) {
        this.ch4JournalCollected = true;
        this.grantCh4Item('eita_journal');
        this.sound.playItemCollect();
        this.itemToast = "COLLECTED EITA'S STORY JOURNAL";
        this.itemToastTimer = 3.2;
        this.emitHud(true);
      }
    }
  }

  private handleChapter4Door(): void {
    const f = this.ch4Flags;
    if (f.subZone === 'desert') {
      if (f.victoryAchieved && this.playerPos.distanceTo(CH4_CASTLE_DOOR_POS) < 5.5) {
        if (!f.balconyEitaSeen) {
          this.startCh4BalconyCutscene();
          return;
        }
        this.sound.playDoorOpen();
        this.enterScene('ch4_scene_3_castle_interior');
      }
    } else if (f.subZone === 'castle_interior') {
      if (!f.eitaRoomEntered && this.playerPos.distanceTo(CH4_EITA_DOOR_POS) < 4.2) {
        f.eitaRoomEntered = true;
        this.sound.playDoorOpen();
        this.startCh4ReunionCutscene();
      } else if (f.eitaCompanionActive && this.playerPos.distanceTo(CH4_CASTLE_EXIT_DOOR_POS) < 4.6) {
        f.castleEscaped = true;
        this.sound.playDoorOpen();
        this.enterScene('ch4_scene_4_pelicon_town');
      }
    }
  }

  private startCh4VictoryCutscene(): void {
    this.ch4Flags.victoryAchieved = true;
    this.ch4Flags.act = Math.max(this.ch4Flags.act, 5);
    this.ch4CutscenePhase = 'victory';
    this.ch4CutsceneTimer = 0;
    this.ch4CutsceneStep = 0;
    this.ch4IsAiming = false;
    this.grantCh4Item('pelicon_emblem');
    this.sound.setZone('pelicon_castle');
    this.sound.playCrowdCheer();
    if (document.pointerLockElement) document.exitPointerLock?.();
    this.emitHud(true);
  }

  private startCh4BalconyCutscene(): void {
    this.ch4Flags.balconyEitaSeen = true;
    this.ch4Flags.act = Math.max(this.ch4Flags.act, 6);
    this.ch4CutscenePhase = 'balcony';
    this.ch4CutsceneTimer = 0;
    this.ch4CutsceneStep = 0;
    this.eita.root.visible = true;
    this.ch4EitaPos.copy(CH4_BALCONY_EITA_POS);
    this.ch4EitaYaw = 0;
    this.ch4EitaExpression = 'smile';
    this.sound.playMagicChime();
    if (document.pointerLockElement) document.exitPointerLock?.();
    this.emitHud(true);
  }

  private startCh4ReunionCutscene(): void {
    this.ch4Flags.reunionDone = false;
    this.ch4Flags.act = Math.max(this.ch4Flags.act, 8);
    this.ch4CutscenePhase = 'reunion';
    this.ch4CutsceneTimer = 0;
    this.ch4CutsceneStep = 0;
    this.playerPos.set(0, 3.8, -28.6);
    this.playerYaw = Math.PI;
    this.eita.root.visible = true;
    this.ch4EitaPos.set(0, 3.8, -31.2);
    this.ch4EitaYaw = 0;
    this.ch4EitaExpression = 'gentle';
    this.sound.setZone('pelicon_reunion');
    if (document.pointerLockElement) document.exitPointerLock?.();
    this.emitHud(true);
  }

  private advanceCh4CutsceneStep(): void {
    if (this.ch4CutscenePhase === 'portal') return; // Wait for automatic portal arrival
    if (this.ch4CutscenePhase === 'magic_awaken') return;
    if (this.ch4CutscenePhase === 'outskirts_end' && this.ch4CutsceneStep >= 3) return;
    this.sound.playUiClick();
    this.ch4CutsceneStep++;
    this.ch4CutsceneTimer = 0;
    this.applyCh4StepEnter();
    this.emitHud(true);
  }

  private applyCh4StepEnter(): void {
    const ph = this.ch4CutscenePhase;
    const st = this.ch4CutsceneStep;
    if (ph === 'fall_intro' && st >= 1) {
      this.ch4CutscenePhase = 'none';
      this.ch4Flags.arrivalDone = true;
      this.ch4Flags.act = Math.max(this.ch4Flags.act, 2);
      this.ch4WoundedWarrior.root.visible = true;
      this.ch4WoundedWarrior.root.position.set(
        CH4_WOUNDED_WARRIOR_POS.x,
        getCh4DesertTerrainHeight(CH4_WOUNDED_WARRIOR_POS.x, CH4_WOUNDED_WARRIOR_POS.z),
        CH4_WOUNDED_WARRIOR_POS.z
      );
      this.ch4BannerTitle = 'PELICON DESERT';
      this.ch4BannerSubtitle = 'Approach the Wounded Pelicon Warrior ahead';
      this.ch4BannerTimer = 4.5;
    } else if (ph === 'wounded') {
      if (st === 3) {
        this.ch4WoundedWarrior.struckArrow.visible = true;
        this.sound.playSwordHit();
      } else if (st >= 6) {
        this.ch4CutscenePhase = 'none';
        this.ch4Flags.woundedWarriorDone = true;
        this.ch4Flags.swordCollected = true;
        this.ch4Flags.activeWeapon = 'sword';
        this.ch4Flags.act = Math.max(this.ch4Flags.act, 3);
        this.grantCh4Item('pelicon_sword');
        this.sound.playItemCollect();
        this.sound.setZone('pelicon_battle');
        this.itemToast = 'OBTAINED PELICON WARRIOR SWORD · MAIN QUEST: SAVE THE PRINCESS';
        this.itemToastTimer = 4.6;
        this.sceneId = 'ch4_scene_2_battlefield';
        this.latestCheckpoint = 'ch4_scene_2_battlefield';
        this.emitSave('ch4_scene_2_battlefield', true, 0, true, true, false);
      }
    } else if (ph === 'victory' && st >= 2) {
      this.ch4CutscenePhase = 'none';
      this.ch4BannerTitle = 'PELICON KINGDOM – VICTORY';
      this.ch4BannerSubtitle = 'MAIN QUEST UPDATED: FIND THE PRINCESS';
      this.ch4BannerTimer = 4.8;
    } else if (ph === 'balcony' && st >= 3) {
      this.ch4CutscenePhase = 'none';
      this.ch4Flags.castleEntered = true;
      this.enterScene('ch4_scene_3_castle_interior');
    } else if (ph === 'reunion') {
      if (st === 1) this.ch4EitaExpression = 'surprised';
      if (st === 3) {
        this.ch4EitaExpression = 'hug';
        this.sound.playMagicChime();
      }
      if (st === 5) {
        // Jafr drops onto floor & Sneh leaps from Eita's hair toward the bookshelf!
        this.ch4EitaExpression = 'smile';
        this.ch4JafrDetached = true;
        this.ch4JafrDetachedPos.set(this.playerPos.x + 0.55, 3.8, this.playerPos.z - 0.6);
        this.sneh.root.visible = true;
        this.ch4SnehPos.set(CH4_EITA_ROOM_POS.x + 0.4, 5.1, -31.0);
        this.ch4SnehMode = 'roll';
        this.sound.playSnailMove();
      }
      if (st === 6) {
        this.ch4SnehMode = 'talk';
        this.sound.playSnailMove();
      }
      if (st === 10) {
        // Reattach Jafr to Nate & Sneh to Eita's shoulder!
        this.ch4JafrDetached = false;
        this.ch4SnehAttachedToEita = true;
        this.ch4SnehMode = 'idle';
        this.sound.playSnailMove();
      }
      if (st >= 12) {
        // Transition to Act 9 Golden Magic Awakening!
        this.ch4Flags.reunionDone = true;
        this.ch4Flags.act = 9;
        this.ch4CutscenePhase = 'magic_awaken';
        this.ch4CutsceneTimer = 0;
        this.ch4CutsceneStep = 0;
        this.ch4World.magicAwakenPillars.visible = true;
        this.sound.playMagicAwaken();
      }
    } else if (ph === 'outskirts_end' && st >= 4) {
      this.ch4CutsceneTimer = Math.max(this.ch4CutsceneTimer, 0);
    }
  }

  private updateCh4Cutscene(dt: number): void {
    this.ch4CutsceneTimer += dt;
    const t = this.ch4CutsceneTimer;
    const ph = this.ch4CutscenePhase;

    if (ph === 'portal') {
      if (t < 3.6) {
        this.fadeAlpha = Math.max(0, 1 - t * 1.4);
        this.whiteFadeAlpha = 0;
        this.camera.position.set(0, 2.2, 4.2 - t * 0.4);
        this.camera.lookAt(0, 1.8, -4.5);
      } else if (t < 11.2) {
        const fly = t - 3.6;
        this.whiteFadeAlpha = fly < 0.7 ? THREE.MathUtils.smoothstep(fly, 0, 0.7) : Math.max(0, 1 - (fly - 0.7));
        const zTunnel = -3 - fly * 4.5;
        this.nate.root.position.set(Math.sin(t * 2) * 0.4, 2.0 + Math.cos(t * 2.5) * 0.2, zTunnel);
        this.camera.position.set(Math.sin(t * 0.9) * 3.2, 2.6, zTunnel + 4.8);
        this.camera.lookAt(0, 2.1, zTunnel - 3);
      } else {
        // Transition to Desert Arrival drop
        this.setCh4SubZone('desert');
        this.ch4CutscenePhase = 'fall_intro';
        this.ch4CutsceneTimer = 0;
        this.ch4CutsceneStep = 0;
        this.whiteFadeAlpha = 1;
        this.playerPos.set(
          CH4_DESERT_SPAWN.x,
          getCh4DesertTerrainHeight(CH4_DESERT_SPAWN.x, CH4_DESERT_SPAWN.z) + 5.5,
          CH4_DESERT_SPAWN.z
        );
        this.playerYaw = Math.PI;
        this.camYaw = Math.PI;
      }
      return;
    }

    if (ph === 'fall_intro') {
      const groundY = getCh4DesertTerrainHeight(CH4_DESERT_SPAWN.x, CH4_DESERT_SPAWN.z);
      this.whiteFadeAlpha = Math.max(0, 1 - t * 1.4);
      const dropP = THREE.MathUtils.clamp(t / 1.1, 0, 1);
      this.playerPos.y = THREE.MathUtils.lerp(groundY + 5.5, groundY, dropP * dropP);
      this.nate.root.position.copy(this.playerPos);
      this.nate.root.rotation.y = this.playerYaw;
      animateNate(this.nate, dt, this.totalTime, {
        speed: 0,
        isRunning: false,
        isGrounded: dropP >= 1,
        isFlying: false,
        isSitting: false,
        hasBook: false,
        shocked: dropP < 1,
      });
      this.camera.position.set(this.playerPos.x + 2.8, groundY + 2.4, this.playerPos.z + 4.8);
      this.camera.lookAt(this.playerPos.x, groundY + 1.2, this.playerPos.z - 6);
      if (t >= 6.5) {
        this.ch4CutsceneStep = 1;
        this.applyCh4StepEnter();
      }
      return;
    }

    if (ph === 'wounded') {
      this.playerPos.set(CH4_WOUNDED_WARRIOR_POS.x - 1.5, getCh4DesertTerrainHeight(CH4_WOUNDED_WARRIOR_POS.x - 1.5, CH4_WOUNDED_WARRIOR_POS.z), CH4_WOUNDED_WARRIOR_POS.z);
      this.playerYaw = Math.PI / 2;
      this.nate.root.position.copy(this.playerPos);
      this.nate.root.rotation.y = this.playerYaw;
      animatePeliconWarrior(
        this.ch4WoundedWarrior,
        this.totalTime,
        this.ch4CutsceneStep >= 3 ? 'down' : 'wounded'
      );
      animateNate(this.nate, dt, this.totalTime, {
        speed: 0,
        isRunning: false,
        isGrounded: true,
        isFlying: false,
        isSitting: false,
        hasBook: false,
        shocked: this.ch4CutsceneStep >= 3,
      });
      this.camera.position.set(CH4_WOUNDED_WARRIOR_POS.x - 3.6, this.playerPos.y + 1.9, CH4_WOUNDED_WARRIOR_POS.z + 3.2);
      this.camera.lookAt(CH4_WOUNDED_WARRIOR_POS.x, this.playerPos.y + 0.9, CH4_WOUNDED_WARRIOR_POS.z);
      return;
    }

    if (ph === 'victory') {
      this.camera.position.set(0, 7.5, -62);
      this.camera.lookAt(0, 12, -104);
      if (t >= 7.5) {
        this.ch4CutsceneStep = 2;
        this.applyCh4StepEnter();
      }
      return;
    }

    if (ph === 'balcony') {
      this.eita.root.visible = true;
      this.ch4EitaPos.copy(CH4_BALCONY_EITA_POS);
      this.eita.root.position.copy(this.ch4EitaPos);
      this.eita.root.rotation.y = 0;
      animateEita(this.eita, this.totalTime, {
        expression: this.ch4CutsceneStep >= 2 ? 'smile' : 'gentle',
        wind: 1.0,
      });
      this.camera.position.set(0.8, 10.6, -88.2);
      this.camera.lookAt(CH4_BALCONY_EITA_POS.x, CH4_BALCONY_EITA_POS.y + 1.35, CH4_BALCONY_EITA_POS.z);
      return;
    }

    if (ph === 'reunion') {
      this.nate.root.position.copy(this.playerPos);
      this.nate.root.rotation.y = this.playerYaw;
      const isHugging = this.ch4CutsceneStep === 3 || this.ch4CutsceneStep === 4;
      const targetZ = isHugging ? -29.6 : -31.2;
      this.ch4EitaPos.z = THREE.MathUtils.lerp(this.ch4EitaPos.z, targetZ, Math.min(1, dt * 4));
      this.eita.root.position.copy(this.ch4EitaPos);
      this.eita.root.rotation.y = 0;

      if (this.ch4CutsceneStep === 5) {
        // Sneh rolls harmlessly into the bookshelf!
        const rollTarget = new THREE.Vector3(CH4_SHELF_POS.x - 0.35, 3.82, CH4_SHELF_POS.z);
        this.ch4SnehPos.lerp(rollTarget, Math.min(1, dt * 2.8));
      } else if (this.ch4CutsceneStep >= 6 && this.ch4CutsceneStep < 10) {
        const meetTarget = new THREE.Vector3(this.ch4JafrDetachedPos.x + 0.52, 3.82, this.ch4JafrDetachedPos.z);
        this.ch4SnehPos.lerp(meetTarget, Math.min(1, dt * 2.5));
        this.ch4SnehMode = this.ch4SnehPos.distanceTo(meetTarget) > 0.2 ? 'crawl' : 'talk';
      }

      animateNate(this.nate, dt, this.totalTime, {
        speed: 0,
        isRunning: false,
        isGrounded: true,
        isFlying: false,
        isSitting: false,
        hasBook: false,
        shocked: false,
        ch2Pose: isHugging ? 'hug' : 'normal',
      });
      animateEita(this.eita, this.totalTime, {
        talking: [1, 2, 3, 4, 8].includes(this.ch4CutsceneStep),
        expression: this.ch4EitaExpression,
        wind: 0.25,
      });

      if (this.ch4CutsceneStep === 7) {
        // Cutaway to two warriors chatting outside door!
        this.camera.position.set(0, 5.4, -17.5);
        this.camera.lookAt(0, 5.0, -21.8);
      } else if (this.ch4CutsceneStep === 5 || this.ch4CutsceneStep === 6 || this.ch4CutsceneStep === 9) {
        this.camera.position.set(1.2, 4.7, -27.2);
        this.camera.lookAt(this.ch4SnehPos.x, this.ch4SnehPos.y + 0.25, this.ch4SnehPos.z);
      } else if (this.ch4CutsceneStep === 11) {
        // Pan toward Sunset Window
        this.camera.position.set(0, 5.6, -29.5);
        this.camera.lookAt(0, 6.8, -37.5);
      } else {
        this.camera.position.set(2.4, 5.1, -27.2);
        this.camera.lookAt(0, 4.95, -30.1);
      }
      return;
    }

    if (ph === 'magic_awaken') {
      this.ch4Flags.powerAwakened = true;
      (this.ch4World.magicAwakenFloorRing.material as THREE.MeshBasicMaterial).opacity =
        0.85 * Math.sin(Math.min(1, t / 4.2) * Math.PI);
      this.nate.root.position.copy(this.playerPos);
      this.eita.root.position.copy(this.ch4EitaPos);
      animateNate(this.nate, dt, this.totalTime, {
        speed: 0,
        isRunning: false,
        isGrounded: true,
        isFlying: false,
        isSitting: false,
        hasBook: false,
        shocked: false,
        ch2Pose: 'magicAwaken',
      });
      animateEita(this.eita, this.totalTime, { expression: 'surprised', wind: 1.4 });
      this.camera.position.set(2.8, 5.4, -26.8);
      this.camera.lookAt(0, 4.9, -29.8);
      if (t >= 4.5) {
        this.ch4World.magicAwakenPillars.visible = false;
        (this.ch4World.magicAwakenFloorRing.material as THREE.MeshBasicMaterial).opacity = 0;
        this.ch4Flags.eitaCompanionActive = true;
        this.ch4Flags.act = 10;
        this.ch4CutscenePhase = 'none';
        this.ch4BannerTitle = 'OBJECTIVE: ESCAPE THE CASTLE';
        this.ch4BannerSubtitle = 'Lead Eita, Jafr & Sneh down the Grand Staircase to the Exit Door';
        this.ch4BannerTimer = 4.8;
        this.emitSave('ch4_scene_3_castle_interior', true, 0, true, true, false);
      }
      return;
    }

    if (ph === 'outskirts_end') {
      this.ch4Flags.outskirtsReached = true;
      this.eita.root.position.copy(this.ch4EitaPos);
      animateEita(this.eita, this.totalTime, {
        talking: this.ch4CutsceneStep === 0,
        expression: 'smile',
        wind: 0.75,
      });
      if (this.ch4CutsceneStep < 4 && t > 3.0) {
        this.ch4CutsceneStep++;
        this.ch4CutsceneTimer = 0;
      }
      if (this.ch4CutsceneStep >= 4) {
        // Camera lifts toward Agnes's Church silhouette & Glowing Twilight Symbol!
        const lift = THREE.MathUtils.clamp(t / 4.2, 0, 1);
        this.camera.position.set(
          CH4_OUTSKIRTS_POS.x + 8,
          THREE.MathUtils.lerp(4.2, 18.0, lift),
          CH4_OUTSKIRTS_POS.z + 6
        );
        this.camera.lookAt(CH4_AGNES_CHURCH_POS.x, 18, CH4_AGNES_CHURCH_POS.z);
        this.fadeAlpha = THREE.MathUtils.smoothstep(t, 3.8, 5.4);
        if (t >= 5.6) {
          this.ch4CutscenePhase = 'none';
          this.enterScene('ch4_complete');
        }
      } else {
        this.camera.position.set(CH4_OUTSKIRTS_POS.x + 5.2, 3.0, CH4_OUTSKIRTS_POS.z + 4.4);
        this.camera.lookAt(CH4_OUTSKIRTS_POS.x - 10, 2.2, CH4_OUTSKIRTS_POS.z - 4);
      }
    }
  }

  private updateCh4EntitiesAndCompanions(dt: number): void {
    const f = this.ch4Flags;

    // 1. Projectiles update
    for (let i = this.ch4Projectiles.length - 1; i >= 0; i--) {
      const p = this.ch4Projectiles[i];
      p.life -= dt;
      p.pos.addScaledVector(p.vel, dt);
      p.mesh.position.copy(p.pos);

      let hit = false;
      if (p.kind === 'enemy') {
        if (p.pos.distanceTo(new THREE.Vector3(this.playerPos.x, this.playerPos.y + 1.1, this.playerPos.z)) < 1.15) {
          if (this.ch4DodgeTimer > 0.08) {
            hit = true; // dodge invulnerability frames
          } else if (this.ch4IsBlocking) {
            this.ch4Health = Math.max(0, this.ch4Health - 2);
            this.sound.playSwordBlock();
            this.spawnCh4VfxRing(
              new THREE.Vector3(this.playerPos.x, this.playerPos.y + 1.15, this.playerPos.z),
              0xfbbf24,
              1.4,
              0.22
            );
            hit = true;
          } else {
            this.ch4Health = Math.max(0, this.ch4Health - 8);
            this.ch4SwordHitTimer = 0.25;
            hit = true;
          }
        }
      } else {
        for (const w of this.ch4Warriors) {
          if (w.dead || w.team !== 'enemy') continue;
          if (p.pos.distanceTo(new THREE.Vector3(w.pos.x, w.pos.y + 1.1, w.pos.z)) < 1.65) {
            hit = true;
            if (p.kind === 'arcane') {
              this.sound.playArcaneBurst();
              this.spawnCh4VfxRing(p.pos.clone(), 0xa855f7, 6.2, 0.45);
              for (const ao of this.ch4Warriors) {
                if (!ao.dead && ao.team === 'enemy' && ao.pos.distanceTo(p.pos) < 5.5) {
                  this.damageCh4Enemy(ao, 85);
                }
              }
            } else {
              this.sound.playSwordHit();
              this.spawnCh4VfxRing(p.pos.clone(), 0xf97316, 2.4, 0.28);
              this.damageCh4Enemy(w, 45);
            }
            break;
          }
        }
      }

      if (hit || p.life <= 0) {
        this.scene.remove(p.mesh);
        this.ch4Projectiles.splice(i, 1);
      }
    }

    // 2. VFX Rings
    for (let i = this.ch4VfxRings.length - 1; i >= 0; i--) {
      const r = this.ch4VfxRings[i];
      r.life -= dt;
      const pct = 1 - Math.max(0, r.life / r.maxLife);
      r.mesh.scale.setScalar(1 + pct * r.targetScale);
      (r.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - pct);
      if (r.life <= 0) {
        this.scene.remove(r.mesh);
        this.ch4VfxRings.splice(i, 1);
      }
    }

    // 3. Desert Warriors AI & Victory Cheering
    const inDesert = f.subZone === 'desert';
    for (const w of this.ch4Warriors) {
      if (!inDesert) {
        w.rig.root.visible = false;
        continue;
      }
      if (w.dead) {
        if (w.vanishTimer > 0) {
          w.vanishTimer -= dt;
          w.rig.root.scale.setScalar(Math.max(0.01, w.vanishTimer / 0.7));
          animatePeliconWarrior(w.rig, this.totalTime, 'vanish', w.phase);
          if (w.vanishTimer <= 0) w.rig.root.visible = false;
        } else {
          w.rig.root.visible = false;
        }
        continue;
      }

      w.rig.root.visible = true;
      w.rig.root.scale.setScalar(1);
      if (f.victoryAchieved && w.team === 'ally') {
        animatePeliconWarrior(w.rig, this.totalTime, 'cheer', w.phase);
        continue;
      }

      if (w.team === 'enemy' && this.ch4CutscenePhase === 'none' && f.swordCollected) {
        const distToNate = w.pos.distanceTo(this.playerPos);
        if (distToNate < 22) {
          w.yaw = Math.atan2(this.playerPos.x - w.pos.x, this.playerPos.z - w.pos.z);
          if (distToNate > 2.4) {
            const spd = 3.2;
            w.pos.x += Math.sin(w.yaw) * spd * dt;
            w.pos.z += Math.cos(w.yaw) * spd * dt;
            w.pos.y = getCh4DesertTerrainHeight(w.pos.x, w.pos.z);
            animatePeliconWarrior(w.rig, this.totalTime, 'walk', w.phase);
          } else {
            w.cooldown -= dt;
            if (w.cooldown <= 0) {
              w.cooldown = 1.6;
              if (this.ch4DodgeTimer <= 0.08) {
                if (this.ch4IsBlocking) {
                  this.ch4Health = Math.max(0, this.ch4Health - 1);
                  this.sound.playSwordBlock();
                  this.spawnCh4VfxRing(
                    new THREE.Vector3(this.playerPos.x, this.playerPos.y + 1.15, this.playerPos.z),
                    0xfbbf24,
                    1.5,
                    0.22
                  );
                } else {
                  this.ch4Health = Math.max(0, this.ch4Health - 6);
                  this.ch4SwordHitTimer = 0.25;
                  this.sound.playSwordHit();
                }
              }
              if (this.ch4Health <= 0) {
                this.ch4Health = 100;
                this.playerPos.set(0, getCh4DesertTerrainHeight(0, 96), 96);
                this.itemToast = 'RALLIED WITH PELICON WARRIORS · HEALTH RESTORED';
                this.itemToastTimer = 3.5;
              }
            }
            animatePeliconWarrior(w.rig, this.totalTime, 'attack', w.phase);
          }
        } else {
          animatePeliconWarrior(w.rig, this.totalTime, 'idle', w.phase);
        }
      } else {
        animatePeliconWarrior(w.rig, this.totalTime, w.team === 'ally' ? 'attack' : 'idle', w.phase);
      }

      w.rig.root.position.copy(w.pos);
      w.rig.root.rotation.y = w.yaw;
    }

    // 4. Companion Eita Follow AI + Sneh Shoulder Attachment
    if (f.eitaCompanionActive && this.ch4CutscenePhase === 'none') {
      this.eita.root.visible = true;
      const rightAngle = this.playerYaw + Math.PI * 0.72;
      const goalX = this.playerPos.x + Math.sin(rightAngle) * 1.45;
      const goalZ = this.playerPos.z + Math.cos(rightAngle) * 1.45;
      const goalY = getCh4WalkSurface(goalX, goalZ, f.subZone, f);

      const dx = goalX - this.ch4EitaPos.x;
      const dz = goalZ - this.ch4EitaPos.z;
      const d = Math.hypot(dx, dz);
      this.ch4EitaWalking = d > 0.25;
      if (this.ch4EitaWalking) {
        const move = Math.min(d, 7.6 * dt);
        this.ch4EitaPos.x += (dx / d) * move;
        this.ch4EitaPos.z += (dz / d) * move;
        this.ch4EitaYaw = Math.atan2(dx, dz);
        this.ch4EitaWalkPhase += move * 3.1;
      } else {
        this.ch4EitaYaw = this.playerYaw;
      }
      this.ch4EitaPos.y = THREE.MathUtils.lerp(this.ch4EitaPos.y, goalY, Math.min(1, dt * 10));
      this.eita.root.position.copy(this.ch4EitaPos);
      this.eita.root.rotation.y = this.ch4EitaYaw;
      animateEita(this.eita, this.totalTime, {
        walking: this.ch4EitaWalking,
        walkPhase: this.ch4EitaWalkPhase,
        expression: 'smile',
        wind: f.subZone === 'desert' ? 0.65 : 0.15,
      });
    }

    // Sneh positioning
    if (this.sneh.root.visible) {
      if (this.ch4SnehAttachedToEita) {
        this.eita.root.updateMatrixWorld(true);
        this.eita.shoulderAnchor.getWorldPosition(this.ch4SnehPos);
        this.sneh.root.position.copy(this.ch4SnehPos);
        this.sneh.root.rotation.y = this.ch4EitaYaw;
        this.sneh.root.scale.setScalar(0.55);
      } else {
        this.sneh.root.position.copy(this.ch4SnehPos);
        this.sneh.root.scale.setScalar(0.75);
      }
      animateSneh(this.sneh, this.totalTime, this.ch4SnehMode);
    }
  }

  private buildCh4Quests(): Ch3QuestEntry[] {
    const f = this.ch4Flags;
    const step = (done: boolean, active: boolean, id: number, title: string, detail?: string): Ch3QuestEntry => ({
      id,
      title,
      status: done ? 'completed' : active ? 'active' : 'locked',
      detail,
    });
    return [
      step(f.arrivalDone, !f.arrivalDone, 1, 'Survive the Arrival in Pelicon', 'Land safely in the Pelicon Desert.'),
      step(f.woundedWarriorDone, f.arrivalDone && !f.woundedWarriorDone, 2, 'Help the Wounded Warrior', 'Speak with the fallen guardian and take his sword.'),
      step(f.wallCleared, f.woundedWarriorDone && !f.wallCleared, 3, 'Clear the Desert Wall', 'Fight beside Pelicon warriors against the King’s forces.'),
      step(f.fireBowCollected, f.wallCleared && !f.fireBowCollected, 4, 'Find the Magical Fire Bow', 'Collect the ancient Fire Bow beyond the Desert Wall.'),
      step(f.victoryAchieved, f.fireBowCollected && !f.victoryAchieved, 5, "Defeat the King's Forces", 'Clear the Market & Castle Road with your Sword and Bows.'),
      step(f.castleEntered, f.victoryAchieved && !f.castleEntered, 6, 'Save the Princess', 'Meet Princess Eita on the balcony and enter Pelicon Castle.'),
      step(f.eitaRoomEntered, f.castleEntered && !f.eitaRoomEntered, 7, 'Meet Princess Eita', "Ascend the Grand Staircase to Eita's Bedroom."),
      step(f.reunionDone, f.eitaRoomEntered && !f.reunionDone, 8, "Discover Eita's Past", 'Recognize your childhood friend from Brook Village.'),
      step(f.powerAwakened, f.eitaRoomEntered && !f.powerAwakened, 9, 'Reunite Jafr & Sneh', 'Witness Jafr and Sneh reunite and awaken your hidden magic.'),
      step(f.castleEscaped, f.powerAwakened && !f.castleEscaped, 10, 'Escape the Castle', 'Lead Eita, Jafr & Sneh out through the Castle Exit.'),
      step(f.townCelebrated, f.castleEscaped && !f.townCelebrated, 11, 'Leave Pelicon Town', 'Walk through the cheering celebration in Pelicon Town.'),
      step(this.sceneId === 'ch4_complete', f.outskirtsReached && this.sceneId !== 'ch4_complete', 12, "Find Agnes's Church", 'Gaze toward the distant sunset church silhouette.'),
    ];
  }

  private updateScene5LibraryCinematic(): void {
    const t = this.sceneTimer;
    this.fadeAlpha = 1 - THREE.MathUtils.smoothstep(t, 0, 0.75);
    if (t < 4.5) {
      const p = t / 4.5;
      const angle = THREE.MathUtils.lerp(0.2, Math.PI * 1.1, p);
      const rad = THREE.MathUtils.lerp(28, 22, p);
      this.camera.position.set(
        Math.sin(angle) * rad,
        THREE.MathUtils.lerp(4, 24, p),
        Math.cos(angle) * rad
      );
      this.camera.lookAt(0, THREE.MathUtils.lerp(12, 22, p), -6);
    } else if (t < 9.2) {
      const p = THREE.MathUtils.smoothstep(t, 4.5, 9.2);
      this.camera.position.set(
        THREE.MathUtils.lerp(Math.sin(Math.PI * 1.1) * 22, 0, p),
        THREE.MathUtils.lerp(24, 3.2, p),
        THREE.MathUtils.lerp(Math.cos(Math.PI * 1.1) * 22, 33.4, p)
      );
      _camLookTarget.set(
        0,
        THREE.MathUtils.lerp(23, 1.5, p),
        THREE.MathUtils.lerp(-20, 26, p)
      );
      this.camera.lookAt(_camLookTarget);
    } else {
      this.enterScene('scene_6_flying_tutorial');
    }

    this.nate.root.position.copy(this.playerPos);
    this.nate.root.rotation.y = this.playerYaw;
    animateNate(this.nate, 0.016, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: true,
      isFlying: false,
      isSitting: false,
      hasBook: false,
      shocked: false,
    });
  }

  private updateScene9Finale(dt: number): void {
    const t = this.sceneTimer;

    // Gentle hover of flying chair + seated Nate
    const bob = Math.sin(this.totalTime * 1.8) * 0.16;
    this.nate.root.position.set(
      this.library.targetChairPos.x,
      this.library.targetChairPos.y + 0.35 + bob,
      this.library.targetChairPos.z
    );
    this.nate.root.rotation.y = this.playerYaw;

    // Book pages shake & flutter violently after t = 6.2s
    if (t > 6.2) {
      this.shocked = true;
      const intensity = Math.min(1, (t - 6.2) / 4.0);
      this.nate.heldBook.position.y = 1.05 + Math.sin(t * 28) * 0.03 * intensity;
      this.nate.heldBookLeftPage.rotation.y = 0.45 + Math.sin(t * 22) * 0.42 * intensity;
      this.nate.heldBookRightPage.rotation.y = -0.45 - Math.cos(t * 22) * 0.42 * intensity;

      // Balanced library light flicker & crisp capped finale bloom
      this.library.libraryLights.forEach((lt, idx) => {
        lt.intensity = (idx === 2 ? 64 : 44) * (0.55 + Math.abs(Math.sin(t * (14 + idx * 5))) * 0.55);
      });
      if (this.bloomPass) {
        this.bloomPass.strength = 0.06 + intensity * 0.08;
      }

      // Portal swirl around Nate
      this.portalGroup.visible = true;
      this.portalGroup.position.set(
        this.nate.root.position.x - Math.sin(this.playerYaw) * -0.4,
        this.nate.root.position.y + 1.15,
        this.nate.root.position.z - Math.cos(this.playerYaw) * -0.4
      );
      this.portalRings.forEach((ring, i) => {
        ring.rotation.z += dt * (2.5 + i * 0.9) * (i % 2 === 0 ? 1 : -1);
        ring.rotation.x = Math.sin(t * 2 + i) * 0.35;
        const sc = 0.4 + intensity * (0.8 + i * 0.15);
        ring.scale.setScalar(sc);
      });
    }

    // Pull Nate into the book after t = 12.2s
    if (t > 12.2) {
      const pullP = THREE.MathUtils.smoothstep(t, 12.2, 15.6);
      this.portalGlowAlpha = THREE.MathUtils.smoothstep(t, 12.6, 15.0);
      this.fadeAlpha = THREE.MathUtils.smoothstep(t, 14.5, 16.0);
      this.nate.root.position.y += pullP * 2.2;
      this.nate.root.scale.setScalar(Math.max(0.05, 1 - pullP * 0.85));
    } else {
      this.nate.root.scale.setScalar(1);
    }

    // Cinematic camera push-in
    const camDist = t < 9.5 ? THREE.MathUtils.lerp(4.4, 2.7, t / 9.5) : THREE.MathUtils.lerp(2.7, 1.35, (t - 9.5) / 6.0);
    const angle = this.playerYaw + 0.35 + Math.sin(t * 0.4) * 0.12;
    this.camera.position.set(
      this.nate.root.position.x + Math.sin(angle) * camDist,
      this.nate.root.position.y + 1.55 - Math.min(0.4, t * 0.03),
      this.nate.root.position.z + Math.cos(angle) * camDist
    );
    this.camera.lookAt(
      this.nate.root.position.x,
      this.nate.root.position.y + 1.18,
      this.nate.root.position.z
    );

    animateNate(this.nate, dt, this.totalTime, {
      speed: 0,
      isRunning: false,
      isGrounded: false,
      isFlying: false,
      isSitting: true,
      hasBook: true,
      shocked: this.shocked,
    });

    if (t >= 16.2) {
      this.nate.root.scale.setScalar(1);
      this.enterScene('chapter_complete');
    }
  }

  private updateJafr(dt: number): void {
    const isShoulderRealm =
      this.ch2World.group.visible || this.ch3World.group.visible || this.ch4World.group.visible;
    const isTalking =
      (this.ch2Dialogue !== null && (this.ch2Dialogue.speaker === 'Jafr' || this.ch2Dialogue.speaker === 'Lumi')) ||
      (this.sceneId === 'ch2_scene_2_jafr_reveal' && this.jafrRevealStep !== 2) ||
      this.portalDiscoveryActive ||
      (this.portalFinaleActive && this.portalFinaleStep < 2);

    if (isShoulderRealm) {
      this.nate.root.updateMatrixWorld(true);
      if (this.ch4JafrDetached && this.ch4World.group.visible) {
        this.jafr.root.visible = true;
        this.jafrPos.lerp(this.ch4JafrDetachedPos, 1 - Math.exp(-6 * dt));
        this.jafrYaw = 0.35;
      } else if (this.sceneId === 'ch2_scene_1_seashore') {
        this.jafr.root.visible = this.sceneTimer > 14.6;
        this.nate.pocketGroup.getWorldPosition(_vecA);
        this.jafrPos.copy(_vecA).add(new THREE.Vector3(0.08, 0.1, 0.12));
        this.jafrYaw = this.playerYaw;
      } else if (this.sceneId === 'ch2_scene_2_jafr_reveal') {
        this.jafr.root.visible = true;
        this.nate.pocketGroup.getWorldPosition(_vecA);
        this.nate.shoulderAnchor.getWorldPosition(_vecB);
        if (this.jafrRevealStep === 0) {
          this.jafrPos.lerp(_vecA.add(new THREE.Vector3(0.28, 0.2, 0.2)), 1 - Math.exp(-6 * dt));
        } else {
          this.jafrPos.lerp(_vecB, 1 - Math.exp(-5 * dt));
        }
        this.jafrYaw = this.playerYaw;
      } else if (this.isSleeping || this.isResting) {
        this.jafr.root.visible = true;
        const target = new THREE.Vector3(CH2_BED_POS.x - 0.72, CH2_BED_POS.y + 0.72, CH2_BED_POS.z - 0.85);
        this.jafrPos.lerp(target, 1 - Math.exp(-5 * dt));
        this.jafrYaw = Math.PI * 0.25;
      } else {
        this.jafr.root.visible = !this.portalFinaleActive || this.portalFinaleTimer < 10.2;
        // Clings closely onto Nate's right shoulder when entering the portal or exploring
        this.nate.shoulderAnchor.getWorldPosition(_vecB);
        this.jafrPos.copy(_vecB);
        if (this.portalFinaleActive && this.portalFinaleStep >= 2) {
          this.jafrPos.x -= Math.sin(this.playerYaw) * 0.04;
          this.jafrPos.z -= Math.cos(this.playerYaw) * 0.04;
        }
        const nearOcean = this.ch2World.group.visible && !this.ch2Flags.insideHouse && this.playerPos.z > 4;
        this.jafrYaw = this.portalDiscoveryActive
          ? Math.atan2(CH2_PORTAL_POS.x - this.playerPos.x, CH2_PORTAL_POS.z - this.playerPos.z)
          : nearOcean
          ? Math.sin(this.totalTime * 1.1) * 0.25
          : this.playerYaw + Math.sin(this.totalTime * 1.4) * 0.18;
      }

      this.jafr.root.position.copy(this.jafrPos);
      this.jafr.root.rotation.y = this.jafrYaw;
      this.jafr.root.scale.setScalar(
        this.sceneId === 'ch2_scene_1_seashore' || (this.sceneId === 'ch2_scene_2_jafr_reveal' && this.jafrRevealStep === 0)
          ? 0.55
          : 0.68
      );
      this.jafr.bubble.visible = false;
      this.jafr.contactShadow.visible = this.isSleeping || this.isResting;
      animateJafrExpression(this.jafr, this.totalTime, {
        isTalking,
        isSleeping: this.isSleeping,
        mood: isTalking ? 'talking' : this.jafrMood,
      });
      return;
    }

    // Chapter 1 Jafr behavior
    this.jafr.root.visible = true;
    this.jafr.root.scale.setScalar(1);
    const rightAngle = this.playerYaw + Math.PI * 0.68;
    let targetX = this.playerPos.x + Math.sin(rightAngle) * 1.15;
    let targetZ = this.playerPos.z + Math.cos(rightAngle) * 1.15;
    let targetY = this.playerPos.y;

    if (this.sceneId === 'scene_2_mission') {
      targetX = 1.25;
      targetZ = 6.4;
      targetY = 0.18;
    } else if (this.isSitting) {
      targetX = this.nate.root.position.x + 0.85;
      targetZ = this.nate.root.position.z + 0.35;
      targetY = this.nate.root.position.y + 0.55;
    } else if (this.isFlying) {
      targetY = this.playerPos.y + 0.85 + Math.sin(this.totalTime * 3.5) * 0.15;
    } else if (this.village.group.visible) {
      targetY = getWalkSurfaceHeight(targetX, targetZ).y;
    }

    const followRate = 1 - Math.exp(-5.5 * dt);
    this.jafrPos.x = THREE.MathUtils.lerp(this.jafrPos.x, targetX, followRate);
    this.jafrPos.y = THREE.MathUtils.lerp(this.jafrPos.y, targetY, followRate);
    this.jafrPos.z = THREE.MathUtils.lerp(this.jafrPos.z, targetZ, followRate);

    const dx = targetX - this.jafrPos.x;
    const dz = targetZ - this.jafrPos.z;
    const moveDist = Math.hypot(dx, dz);
    if (moveDist > 0.04) {
      this.jafrYaw = Math.atan2(dx, dz);
    } else {
      this.jafrYaw = this.playerYaw;
    }

    this.jafr.root.position.copy(this.jafrPos);
    this.jafr.root.rotation.y = this.jafrYaw;
    this.jafr.bubble.visible = this.isFlying || this.isSitting;
    this.jafr.contactShadow.visible = !this.isFlying && !this.isSitting;
    animateJafrExpression(this.jafr, this.totalTime, {
      isTalking: false,
      isSleeping: false,
      mood: 'curious',
    });
  }

  private updateDirectionalShadowFollow(): void {
    const px = Math.round(this.playerPos.x);
    const py = Math.round(this.playerPos.y);
    const pz = Math.round(this.playerPos.z);
    this.sunLight.position.set(px + 28, py + 48, pz + 20);
    this.sunLight.target.position.set(px, py, pz);
    this.sunLight.target.updateMatrixWorld();
  }

  private computeObservationMarkers(): ObservationMarker[] {
    if (!this.observationMode) return [];
    if (this.ch2World.group.visible && this.ch2Flags.insideHouse) return [];
    if (this.ch3World.group.visible && (this.ch3Flags.subZone === 'house_interior' || this.ch3Flags.subZone === 'tunnel')) {
      return [];
    }

    const markers: ObservationMarker[] = [];
    this.camera.updateMatrixWorld();

    if (this.ch3World.group.visible) {
      for (const oa of this.ch3World.observationAnchors) {
        if (oa.subZone !== this.ch3Flags.subZone) continue;
        _projVec.copy(oa.anchor).project(this.camera);
        if (_projVec.z > 1) continue;
        const sx = _projVec.x * 0.5 + 0.5;
        const sy = -_projVec.y * 0.5 + 0.5;
        if (sx < 0.05 || sx > 0.95 || sy < 0.08 || sy > 0.88) continue;
        markers.push({
          id: oa.id,
          label: oa.label,
          x: sx,
          y: sy,
          distance: Math.round(this.playerPos.distanceTo(oa.anchor)),
        });
      }
      return markers;
    }

    if (this.ch4World.group.visible) {
      const list =
        this.ch4Flags.subZone === 'castle_interior'
          ? this.ch4World.observationAnchors.castle_interior
          : this.ch4World.observationAnchors.desert;
      for (const oa of list) {
        _projVec.copy(oa.position).project(this.camera);
        if (_projVec.z > 1) continue;
        const sx = _projVec.x * 0.5 + 0.5;
        const sy = -_projVec.y * 0.5 + 0.5;
        if (sx < 0.05 || sx > 0.95 || sy < 0.08 || sy > 0.88) continue;
        markers.push({
          id: oa.id,
          label: oa.label,
          x: sx,
          y: sy,
          distance: Math.round(this.playerPos.distanceTo(oa.position)),
        });
      }
      return markers;
    }

    for (const hr of this.ch2World.highlightRings) {
      if (hr.id === 'portal' && !this.ch2Flags.portalDiscovered) continue;
      _projVec.copy(hr.anchor).project(this.camera);
      if (_projVec.z > 1) continue; // behind camera
      const sx = _projVec.x * 0.5 + 0.5;
      const sy = -_projVec.y * 0.5 + 0.5;
      if (sx < 0.05 || sx > 0.95 || sy < 0.08 || sy > 0.88) continue;
      markers.push({
        id: hr.id,
        label: hr.label,
        x: sx,
        y: sy,
        distance: Math.round(this.playerPos.distanceTo(hr.anchor)),
      });
    }
    return markers;
  }

  private buildCh3Quests(): Ch3QuestEntry[] {
    const f = this.ch3Flags;
    const step = (done: boolean, active: boolean, id: number, title: string, detail?: string): Ch3QuestEntry => ({
      id,
      title,
      status: done ? 'completed' : active ? 'active' : 'locked',
      detail,
    });
    return [
      step(f.doorOpenedOnce, f.portalSequenceDone && !f.doorOpenedOnce, 1, 'Investigate the Knocking Sound', 'Rest inside the house, wake to knocking, and open the door.'),
      step(f.letterRead, f.doorOpenedOnce && !f.letterRead, 2, 'Discover the Secret of the Letter', 'Collect and read the Black Envelope on the porch.'),
      step(f.whisperHeard, f.letterRead && !f.whisperHeard, 3, 'Follow the Mysterious Footprints', `Trace glowing footprints into the woods (Optional Clues: ${f.collectedOptionalIds.length}/4).`),
      step(f.lumiMet, f.whisperHeard && !f.lumiMet, 4, 'Find Lumi in the Whispering Woods', 'Cross the wooden plank bridge and speak with Lumi.'),
      step(f.stonesSolved, f.lumiMet && !f.stonesSolved, 5, 'Align the Three Memory Stones', `Fragments: ${f.collectedFragments.length}/3 · Align Sun, Moon, Star at the stone dais.`),
      step(f.statueMemoryViewed, f.stonesSolved && !f.statueMemoryViewed, 6, 'Investigate the Forgotten City', 'Descend into Elarion and touch the Broken Wizard Statue.'),
      step(f.orvellanMet, f.statueMemoryViewed && !f.orvellanMet, 7, 'Meet Orvellan in the Library', 'Enter the Ancient Library of Elarion and speak with the Last Keeper.'),
      step(f.readerNamesRevealed, f.orvellanMet && !f.readerNamesRevealed, 8, 'Uncover the Archive of Readers', 'Open the Giant Golden Book in the Archive chamber.'),
      step(f.northernGateOpened, f.escapeActive && !f.northernGateOpened, 9, 'Escape Elarion Before the 7th Bell', `Switches: ${f.escapeSwitchIds.length}/2 · Unlock the Northern Gate.`),
      step(this.sceneId === 'ch3_complete', f.northernGateOpened && this.sceneId !== 'ch3_complete', 10, 'The Valley of Silent Bells', 'Step out into the valley toward the Tower of Books.'),
    ];
  }

  private buildHudState(): HudState {
    const isCh2 = this.isChapter2Scene();
    const isCh3 = this.isChapter3Scene();
    const isCh4 = this.isChapter4Scene();
    const chapterNum: ChapterNumber = isCh4 ? 4 : isCh3 ? 3 : isCh2 ? 2 : 1;
    let questTitle = '';
    let questSubtitle = '';
    let distanceMeters: number | null = null;
    let altitudeMeters: number | null = null;
    let interactionPrompt: string | null = null;
    let interactionKey: HudState['interactionKey'] = null;
    let bannerTitle: string | null = null;
    let bannerSubtitle: string | null = null;
    let dialogue: DialogueLine | null = this.ch2Dialogue;
    let dialogueCanAdvance = false;

    if (this.sceneId === 'scene_1_intro') {
      if (this.sceneTimer < 3.6) {
        bannerTitle = 'THE ENCHANTABLE ISLAND';
        bannerSubtitle = 'Chapter 1 · Finding W Book';
      } else if (this.sceneTimer < 7.4) {
        bannerTitle = 'BROOK VILLAGE';
        bannerSubtitle = 'Home of Nateleon Kennedy';
      }
    } else if (this.sceneId === 'scene_2_mission') {
      dialogue = MISSION_DIALOGUE[this.dialogueIdx];
      dialogueCanAdvance = true;
    } else if (this.sceneId === 'scene_3_journey') {
      questTitle = 'QUEST: FIND THE ENCH LIBRARY';
      questSubtitle = 'Follow the cobblestone valley path';
      const info = getNearestPathInfo(this.playerPos.x, this.playerPos.z);
      distanceMeters = Math.max(0, Math.round(info.distanceRemaining));
    } else if (this.sceneId === 'scene_4_entrance') {
      questTitle = 'QUEST: ENTER THE ENCH LIBRARY';
      questSubtitle = 'Approach the grand entrance';
      distanceMeters = 0;
      if (this.sceneTimer < 3.8) {
        bannerTitle = 'ENCH LIBRARY DISCOVERED';
        bannerSubtitle = 'Checkpoint Saved';
      }
      if (!this.doorOpening && this.playerPos.distanceTo(LIBRARY_PLAZA_POS) < 14) {
        interactionPrompt = 'PRESS ENTER TO ENTER THE LIBRARY';
        interactionKey = 'ENTER';
      }
    } else if (this.sceneId === 'scene_5_library_cinematic') {
      if (this.sceneTimer > 4.6) {
        bannerTitle = "YOUR SENSEI'S BOOK IS WAITING.";
        bannerSubtitle = 'Upper Sanctum Platform';
      }
    } else if (this.sceneId === 'scene_6_flying_tutorial') {
      questTitle = "QUEST: FIND YOUR SENSEI'S BOOK";
      questSubtitle = 'Press I to take flight inside the library';
      altitudeMeters = Math.max(0, Math.round(this.playerPos.y));
      distanceMeters = Math.round(this.playerPos.distanceTo(this.library.targetBookPos));
    } else if (this.sceneId === 'scene_7_find_book') {
      questTitle = "QUEST: FIND YOUR SENSEI'S BOOK";
      questSubtitle = 'Ascend to the golden beacon above the rotunda';
      altitudeMeters = Math.max(0, Math.round(this.playerPos.y));
      const exactBookDist = this.playerPos.distanceTo(this.library.targetBookPos);
      distanceMeters = Math.round(exactBookDist);
      if (exactBookDist < 4.8) {
        interactionPrompt = 'PRESS E TO COLLECT THE BOOK';
        interactionKey = 'E';
      }
    } else if (this.sceneId === 'scene_8_flying_chair') {
      questTitle = 'QUEST: FIND A PLACE TO READ.';
      questSubtitle = 'Fly or walk to the glowing chair nearby';
      altitudeMeters = Math.max(0, Math.round(this.playerPos.y));
      const exactChairDist = this.playerPos.distanceTo(this.library.targetChairPos);
      distanceMeters = Math.round(exactChairDist);
      if (exactChairDist < 4.8) {
        interactionPrompt = 'PRESS ENTER TO SIT.';
        interactionKey = 'ENTER';
      }
    } else if (this.sceneId === 'scene_9_finale') {
      const t = this.sceneTimer;
      if (t < 3.2) {
        dialogue = {
          speaker: 'Nate',
          portrait: 'nate',
          emotion: 'curious',
          text: "Wait... this doesn't look like the book Sensei described.",
        };
      } else if (t < 6.4) {
        dialogue = {
          speaker: 'Nate',
          portrait: 'nate',
          emotion: 'surprised',
          text: 'I think... I picked up the wrong book!',
        };
      } else if (t >= 9.2 && t < 12.6) {
        dialogue = {
          speaker: 'Nate',
          portrait: 'nate',
          emotion: 'surprised',
          text: "What's happening?!",
        };
      }
    } else if (this.sceneId === 'ch2_scene_1_seashore') {
      if (this.sceneTimer > 2.4 && this.sceneTimer < 6.2) {
        bannerTitle = 'CHAPTER 2 · THE UNKNOWN WORLD';
        bannerSubtitle = 'Inside THE BOOK';
      } else if (this.sceneTimer >= 15.2) {
        dialogue = {
          speaker: 'Nate',
          portrait: 'nate',
          emotion: 'surprised',
          text: 'Ahh! Where am I?',
          note: 'Seawater touches his chin as he looks across the unfamiliar coastline.',
        };
      }
    } else if (this.sceneId === 'ch2_scene_2_jafr_reveal') {
      dialogueCanAdvance = true;
      const lines: DialogueLine[] = [
        {
          speaker: 'Jafr',
          portrait: 'jafr',
          emotion: 'happy',
          text: "I'm in your US Pocket! I came into the book with you, and now I'm in this world too! Okay, let's go!",
          note: 'The Universal Snail Pocket flap opens and Jafr peeks out.',
        },
        {
          speaker: 'Jafr',
          portrait: 'jafr',
          emotion: 'happy',
          text: 'Hold tight—climbing up to your shoulder!',
          note: 'Jafr crawls up and settles onto Nate’s right shoulder.',
        },
        {
          speaker: 'Nate',
          portrait: 'nate',
          emotion: 'curious',
          text: 'Okay... where should I go now?',
          note: 'Nate turns to Jafr and gestures—unable to make his words reach him.',
        },
        {
          speaker: 'Jafr',
          portrait: 'jafr',
          emotion: 'surprised',
          text: "Ahh! You can't speak, buddy!",
          note: 'Jafr tilts his eyestalks knowingly.',
        },
        {
          speaker: 'Jafr',
          portrait: 'jafr',
          emotion: 'calm',
          text: "Don't worry. We'll figure this out together.",
          note: 'Nate nods with a confused, determined hand gesture.',
        },
      ];
      dialogue = lines[this.jafrRevealStep] ?? lines[0];
    } else if (isCh2) {
      if (this.portalDiscoveryActive) {
        dialogueCanAdvance = true;
        dialogue = PORTAL_DISCOVERY_DIALOGUE[this.portalDiscoveryStep] ?? PORTAL_DISCOVERY_DIALOGUE[0];
      } else if (this.portalFinaleActive && this.portalFinaleStep < 2) {
        dialogueCanAdvance = true;
        dialogue =
          this.portalFinaleStep === 0
            ? {
                speaker: 'Jafr',
                portrait: 'jafr',
                emotion: 'happy',
                text: 'Well, Nate... ready for another adventure?',
                note: 'Nate nods confidently toward the ancient portal.',
              }
            : {
                speaker: 'Jafr',
                portrait: 'jafr',
                emotion: 'happy',
                text: "Okay! Let's find out where this thing takes us!",
              };
      } else if (!this.ch2Flags.insideHouse) {
        if (this.ch2Flags.portalDiscovered && !this.ch2Flags.portalInvestigated) {
          questTitle = 'QUEST: INVESTIGATE THE MYSTERIOUS PORTAL';
          questSubtitle = 'Climb the stone steps on the right rocky platform';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH2_PORTAL_POS));
        } else if (this.ch2Flags.portalInvestigated) {
          const ready =
            this.ch2Flags.itemsCollected && (this.ch2Flags.sleptOnce || this.ch2Flags.firstCheckpointSaved);
          questTitle = ready ? 'QUEST: ENTER THE ANCIENT GATEWAY' : 'QUEST: REST AT HOUSE BED FIRST';
          questSubtitle = ready
            ? 'Approach the glowing stone portal beside the mountain house'
            : 'Return inside the Mountain House and rest or sleep on the bed';
          distanceMeters = Math.round(this.playerPos.distanceTo(ready ? CH2_PORTAL_POS : CH2_DOOR_POS));
        } else if (!this.ch2Flags.houseDiscovered) {
          questTitle = 'QUEST: REACH THE MOUNTAIN HOUSE';
          questSubtitle = 'Follow the winding coastal path, wooden bridges & stone steps up the mountain';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH2_DOOR_POS));
        } else {
          questTitle = 'QUEST: REACH THE MOUNTAIN HOUSE';
          questSubtitle = 'Step onto the wooden porch and enter the Mountain House';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH2_DOOR_POS));
        }

        if (this.discoveryTimer > 0) {
          bannerTitle = 'SHELTER DISCOVERED';
          bannerSubtitle = 'Mountain House & Outside Tent';
        }
        if (
          !this.portalDiscoveryActive &&
          !this.portalInvestigateActive &&
          !this.portalFinaleActive &&
          this.playerPos.distanceTo(CH2_PORTAL_POS) < 5.5
        ) {
          if (this.ch2Flags.portalDiscovered && !this.ch2Flags.portalInvestigated) {
            interactionPrompt = 'PRESS E TO INVESTIGATE';
            interactionKey = 'E';
          } else if (this.ch2Flags.portalInvestigated) {
            interactionPrompt = 'PRESS E TO ENTER THE PORTAL';
            interactionKey = 'E';
          } else if (this.ch2Flags.itemsCollected) {
            interactionPrompt = 'PRESS E TO INSPECT';
            interactionKey = 'E';
          }
        } else if (!this.ch2DoorOpening && this.playerPos.distanceTo(CH2_DOOR_POS) < 4.4) {
          interactionPrompt = 'PRESS ENTER TO ENTER';
          interactionKey = 'ENTER';
        }
      } else {
        if (!this.ch2Flags.itemsCollected) {
          questTitle = 'QUEST: SEARCH THE HOUSE FOR SUPPLIES';
          questSubtitle = 'Check the wooden supply box in storage';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH2_BOX_POS));
        } else if (!this.ch2Flags.sleptOnce && !this.ch2Flags.firstCheckpointSaved) {
          questTitle = 'QUEST: REST OR SLEEP UNTIL MORNING';
          questSubtitle = 'Approach the old wooden bed on the right side';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH2_BED_POS));
        } else {
          questTitle = 'QUEST: STEP OUTSIDE THE HOUSE';
          questSubtitle = 'Walk to the front doorway and press Enter to go outside';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH2_INTERIOR_SPAWN));
        }

        if (!this.boxOpening && !this.ch2Flags.itemsCollected && this.playerPos.distanceTo(CH2_BOX_POS) < 3.2) {
          interactionPrompt = 'PRESS E TO OPEN';
          interactionKey = 'E';
        } else if (
          !this.restModalOpen &&
          !this.isResting &&
          !this.isSleeping &&
          !this.boxOpening &&
          this.playerPos.distanceTo(CH2_BED_POS) < 3.5
        ) {
          interactionPrompt = 'PRESS F TO REST OR SLEEP';
          interactionKey = 'F';
        } else if (this.playerPos.z > -103.8 && Math.abs(this.playerPos.x) < 1.8) {
          interactionPrompt = 'PRESS ENTER TO STEP OUTSIDE';
          interactionKey = 'ENTER';
        }
      }

      if (this.checkpointBannerTimer > 0) {
        bannerTitle = 'CHECKPOINT REACHED';
        bannerSubtitle = 'GAME SAVED';
      }
    } else if (isCh3) {
      const f = this.ch3Flags;
      if (this.ch3BannerTimer > 0 && this.ch3BannerTitle) {
        bannerTitle = this.ch3BannerTitle;
        bannerSubtitle = this.ch3BannerSubtitle;
      }

      if (this.ch3PortalTunnelActive) {
        if (this.ch3PortalTunnelTimer >= 8.2) {
          dialogue = CH3_ARRIVAL_LINES[this.ch3ArrivalLineStep] ?? CH3_ARRIVAL_LINES[0];
          dialogueCanAdvance = true;
        }
      } else if (this.ch3OrvellanMenuActive && this.ch3OrvellanChoiceDialogue) {
        const choices: DialogueChoice[] = [];
        if (!f.orvellanAskedTopics.includes('ask_book')) {
          choices.push({ id: 'ask_book', label: 'Ask about THE BOOK' });
        }
        if (!f.orvellanAskedTopics.includes('ask_elarion')) {
          choices.push({ id: 'ask_elarion', label: 'Ask about Elarion' });
        }
        if (!f.orvellanAskedTopics.includes('ask_final_page')) {
          choices.push({ id: 'ask_final_page', label: 'Ask about The Final Page' });
        }
        choices.push({ id: 'proceed_archive', label: 'Enter the Archive of Readers' });
        dialogue = { ...this.ch3OrvellanChoiceDialogue, choices };
      }

      // Dynamic Quest Title, Subtitle & Proximity Prompts across all 10 Acts
      if (f.subZone === 'house_interior') {
        if (!f.sleptInHouse) {
          questTitle = 'ACT 1 · THE MORNING THAT SHOULD NOT EXIST';
          questSubtitle = 'Rest on the bed inside the unfamiliar house';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH3_INTERIOR_BED_POS));
          if (distanceMeters < 4) {
            interactionPrompt = 'PRESS F TO REST ON BED';
            interactionKey = 'F';
          }
        } else {
          questTitle = 'QUEST: INVESTIGATE THE KNOCKING SOUND';
          questSubtitle = 'Open the front door to see who knocked';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH3_INTERIOR_DOOR_POS));
          if (distanceMeters < 4) {
            interactionPrompt = 'PRESS ENTER TO OPEN DOOR';
            interactionKey = 'ENTER';
          }
        }
      } else if (f.subZone === 'surface') {
        if (!f.sleptInHouse) {
          questTitle = 'ACT 1 · AN UNFAMILIAR CLEARING';
          questSubtitle = 'Enter the wooden house ahead to rest before exploring';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH3_EXTERIOR_DOOR_POS));
        } else if (!f.letterRead) {
          questTitle = 'QUEST: DISCOVER THE SECRET OF THE LETTER';
          questSubtitle = 'Pick up the Black Envelope with the Golden Symbol on the porch';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH3_LETTER_POS));
        } else if (!f.whisperHeard) {
          questTitle = 'QUEST: FOLLOW THE MYSTERIOUS FOOTPRINTS';
          questSubtitle = `Follow glowing footprints north (Press V to Observe · Clues ${f.collectedOptionalIds.length}/4)`;
          distanceMeters = Math.round(Math.max(0, this.playerPos.z + 4));
        } else if (!f.lumiMet) {
          questTitle = 'QUEST: FOLLOW THE WHISPERS';
          questSubtitle = 'Read the wooden sign & speak with Lumi beyond the plank bridge';
          distanceMeters = Math.round(this.playerPos.distanceTo(this.ch3World.lumiRig.root.position));
        } else if (!f.stonesSolved) {
          questTitle = `QUEST: FIND THE FORGOTTEN HOUSE (${f.collectedFragments.length}/3 FRAGMENTS)`;
          questSubtitle = 'Gather Sun, Moon & Star fragments from ruins, then align the Three Memory Stones';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH3_STONES_PLATFORM_POS));
        } else {
          questTitle = 'QUEST: DESCEND INTO ELARION';
          questSubtitle = 'Step down the hidden staircase in the center of the stone platform';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH3_STAIR_DESCENT_POS));
        }

        // Surface interaction prompts
        if (!f.letterCollected && this.playerPos.distanceTo(CH3_LETTER_POS) < 3.4) {
          interactionPrompt = 'PRESS E TO COLLECT THE LETTER';
          interactionKey = 'E';
        } else if (this.playerPos.distanceTo(CH3_EXTERIOR_DOOR_POS) < 4.0) {
          interactionPrompt = 'PRESS ENTER TO ENTER HOUSE';
          interactionKey = 'ENTER';
        } else if (this.ch3World.collectibles.some((c) => !c.collected && this.playerPos.distanceTo(c.position) < 3.2)) {
          const near = this.ch3World.collectibles.find((c) => !c.collected && this.playerPos.distanceTo(c.position) < 3.2)!;
          interactionPrompt = `PRESS E TO COLLECT ${near.name.toUpperCase()}`;
          interactionKey = 'E';
        } else if (this.playerPos.distanceTo(CH3_SIGN_POS) < 3.8) {
          interactionPrompt = 'PRESS E TO READ WOODEN SIGN';
          interactionKey = 'E';
        } else if (this.playerPos.distanceTo(this.ch3World.lumiRig.root.position) < 4.5) {
          interactionPrompt = 'PRESS E TO SPEAK WITH LUMI';
          interactionKey = 'E';
        } else if (this.ch3World.fragments.some((fr) => !fr.collected && this.playerPos.distanceTo(fr.position) < 3.4)) {
          const nearF = this.ch3World.fragments.find((fr) => !fr.collected && this.playerPos.distanceTo(fr.position) < 3.4)!;
          interactionPrompt = `PRESS E TO COLLECT ${nearF.title.toUpperCase()}`;
          interactionKey = 'E';
        } else if (f.stonesSolved && this.playerPos.distanceTo(CH3_STAIR_DESCENT_POS) < 4.4) {
          interactionPrompt = 'PRESS E TO DESCEND HIDDEN STAIRCASE';
          interactionKey = 'E';
        } else if (!f.stonesSolved && this.playerPos.distanceTo(CH3_STONES_PLATFORM_POS) < 9.5) {
          interactionPrompt = 'PRESS E TO ALIGN THREE MEMORY STONES';
          interactionKey = 'E';
        }
      } else if (f.subZone === 'elarion') {
        if (!f.statueMemoryViewed) {
          questTitle = 'QUEST: INVESTIGATE THE FORGOTTEN CITY';
          questSubtitle = 'Touch the Broken Wizard Statue (or use Memory Crystal in Bag)';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH3_STATUE_POS));
        } else if (!f.orvellanConfronted && !f.escapeActive) {
          questTitle = 'QUEST: THE STRANGER IN THE LIBRARY';
          questSubtitle = 'Speak with Orvellan inside the Ancient Library of Elarion';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH3_ORVELLAN_POS));
        } else if (f.escapeActive) {
          questTitle = 'QUEST: ESCAPE ELARION BEFORE THE SEVENTH BELL';
          questSubtitle = `Disable rune barriers (${f.escapeSwitchIds.length}/2 switches) and unlock the Northern Gate!`;
          distanceMeters = Math.round(this.playerPos.distanceTo(CH3_NORTHERN_GATE_POS));
        }

        if (this.ch3World.elarionInspectables.some((ins) => this.playerPos.distanceTo(ins.position) < 3.4)) {
          const nearI = this.ch3World.elarionInspectables.find((ins) => this.playerPos.distanceTo(ins.position) < 3.4)!;
          interactionPrompt = `PRESS E TO READ ${nearI.label.toUpperCase()}`;
          interactionKey = 'E';
        } else if (!f.statueMemoryViewed && this.playerPos.distanceTo(CH3_STATUE_POS) < 5.5) {
          interactionPrompt = 'PRESS E TO ACTIVATE MEMORY CRYSTAL AT STATUE';
          interactionKey = 'E';
        } else if (this.playerPos.distanceTo(CH3_ORVELLAN_POS) < 5.2 && !f.orvellanConfronted && !f.escapeActive) {
          interactionPrompt = 'PRESS E TO SPEAK WITH ORVELLAN';
          interactionKey = 'E';
        } else if (f.escapeActive && this.ch3World.escapeSwitches.some((sw) => !sw.activated && this.playerPos.distanceTo(sw.position) < 3.8)) {
          interactionPrompt = 'PRESS E TO SHATTER BARRIER CRYSTAL';
          interactionKey = 'E';
        } else if (this.playerPos.distanceTo(CH3_NORTHERN_GATE_POS) < 5.8 && !this.ch3BellFinaleActive) {
          interactionPrompt = 'PRESS E TO USE THE GOLDEN GATE KEY';
          interactionKey = 'E';
        }
      } else if (f.subZone === 'valley') {
        questTitle = 'ACT 10 · THE VALLEY OF SILENT BELLS';
        questSubtitle = 'Behold the Tower of Books across the valley';
        distanceMeters = Math.round(this.playerPos.distanceTo(CH3_BOOK_TOWER_POS));
      }
    } else if (isCh4) {
      const f = this.ch4Flags;
      if (this.ch4BannerTimer > 0 && this.ch4BannerTitle) {
        bannerTitle = this.ch4BannerTitle;
        bannerSubtitle = this.ch4BannerSubtitle;
      }

      // Chapter 4 Cutscene Dialogues
      if (this.ch4CutscenePhase === 'portal') {
        if (this.ch4CutsceneTimer < 1.8) {
          dialogue = { speaker: 'Mysterious Voice', portrait: 'orvellan', emotion: 'calm', text: 'Welcome, Reader.', note: 'A golden book opens before Nate: THE WAR OF PELICON DESERT.' };
        } else {
          dialogue = { speaker: 'Jafr', portrait: 'jafr', emotion: 'surprised', text: 'NATE! HOLD ON!', note: 'A radiant wind of sand and golden pages pulls Nate into the story!' };
        }
      } else if (this.ch4CutscenePhase === 'fall_intro') {
        dialogue = { speaker: 'Jafr', portrait: 'jafr', emotion: 'surprised', text: 'Again?! Where are we now?', note: 'Clinging to Nate’s shoulder as the battle of Pelicon rages ahead.' };
        dialogueCanAdvance = true;
      } else if (this.ch4CutscenePhase === 'wounded') {
        const lines: DialogueLine[] = [
          { speaker: 'Wounded Warrior', portrait: 'warrior', emotion: 'concerned', text: 'Hey... you!' },
          { speaker: 'Wounded Warrior', portrait: 'warrior', emotion: 'concerned', text: "Fight against the King's warriors! We can save the princess!" },
          { speaker: 'Nate', portrait: 'nate', emotion: 'curious', text: 'Who is the princess?' },
          { speaker: 'Wounded Warrior', portrait: 'warrior', emotion: 'emotional', text: "She's up in the castle! She is beautiful, honest and generous. Everyone in Pelicon loves her." },
          { speaker: 'Wounded Warrior', portrait: 'warrior', emotion: 'sad', text: 'Save the princess...', note: 'The brave guardian falls peacefully unconscious beside his sword.' },
          { speaker: 'Jafr', portrait: 'jafr', emotion: 'concerned', text: 'Nate... I think we need to help them. Take his sword!' },
        ];
        dialogue = lines[this.ch4CutsceneStep] ?? lines[0];
        dialogueCanAdvance = true;
      } else if (this.ch4CutscenePhase === 'victory') {
        dialogue =
          this.ch4CutsceneStep === 0
            ? { speaker: 'Jafr', portrait: 'jafr', emotion: 'happy', text: 'We did it!' }
            : { speaker: 'Jafr', portrait: 'jafr', emotion: 'happy', text: "Now... let's find that princess!", note: 'The Pelicon banner rises and the Castle Gates swing open.' };
        dialogueCanAdvance = true;
      } else if (this.ch4CutscenePhase === 'balcony') {
        const lines: DialogueLine[] = [
          { speaker: 'Jafr', portrait: 'jafr', emotion: 'surprised', text: 'Nate... I think the princess is looking at you!', note: 'A gentle desert breeze moves Eita’s hair above the balcony.' },
          { speaker: 'Nate', portrait: 'nate', emotion: 'curious', text: 'Understand?' },
          { speaker: 'Princess Eita', portrait: 'eita', emotion: 'happy', text: '(Smiles warmly toward Nate and steps inside toward the Grand Hall.)' },
        ];
        dialogue = lines[this.ch4CutsceneStep] ?? lines[0];
        dialogueCanAdvance = true;
      } else if (this.ch4CutscenePhase === 'reunion') {
        const lines: DialogueLine[] = [
          { speaker: 'Nate', portrait: 'nate', emotion: 'concerned', text: "Princess Eita! Please help me. I'm trapped in this Book and don't know how to get out." },
          { speaker: 'Eita', portrait: 'eita', emotion: 'emotional', text: 'You know... I am also a human from Brook Village. When I was four, I came into this Book. Now I am sixteen—what can I do?' },
          { speaker: 'Eita', portrait: 'eita', emotion: 'surprised', text: 'How do you know my name?', note: 'Nate: "I know you because we study in the same magic school... Eita Yusa!"' },
          { speaker: 'Eita', portrait: 'eita', emotion: 'emotional', text: 'Leon... Finally, you found me!', note: 'Eita and Nate share a heartfelt childhood-friends reunion hug.' },
          { speaker: 'Eita', portrait: 'eita', emotion: 'happy', text: 'I thought I would never see anyone from Brook Village again! And I think you have your Jafr with you!' },
          { speaker: 'Jafr', portrait: 'jafr', emotion: 'happy', text: 'Hi!', note: 'Suddenly a pink spiral shell bursts out of Eita’s long hair and rolls into the bookshelf!' },
          { speaker: 'Sneh', portrait: 'sneh', emotion: 'happy', text: "You don't miss me, Jaf?", note: 'Jafr: "I missed you very much, Sneh!"' },
          { speaker: 'Warrior 1', portrait: 'warrior', emotion: 'calm', text: "Hey, did you hear something inside? | Warrior 2: Don't worry—he rescued the princess. Just keep quiet!" },
          { speaker: 'Sneh', portrait: 'sneh', emotion: 'happy', text: 'Still talking too much?', note: 'Eita laughs softly while Jafr beams happily.' },
          { speaker: 'Nate', portrait: 'nate', emotion: 'calm', text: "I know a witch who told me about Agnes's Church. Under the escape gate there's a way out of this Book!" },
          { speaker: 'Eita', portrait: 'eita', emotion: 'happy', text: 'Okay... let’s go! Sneh, come!', note: 'Jafr climbs onto Nate’s shoulder; Sneh climbs onto Eita’s shoulder.' },
          { speaker: 'Sneh', portrait: 'sneh', emotion: 'curious', text: 'Another adventure? | Jafr: Looks like it!', note: 'Outside the bedroom window, the sunset paints the Pelicon Desert gold.' },
        ];
        dialogue = lines[this.ch4CutsceneStep] ?? lines[0];
        dialogueCanAdvance = true;
      } else if (this.ch4CutscenePhase === 'magic_awaken') {
        dialogue = { speaker: 'Jafr', portrait: 'jafr', emotion: 'surprised', text: 'Whoa!! Gold magic around your hands, Nate—you unlocked a new power!', note: 'Glowing runes swirl beneath Nate as warm wind blows the curtains.' };
      } else if (this.ch4CutscenePhase === 'outskirts_end') {
        const lines: DialogueLine[] = [
          { speaker: 'Eita', portrait: 'eita', emotion: 'curious', text: "So... Agnes's Church?" },
          { speaker: 'Nate', portrait: 'nate', emotion: 'calm', text: "Yes. That's our next destination." },
          { speaker: 'Jafr', portrait: 'jafr', emotion: 'happy', text: "Let's go, everyone!" },
          { speaker: 'Sneh', portrait: 'sneh', emotion: 'happy', text: "Let's find our way home!" },
          { speaker: 'Chapter 4 Ending', portrait: 'eita', emotion: 'emotional', text: "High above the dunes stands the distant silhouette of Agnes's Church beneath a glowing twilight symbol." },
        ];
        dialogue = lines[this.ch4CutsceneStep] ?? lines[4];
        dialogueCanAdvance = this.ch4CutsceneStep < 4;
      }

      // Dynamic Ch4 Quests & Prompts
      if (f.subZone === 'desert') {
        if (!f.woundedWarriorDone) {
          questTitle = 'QUEST: REACH THE WOUNDED WARRIOR';
          questSubtitle = 'Speak with the Pelicon guardian on the sand ahead';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH4_WOUNDED_WARRIOR_POS));
        } else if (!f.wallCleared) {
          questTitle = 'MAIN QUEST: SAVE THE PRINCESS (DESERT WALL)';
          questSubtitle = 'Right Click: Sword Strike against the King’s Warriors';
          distanceMeters = Math.round(Math.max(0, this.playerPos.z - CH4_WALL_ZONE_Z));
        } else if (!f.fireBowCollected) {
          questTitle = 'QUEST: COLLECT THE MAGICAL FIRE BOW';
          questSubtitle = 'Approach the glowing gold pedestal past the Desert Wall & press E';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH4_FIRE_BOW_POS));
        } else if (!f.marketCleared) {
          questTitle = 'MAIN QUEST: CLEAR THE ABANDONED MARKET';
          questSubtitle = 'Left Click: Aim Bow · Right Click: Shoot / Sword · N: Switch Bows';
          distanceMeters = Math.round(Math.max(0, this.playerPos.z));
        } else if (!f.victoryAchieved) {
          questTitle = 'MAIN QUEST: DEFEAT THE KING’S FORCES';
          questSubtitle = f.arcaneBowUnlocked
            ? 'Clear the Castle Road defenders ahead'
            : 'Collect the Arcane Burst Bow ahead & clear the Castle Road';
          distanceMeters = Math.round(Math.max(0, this.playerPos.z - CH4_ROAD_ZONE_Z));
        } else if (!f.castleEntered) {
          questTitle = 'QUEST: FIND THE PRINCESS';
          questSubtitle = 'Approach the open Pelicon Castle Gates & press ENTER';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH4_CASTLE_DOOR_POS));
        } else {
          questTitle = 'QUEST: REACH THE DESERT OUTSKIRTS';
          questSubtitle = 'Walk west through celebrating Pelicon Town with Eita, Jafr & Sneh';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH4_OUTSKIRTS_POS));
        }

        if (!f.swordCollected && f.woundedWarriorDone && this.playerPos.distanceTo(CH4_DROPPED_SWORD_POS) < 3.8) {
          interactionPrompt = 'PRESS E TO COLLECT WARRIOR SWORD';
          interactionKey = 'E';
        } else if (!f.fireBowCollected && this.playerPos.distanceTo(CH4_FIRE_BOW_POS) < 4.2) {
          interactionPrompt = 'PRESS E TO COLLECT THE MAGICAL BOW';
          interactionKey = 'E';
        } else if (f.marketCleared && !f.arcaneBowUnlocked && this.playerPos.distanceTo(CH4_ARCANE_BOW_POS) < 4.2) {
          interactionPrompt = 'PRESS E TO COLLECT ARCANE BURST BOW';
          interactionKey = 'E';
        } else if (f.victoryAchieved && !f.castleEntered && this.playerPos.distanceTo(CH4_CASTLE_DOOR_POS) < 5.5) {
          interactionPrompt = f.balconyEitaSeen ? 'PRESS ENTER TO ENTER THE CASTLE' : 'PRESS ENTER TO APPROACH THE CASTLE';
          interactionKey = 'ENTER';
        }
      } else if (f.subZone === 'castle_interior') {
        if (!f.eitaRoomEntered) {
          questTitle = 'QUEST: MEET PRINCESS EITA';
          questSubtitle = 'Walk up the Grand Staircase to the Royal Bedroom door';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH4_EITA_DOOR_POS));
          if (distanceMeters < 4.4) {
            interactionPrompt = "PRESS ENTER TO ENTER THE PRINCESS'S ROOM";
            interactionKey = 'ENTER';
          }
        } else {
          questTitle = 'ESCAPE THE PRINCESS’S ROOM & CASTLE';
          questSubtitle = 'Lead Eita, Jafr & Sneh down the staircase to the main Castle Exit';
          distanceMeters = Math.round(this.playerPos.distanceTo(CH4_CASTLE_EXIT_DOOR_POS));
          if (!this.ch4JournalCollected && this.playerPos.distanceTo(CH4_JOURNAL_POS) < 3.4) {
            interactionPrompt = "PRESS E TO COLLECT EITA'S STORY JOURNAL";
            interactionKey = 'E';
          } else if (distanceMeters < 4.6) {
            interactionPrompt = 'PRESS ENTER TO EXIT THE CASTLE';
            interactionKey = 'ENTER';
          }
        }
      }
    }

    const dangerousHeightWarning =
      this.library.group.visible &&
      this.isPlayableScene() &&
      !this.isFlying &&
      !this.isGrounded &&
      this.fallPeakY > 12 &&
      this.playerVel.y < -4;

    const timeOfDayLabel = isCh2
      ? this.timeOfDay < 0.28
        ? 'Sunset'
        : this.timeOfDay < 0.62
        ? 'Evening'
        : this.timeOfDay < 0.88
        ? 'Night'
        : 'Morning'
      : isCh3
      ? this.ch3Flags.subZone === 'elarion'
        ? this.ch3Flags.escapeActive
          ? 'Seventh Bell Escape'
          : 'Subterranean Elarion'
        : this.ch3Flags.subZone === 'valley'
        ? 'Silent Valley'
        : '7:00 AM · Dawn Mist'
      : isCh4
      ? this.ch4Flags.subZone === 'castle_interior'
        ? 'Pelicon Royal Castle'
        : this.ch4Flags.castleEscaped
        ? 'Golden Sunset · Peace'
        : 'Pelicon Desert War'
      : null;

    const memoryPuzzle: MemoryPuzzleUiState | null = this.ch3PuzzleOpen
      ? {
          open: true,
          fragments: [...this.ch3Flags.collectedFragments],
          rotations: [...this.ch3Flags.stoneRotations] as [number, number, number],
          solved: this.ch3Flags.stonesSolved,
          feedback: this.ch3PuzzleFeedback,
        }
      : null;

    const subZoneLabelMap: Record<Ch3SubZone, string> = {
      tunnel: 'Portal Passage',
      house_interior: 'Forgotten House Interior',
      surface: this.ch3Flags.whisperHeard ? 'Whispering Woods' : 'Forgotten Clearing',
      elarion: this.ch3Flags.archiveEntered
        ? 'Archive of Readers'
        : this.ch3Flags.orvellanMet
        ? 'Library of Elarion'
        : 'Elarion Cavern City',
      valley: 'Valley of Silent Bells',
    };

    const ch4ZoneLabel = !isCh4
      ? null
      : this.ch4Flags.subZone === 'tunnel'
      ? 'Portal to Pelicon'
      : this.ch4Flags.subZone === 'castle_interior'
      ? this.ch4Flags.eitaRoomEntered
        ? "Princess Eita's Bedroom"
        : 'Pelicon Castle Interior'
      : this.ch4Flags.castleEscaped
      ? 'Celebrating Pelicon Town'
      : !this.ch4Flags.wallCleared
      ? 'Area 1 · Desert Wall'
      : !this.ch4Flags.marketCleared
      ? 'Area 2 · Abandoned Market'
      : !this.ch4Flags.victoryAchieved
      ? 'Area 3 · Castle Road'
      : 'Pelicon Courtyard';

    const ch4EnemiesRemaining = isCh4
      ? this.ch4Warriors.filter((w) => w.team === 'enemy' && !w.dead).length
      : 0;

    return {
      mode: this.mode,
      scene: this.sceneId,
      chapter: chapterNum,
      questTitle,
      questSubtitle,
      distanceMeters,
      altitudeMeters,
      isFlying: this.isFlying,
      dangerousHeightWarning,
      interactionPrompt,
      interactionKey,
      bannerTitle,
      bannerSubtitle,
      dialogue,
      dialogueCanAdvance,
      autoDialogue: this.autoDialogue,
      ambientBubble: this.ambientBubble,
      showFlyingTutorial: this.sceneId === 'scene_6_flying_tutorial',
      showObservationTutorial:
        (isCh2 &&
          this.sceneId === 'ch2_scene_3_explore' &&
          !this.ch2Flags.observationUsed &&
          !this.ch2Flags.insideHouse &&
          this.discoveryTimer <= 0) ||
        (isCh3 &&
          this.ch3Flags.footprintsDiscovered &&
          !this.ch3Flags.observationUsedCh3 &&
          this.ch3Flags.subZone === 'surface'),
      observationMode: this.observationMode,
      observationMarkers: this.computeObservationMarkers(),
      energy: Math.round(this.energy),
      stamina: Math.round(this.stamina),
      isExhausted: isCh2 && this.energy < 45,
      inventory: this.inventory.map((it) => ({ ...it })),
      inventoryOpen: this.inventoryOpen,
      itemToast: this.itemToast,
      jafrStatus: isCh2 || isCh3 || isCh4 ? this.jafrStatusText : null,
      restModalOpen: this.restModalOpen,
      isResting: this.isResting,
      isSleeping: this.isSleeping,
      letterOpen: this.letterOpen,
      memoryPuzzle,
      questLogOpen: this.questLogOpen,
      ch3Quests: isCh4 ? this.buildCh4Quests() : isCh3 ? this.buildCh3Quests() : [],
      ch2PortalCompleted: this.ch2PortalCompleted,
      ch3MemoryStones: this.ch3Flags.stonesSolved ? 3 : this.ch3Flags.collectedFragments.length,
      ch3HasGateKey: this.ch3Flags.gateKeyObtained,
      ch3HasMemoryCrystal: this.ch3Flags.memoryCrystalObtained,
      ch3BellCount: this.ch3Flags.escapeBellsRung,
      ch3SubZoneLabel: isCh3 ? subZoneLabelMap[this.ch3Flags.subZone] : null,
      ch3ArchiveNamesVisible: this.ch3ArchiveNamesVisible,
      ch4Health: Math.round(this.ch4Health),
      ch4ActiveWeapon: this.ch4Flags.activeWeapon,
      ch4HasSword: this.ch4Flags.swordCollected,
      ch4HasFireBow: this.ch4Flags.fireBowCollected,
      ch4HasArcaneBow: this.ch4Flags.arcaneBowUnlocked,
      ch4IsAiming: this.ch4IsAiming,
      ch4IsBlocking: this.ch4IsBlocking,
      ch4ComboStep: this.ch4ComboStep,
      ch4EnemiesRemaining,
      ch4SubZoneLabel: ch4ZoneLabel,
      ch4SnehStatus:
        this.ch4Flags.eitaCompanionActive || this.ch4SnehAttachedToEita
          ? "Sneh perched on Eita's shoulder"
          : this.sneh.root.visible
          ? 'Sneh reunited with Jafr'
          : null,
      ch4EitaCompanion: this.ch4Flags.eitaCompanionActive,
      minimap: this.buildMinimapState(chapterNum),
      timeOfDayLabel,
      saveStatus: this.saveStatus,
      fadeAlpha: this.fadeAlpha,
      whiteFadeAlpha: this.whiteFadeAlpha,
      portalGlowAlpha: this.portalGlowAlpha,
      pointerLocked: this.pointerLocked,
      gameOverReason: this.gameOverReason,
      introStage: this.introStage,
      introElapsed: this.introElapsed,
    };
  }

  private buildMinimapState(chapter: ChapterNumber): MinimapState | null {
    if (!this.isPlayableScene()) return null;
    const markers: MinimapMarker[] = [];
    const addMarker = (id: string, kind: MinimapMarker['kind'], label: string, pos: { x: number; z: number }) => {
      markers.push({
        id,
        kind,
        label,
        dx: pos.x - this.playerPos.x,
        dz: pos.z - this.playerPos.z,
      });
    };

    if (chapter === 1) {
      if (this.village.group.visible) {
        addMarker('mother', 'ally', 'Mother', { x: -1.3, z: 6.8 });
        addMarker('ench_lib', 'quest', 'Ench Library', LIBRARY_PLAZA_POS);
      } else if (this.library.group.visible) {
        if (!this.hasBook) {
          addMarker('sensei_book', 'quest', "Sensei's Book", this.library.targetBookPos);
        } else {
          addMarker('flying_chair', 'quest', 'Reading Chair', this.library.targetChairPos);
        }
      }
    } else if (chapter === 2) {
      if (this.ch2Flags.insideHouse) {
        if (!this.ch2Flags.itemsCollected) addMarker('box', 'quest', 'Supply Box', CH2_BOX_POS);
        else if (!this.ch2Flags.sleptOnce && !this.ch2Flags.firstCheckpointSaved) addMarker('bed', 'quest', 'Wooden Bed', CH2_BED_POS);
        else addMarker('exit', 'quest', 'House Exit', CH2_INTERIOR_SPAWN);
      } else {
        addMarker('house', !this.ch2Flags.houseDiscovered ? 'quest' : 'landmark', 'Mountain House', CH2_DOOR_POS);
        if (this.ch2Flags.portalDiscovered) {
          addMarker('portal', 'portal', 'Ancient Portal', CH2_PORTAL_POS);
        }
      }
    } else if (chapter === 3) {
      const f = this.ch3Flags;
      if (f.subZone === 'house_interior') {
        if (!f.sleptInHouse) addMarker('bed', 'quest', 'Bed', CH3_INTERIOR_BED_POS);
        else addMarker('door', 'quest', 'Front Door', CH3_INTERIOR_DOOR_POS);
      } else if (f.subZone === 'surface') {
        addMarker('house', 'landmark', 'Forgotten House', CH3_EXTERIOR_DOOR_POS);
        if (!f.letterRead) addMarker('letter', 'quest', 'Black Letter', CH3_LETTER_POS);
        if (!f.lumiMet) addMarker('lumi', 'ally', 'Lumi', this.ch3World.lumiRig.root.position);
        if (!f.stonesSolved) addMarker('stones', 'quest', 'Memory Stones', CH3_STONES_PLATFORM_POS);
        else addMarker('stairs', 'portal', 'Elarion Descent', CH3_STAIR_DESCENT_POS);
      } else if (f.subZone === 'elarion') {
        if (!f.statueMemoryViewed) addMarker('statue', 'quest', 'Wizard Statue', CH3_STATUE_POS);
        if (!f.orvellanMet) addMarker('orvellan', 'ally', 'Orvellan', CH3_ORVELLAN_POS);
        if (f.orvellanMet && !f.readerNamesRevealed) addMarker('archive', 'quest', 'Archive', CH3_ARCHIVE_POS);
        if (f.escapeActive) addMarker('gate', 'portal', 'Northern Gate', CH3_NORTHERN_GATE_POS);
      } else if (f.subZone === 'valley') {
        addMarker('tower', 'quest', 'Tower of Books', CH3_BOOK_TOWER_POS);
      }
    } else if (chapter === 4) {
      const f = this.ch4Flags;
      if (f.subZone === 'desert') {
        if (!f.woundedWarriorDone) addMarker('wounded', 'ally', 'Wounded Guardian', CH4_WOUNDED_WARRIOR_POS);
        if (f.woundedWarriorDone && !f.swordCollected) addMarker('sword', 'quest', 'Warrior Sword', CH4_DROPPED_SWORD_POS);
        if (f.wallCleared && !f.fireBowCollected) addMarker('fbow', 'quest', 'Fire Bow', CH4_FIRE_BOW_POS);
        if (f.marketCleared && !f.arcaneBowUnlocked) addMarker('abow', 'quest', 'Arcane Bow', CH4_ARCANE_BOW_POS);
        if (f.victoryAchieved && !f.castleEntered) addMarker('castle', 'portal', 'Pelicon Castle', CH4_CASTLE_DOOR_POS);
        if (f.castleEscaped) addMarker('outskirts', 'quest', 'Desert Outskirts', CH4_OUTSKIRTS_POS);
        for (const w of this.ch4Warriors) {
          if (!w.dead && w.team === 'enemy' && w.pos.distanceTo(this.playerPos) < 46) {
            addMarker(w.id, 'enemy', 'King Warrior', w.pos);
          }
        }
        if (f.eitaCompanionActive) {
          addMarker('eita', 'ally', 'Princess Eita', this.ch4EitaPos);
        }
      } else if (f.subZone === 'castle_interior') {
        if (!f.eitaRoomEntered) addMarker('eita_room', 'quest', "Eita's Chamber", CH4_EITA_DOOR_POS);
        else addMarker('castle_exit', 'portal', 'Castle Exit', CH4_CASTLE_EXIT_DOOR_POS);
      }
    }

    return {
      x: this.playerPos.x,
      z: this.playerPos.z,
      yaw: this.playerYaw,
      scale: chapter === 1 && this.village.group.visible ? 80 : 48,
      markers,
    };
  }

  private emitHud(force: boolean): void {
    const now = performance.now();
    if (!force && now - this.lastHudEmit < 90) return;
    const state = this.buildHudState();
    const key = JSON.stringify(state);
    if (!force && key === this.lastHudKey) return;
    this.lastHudEmit = now;
    this.lastHudKey = key;
    this.onHudUpdate(state);
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleWindowBlur);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    this.renderer.domElement.removeEventListener('mousedown', this.handleMouseDown);
    this.renderer.domElement.removeEventListener('contextmenu', this.handleContextMenu);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);

    this.sound.dispose();
    this.tex.dispose();
    this.scene.traverse((obj) => {
      const m = obj as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      if (m.material) {
        if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
        else m.material.dispose();
      }
    });
    this.composer?.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
