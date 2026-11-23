export type ChapterNumber = 1 | 2 | 3 | 4;

export type SceneId =
  | 'title'
  | 'scene_1_intro'
  | 'scene_2_mission'
  | 'scene_3_journey'
  | 'scene_4_entrance'
  | 'scene_5_library_cinematic'
  | 'scene_6_flying_tutorial'
  | 'scene_7_find_book'
  | 'scene_8_flying_chair'
  | 'scene_9_finale'
  | 'chapter_complete'
  | 'ch2_scene_1_seashore'
  | 'ch2_scene_2_jafr_reveal'
  | 'ch2_scene_3_explore'
  | 'ch2_scene_4_house_interior'
  | 'ch2_scene_5_supply_box'
  | 'ch2_scene_6_rest_sleep'
  | 'ch2_scene_7_portal'
  | 'ch2_complete'
  | 'ch3_scene_1_arrival'
  | 'ch3_scene_2_whispering_woods'
  | 'ch3_scene_elarion'
  | 'ch3_scene_3_silent_bells'
  | 'ch3_complete'
  | 'ch4_scene_1_arrival'
  | 'ch4_scene_2_battlefield'
  | 'ch4_scene_3_castle_interior'
  | 'ch4_scene_4_pelicon_town'
  | 'ch4_complete';

export type GameMode = 'title' | 'playing' | 'paused' | 'gameover' | 'complete';

export type DialogueEmotion =
  | 'happy'
  | 'concerned'
  | 'surprised'
  | 'calm'
  | 'sad'
  | 'angry'
  | 'curious'
  | 'emotional';

export type PortraitId =
  | 'nate'
  | 'mother'
  | 'eita'
  | 'jafr'
  | 'sneh'
  | 'orvellan'
  | 'lumi'
  | 'warrior'
  | 'villager';

export interface DialogueChoice {
  id: string;
  label: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  note?: string;
  emotion?: DialogueEmotion;
  portrait?: PortraitId;
  choices?: DialogueChoice[];
}

export type IntroStage =
  | 'intro_dark'
  | 'intro_library'
  | 'intro_book'
  | 'intro_title'
  | 'intro_close'
  | 'menu';

export interface KeyBindings {
  interact: string;
  observe: string;
  bag: string;
  quests: string;
  guard: string;
  dodge: string;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  dialogueVolume: number;
  muted: boolean;
  mouseSensitivity: number;
  invertY: boolean;
  graphicsQuality: 'high' | 'balanced';
  resolutionScale: 'native' | '1080p' | '1440p' | '2160p';
  displayMode: 'windowed' | 'fullscreen';
  vsync: boolean;
  shadowQuality: 'ultra' | 'high' | 'medium';
  textureQuality: 'ultra' | 'high' | 'medium';
  effectsQuality: 'ultra' | 'high' | 'medium';
  keyBindings: KeyBindings;
}

export type InventoryItemId =
  | 'energy_tonic'
  | 'fruit'
  | 'broken_compass'
  | 'old_wooden_toy'
  | 'torn_blue_fabric'
  | 'small_silver_key'
  | 'memory_crystal'
  | 'memory_stone'
  | 'golden_gate_key'
  | 'pelicon_sword'
  | 'fire_bow'
  | 'arcane_bow'
  | 'pelicon_emblem'
  | 'eita_journal';

export interface InventoryItem {
  id: InventoryItemId;
  name: string;
  description: string;
  quantity: number;
  energyRestore: number;
}

export interface Ch2StoryFlags {
  houseDiscovered: boolean;
  insideHouse: boolean;
  boxOpened: boolean;
  itemsCollected: boolean;
  sleptOnce: boolean;
  firstCheckpointSaved: boolean;
  observationUsed: boolean;
  portalDiscovered: boolean;
  portalInvestigated: boolean;
  portalEntered: boolean;
}

export type Ch3SubZone = 'tunnel' | 'house_interior' | 'surface' | 'elarion' | 'valley';

