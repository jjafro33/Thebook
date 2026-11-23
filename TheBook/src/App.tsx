import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHUD } from './components/GameHUD';
import { IntroSequenceOverlay } from './components/IntroSequenceOverlay';
import {
  ChapterSelectModal,
  ControlsModal,
  CreditsModal,
  ExitConfirmModal,
  NewGameConfirmModal,
  SettingsModal,
} from './components/Modals';
import { TitleScreen } from './components/TitleScreen';
import { GameEngine, type SaveCheckpointPayload } from './game/GameEngine';
import {
  DEFAULT_CH2_FLAGS,
  DEFAULT_CH3_FLAGS,
  DEFAULT_CH4_FLAGS,
  DEFAULT_KEY_BINDINGS,
  DEFAULT_SETTINGS,
  type GameSettings,
  type HudState,
  type SaveProgress,
  type SceneId,
} from './game/types';

const SETTINGS_KEY = 'nublix_thebook_settings_v1';
const SAVE_KEY = 'nublix_thebook_save_v1';

const INITIAL_HUD: HudState = {
  mode: 'title',
  scene: 'title',
  chapter: 1,
  questTitle: '',
  questSubtitle: '',
  distanceMeters: null,
  altitudeMeters: null,
  isFlying: false,
  dangerousHeightWarning: false,
  interactionPrompt: null,
  interactionKey: null,
  bannerTitle: null,
  bannerSubtitle: null,
  dialogue: null,
  dialogueCanAdvance: false,
  autoDialogue: false,
  ambientBubble: null,
  showFlyingTutorial: false,
  showObservationTutorial: false,
  observationMode: false,
  observationMarkers: [],
  energy: 100,
  stamina: 100,
  isExhausted: false,
  inventory: [],
  inventoryOpen: false,
  itemToast: null,
  jafrStatus: null,
  restModalOpen: false,
  isResting: false,
  isSleeping: false,
  letterOpen: null,
  memoryPuzzle: null,
  questLogOpen: false,
  ch3Quests: [],
  ch2PortalCompleted: false,
  ch3MemoryStones: 0,
  ch3HasGateKey: false,
  ch3HasMemoryCrystal: false,
  ch3BellCount: 0,
  ch3SubZoneLabel: null,
  ch3ArchiveNamesVisible: false,
  ch4Health: 100,
  ch4ActiveWeapon: 'none',
  ch4HasSword: false,
  ch4HasFireBow: false,
  ch4HasArcaneBow: false,
  ch4IsAiming: false,
  ch4IsBlocking: false,
  ch4ComboStep: 0,
  ch4EnemiesRemaining: 0,
  ch4SubZoneLabel: null,
  ch4SnehStatus: null,
  ch4EitaCompanion: false,
  minimap: null,
  timeOfDayLabel: null,
  saveStatus: 'idle',
  fadeAlpha: 0,
  whiteFadeAlpha: 0,
  portalGlowAlpha: 0,
  pointerLocked: false,
  gameOverReason: null,
  introStage: 'intro_dark',
  introElapsed: 0,
};

function loadStoredSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      keyBindings: {
        ...DEFAULT_KEY_BINDINGS,
        ...(parsed.keyBindings ?? {}),
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function loadStoredSave(): SaveProgress | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SaveProgress>;
    if (!parsed.checkpointScene) return null;
    const chapter =
      parsed.chapter ??
      (parsed.checkpointScene.startsWith('ch4_')
        ? 4
        : parsed.checkpointScene.startsWith('ch3_')
        ? 3
        : parsed.checkpointScene.startsWith('ch2_')
        ? 2
        : 1);
    return {
      version: 3,
      chapter,
      checkpointScene: parsed.checkpointScene,
      chapter1Completed: Boolean(parsed.chapter1Completed),
      chapter2Completed: Boolean(parsed.chapter2Completed),
      chapter3Completed: Boolean(parsed.chapter3Completed),
      chapter4Completed: Boolean(parsed.chapter4Completed),
      timestamp: parsed.timestamp ?? Date.now(),
      distanceRemaining: parsed.distanceRemaining ?? 0,
      playerPosition: parsed.playerPosition ?? null,
      playerYaw: parsed.playerYaw,
      energy: parsed.energy,
      timeOfDay: parsed.timeOfDay,
      inventory: parsed.inventory,
      storyFlags: payloadFlags(parsed.storyFlags, DEFAULT_CH2_FLAGS),
      ch3Flags: payloadFlags(parsed.ch3Flags, DEFAULT_CH3_FLAGS),
      ch4Flags: payloadFlags(parsed.ch4Flags, DEFAULT_CH4_FLAGS),
    };
  } catch {
    return null;
  }
}

