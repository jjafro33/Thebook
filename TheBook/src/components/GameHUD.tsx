import React from 'react';
import {
  Apple,
  Backpack,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronsRight,
  Circle,
  Compass,
  Crosshair,
  Eye,
  Flame,
  FlaskConical,
  Gem,
  Heart,
  Keyboard,
  KeyRound,
  ListChecks,
  Lock,
  Moon,
  Pause,
  RotateCcw,
  RotateCw,
  ScrollText,
  Settings,
  Shield,
  SkipForward,
  Sparkles,
  Star,
  Sun,
  Swords,
  Volume2,
  VolumeX,
  Wind,
  Zap,
} from 'lucide-react';
import type {
  Ch4WeaponMode,
  GameSettings,
  HudState,
  InventoryItem,
  InventoryItemId,
} from '../game/types';
import {
  formatEmotionLabel,
  MinimapRadar,
  PortraitAvatar,
  resolvePortraitId,
} from './HudWidgets';

interface GameHUDProps {
  hud: HudState;
  settings: GameSettings;
  onToggleMute: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestartCheckpoint: () => void;
  onOpenControls: () => void;
  onOpenSettings: () => void;
  onReturnTitle: () => void;
  onReplayChapter: () => void;
  onAdvanceDialogue: () => void;
  onToggleAutoDialogue: () => void;
  onSkipDialogue: () => void;
  onToggleObservation: () => void;
  onStartChapter2: () => void;
  onStartChapter3: () => void;
  onStartChapter4: () => void;
  onSelectCh4Weapon: (weapon: Ch4WeaponMode) => void;
  onSwitchCh4Bow: () => void;
  onTriggerCh4Attack: () => void;
  onTriggerCh4Block: (active: boolean) => void;
  onTriggerCh4Dodge: () => void;
  onToggleInventory: () => void;
  onUseInventoryItem: (id: InventoryItem['id']) => void;
  onSelectRestOption: (option: 'rest' | 'sleep') => void;
  onStandUpFromRest: () => void;
  onContinueMorning: () => void;
  onCloseLetterModal: () => void;
  onSelectDialogueChoice: (choiceId: string) => void;
  onRotatePuzzleStone: (index: 0 | 1 | 2) => void;
  onConfirmPuzzle: () => void;
  onClosePuzzle: () => void;
  onToggleQuestLog: () => void;
}