export interface Ch3StoryFlags {
  subZone: Ch3SubZone;
  act: number; // 0: arrival, 1..10: Acts 1-10
  portalSequenceDone: boolean;
  sleptInHouse: boolean;
  knockInvestigated: boolean;
  doorOpenedOnce: boolean;
  letterCollected: boolean;
  letterRead: boolean;
  clockTriggered: boolean;
  footprintsDiscovered: boolean;
  observationUsedCh3: boolean;
  collectedOptionalIds: string[]; // broken_compass, old_wooden_toy, torn_blue_fabric, small_silver_key
  whisperHeard: boolean;
  signRead: boolean;
  lumiMet: boolean;
  collectedFragments: ('sun' | 'moon' | 'star')[];
  stoneRotations: [number, number, number]; // 0..3 steps for Sun, Moon, Star
  stonesSolved: boolean;
  memoryCrystalObtained: boolean;
  memoryStonesCollected: number;
  collectedStoneIds: string[];
  elarionEntered: boolean;
  inspectedElarionIds: string[];
  statueMemoryViewed: boolean;
  orvellanMet: boolean;
  orvellanAskedTopics: string[];
  archiveEntered: boolean;
  readerNamesRevealed: boolean;
  warningTriggered: boolean;
  gateKeyObtained: boolean;
  escapeActive: boolean;
  escapeBellsRung: number;
  escapeSwitchIds: string[];
  northernGateOpened: boolean;
  bellsAwakened: boolean;
  elarionRevealed: boolean;
  orvellanConfronted: boolean;
}

export type Ch4SubZone = 'tunnel' | 'desert' | 'castle_interior';
export type Ch4WeaponMode = 'none' | 'sword' | 'fire_bow' | 'arcane_bow';

export interface Ch4StoryFlags {
  subZone: Ch4SubZone;
  act: number; // 1..12
  arrivalDone: boolean;
  woundedWarriorDone: boolean;
  swordCollected: boolean;
  wallCleared: boolean;
  fireBowCollected: boolean;
  marketCleared: boolean;
  arcaneBowUnlocked: boolean;
  castleRoadCleared: boolean;
  victoryAchieved: boolean;
  balconyEitaSeen: boolean;
  castleEntered: boolean;
  eitaRoomEntered: boolean;
  reunionDone: boolean;
  powerAwakened: boolean;
  eitaCompanionActive: boolean;
  castleEscaped: boolean;
  townCelebrated: boolean;
  outskirtsReached: boolean;
  activeWeapon: Ch4WeaponMode;
}

export interface MemoryPuzzleUiState {
  open: boolean;
  fragments: ('sun' | 'moon' | 'star')[];
  rotations: [number, number, number]; // target index is 0 for each aligned stone
  solved: boolean;
  feedback: string | null;
}

export interface Ch3QuestEntry {
  id: number;
  title: string;
  status: 'completed' | 'active' | 'locked';
  detail?: string;
}

export interface SaveProgress {
  version: 3;
  chapter: ChapterNumber;
  checkpointScene: SceneId;
  chapter1Completed: boolean;
  chapter2Completed: boolean;
  chapter3Completed: boolean;
  chapter4Completed?: boolean;
  timestamp: number;
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

export interface ObservationMarker {
  id: string;
  label: string;
  x: number; // normalized 0..1 screen X
  y: number; // normalized 0..1 screen Y
  distance: number;
}

export interface LetterModalContent {
  title: string;
  sender: string;
  body: string[];
  footer: string;
  goldenSymbol?: boolean;
}

export interface MinimapMarker {
  id: string;
  kind: 'quest' | 'enemy' | 'ally' | 'landmark' | 'portal';
  label: string;
  dx: number;
  dz: number;
}

export interface MinimapState {
  x: number;
  z: number;
  yaw: number;
  scale: number;
  markers: MinimapMarker[];
}

export interface HudState {
  mode: GameMode;
  scene: SceneId;
  chapter: ChapterNumber;
  questTitle: string;
  questSubtitle: string;
  distanceMeters: number | null;
  altitudeMeters: number | null;
  isFlying: boolean;
  dangerousHeightWarning: boolean;
  interactionPrompt: string | null;
  interactionKey: 'ENTER' | 'E' | 'I' | 'F' | 'V' | null;
  bannerTitle: string | null;
  bannerSubtitle: string | null;
  dialogue: DialogueLine | null;
  dialogueCanAdvance: boolean;
  autoDialogue: boolean;
  ambientBubble: DialogueLine | null;
  showFlyingTutorial: boolean;
  showObservationTutorial: boolean;
  observationMode: boolean;
  observationMarkers: ObservationMarker[];
  energy: number;
  stamina: number;
  isExhausted: boolean;
  inventory: InventoryItem[];
  inventoryOpen: boolean;
  itemToast: string | null;
  jafrStatus: string | null;
  restModalOpen: boolean;
  isResting: boolean;
  isSleeping: boolean;
  letterOpen: LetterModalContent | null;
  memoryPuzzle: MemoryPuzzleUiState | null;
  questLogOpen: boolean;
  ch3Quests: Ch3QuestEntry[];
  ch2PortalCompleted: boolean;
  ch3MemoryStones: number;
  ch3HasGateKey: boolean;
  ch3HasMemoryCrystal: boolean;
  ch3BellCount: number;
  ch3SubZoneLabel: string | null;
  ch3ArchiveNamesVisible: boolean;
  ch4Health: number;
  ch4ActiveWeapon: Ch4WeaponMode;
  ch4HasSword: boolean;
  ch4HasFireBow: boolean;
  ch4HasArcaneBow: boolean;
  ch4IsAiming: boolean;
  ch4IsBlocking: boolean;
  ch4ComboStep: number;
  ch4EnemiesRemaining: number;
  ch4SubZoneLabel: string | null;
  ch4SnehStatus: string | null;
  ch4EitaCompanion: boolean;
  minimap: MinimapState | null;
  timeOfDayLabel: string | null;
  saveStatus: 'idle' | 'saving' | 'saved';
  fadeAlpha: number;
  whiteFadeAlpha: number;
  portalGlowAlpha: number;
  pointerLocked: boolean;
  gameOverReason: string | null;
  introStage: IntroStage;
  introElapsed: number;
}

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  interact: 'KeyE',
  observe: 'KeyV',
  bag: 'Tab',
  quests: 'KeyJ',
  guard: 'KeyQ',
  dodge: 'KeyC',
};

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.75,
  musicVolume: 0.8,
  sfxVolume: 0.85,
  dialogueVolume: 0.9,
  muted: false,
  mouseSensitivity: 1.0,
  invertY: false,
  graphicsQuality: 'high',
  resolutionScale: 'native',
  displayMode: 'windowed',
  vsync: true,
  shadowQuality: 'high',
  textureQuality: 'high',
  effectsQuality: 'high',
  keyBindings: { ...DEFAULT_KEY_BINDINGS },
};