function payloadFlags<T extends object>(saved: T | undefined, defaults: T): T | undefined {
  return saved ? { ...defaults, ...saved } : undefined;
}

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [settings, setSettings] = useState<GameSettings>(loadStoredSettings);
  const [save, setSave] = useState<SaveProgress | null>(loadStoredSave);
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);
  const [modal, setModal] = useState<
    'none' | 'settings' | 'controls' | 'chapters' | 'credits' | 'new_game' | 'exit'
  >('none');

  const handleSaveCheckpoint = useCallback((payload: SaveCheckpointPayload) => {
    setSave((prev) => {
      const nextSave: SaveProgress = {
        version: 3,
        chapter: payload.chapter,
        checkpointScene: payload.checkpointScene,
        chapter1Completed: payload.chapter1Completed || Boolean(prev?.chapter1Completed),
        chapter2Completed: payload.chapter2Completed || Boolean(prev?.chapter2Completed),
        chapter3Completed: payload.chapter3Completed || Boolean(prev?.chapter3Completed),
        chapter4Completed: payload.chapter4Completed || Boolean(prev?.chapter4Completed),
        timestamp: Date.now(),
        distanceRemaining: payload.distanceRemaining,
        playerPosition: payload.playerPosition ?? null,
        playerYaw: payload.playerYaw,
        energy: payload.energy,
        timeOfDay: payload.timeOfDay,
        inventory: payload.inventory,
        storyFlags: payload.storyFlags,
        ch3Flags: payload.ch3Flags,
        ch4Flags: payload.ch4Flags,
      };
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(nextSave));
      } catch {
        // Ignore storage quota errors
      }
      return nextSave;
    });
  }, []);

  // Close open modals on Escape before GameEngine toggles pause
  useEffect(() => {
    if (modal === 'none') return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.stopImmediatePropagation();
        e.preventDefault();
        setModal('none');
      }
    };
    window.addEventListener('keydown', onEsc, true);
    return () => window.removeEventListener('keydown', onEsc, true);
  }, [modal]);

  // Mount Three.js engine once in isolated container
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const engine = new GameEngine(
      container,
      settings,
      (nextHud) => setHud(nextHud),
      handleSaveCheckpoint
    );
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateSettings = useCallback((next: GameSettings) => {
    setSettings(next);
    engineRef.current?.updateSettings(next);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    handleUpdateSettings({ ...settings, muted: !settings.muted });
  }, [settings, handleUpdateSettings]);

  const handleNewGameConfirm = useCallback(() => {
    engineRef.current?.playMenuClick();
    setModal('none');
    engineRef.current?.startNewGame();
  }, []);

  const handleStartChapter2 = useCallback(() => {
    setModal('none');
    engineRef.current?.startChapter2();
  }, []);

  const handleStartChapter3 = useCallback(() => {
    setModal('none');
    engineRef.current?.startChapter3FromPortal();
  }, []);

  const handleStartChapter4 = useCallback(() => {
    setModal('none');
    engineRef.current?.startChapter4FromValley();
  }, []);

  const handleContinue = useCallback((saved: SaveProgress) => {
    engineRef.current?.playMenuClick();
    setModal('none');
    engineRef.current?.loadSceneFromCheckpoint(saved.checkpointScene, saved);
  }, []);

  const handleSelectScene = useCallback((scene: SceneId) => {
    engineRef.current?.playMenuClick();
    setModal('none');
    engineRef.current?.loadSceneFromCheckpoint(scene, null);
  }, []);

  const openMenuModal = useCallback(
    (next: 'settings' | 'controls' | 'chapters' | 'credits' | 'new_game' | 'exit') => {
      engineRef.current?.playMenuClick();
      setModal(next);
    },
    []
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#050811]">
      {/* Isolated WebGL mount container */}
      <div ref={mountRef} className="absolute inset-0 h-full w-full" />

      {/* Opening Cinematic Sequence Overlay (~17.5s) */}
      {hud.mode === 'title' && hud.introStage !== 'menu' && (
        <IntroSequenceOverlay
          stage={hud.introStage}
          elapsed={hud.introElapsed}
          onSkip={() => engineRef.current?.skipTitleIntro()}
          onUnlockAudio={() => engineRef.current?.unlockAudio()}
        />
      )}

      {/* Full-Screen Interactive Main Menu */}
      {hud.mode === 'title' && hud.introStage === 'menu' && (
        <TitleScreen
          save={save}
          muted={settings.muted}
          modalOpen={modal !== 'none'}
          onNewGame={() => openMenuModal('new_game')}
          onContinue={handleContinue}
          onOpenChapters={() => openMenuModal('chapters')}
          onOpenSettings={() => openMenuModal('settings')}
          onOpenCredits={() => openMenuModal('credits')}
          onOpenExit={() => openMenuModal('exit')}
          onReplayIntro={() => {
            setModal('none');
            engineRef.current?.replayTitleIntro();
          }}
          onToggleMute={handleToggleMute}
          onHoverItem={() => engineRef.current?.playMenuHover()}
        />
      )}

      {/* Active Gameplay / Cutscene / Pause / Victory HUD */}
      <GameHUD
        hud={hud}
        settings={settings}
        onToggleMute={handleToggleMute}
        onPause={() => engineRef.current?.setPaused(true)}
        onResume={() => engineRef.current?.setPaused(false)}
        onRestartCheckpoint={() => engineRef.current?.restartLatestCheckpoint()}
        onOpenControls={() => setModal('controls')}
        onOpenSettings={() => setModal('settings')}
        onReturnTitle={() => engineRef.current?.returnToTitle()}
        onReplayChapter={handleNewGameConfirm}
        onAdvanceDialogue={() => engineRef.current?.advanceDialogue()}
        onToggleAutoDialogue={() => engineRef.current?.toggleAutoDialogue()}
        onSkipDialogue={() => engineRef.current?.skipDialogueSequence()}
        onToggleObservation={() => engineRef.current?.toggleObservationMode()}
        onStartChapter2={handleStartChapter2}
        onStartChapter3={handleStartChapter3}
        onStartChapter4={handleStartChapter4}
        onSelectCh4Weapon={(w) => engineRef.current?.selectCh4Weapon(w)}
        onSwitchCh4Bow={() => engineRef.current?.switchCh4Bow()}
        onTriggerCh4Attack={() => engineRef.current?.triggerCh4PrimaryAttack()}
        onTriggerCh4Block={(active) => engineRef.current?.triggerCh4Block(active)}
        onTriggerCh4Dodge={() => engineRef.current?.triggerCh4Dodge()}
        onToggleInventory={() => engineRef.current?.toggleInventory()}
        onUseInventoryItem={(id) => engineRef.current?.useInventoryItem(id)}
        onSelectRestOption={(opt) => engineRef.current?.selectRestOption(opt)}
        onStandUpFromRest={() => engineRef.current?.standUpFromRest()}
        onContinueMorning={() => engineRef.current?.continueMorningExploration()}
        onCloseLetterModal={() => engineRef.current?.closeLetterModal()}
        onSelectDialogueChoice={(choiceId) => engineRef.current?.selectDialogueChoice(choiceId)}
        onRotatePuzzleStone={(index) => engineRef.current?.rotateMemoryPuzzleStone(index)}
        onConfirmPuzzle={() => engineRef.current?.confirmMemoryPuzzle()}
        onClosePuzzle={() => engineRef.current?.closeMemoryPuzzle()}
        onToggleQuestLog={() => engineRef.current?.toggleQuestLog()}
      />

      {/* Modals */}
      {modal === 'settings' && (
        <SettingsModal
          settings={settings}
          onChange={handleUpdateSettings}
          onClose={() => setModal('none')}
        />
      )}
      {modal === 'controls' && <ControlsModal onClose={() => setModal('none')} />}
      {modal === 'chapters' && (
        <ChapterSelectModal
          onSelectScene={handleSelectScene}
          onClose={() => setModal('none')}
        />
      )}
      {modal === 'credits' && <CreditsModal onClose={() => setModal('none')} />}
      {modal === 'new_game' && (
        <NewGameConfirmModal
          existingSave={save}
          onConfirm={handleNewGameConfirm}
          onClose={() => setModal('none')}
        />
      )}
      {modal === 'exit' && (
        <ExitConfirmModal
          onReturnMenu={() => {
            engineRef.current?.playMenuClick();
            setModal('none');
          }}
          onReplayIntro={() => {
            setModal('none');
            engineRef.current?.replayTitleIntro();
          }}
        />
      )}
    </div>
  );
}