function renderItemIcon(id: InventoryItemId) {
  switch (id) {
    case 'energy_tonic':
      return <FlaskConical className="h-5 w-5 text-[#72efdd]" />;
    case 'fruit':
      return <Apple className="h-5 w-5 text-rose-300" />;
    case 'broken_compass':
      return <Compass className="h-5 w-5 text-[#d9a84e]" />;
    case 'old_wooden_toy':
      return <Sparkles className="h-5 w-5 text-amber-300" />;
    case 'torn_blue_fabric':
      return <ScrollText className="h-5 w-5 text-sky-300" />;
    case 'small_silver_key':
    case 'golden_gate_key':
      return <KeyRound className="h-5 w-5 text-[#f4e4c2]" />;
    case 'memory_crystal':
      return <Gem className="h-5 w-5 text-[#72efdd]" />;
    case 'memory_stone':
      return <BookOpen className="h-5 w-5 text-purple-300" />;
    case 'pelicon_sword':
      return <Swords className="h-5 w-5 text-[#fbbf24]" />;
    case 'fire_bow':
      return <Flame className="h-5 w-5 text-orange-400" />;
    case 'arcane_bow':
      return <Sparkles className="h-5 w-5 text-purple-300" />;
    case 'pelicon_emblem':
      return <Shield className="h-5 w-5 text-[#d9a84e]" />;
    case 'eita_journal':
      return <BookOpen className="h-5 w-5 text-pink-300" />;
  }
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  settings,
  onToggleMute,
  onPause,
  onResume,
  onRestartCheckpoint,
  onOpenControls,
  onOpenSettings,
  onReturnTitle,
  onReplayChapter,
  onAdvanceDialogue,
  onToggleAutoDialogue,
  onSkipDialogue,
  onToggleObservation,
  onStartChapter2,
  onStartChapter3,
  onStartChapter4,
  onSelectCh4Weapon,
  onSwitchCh4Bow,
  onTriggerCh4Attack,
  onTriggerCh4Block,
  onTriggerCh4Dodge,
  onToggleInventory,
  onUseInventoryItem,
  onSelectRestOption,
  onStandUpFromRest,
  onContinueMorning,
  onCloseLetterModal,
  onSelectDialogueChoice,
  onRotatePuzzleStone,
  onConfirmPuzzle,
  onClosePuzzle,
  onToggleQuestLog,
}) => {
  const inPlay = hud.mode === 'playing';
  const isAdventureChapter = hud.chapter === 2 || hud.chapter === 3 || hud.chapter === 4;
  const showControlsBar =
    inPlay &&
    !hud.dialogue &&
    (hud.scene === 'scene_3_journey' ||
      hud.scene === 'scene_4_entrance' ||
      hud.scene === 'scene_6_flying_tutorial' ||
      hud.scene === 'scene_7_find_book' ||
      hud.scene === 'scene_8_flying_chair' ||
      hud.scene === 'ch2_scene_3_explore' ||
      hud.scene === 'ch2_scene_4_house_interior' ||
      hud.scene === 'ch2_scene_5_supply_box' ||
      hud.scene === 'ch2_scene_6_rest_sleep' ||
      hud.scene === 'ch2_scene_7_portal' ||
      hud.scene === 'ch2_complete' ||
      hud.scene === 'ch3_scene_1_arrival' ||
      hud.scene === 'ch3_scene_2_whispering_woods' ||
      hud.scene === 'ch3_scene_elarion' ||
      hud.scene === 'ch3_scene_3_silent_bells' ||
      hud.scene === 'ch4_scene_1_arrival' ||
      hud.scene === 'ch4_scene_2_battlefield' ||
      hud.scene === 'ch4_scene_3_castle_interior' ||
      hud.scene === 'ch4_scene_4_pelicon_town');

  const totalInventoryCount = hud.inventory.reduce((acc, item) => acc + item.quantity, 0);
  const quickHealingItem = hud.inventory.find(
    (item) => item.quantity > 0 && item.energyRestore > 0
  );
  const ch4BowEquipped =
    hud.chapter === 4 &&
    (hud.ch4ActiveWeapon === 'fire_bow' || hud.ch4ActiveWeapon === 'arcane_bow');
  const ch4HasCombatGear =
    hud.chapter === 4 && (hud.ch4HasSword || hud.ch4HasFireBow || hud.ch4HasArcaneBow);

  const subZoneMeta = [
    hud.ch3SubZoneLabel,
    hud.ch4SubZoneLabel,
    hud.timeOfDayLabel,
  ].filter(Boolean) as string[];

  const activePortrait = hud.dialogue
    ? resolvePortraitId(hud.dialogue.speaker, hud.dialogue.portrait)
    : 'nate';
  const emotionLabel = hud.dialogue ? formatEmotionLabel(hud.dialogue.emotion) : null;

  const primaryVitalityPct = hud.chapter === 4 ? hud.ch4Health : hud.energy;
  const secondaryStaminaPct = hud.chapter === 4 ? hud.stamina : hud.energy;

  return (
    <>
      {/* Portal Illumination, White Flash & Fade to Black Layers */}
      {hud.portalGlowAlpha > 0 && (
        <div
          className="pointer-events-none fixed inset-0 z-30"
          style={{
            background:
              'radial-gradient(circle at center, rgba(255,244,205,1) 0%, rgba(111,231,255,0.85) 55%, rgba(88,28,135,0.9) 100%)',
            opacity: hud.portalGlowAlpha,
          }}
        />
      )}
      {hud.whiteFadeAlpha > 0 && (
        <div
          className="pointer-events-none fixed inset-0 z-30 bg-[#f8fafc]"
          style={{ opacity: hud.whiteFadeAlpha }}
        />
      )}
      {hud.fadeAlpha > 0 && (
        <div
          className="pointer-events-none fixed inset-0 z-30 bg-[#05070b]"
          style={{ opacity: hud.fadeAlpha }}
        />
      )}

      {/* Chapter 4 Bow Aiming Reticle */}
      {inPlay && ch4BowEquipped && !hud.dialogue && (
        <div className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center">
          <div
            className={`flex items-center justify-center rounded-full border-2 transition-all duration-150 ${
              hud.ch4IsAiming
                ? hud.ch4ActiveWeapon === 'arcane_bow'
                  ? 'h-8 w-8 border-purple-300 bg-purple-500/15'
                  : 'h-8 w-8 border-orange-300 bg-orange-500/15'
                : 'h-11 w-11 border-white/50 bg-transparent'
            }`}
          >
            <Crosshair
              className={`h-4 w-4 ${
                hud.ch4ActiveWeapon === 'arcane_bow' ? 'text-purple-200' : 'text-orange-200'
              }`}
            />
          </div>
        </div>
      )}

      {/* Observation Mode Frame & Projected 3D Landmark Markers */}
      {inPlay && hud.observationMode && (
        <div className="pointer-events-none fixed inset-0 z-10 border-4 border-[#72efdd]/30">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 rounded-md border border-[#72efdd]/45 bg-[#090e16]/92 px-4 py-1 text-xs font-semibold tracking-widest text-[#72efdd]">
            OBSERVATION MODE · PRESS V TO EXIT
          </div>
          {hud.observationMarkers.map((m) => (
            <div
              key={m.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
            >
              <div className="flex flex-col items-center">
                <div className="rounded-md border border-[#72efdd]/65 bg-[#090e16]/94 px-3 py-1 text-center shadow-lg">
                  <div className="text-[11px] font-semibold text-[#f4e4c2]">{m.label}</div>
                  <div className="font-mono-num text-[10px] text-[#72efdd]">{m.distance}m</div>
                </div>
                <div className="mt-1 h-2.5 w-2.5 rotate-45 border border-[#72efdd] bg-[#72efdd]/30" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Gameplay / Cutscene HUD */}
      {hud.mode !== 'title' && hud.mode !== 'complete' && (
        <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3 sm:p-5">
          {/* Top Perimeter Row */}
          <div className="flex items-start justify-between gap-3">
            {/* Top-Left AAA Hero Status Plate + Main Quest Card */}
            {hud.questTitle ? (
              <div className="flex max-w-[330px] flex-col gap-2 sm:max-w-[360px]">
                {/* Character Vitality & Stamina Plate */}
                <div className="flex items-center gap-2.5 rounded-lg border border-[#d9a84e]/45 bg-[#090d14]/92 px-3 py-2 shadow-xl">
                  <PortraitAvatar portrait="nate" size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display truncate text-xs font-bold tracking-wide text-[#f7ebd2]">
                        Nateleon Kennedy
                      </span>
                      <span className="font-mono-num text-[10px] font-semibold text-[#d9a84e]">
                        CH.{hud.chapter}
                      </span>
                    </div>

                    {/* Vitality / Health Bar */}
                    <div className="mt-1 flex items-center gap-2">
                      <Heart
                        className={`h-3 w-3 shrink-0 ${
                          primaryVitalityPct <= 30 ? 'text-rose-400' : 'text-rose-400/90'
                        }`}
                      />
                      <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-white/10">
                        <div
                          className={`h-full transition-all duration-200 ${
                            hud.chapter === 4
                              ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                              : hud.isExhausted
                              ? 'bg-amber-400'
                              : 'bg-gradient-to-r from-emerald-500 to-[#72efdd]'
                          }`}
                          style={{
                            width: `${Math.max(0, Math.min(100, primaryVitalityPct))}%`,
                          }}
                        />
                      </div>
                      <span className="font-mono-num w-8 text-right text-[10px] font-semibold text-slate-200">
                        {Math.round(primaryVitalityPct)}%
                      </span>
                    </div>

                    {/* Stamina / Focus Bar */}
                    <div className="mt-1 flex items-center gap-2">
                      <Zap className="h-3 w-3 shrink-0 text-sky-400" />
                      <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-cyan-300 transition-all duration-150"
                          style={{
                            width: `${Math.max(0, Math.min(100, secondaryStaminaPct))}%`,
                          }}
                        />
                      </div>
                      <span className="font-mono-num w-8 text-right text-[10px] text-slate-300">
                        {Math.round(secondaryStaminaPct)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Quest Objective Card */}
                <div className="rounded-lg border border-[#d9a84e]/35 bg-[#090d14]/90 px-3.5 py-2.5 shadow-lg">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                    <span className="font-display text-xs font-bold tracking-wider text-[#f4e4c2]">
                      {hud.questTitle}
                    </span>
                    {subZoneMeta.length > 0 && (
                      <span className="text-[10px] font-medium tracking-wide text-[#d9a84e]">
                        {subZoneMeta.join(' · ')}
                      </span>
                    )}
                  </div>

                  {hud.questSubtitle && (
                    <div className="mt-1 text-[11px] leading-snug text-slate-300">
                      {hud.questSubtitle}
                    </div>
                  )}

                  {hud.distanceMeters !== null && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-1.5 text-[11px] text-slate-300">
                      <span className="font-mono-num font-semibold text-[#72efdd]">
                        {hud.distanceMeters}m away
                      </span>
                      {hud.altitudeMeters !== null && (
                        <>
                          <span className="text-white/25">·</span>
                          <span className="font-mono-num text-slate-300">
                            Alt {hud.altitudeMeters}m
                          </span>
                        </>
                      )}
                      {hud.isFlying && (
                        <>
                          <span className="text-white/25">·</span>
                          <span className="font-semibold text-[#72efdd]">Flight Active</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Companion & Chapter Relics Readout */}
                  {(hud.jafrStatus ||
                    (hud.chapter === 4 && (hud.ch4SnehStatus || hud.ch4EitaCompanion)) ||
                    hud.chapter === 3) && (
                    <div className="mt-1.5 space-y-0.5 border-t border-white/10 pt-1.5 text-[10.5px] text-slate-300">
                      {hud.jafrStatus && (
                        <div>
                          <span className="font-semibold text-[#72efdd]">Jafr:</span>{' '}
                          {hud.jafrStatus}
                        </div>
                      )}
                      {hud.chapter === 4 && hud.ch4SnehStatus && (
                        <div>
                          <span className="font-semibold text-pink-300">Sneh:</span>{' '}
                          {hud.ch4SnehStatus}
                        </div>
                      )}
                      {hud.chapter === 4 && hud.ch4EitaCompanion && (
                        <div className="font-medium text-amber-200">
                          Companion: Princess Eita Yusa following
                        </div>
                      )}
                      {hud.chapter === 3 && (
                        <div className="font-mono-num flex flex-wrap items-center gap-2 pt-0.5 text-[#72efdd]">
                          <span>Stones: {hud.ch3MemoryStones}/3</span>
                          {hud.ch3HasMemoryCrystal && (
                            <>
                              <span className="text-white/25">·</span>
                              <span className="text-cyan-200">Memory Crystal</span>
                            </>
                          )}
                          {hud.ch3HasGateKey && (
                            <>
                              <span className="text-white/25">·</span>
                              <span className="text-[#f4e4c2]">Golden Gate Key</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chapter 3 Escape Bell Counter */}
                {hud.chapter === 3 && hud.ch3BellCount > 0 && (
                  <div className="flex w-fit items-center gap-2 rounded-lg border border-rose-500/60 bg-rose-950/92 px-3 py-1.5 text-xs font-semibold text-rose-200 shadow-lg">
                    <Bell className="h-3.5 w-3.5 text-amber-300" />
                    <span className="font-mono-num">BELLS TOLLED: {hud.ch3BellCount} / 7</span>
                  </div>
                )}

                {/* Chapter 4 Enemy Counter */}
                {hud.chapter === 4 && hud.ch4EnemiesRemaining > 0 && (
                  <div className="flex w-fit items-center gap-2 rounded-lg border border-amber-500/55 bg-[#1b1207]/92 px-3 py-1.5 text-xs font-semibold text-amber-200 shadow-lg">
                    <Swords className="h-3.5 w-3.5 text-amber-400" />
                    <span className="font-mono-num">
                      ENEMIES REMAINING: {hud.ch4EnemiesRemaining}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div />
            )}

            {/* Top-Right Cluster: Utility Bar + Circular Compass Minimap */}
            <div className="pointer-events-auto flex flex-col items-end gap-2.5">
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {hud.saveStatus !== 'idle' && (
                  <div className="rounded-lg border border-[#72efdd]/45 bg-[#090d14]/94 px-2.5 py-1.5 text-[10px] font-semibold tracking-wider text-[#72efdd]">
                    {hud.saveStatus === 'saving' ? 'AUTOSAVING...' : 'SAVED'}
                  </div>
                )}

                {(hud.chapter === 3 || hud.chapter === 4) && (
                  <button
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onToggleQuestLog();
                    }}
                    aria-label="Open quest tracker"
                    className={`flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                      hud.questLogOpen
                        ? 'border-[#72efdd] bg-[#72efdd]/20 text-[#72efdd]'
                        : 'border-white/15 bg-[#090d14]/92 text-slate-200 hover:border-[#72efdd]/50 hover:text-white'
                    }`}
                  >
                    <ListChecks className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Quests</span>
                  </button>
                )}

                {isAdventureChapter &&
                  hud.scene !== 'ch2_scene_1_seashore' &&
                  hud.scene !== 'ch2_scene_2_jafr_reveal' && (
                    <button
                      onClick={(e) => {
                        e.currentTarget.blur();
                        onToggleInventory();
                      }}
                      aria-label="Open adventurer bag"
                      className={`flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                        hud.inventoryOpen
                          ? 'border-[#d9a84e] bg-[#d9a84e]/20 text-[#f4e4c2]'
                          : 'border-white/15 bg-[#090d14]/92 text-slate-200 hover:border-[#d9a84e]/50 hover:text-white'
                      }`}
                    >
                      <Backpack className="h-3.5 w-3.5" />
                      <span className="font-mono-num hidden sm:inline">
                        Bag ({totalInventoryCount})
                      </span>
                    </button>
                  )}

                {isAdventureChapter && (
                  <button
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onToggleObservation();
                    }}
                    aria-label="Toggle observation mode"
                    title="Observation Mode (V)"
                    className={`flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                      hud.observationMode
                        ? 'border-[#72efdd] bg-[#72efdd]/20 text-[#72efdd]'
                        : 'border-white/15 bg-[#090d14]/92 text-slate-200 hover:border-[#72efdd]/50 hover:text-white'
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="hidden xl:inline">Observe</span>
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onOpenControls();
                  }}
                  aria-label="Open controls guide"
                  title="Controls"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#090d14]/92 text-slate-200 transition-colors hover:border-[#d9a84e]/50 hover:text-white"
                >
                  <Keyboard className="h-4 w-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onOpenSettings();
                  }}
                  aria-label="Open settings"
                  title="Settings"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#090d14]/92 text-slate-200 transition-colors hover:border-[#d9a84e]/50 hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onToggleMute();
                  }}
                  aria-label={settings.muted ? 'Unmute audio' : 'Mute audio'}
                  title={settings.muted ? 'Unmute' : 'Mute'}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-[#090d14]/92 text-slate-200 transition-colors hover:border-[#d9a84e]/50 hover:text-white"
                >
                  {settings.muted ? (
                    <VolumeX className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onPause();
                  }}
                  aria-label="Pause game"
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-white/15 bg-[#090d14]/92 px-2.5 text-xs font-medium text-slate-200 transition-colors hover:border-[#d9a84e]/50 hover:text-white"
                >
                  <Pause className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Esc</span>
                </button>
              </div>

              {hud.minimap && <MinimapRadar minimap={hud.minimap} />}
            </div>
          </div>

          {/* Center-Upper Banners, Archive Reveal, Item Toasts & Warnings */}
          <div className="flex flex-col items-center gap-2.5">
            {hud.bannerTitle && (
              <div className="animate-fade-slide-up rounded-lg border border-[#d9a84e]/45 bg-[#080c12]/92 px-8 py-3.5 text-center shadow-2xl">
                <div className="font-display text-xl font-bold tracking-[0.18em] text-[#f7ebd2] sm:text-2xl">
                  {hud.bannerTitle}
                </div>
                {hud.bannerSubtitle && (
                  <div className="mt-1 text-xs tracking-wider text-[#d9a84e]">
                    {hud.bannerSubtitle}
                  </div>
                )}
              </div>
            )}

            {hud.ch3ArchiveNamesVisible && (
              <div className="animate-fade-slide-up rounded-xl border border-[#d9a84e]/65 bg-[#0a0d16]/95 px-8 py-5 text-center shadow-2xl">
                <div className="text-[11px] font-semibold tracking-[0.26em] text-[#d9a84e]">
                  ARCHIVE OF READERS · OPENED PAGE
                </div>
                <div className="font-display mt-2 text-2xl font-bold tracking-[0.22em] text-[#fde68a]">
                  NATELEON KENNEDY
                </div>
                <div className="my-1.5 text-xs text-slate-400">&amp;</div>
                <div className="font-display text-xl font-bold tracking-[0.26em] text-[#72efdd]">
                  JAFR
                </div>
                <div className="mt-2 text-[11px] italic text-slate-400">
                  Inscribed within the Living Pages of THE BOOK
                </div>
              </div>
            )}

            {hud.itemToast && (
              <div className="animate-fade-slide-up flex items-center gap-2 rounded-lg border border-[#72efdd]/55 bg-[#09121a]/94 px-4 py-2 text-xs font-semibold tracking-wider text-[#72efdd] shadow-xl">
                <Sparkles className="h-4 w-4" />
                <span>{hud.itemToast}</span>
              </div>
            )}

            {hud.ambientBubble && (
              <div className="animate-fade-slide-up rounded-lg border border-[#72efdd]/35 bg-[#090e16]/92 px-4 py-2 text-center shadow-lg">
                <span className="text-xs font-semibold text-[#72efdd]">
                  {hud.ambientBubble.speaker}:{' '}
                </span>
                <span className="text-xs text-slate-100">
                  &ldquo;{hud.ambientBubble.text}&rdquo;
                </span>
              </div>
            )}

            {hud.dangerousHeightWarning && (
              <div className="rounded-lg border border-rose-500/70 bg-rose-950/92 px-6 py-2.5 text-center shadow-xl">
                <div className="font-display text-sm font-bold tracking-wider text-rose-200">
                  DANGEROUS HEIGHT! PRESS I TO FLY!
                </div>
              </div>
            )}
          </div>

          {/* Bottom Safe-Margin Perimeter: Tutorials, Compact Cinematic Dialogue, Ch4 Hotbar & Prompts */}
          <div className="flex flex-col gap-2.5">
            {/* Tutorials above Bottom Row */}
            {(hud.showFlyingTutorial || hud.showObservationTutorial) && (
              <div className="flex flex-col items-center gap-2">
                {hud.showFlyingTutorial && (
                  <div className="w-full max-w-sm rounded-lg border border-[#72efdd]/45 bg-[#090f18]/94 px-5 py-3.5 shadow-2xl">
                    <div className="font-display text-xs font-semibold tracking-wider text-[#72efdd]">
                      FLYING CONTROLS
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-slate-200">
                      <div>
                        <span className="font-mono-num font-semibold text-[#f4e4c2]">Press I</span> – Start / Stop flying
                      </div>
                      <div>
                        <span className="font-mono-num font-semibold text-[#f4e4c2]">UP / DOWN ARROW</span> – Ascend / Descend
                      </div>
                      <div>
                        <span className="font-mono-num font-semibold text-[#f4e4c2]">W / A / S / D</span> – Move while flying
                      </div>
                    </div>
                  </div>
                )}

                {hud.showObservationTutorial && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-[#72efdd]/50 bg-[#090f18]/94 px-4 py-2 text-xs font-semibold tracking-wider text-[#72efdd] shadow-xl">
                    <Eye className="h-4 w-4" />
                    <span>PRESS V TO OBSERVE YOUR SURROUNDINGS</span>
                  </div>
                )}
              </div>
            )}

            {/* Compact Bottom-Anchored Cinematic Dialogue Panel */}
            {hud.dialogue && (
              <div className="pointer-events-auto relative mx-auto w-full max-w-[740px] px-1 pt-4">
                {/* Separated Ornate Speaker Nameplate */}
                <div className="absolute top-0 left-5 z-10 flex items-center gap-2 rounded-md border border-[#d9a84e]/75 bg-[#121927] px-3.5 py-1 shadow-lg">
                  <span className="font-display text-xs font-bold tracking-wider text-[#f7ebd2] sm:text-sm">
                    {hud.dialogue.speaker}
                  </span>
                  {emotionLabel && (
                    <>
                      <span className="text-white/30">·</span>
                      <span className="text-[11px] font-medium text-[#72efdd]">
                        {emotionLabel}
                      </span>
                    </>
                  )}
                </div>

                <div
                  onClick={hud.dialogueCanAdvance ? onAdvanceDialogue : undefined}
                  className={`animate-fade-slide-up rounded-xl border border-[#d9a84e]/55 bg-[#070b12]/92 px-4 pt-5 pb-3.5 shadow-2xl sm:px-5 ${
                    hud.dialogueCanAdvance ? 'cursor-pointer' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <PortraitAvatar
                      portrait={activePortrait}
                      emotion={hud.dialogue.emotion}
                      size="lg"
                      className="mt-0.5 hidden sm:block"
                    />
                    <PortraitAvatar
                      portrait={activePortrait}
                      emotion={hud.dialogue.emotion}
                      size="sm"
                      className="mt-0.5 sm:hidden"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed text-[#f3efe4] sm:text-[15px]">
                        &ldquo;{hud.dialogue.text}&rdquo;
                      </p>
                      {hud.dialogue.note && (
                        <p className="mt-1 text-xs italic text-[#72efdd]">{hud.dialogue.note}</p>
                      )}

                      {hud.dialogue.choices && hud.dialogue.choices.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-2.5">
                          {hud.dialogue.choices.map((ch) => (
                            <button
                              key={ch.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.currentTarget.blur();
                                onSelectDialogueChoice(ch.id);
                              }}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                ch.id === 'proceed_archive'
                                  ? 'bg-[#d9a84e] text-[#090d14] hover:bg-[#e7bd6d]'
                                  : 'border border-[#72efdd]/45 bg-[#0f1926] text-[#72efdd] hover:bg-[#172638]'
                              }`}
                            >
                              {ch.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dialogue Controls Bar: Auto-Dialogue · Skip · Continue >> */}
                  <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-white/10 pt-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.currentTarget.blur();
                          onToggleAutoDialogue();
                        }}
                        className={`rounded border px-2.5 py-1 font-medium transition-colors ${
                          hud.autoDialogue
                            ? 'border-[#72efdd]/70 bg-[#72efdd]/15 text-[#72efdd]'
                            : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {hud.autoDialogue ? 'Auto: ON' : 'Auto'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.currentTarget.blur();
                          onSkipDialogue();
                        }}
                        className="flex items-center gap-1 rounded border border-white/15 bg-white/5 px-2.5 py-1 font-medium text-slate-300 transition-colors hover:border-[#d9a84e]/50 hover:text-[#f4e4c2]"
                      >
                        <SkipForward className="h-3 w-3" />
                        <span>Skip</span>
                      </button>
                    </div>

                    {hud.dialogueCanAdvance ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.currentTarget.blur();
                          onAdvanceDialogue();
                        }}
                        className="flex items-center gap-1 font-semibold tracking-wide text-[#f4e4c2] transition-colors hover:text-[#72efdd]"
                      >
                        <span>Continue (Space)</span>
                        <ChevronsRight className="h-4 w-4 text-[#d9a84e]" />
                      </button>
                    ) : (
                      <span className="text-slate-400">Listening...</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Alignment Row: Left Spacer / Center Action Hotbar / Right Context Prompts */}
            {!hud.dialogue && (
              <div className="flex items-end justify-between gap-3">
                <div className="hidden min-w-[160px] lg:block" />

                {/* Bottom-Center Ch4 Combat Hotbar OR Flat Control Hint Strip */}
                <div className="flex flex-1 flex-col items-center gap-2">
                  {ch4HasCombatGear && (
                    <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-[#d9a84e]/45 bg-[#090d14]/94 px-3 py-2 shadow-2xl">
                      {hud.ch4HasSword && (
                        <button
                          onClick={(e) => {
                            e.currentTarget.blur();
                            onSelectCh4Weapon('sword');
                          }}
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                            hud.ch4ActiveWeapon === 'sword'
                              ? 'border-amber-400 bg-amber-400/20 text-amber-200'
                              : 'border-white/15 bg-[#121925] text-slate-300 hover:border-amber-400/40'
                          }`}
                        >
                          <Swords className="h-3.5 w-3.5 text-amber-300" />
                          <span>[1] Sword</span>
                          {hud.ch4ComboStep > 0 && hud.ch4ActiveWeapon === 'sword' && (
                            <span className="font-mono-num text-[10px] text-[#72efdd]">
                              x{hud.ch4ComboStep}
                            </span>
                          )}
                        </button>
                      )}

                      {hud.ch4HasFireBow && (
                        <button
                          onClick={(e) => {
                            e.currentTarget.blur();
                            onSelectCh4Weapon('fire_bow');
                          }}
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                            hud.ch4ActiveWeapon === 'fire_bow'
                              ? 'border-orange-400 bg-orange-500/20 text-orange-200'
                              : 'border-white/15 bg-[#121925] text-slate-300 hover:border-orange-400/40'
                          }`}
                        >
                          <Flame className="h-3.5 w-3.5 text-orange-400" />
                          <span>[2] Fire Bow</span>
                        </button>
                      )}

                      {hud.ch4HasArcaneBow && (
                        <button
                          onClick={(e) => {
                            e.currentTarget.blur();
                            onSelectCh4Weapon('arcane_bow');
                          }}
                          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                            hud.ch4ActiveWeapon === 'arcane_bow'
                              ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                              : 'border-white/15 bg-[#121925] text-slate-300 hover:border-purple-400/40'
                          }`}
                        >
                          <Sparkles className="h-3.5 w-3.5 text-purple-300" />
                          <span>[3] Arcane Bow</span>
                        </button>
                      )}

                      {hud.ch4HasFireBow && hud.ch4HasArcaneBow && (
                        <button
                          onClick={(e) => {
                            e.currentTarget.blur();
                            onSwitchCh4Bow();
                          }}
                          className="rounded-lg border border-[#72efdd]/40 bg-[#0e1b26] px-2.5 py-1.5 text-xs font-semibold text-[#72efdd] transition-colors hover:bg-[#152938]"
                        >
                          [N] Bow
                        </button>
                      )}

                      {hud.ch4ActiveWeapon !== 'none' && (
                        <button
                          onClick={(e) => {
                            e.currentTarget.blur();
                            onTriggerCh4Attack();
                          }}
                          className="rounded-lg border border-white/25 bg-[#1a2232] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#253147]"
                        >
                          {hud.ch4ActiveWeapon === 'sword' ? 'Strike (R-Click)' : 'Shoot (R-Click)'}
                        </button>
                      )}

                      {hud.ch4HasSword && (
                        <button
                          onMouseDown={() => onTriggerCh4Block(true)}
                          onMouseUp={() => onTriggerCh4Block(false)}
                          onMouseLeave={() => onTriggerCh4Block(false)}
                          onTouchStart={() => onTriggerCh4Block(true)}
                          onTouchEnd={() => onTriggerCh4Block(false)}
                          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                            hud.ch4IsBlocking
                              ? 'border-[#d9a84e] bg-[#d9a84e]/25 text-[#fde68a]'
                              : 'border-white/15 bg-[#121925] text-slate-300 hover:border-[#d9a84e]/50'
                          }`}
                        >
                          <Shield className="h-3.5 w-3.5 text-[#d9a84e]" />
                          <span>[Q] Guard</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.currentTarget.blur();
                          onTriggerCh4Dodge();
                        }}
                        className="flex items-center gap-1 rounded-lg border border-sky-400/35 bg-[#0e1926] px-2.5 py-1.5 text-xs font-semibold text-sky-200 transition-colors hover:bg-[#16273b]"
                      >
                        <Wind className="h-3.5 w-3.5 text-sky-300" />
                        <span>[C] Dodge</span>
                      </button>

                      {quickHealingItem && (
                        <button
                          onClick={(e) => {
                            e.currentTarget.blur();
                            onUseInventoryItem(quickHealingItem.id);
                          }}
                          className="flex items-center gap-1 rounded-lg border border-emerald-400/45 bg-emerald-950/75 px-2.5 py-1.5 text-xs font-semibold text-emerald-200 transition-colors hover:bg-emerald-900/80"
                        >
                          <FlaskConical className="h-3.5 w-3.5 text-[#72efdd]" />
                          <span>
                            {quickHealingItem.name} ({quickHealingItem.quantity})
                          </span>
                        </button>
                      )}
                    </div>
                  )}

                  {showControlsBar && (
                    <div className="hidden rounded-md bg-[#080c12]/88 px-4 py-1.5 text-[11px] text-slate-300 md:block">
                      {hud.chapter === 4
                        ? 'WASD Move · R-Click Combo/Shoot · L-Click Aim · Q Guard · C Dodge · N Switch Bow · V Observe · Tab Bag · J Quests · E Interact'
                        : hud.chapter === 3
                        ? 'WASD Move · Mouse Look · V Observe · Tab Bag · J Quests · E Interact · F Bed · Enter Door · Esc Pause'
                        : hud.chapter === 2
                        ? 'WASD Move · V Observe · Tab Bag · E Interact / Open Box / Portal · F Rest · Enter Door · Esc Pause'
                        : hud.scene === 'scene_3_journey' || hud.scene === 'scene_4_entrance'
                        ? 'WASD Move · Click Viewport or Drag Mouse Look · Shift Run · Space Jump · Esc Pause'
                        : 'I Toggle Flight · Up/Down Altitude · WASD Move · Mouse Look · E Collect · Enter Sit · Esc Pause'}
                    </div>
                  )}

                  {hud.scene === 'scene_1_intro' && (
                    <div className="text-xs text-slate-300/85">Press Space to skip intro</div>
                  )}
                </div>

                {/* Bottom-Right: Contextual Interaction Prompts & Rest Action */}
                <div className="flex min-w-[160px] flex-col items-end gap-2">
                  {hud.isResting && (
                    <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-[#d9a84e]/55 bg-[#0a0f17]/94 px-4 py-2 shadow-xl">
                      <span className="font-mono-num text-xs font-medium text-[#f4e4c2]">
                        Resting ({hud.energy}%)
                      </span>
                      <button
                        onClick={(e) => {
                          e.currentTarget.blur();
                          onStandUpFromRest();
                        }}
                        className="rounded-md bg-[#d9a84e] px-3 py-1 text-xs font-semibold text-[#0a0e14] transition-colors hover:bg-[#e7bd6d]"
                      >
                        Get Up (F)
                      </button>
                    </div>
                  )}

                  {hud.interactionPrompt && (
                    <div className="rounded-lg border border-[#d9a84e]/65 bg-[#090d14]/94 px-4 py-2 shadow-xl">
                      <span className="font-display text-xs font-semibold tracking-wider text-[#f7ebd2] sm:text-sm">
                        [ {hud.interactionPrompt} ]
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chapter 2, 3 & 4 Adventurer Bag Drawer */}
      {inPlay && hud.inventoryOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#06090d]/75 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#d9a84e]/45 bg-[#0d131c] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#f4e4c2]">Adventurer Bag</h3>
                <p className="text-xs text-slate-400">
                  Provisions, relics, and clues collected along the journey
                </p>
              </div>
              <button
                onClick={onToggleInventory}
                className="rounded-md border border-white/15 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10"
              >
                Close (Tab)
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] space-y-2.5 overflow-y-auto pr-1">
              {hud.inventory.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center text-xs text-slate-400">
                  Your bag is currently empty. Search shelters and ruins for items.
                </div>
              ) : (
                hud.inventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#131b27] p-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#0b1018]">
                        {renderItemIcon(item.id)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#f4e4c2]">
                          {item.name}{' '}
                          <span className="font-mono-num text-xs text-[#72efdd]">
                            x{item.quantity}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400">{item.description}</div>
                      </div>
                    </div>
                    {item.energyRestore > 0 ? (
                      <button
                        onClick={() => onUseInventoryItem(item.id)}
                        className="shrink-0 rounded-lg bg-[#72efdd] px-3.5 py-1.5 text-xs font-semibold text-[#09121a] transition-colors hover:bg-[#99f6e4]"
                      >
                        Use (+{item.energyRestore}%)
                      </button>
                    ) : item.id === 'memory_crystal' ? (
                      <button
                        onClick={() => onUseInventoryItem(item.id)}
                        className="shrink-0 rounded-lg bg-[#72efdd] px-3.5 py-1.5 text-xs font-semibold text-[#09121a] transition-colors hover:bg-[#99f6e4]"
                      >
                        Activate
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-md border border-[#d9a84e]/45 bg-[#d9a84e]/15 px-3 py-1.5 text-[11px] font-semibold text-[#f4e4c2]">
                        Relic
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chapter 3 Interactive Three Memory Stones Puzzle Modal */}
      {inPlay && hud.memoryPuzzle?.open && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#06090d]/82 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-[#72efdd]/45 bg-[#0c121c] p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.2em] text-[#72efdd]">
                  ANCIENT MECHANISM · THREE MEMORY STONES
                </div>
                <h3 className="font-display mt-1 text-2xl font-bold text-[#f7ebd2]">
                  Align Sun, Moon &amp; Star
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Gather all 3 symbol fragments from the Whispering Woods ruins, then rotate each dial to 0° Dawn.
                </p>
              </div>
              <button
                onClick={onClosePuzzle}
                className="rounded-md border border-white/15 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
              >
                Close (Esc)
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {(
                [
                  {
                    idx: 0 as const,
                    id: 'sun' as const,
                    name: 'Sun Stone',
                    clue: 'The Sun remembers the beginning.',
                    color: 'text-amber-300 border-amber-400/40',
                    icon: <Sun className="h-6 w-6 text-amber-300" />,
                  },
                  {
                    idx: 1 as const,
                    id: 'moon' as const,
                    name: 'Moon Stone',
                    clue: 'The Moon remembers the silence.',
                    color: 'text-sky-300 border-sky-400/40',
                    icon: <Moon className="h-6 w-6 text-sky-300" />,
                  },
                  {
                    idx: 2 as const,
                    id: 'star' as const,
                    name: 'Star Stone',
                    clue: 'The Star remembers the way home.',
                    color: 'text-[#72efdd] border-[#72efdd]/40',
                    icon: <Star className="h-6 w-6 text-[#72efdd]" />,
                  },
                ] as const
              ).map((st) => {
                const hasFrag = hud.memoryPuzzle!.fragments.includes(st.id);
                const rot = hud.memoryPuzzle!.rotations[st.idx];
                const deg = rot * 90;
                const aligned = hasFrag && rot === 0;
                return (
                  <div
                    key={st.id}
                    className={`flex flex-col items-center rounded-xl border bg-[#121a28] p-4 text-center ${st.color}`}
                  >
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/15 bg-[#090e16] transition-transform duration-300"
                      style={{ transform: `rotate(${deg}deg)` }}
                    >
                      {st.icon}
                    </div>
                    <div className="font-display mt-3 text-sm font-bold text-[#f4e4c2]">{st.name}</div>
                    <p className="mt-1 text-[11px] italic text-slate-300">&ldquo;{st.clue}&rdquo;</p>
                    <div className="mt-2 font-mono-num text-[11px]">
                      {hasFrag ? (
                        <span className={aligned ? 'font-semibold text-emerald-300' : 'text-[#72efdd]'}>
                          {aligned ? 'Aligned · 0° Dawn' : `Dial Angle: ${deg}°`}
                        </span>
                      ) : (
                        <span className="text-amber-300">Fragment Missing in Ruins</span>
                      )}
                    </div>
                    <button
                      onClick={() => onRotatePuzzleStone(st.idx)}
                      disabled={!hasFrag}
                      className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        hasFrag
                          ? 'bg-[#1c283b] text-[#f4e4c2] hover:bg-[#263750]'
                          : 'cursor-not-allowed bg-white/5 text-slate-500'
                      }`}
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      <span>Rotate 90°</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {hud.memoryPuzzle.feedback && (
              <div className="mt-4 rounded-lg border border-amber-400/50 bg-amber-950/40 px-4 py-2 text-center text-xs text-amber-200">
                {hud.memoryPuzzle.feedback}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                onClick={onClosePuzzle}
                className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10"
              >
                Leave Mechanism
              </button>
              <button
                onClick={onConfirmPuzzle}
                className="rounded-lg bg-[#72efdd] px-5 py-2 text-xs font-bold text-[#081218] transition-colors hover:bg-[#99f6e4]"
              >
                Attune Memory Stones
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter 3 / Chapter 4 Quest Log Modal */}
      {inPlay && hud.questLogOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#06090d]/80 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#72efdd]/45 bg-[#0c121c] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#f4e4c2]">
                  {hud.chapter === 4 ? 'Chapter 4 · Pelicon War Journal' : 'Chapter 3 · Story Journal'}
                </h3>
                <p className="text-xs text-slate-400">
                  {hud.chapter === 4
                    ? 'The War of Pelicon Desert (Quests 1–12)'
                    : 'The House of Forgotten Secrets (Acts 1–10)'}
                </p>
              </div>
              <button
                onClick={onToggleQuestLog}
                className="rounded-md border border-white/15 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10"
              >
                Close (J)
              </button>
            </div>

            <div className="mt-4 max-h-[65vh] space-y-2 overflow-y-auto pr-1">
              {hud.ch3Quests.map((q) => (
                <div
                  key={q.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    q.status === 'active'
                      ? 'border-[#72efdd]/55 bg-[#122030]'
                      : q.status === 'completed'
                      ? 'border-emerald-500/25 bg-[#0e1821]'
                      : 'border-white/5 bg-[#0b0f17] opacity-60'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {q.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : q.status === 'active' ? (
                      <Circle className="h-4 w-4 text-[#72efdd]" />
                    ) : (
                      <Lock className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#f4e4c2]">
                      {hud.chapter === 4 ? `Quest ${q.id}` : `Act ${q.id}`}: {q.title}
                    </div>
                    {q.detail && <div className="mt-0.5 text-[11px] text-slate-400">{q.detail}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chapter 3 Black Envelope & Forgotten Letter Modal */}
      {inPlay && hud.letterOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#06090d]/82 p-4">
          <div
            className={`w-full max-w-lg rounded-xl border p-7 shadow-2xl ${
              hud.letterOpen.goldenSymbol
                ? 'border-[#d9a84e]/75 bg-[#0c0e15]'
                : 'border-[#d9a84e]/60 bg-[#12161f]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#d9a84e]">
                <ScrollText className="h-4 w-4" />
                <span>{hud.letterOpen.goldenSymbol ? 'BLACK ENVELOPE · GOLDEN SEAL' : 'MORNING LETTER'}</span>
              </div>
              {hud.letterOpen.goldenSymbol && (
                <svg viewBox="0 0 40 40" className="h-9 w-9 text-[#fbbf24]" aria-hidden="true">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2" />
                  <polygon points="20,7 24,17 34,20 24,23 20,33 16,23 6,20 16,17" fill="currentColor" opacity="0.85" />
                </svg>
              )}
            </div>
            <h3 className="font-display mt-2 text-2xl font-bold text-[#f7ebd2]">
              {hud.letterOpen.title}
            </h3>
            <div className="mt-1 text-xs text-[#72efdd]">From: {hud.letterOpen.sender}</div>
            <div className="my-4 h-px w-full bg-[#d9a84e]/35" />
            <div className="space-y-3 text-sm leading-relaxed text-slate-100">
              {hud.letterOpen.body.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
            <p className="mt-5 text-sm font-semibold italic text-[#d9a84e]">{hud.letterOpen.footer}</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={onCloseLetterModal}
                className="rounded-lg bg-[#d9a84e] px-5 py-2 text-xs font-bold tracking-wide text-[#090d12] transition-colors hover:bg-[#e7bd6d]"
              >
                Continue (Space / E)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter 2 & 3 Rest / Sleep Selection Modal */}
      {inPlay && hud.restModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#06090d]/75 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#d9a84e]/45 bg-[#0d131c] p-6 shadow-2xl">
            <div className="text-xs font-semibold tracking-[0.2em] text-[#d9a84e]">
              FIRST RESTING POINT
            </div>
            <h3 className="font-display mt-1 text-2xl font-bold text-[#f7ebd2]">
              Old Wooden Bed
            </h3>
            <p className="mt-1.5 text-xs text-slate-300">
              Choose how Nate and Jafr should recover inside the shelter.
            </p>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => onSelectRestOption('rest')}
                className="flex w-full items-center gap-3.5 rounded-lg border border-white/15 bg-[#131b27] p-4 text-left transition-colors hover:border-[#72efdd]/60 hover:bg-[#182231]"
              >
                <Sun className="h-5 w-5 shrink-0 text-[#72efdd]" />
                <div>
                  <div className="text-sm font-semibold text-[#f4e4c2]">A. REST</div>
                  <div className="text-xs text-slate-400">
                    Sit on the bed and steadily recover energy. Stand up anytime.
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectRestOption('sleep')}
                className="flex w-full items-center gap-3.5 rounded-lg border border-[#d9a84e]/45 bg-[#171d29] p-4 text-left transition-colors hover:border-[#d9a84e] hover:bg-[#1e2636]"
              >
                <Moon className="h-5 w-5 shrink-0 text-[#d9a84e]" />
                <div>
                  <div className="text-sm font-semibold text-[#f4e4c2]">B. SLEEP</div>
                  <div className="text-xs text-slate-400">
                    Sleep peacefully until morning, restore 100% energy &amp; save Checkpoint.
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Menu Overlay */}
      {hud.mode === 'paused' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#06090d]/85 p-4">
          <div className="w-full max-w-sm rounded-xl border border-[#d9a84e]/40 bg-[#0d131c] p-6 text-center shadow-2xl">
            <div className="text-xs tracking-[0.2em] text-[#d9a84e]">PAUSED</div>
            <h2 className="font-display mt-1 text-2xl font-bold text-[#f7ebd2]">THE BOOK</h2>

            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={onResume}
                className="w-full rounded-lg bg-[#d9a84e] px-4 py-2.5 text-sm font-semibold text-[#0a0e14] transition-colors hover:bg-[#e7bd6d]"
              >
                Resume Game
              </button>
              <button
                onClick={onRestartCheckpoint}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
              >
                Restart Latest Checkpoint
              </button>
              <button
                onClick={onOpenControls}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
              >
                Controls
              </button>
              <button
                onClick={onOpenSettings}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
              >
                Settings
              </button>
              <button
                onClick={onReturnTitle}
                className="w-full rounded-lg border border-rose-500/30 bg-rose-950/30 px-4 py-2.5 text-sm font-medium text-rose-200 transition-colors hover:bg-rose-950/50"
              >
                Return to Title
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {hud.mode === 'gameover' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#06090d]/88 p-4">
          <div className="w-full max-w-md rounded-xl border border-rose-500/45 bg-[#110d13] p-7 text-center shadow-2xl">
            <div className="text-xs font-semibold tracking-[0.2em] text-rose-400">
              {hud.chapter === 4 ? 'FALLEN IN BATTLE' : 'FALL HAZARD'}
            </div>
            <h2 className="font-display mt-2 text-3xl font-bold text-[#f7ebd2]">
              Nate Has Fallen
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {hud.gameOverReason || 'You fell from a dangerous height inside the Ench Library.'}
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button
                onClick={onRestartCheckpoint}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#d9a84e] px-5 py-2.5 text-sm font-semibold text-[#0a0e14] transition-colors hover:bg-[#e7bd6d]"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Restart Checkpoint</span>
              </button>
              <button
                onClick={onReturnTitle}
                className="flex-1 rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
              >
                Title Screen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter 1 Completion Screen */}
      {hud.mode === 'complete' && hud.chapter === 1 && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#05070b] p-6">
          <div className="animate-fade-slide-up w-full max-w-xl rounded-2xl border border-[#d9a84e]/45 bg-[#0c111a] p-8 text-center shadow-2xl sm:p-10">
            <div className="text-xs font-semibold tracking-[0.28em] text-[#d9a84e]">
              A NUBLIX ORIGINAL GAME
            </div>
            <h1 className="font-display mt-2 text-4xl font-bold tracking-wider text-[#f7ebd2] sm:text-5xl">
              THE BOOK
            </h1>
            <div className="mx-auto my-5 h-px w-32 bg-[#d9a84e]/40" />
            <div className="font-display text-lg font-semibold tracking-widest text-[#72efdd]">
              CHAPTER 1 COMPLETED
            </div>
            <div className="mt-1 text-sm text-slate-300">Quest: Finding W Book.</div>
            <p className="mt-5 text-sm leading-relaxed text-slate-400">
              Pulled beyond the Ench Library into the luminous pages of the mysterious tome, Nate and Jafr awaken inside an unknown world.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3">
              <button
                onClick={onStartChapter2}
                className="rounded-lg bg-[#72efdd] px-6 py-3 text-sm font-bold tracking-wide text-[#081218] transition-colors hover:bg-[#99f6e4]"
              >
                Continue to Chapter 2: The Unknown World
              </button>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={onReplayChapter}
                  className="flex-1 rounded-lg bg-[#d9a84e] px-5 py-2.5 text-sm font-semibold text-[#0a0e14] transition-colors hover:bg-[#e7bd6d]"
                >
                  Replay Chapter 1
                </button>
                <button
                  onClick={onReturnTitle}
                  className="flex-1 rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
                >
                  Return to Title
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter 2 Portal Completion OR Morning Checkpoint Screen */}
      {hud.mode === 'complete' && hud.chapter === 2 && (
        hud.ch2PortalCompleted ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#05070b] p-6">
            <div className="animate-fade-slide-up w-full max-w-xl rounded-2xl border border-[#d9a84e]/50 bg-[#0c111a] p-8 text-center shadow-2xl sm:p-10">
              <div className="text-xs font-semibold tracking-[0.28em] text-[#d9a84e]">
                THE BOOK
              </div>
              <h1 className="font-display mt-2 text-3xl font-bold tracking-wider text-[#f7ebd2] sm:text-4xl">
                CHAPTER 2 COMPLETED
              </h1>
              <div className="mt-1 font-display text-sm font-semibold tracking-[0.2em] text-[#72efdd]">
                THE UNKNOWN WORLD
              </div>

              <div className="mx-auto my-6 h-px w-36 bg-[#d9a84e]/40" />

              <div className="text-xs font-semibold tracking-[0.24em] text-slate-400">
                NEXT CHAPTER
              </div>
              <h2 className="font-display mt-1.5 text-xl font-bold tracking-wide text-[#f4e4c2] sm:text-2xl">
                CHAPTER 3 – THE HOUSE OF FORGOTTEN SECRETS
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Drawn through the ancient stone gateway with Jafr clinging to his shoulder, Nate steps toward a quiet manor shrouded in mist and unspoken memories.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3">
                <button
                  onClick={onStartChapter3}
                  className="rounded-lg bg-[#72efdd] px-6 py-3 text-sm font-bold tracking-wide text-[#081218] transition-colors hover:bg-[#99f6e4]"
                >
                  Start Chapter 3
                </button>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    onClick={onStartChapter2}
                    className="flex-1 rounded-lg bg-[#d9a84e] px-5 py-2.5 text-sm font-semibold text-[#0a0e14] transition-colors hover:bg-[#e7bd6d]"
                  >
                    Replay Chapter 2
                  </button>
                  <button
                    onClick={onReturnTitle}
                    className="flex-1 rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
                  >
                    Return to Title
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#05070b]/85 p-6">
            <div className="animate-fade-slide-up w-full max-w-xl rounded-2xl border border-[#d9a84e]/45 bg-[#0c111a] p-8 text-center shadow-2xl sm:p-10">
              <div className="text-xs font-semibold tracking-[0.28em] text-[#d9a84e]">
                CHECKPOINT REACHED · GAME SAVED
              </div>
              <h1 className="font-display mt-2 text-4xl font-bold tracking-wider text-[#f7ebd2] sm:text-5xl">
                THE BOOK
              </h1>
              <div className="mx-auto my-5 h-px w-32 bg-[#d9a84e]/40" />
              <div className="font-display text-lg font-semibold tracking-widest text-[#72efdd]">
                CHAPTER 2 · FIRST NIGHT SURVIVED
              </div>
              <div className="mt-1 text-sm text-slate-300">
                Morning has dawned over the Unknown Island. Shelter secured &amp; Energy 100%.
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Nate and Jafr have safely rested inside the mountain house with supplies gathered. Step outside into the morning light to uncover the secrets nearby.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={onContinueMorning}
                  className="flex-1 rounded-lg bg-[#72efdd] px-6 py-2.5 text-sm font-bold text-[#081218] transition-colors hover:bg-[#99f6e4]"
                >
                  Continue Morning Exploration
                </button>
                <button
                  onClick={onReturnTitle}
                  className="flex-1 rounded-lg border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
                >
                  Return to Title
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* Chapter 3 Completion Screen */}
      {hud.mode === 'complete' && hud.chapter === 3 && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#05070b] p-6">
          <div className="animate-fade-slide-up w-full max-w-xl rounded-2xl border border-[#d9a84e]/50 bg-[#0c111a] p-8 text-center shadow-2xl sm:p-10">
            <div className="font-display text-xs font-semibold tracking-[0.26em] text-[#72efdd]">
              THE FIRST WORLD HAS REMEMBERED YOU.
            </div>
            <h1 className="font-display mt-3 text-4xl font-bold tracking-wider text-[#f7ebd2] sm:text-5xl">
              THE BOOK
            </h1>
            <div className="mx-auto my-5 h-px w-32 bg-[#d9a84e]/40" />
            <div className="font-display text-lg font-semibold tracking-widest text-[#d9a84e]">
              CHAPTER 3 COMPLETED
            </div>
            <div className="mt-1 text-base font-semibold text-[#f4e4c2]">
              THE HOUSE OF FORGOTTEN SECRETS
            </div>
            <div className="mt-5 rounded-lg border border-[#72efdd]/30 bg-[#101826] px-4 py-3 text-xs font-semibold tracking-[0.18em] text-[#72efdd]">
              NEXT: CHAPTER 4 – THE WAR OF PELICON DESERT
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3">
              <button
                onClick={onStartChapter4}
                className="rounded-lg bg-[#72efdd] px-6 py-3 text-sm font-bold tracking-wide text-[#081218] transition-colors hover:bg-[#99f6e4]"
              >
                Begin Chapter 4 – Pelicon Desert
              </button>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={onStartChapter3}
                  className="flex-1 rounded-lg bg-[#d9a84e] px-5 py-2.5 text-sm font-semibold text-[#0a0e14] transition-colors hover:bg-[#e7bd6d]"
                >
                  Replay Chapter 3
                </button>
                <button
                  onClick={onReturnTitle}
                  className="flex-1 rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
                >
                  Return to Title
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter 4 Completion Screen */}
      {hud.mode === 'complete' && hud.chapter === 4 && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#05070b] p-6">
          <div className="animate-fade-slide-up w-full max-w-xl rounded-2xl border border-[#d9a84e]/55 bg-[#0c111a] p-8 text-center shadow-2xl sm:p-10">
            <div className="font-display text-xs font-semibold tracking-[0.26em] text-[#72efdd]">
              PELICON KINGDOM SAVED · GOLDEN MAGIC AWAKENED
            </div>
            <h1 className="font-display mt-3 text-4xl font-bold tracking-wider text-[#f7ebd2] sm:text-5xl">
              THE BOOK
            </h1>
            <div className="mx-auto my-5 h-px w-32 bg-[#d9a84e]/40" />
            <div className="font-display text-lg font-semibold tracking-widest text-[#d9a84e]">
              CHAPTER 4 COMPLETED
            </div>
            <div className="mt-1 text-base font-semibold text-[#f4e4c2]">
              THE WAR OF PELICON DESERT
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              United with Princess Eita Yusa, Jafr, and Sneh beneath the twilight sky, Nate gazes toward a mysterious ruined church shimmering in the distance.
            </p>
            <div className="mt-5 rounded-lg border border-[#d9a84e]/40 bg-[#17120a] px-4 py-3 text-xs font-semibold tracking-[0.18em] text-[#fde68a]">
              NEXT: CHAPTER 5 – FINDING AGNES&apos;S CHURCH
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={onStartChapter4}
                className="flex-1 rounded-lg bg-[#d9a84e] px-5 py-2.5 text-sm font-semibold text-[#0a0e14] transition-colors hover:bg-[#e7bd6d]"
              >
                Replay Chapter 4
              </button>
              <button
                onClick={onReturnTitle}
                className="flex-1 rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
              >
                Return to Title
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