export const DEFAULT_CH2_FLAGS: Ch2StoryFlags = {
  houseDiscovered: false,
  insideHouse: false,
  boxOpened: false,
  itemsCollected: false,
  sleptOnce: false,
  firstCheckpointSaved: false,
  observationUsed: false,
  portalDiscovered: false,
  portalInvestigated: false,
  portalEntered: false,
};

export const DEFAULT_CH3_FLAGS: Ch3StoryFlags = {
  subZone: 'tunnel',
  act: 0,
  portalSequenceDone: false,
  sleptInHouse: false,
  knockInvestigated: false,
  doorOpenedOnce: false,
  letterCollected: false,
  letterRead: false,
  clockTriggered: false,
  footprintsDiscovered: false,
  observationUsedCh3: false,
  collectedOptionalIds: [],
  whisperHeard: false,
  signRead: false,
  lumiMet: false,
  collectedFragments: [],
  stoneRotations: [2, 1, 3],
  stonesSolved: false,
  memoryCrystalObtained: false,
  memoryStonesCollected: 0,
  collectedStoneIds: [],
  elarionEntered: false,
  inspectedElarionIds: [],
  statueMemoryViewed: false,
  orvellanMet: false,
  orvellanAskedTopics: [],
  archiveEntered: false,
  readerNamesRevealed: false,
  warningTriggered: false,
  gateKeyObtained: false,
  escapeActive: false,
  escapeBellsRung: 0,
  escapeSwitchIds: [],
  northernGateOpened: false,
  bellsAwakened: false,
  elarionRevealed: false,
  orvellanConfronted: false,
};

export const DEFAULT_CH4_FLAGS: Ch4StoryFlags = {
  subZone: 'tunnel',
  act: 1,
  arrivalDone: false,
  woundedWarriorDone: false,
  swordCollected: false,
  wallCleared: false,
  fireBowCollected: false,
  marketCleared: false,
  arcaneBowUnlocked: false,
  castleRoadCleared: false,
  victoryAchieved: false,
  balconyEitaSeen: false,
  castleEntered: false,
  eitaRoomEntered: false,
  reunionDone: false,
  powerAwakened: false,
  eitaCompanionActive: false,
  castleEscaped: false,
  townCelebrated: false,
  outskirtsReached: false,
  activeWeapon: 'none',
};

export interface ChapterSceneMeta {
  id: SceneId;
  number: string;
  title: string;
  description: string;
}

export const CHAPTER_1_SCENES: ChapterSceneMeta[] = [
  {
    id: 'scene_1_intro',
    number: 'Scene 1',
    title: 'Brook Village',
    description: 'Cinematic arrival across the Enchantable Island.',
  },
  {
    id: 'scene_2_mission',
    number: 'Scene 2',
    title: "Nate's Mission",
    description: "Receive Sensei's request inside Nate's cottage.",
  },
  {
    id: 'scene_3_journey',
    number: 'Scene 3',
    title: 'The 1 km Journey',
    description: 'Travel along the guided valley trail to the Ench Library.',
  },
  {
    id: 'scene_4_entrance',
    number: 'Scene 4',
    title: 'Ench Library Gates',
    description: 'Stand before the grand enchanted library entrance.',
  },
  {
    id: 'scene_5_library_cinematic',
    number: 'Scene 5',
    title: 'Inside the Ench Library',
    description: 'Explore the soaring circular rotunda and floating tiers.',
  },
  {
    id: 'scene_6_flying_tutorial',
    number: 'Scene 6',
    title: 'Flight Awakening',
    description: 'Master magical flight inside the library.',
  },
  {
    id: 'scene_7_find_book',
    number: 'Scene 7',
    title: 'The Mysterious Tome',
    description: 'Ascend to collect the glowing book for Sensei.',
  },
  {
    id: 'scene_8_flying_chair',
    number: 'Scene 8',
    title: 'The Flying Chair',
    description: 'Take a seat above the rotunda to inspect the book.',
  },
  {
    id: 'scene_9_finale',
    number: 'Scene 9',
    title: 'The Wrong Book',
    description: 'Witness the portal awakening inside THE BOOK.',
  },
];

export const CHAPTER_2_SCENES: ChapterSceneMeta[] = [
  {
    id: 'ch2_scene_1_seashore',
    number: 'Scene 1',
    title: 'The Unknown Seashore',
    description: 'Awaken upon a mysterious coastline inside THE BOOK.',
  },
  {
    id: 'ch2_scene_2_jafr_reveal',
    number: 'Scene 2',
    title: "Jafr's Reveal",
    description: 'Jafr emerges from the Universal Snail Pocket.',
  },
  {
    id: 'ch2_scene_3_explore',
    number: 'Scene 3',
    title: 'The Mountain Path',
    description: 'Follow the winding coastal bridges and stone steps to the mountain house.',
  },
  {
    id: 'ch2_scene_4_house_interior',
    number: 'Scene 4',
    title: 'Abandoned Mountain House',
    description: 'Step inside the weathered shelter before nightfall.',
  },
  {
    id: 'ch2_scene_5_supply_box',
    number: 'Scene 5',
    title: 'Searching for Supplies',
    description: 'Open the wooden supply box to gather provisions.',
  },
  {
    id: 'ch2_scene_6_rest_sleep',
    number: 'Scene 6',
    title: 'First Resting Point',
    description: 'Rest or sleep until morning and save your checkpoint.',
  },
  {
    id: 'ch2_scene_7_portal',
    number: 'Scene 7',
    title: 'The Mountain Gateway',
    description: 'Discover, investigate, and enter the ancient portal beside the house.',
  },
];

export const CHAPTER_3_SCENES: ChapterSceneMeta[] = [
  {
    id: 'ch3_scene_1_arrival',
    number: 'Acts 1–2',
    title: 'Portal Arrival & The Black Letter',
    description: 'Arrive through the tunnel of light, wake to knocking, and discover glowing footprints.',
  },
  {
    id: 'ch3_scene_2_whispering_woods',
    number: 'Acts 3–4',
    title: 'Whispering Woods & Memory Stones',
    description: 'Meet Lumi, gather the Sun, Moon, and Star fragments, and unlock the hidden descent.',
  },
  {
    id: 'ch3_scene_elarion',
    number: 'Acts 5–9',
    title: 'Elarion, Orvellan & The 7th Bell Escape',
    description: 'Uncover the forgotten city, meet the Last Keeper, learn the Reader secret, and escape.',
  },
  {
    id: 'ch3_scene_3_silent_bells',
    number: 'Act 10',
    title: 'The Valley of Silent Bells',
    description: 'Step beyond the Northern Gate toward the towering library of books.',
  },
];

export const CHAPTER_4_SCENES: ChapterSceneMeta[] = [
  {
    id: 'ch4_scene_1_arrival',
    number: 'Act 1',
    title: 'Arrival in Pelicon Desert',
    description: 'The golden Book transports Nate and Jafr from Silent Bells to Pelicon Desert.',
  },
  {
    id: 'ch4_scene_2_battlefield',
    number: 'Acts 2–6',
    title: 'Battlefield of Pelicon',
    description: 'Master the Warrior Sword & Magical Bows, liberate the Castle Road, and spot Eita.',
  },
  {
    id: 'ch4_scene_3_castle_interior',
    number: 'Acts 7–10',
    title: 'Pelicon Castle & Reunion',
    description: 'Reunite with Princess Eita & Sneh, awaken hidden magic, and escape the castle.',
  },
  {
    id: 'ch4_scene_4_pelicon_town',
    number: 'Acts 11–12',
    title: 'Celebrating Town & Desert Outskirts',
    description: "Celebrate with Pelicon's citizens and glimpse Agnes's Church at sunset.",
  },
];

