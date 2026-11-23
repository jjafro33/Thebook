import React, { useEffect, useState } from 'react';
import { Check, Keyboard, RotateCcw, Sliders, Volume2, VolumeX, X } from 'lucide-react';
import {
  CHAPTER_1_SCENES,
  CHAPTER_2_SCENES,
  CHAPTER_3_SCENES,
  CHAPTER_4_SCENES,
  DEFAULT_KEY_BINDINGS,
  DEFAULT_SETTINGS,
  type GameSettings,
  type KeyBindings,
  type SaveProgress,
  type SceneId,
} from '../game/types';

function formatKeyLabel(code: string): string {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code === 'Space') return 'Space';
  if (code === 'Tab') return 'Tab';
  return code;
}

const KEY_ACTION_LABELS: { key: keyof KeyBindings; label: string; desc: string }[] = [
  { key: 'interact', label: 'Interact / Collect', desc: 'Pick up books, open chests, investigate portals' },
  { key: 'observe', label: 'Observation Mode', desc: 'Reveal footprints, clues, and landmarks (Ch. 2–4)' },
  { key: 'bag', label: 'Adventurer Bag', desc: 'Open inventory & restorative items (Ch. 2–4)' },
  { key: 'quests', label: 'Quest Journal', desc: 'View chapter quest checklist (Ch. 3–4)' },
  { key: 'guard', label: 'Sword Guard / Block', desc: 'Deflect incoming strikes in combat (Ch. 4)' },
  { key: 'dodge', label: 'Dodge-Dash', desc: 'Quick evasive dash in combat (Ch. 4)' },
];

interface SettingsModalProps {
  settings: GameSettings;
  onChange: (next: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onChange,
  onClose,
}) => {
  const [tab, setTab] = useState<'graphics' | 'audio' | 'controls'>('graphics');
  const [draft, setDraft] = useState<GameSettings>({
    ...DEFAULT_SETTINGS,
    ...settings,
    keyBindings: { ...DEFAULT_KEY_BINDINGS, ...(settings.keyBindings ?? {}) },
  });
  const [rebindingAction, setRebindingAction] = useState<keyof KeyBindings | null>(null);
  const [appliedBanner, setAppliedBanner] = useState(false);

  useEffect(() => {
    if (!rebindingAction) return;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        setRebindingAction(null);
        return;
      }
      setDraft((prev) => ({
        ...prev,
        keyBindings: {
          ...prev.keyBindings,
          [rebindingAction]: e.code,
        },
      }));
      setRebindingAction(null);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [rebindingAction]);

  const handleApply = () => {
    onChange(draft);
    setAppliedBanner(true);
    window.setTimeout(() => setAppliedBanner(false), 1800);
  };

  const handleReset = () => {
    const fresh: GameSettings = {
      ...DEFAULT_SETTINGS,
      keyBindings: { ...DEFAULT_KEY_BINDINGS },
    };
    setDraft(fresh);
    onChange(fresh);
    setAppliedBanner(true);
    window.setTimeout(() => setAppliedBanner(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04070e]/88 p-4">
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-xl border border-[#d9a84e]/45 bg-[#0c1322] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Sliders className="h-5 w-5 text-[#d9a84e]" />
            <div>
              <h2 className="font-display text-xl font-semibold tracking-wider text-[#f4e4c2]">
                SETTINGS
              </h2>
              <p className="text-xs text-slate-400">
                Configure display performance, audio channels &amp; key bindings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="mt-4 flex gap-2 border-b border-white/10 pb-3">
          {(
            [
              { id: 'graphics', label: 'Graphics' },
              { id: 'audio', label: 'Audio' },
              { id: 'controls', label: 'Controls' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setRebindingAction(null);
                setTab(item.id);
              }}
              className={`rounded-lg px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors ${
                tab === item.id
                  ? 'bg-[#d9a84e] text-[#090d16]'
                  : 'border border-white/15 bg-[#121b2e] text-slate-300 hover:border-[#d9a84e]/40 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="mt-5 flex-1 space-y-5 overflow-y-auto pr-1 text-sm">
          {tab === 'graphics' && (
            <>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-slate-100">Resolution Target</div>
                  <div className="text-xs text-slate-400">Render scaling cap across displays</div>
                </div>
                <div className="flex rounded-lg border border-white/15 bg-[#080d18] p-1">
                  {(['native', '1080p', '1440p', '2160p'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setDraft({ ...draft, resolutionScale: res })}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium uppercase transition-colors ${
                        draft.resolutionScale === res
                          ? 'bg-[#d9a84e] text-[#090d16]'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-slate-100">Display Mode</div>
                  <div className="text-xs text-slate-400">Switch between windowed or full-screen</div>
                </div>
                <div className="flex rounded-lg border border-white/15 bg-[#080d18] p-1">
                  {(['windowed', 'fullscreen'] as const).map((dm) => (
                    <button
                      key={dm}
                      onClick={() => setDraft({ ...draft, displayMode: dm })}
                      className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                        draft.displayMode === dm
                          ? 'bg-[#d9a84e] text-[#090d16]'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {dm}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-slate-100">VSync</div>
                  <div className="text-xs text-slate-400">Synchronize frames to display refresh rate</div>
                </div>
                <button
                  onClick={() => setDraft({ ...draft, vsync: !draft.vsync })}
                  className={`rounded-lg border px-4 py-1.5 text-xs font-semibold transition-colors ${
                    draft.vsync
                      ? 'border-[#d9a84e] bg-[#d9a84e]/20 text-[#f4e4c2]'
                      : 'border-white/15 bg-white/5 text-slate-400'
                  }`}
                >
                  {draft.vsync ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-slate-100">Overall Graphics Preset</div>
                  <div className="text-xs text-slate-400">Balance crisp detail and smooth framerate</div>
                </div>
                <div className="flex rounded-lg border border-white/15 bg-[#080d18] p-1">
                  {(['high', 'balanced'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setDraft({ ...draft, graphicsQuality: q })}
                      className={`rounded-md px-3.5 py-1 text-xs font-medium capitalize transition-colors ${
                        draft.graphicsQuality === q
                          ? 'bg-[#d9a84e] text-[#090d16]'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-slate-100">Shadow Quality</div>
                  <div className="text-xs text-slate-400">Dynamic sunlight &amp; sanctuary shadows</div>
                </div>
                <div className="flex rounded-lg border border-white/15 bg-[#080d18] p-1">
                  {(['ultra', 'high', 'medium'] as const).map((sq) => (
                    <button
                      key={sq}
                      onClick={() => setDraft({ ...draft, shadowQuality: sq })}
                      className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                        draft.shadowQuality === sq
                          ? 'bg-[#d9a84e] text-[#090d16]'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {sq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-slate-100">Texture Detail</div>
                  <div className="text-xs text-slate-400">Material sharpness on architecture &amp; robes</div>
                </div>
                <div className="flex rounded-lg border border-white/15 bg-[#080d18] p-1">
                  {(['ultra', 'high', 'medium'] as const).map((tq) => (
                    <button
                      key={tq}
                      onClick={() => setDraft({ ...draft, textureQuality: tq })}
                      className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                        draft.textureQuality === tq
                          ? 'bg-[#d9a84e] text-[#090d16]'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {tq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-slate-100">Effects &amp; Atmospheric Bloom</div>
                  <div className="text-xs text-slate-400">Arcane glow, dust particles &amp; post-processing</div>
                </div>
                <div className="flex rounded-lg border border-white/15 bg-[#080d18] p-1">
                  {(['ultra', 'high', 'medium'] as const).map((eq) => (
                    <button
                      key={eq}
                      onClick={() => setDraft({ ...draft, effectsQuality: eq })}
                      className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                        draft.effectsQuality === eq
                          ? 'bg-[#d9a84e] text-[#090d16]'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === 'audio' && (
            <>
              {(
                [
                  { key: 'masterVolume', label: 'Master Volume' },
                  { key: 'musicVolume', label: 'Orchestral & Ambient Music' },
                  { key: 'sfxVolume', label: 'Sound Effects & Environment' },
                  { key: 'dialogueVolume', label: 'Dialogue & Voice Cues' },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-slate-100">{label}</span>
                    <span className="font-mono-num text-xs font-semibold text-[#d9a84e]">
                      {Math.round(draft[key] * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft({ ...draft, [key]: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#d9a84e]"
                  />
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <div className="font-medium text-slate-100">Audio Output</div>
                  <div className="text-xs text-slate-400">Silence all channels immediately</div>
                </div>
                <button
                  onClick={() => setDraft({ ...draft, muted: !draft.muted })}
                  className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-100 transition-colors hover:bg-white/10"
                >
                  {draft.muted ? (
                    <>
                      <VolumeX className="h-4 w-4 text-amber-400" />
                      <span>Muted</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 text-emerald-400" />
                      <span>Active</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {tab === 'controls' && (
            <>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-slate-100">Mouse Look Sensitivity</span>
                  <span className="font-mono-num text-xs font-semibold text-[#d9a84e]">
                    {draft.mouseSensitivity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={2.2}
                  step={0.1}
                  value={draft.mouseSensitivity}
                  onChange={(e) =>
                    setDraft({ ...draft, mouseSensitivity: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#d9a84e]"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-100">Invert Camera Y-Axis</span>
                <button
                  onClick={() => setDraft({ ...draft, invertY: !draft.invertY })}
                  className={`rounded-lg border px-4 py-1.5 text-xs font-semibold transition-colors ${
                    draft.invertY
                      ? 'border-[#d9a84e] bg-[#d9a84e]/20 text-[#f4e4c2]'
                      : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {draft.invertY ? 'Inverted' : 'Standard'}
                </button>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-[#d9a84e] uppercase">
                  <Keyboard className="h-4 w-4" />
                  <span>Key Remapping</span>
                </div>
                <div className="space-y-2">
                  {KEY_ACTION_LABELS.map((item) => {
                    const active = rebindingAction === item.key;
                    return (
                      <div
                        key={item.key}
                        className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#111a2d] px-3.5 py-2.5"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-100">{item.label}</div>
                          <div className="text-[11px] text-slate-400">{item.desc}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRebindingAction(active ? null : item.key)}
                          className={`font-mono-num min-w-[92px] rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            active
                              ? 'border-[#72efdd] bg-[#72efdd]/15 text-[#72efdd]'
                              : 'border-[#d9a84e]/40 bg-[#090e19] text-[#f4e4c2] hover:border-[#d9a84e]'
                          }`}
                        >
                          {active ? 'Press Key...' : formatKeyLabel(draft.keyBindings[item.key])}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions: Reset / Apply / Back */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-white/30 hover:bg-white/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2.5">
            {appliedBanner && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                <span>Applied</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleApply}
              className="rounded-lg border border-[#d9a84e] bg-[#d9a84e]/20 px-4 py-2 text-xs font-semibold text-[#f4e4c2] transition-colors hover:bg-[#d9a84e]/35"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#d9a84e] px-5 py-2 text-xs font-semibold text-[#0a0f16] transition-colors hover:bg-[#e7bd6d]"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ControlsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const groundControls = [
    ['W / A / S / D', 'Move Nate'],
    ['Mouse (Click or Drag)', 'Rotate Camera'],
    ['Shift', 'Run (when rested)'],
    ['Space', 'Jump / Advance Dialogue'],
    ['E', 'Interact / Open Box / Investigate Portal'],
    ['Enter', 'Enter Door / Sit on Chair'],
    ['ESC', 'Pause Menu'],
  ];

  const adventureControls = [
    ['V', 'Observation Mode (Ch. 2–4)'],
    ['F', 'Rest / Sleep at Bed (Ch. 2 & 3)'],
    ['Tab', 'Open Adventurer Bag (Ch. 2–4)'],
    ['J', 'Open Quest Tracker (Ch. 3 & 4)'],
    ['Right Click', '3-Hit Sword Combo / Shoot Arrow (Ch. 4)'],
    ['Left Click', 'Aim Bow & Zoom (Ch. 4)'],
    ['Q (Hold)', 'Block / Guard Incoming Strikes (Ch. 4)'],
    ['C', 'Dodge-Dash (Ch. 4)'],
    ['N / 1 / 2 / 3', 'Switch Bows / Weapons (Ch. 4)'],
    ['I / Up / Down', 'Fly & Altitude Control (Ch. 1)'],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04070e]/88 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#d9a84e]/35 bg-[#0c1322] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="font-display text-xl font-semibold tracking-wide text-[#f4e4c2]">
            Controls
          </h2>
          <button
            onClick={onClose}
            aria-label="Close controls"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-[#d9a84e]">
              Exploration
            </h3>
            <div className="space-y-2.5 text-xs">
              {groundControls.map(([k, desc]) => (
                <div key={k} className="flex items-center justify-between gap-2 border-b border-white/5 pb-1.5">
                  <span className="text-slate-300">{desc}</span>
                  <span className="font-mono-num shrink-0 font-semibold text-[#f4e4c2]">{k}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-[#72efdd]">
              Survival &amp; Combat
            </h3>
            <div className="space-y-2.5 text-xs">
              {adventureControls.map(([k, desc]) => (
                <div key={k} className="flex items-center justify-between gap-2 border-b border-white/5 pb-1.5">
                  <span className="text-slate-300">{desc}</span>
                  <span className="font-mono-num shrink-0 font-semibold text-[#72efdd]">{k}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              In Chapter 2, Nate begins exhausted—use Observation Mode (V) to spot shelter and recover energy by eating supplies or resting.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#d9a84e] px-5 py-2 text-sm font-semibold text-[#0a0f16] transition-colors hover:bg-[#e7bd6d]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface ChapterSelectModalProps {
  onSelectScene: (scene: SceneId) => void;
  onClose: () => void;
}

export const ChapterSelectModal: React.FC<ChapterSelectModalProps> = ({
  onSelectScene,
  onClose,
}) => {
  const [tab, setTab] = useState<1 | 2 | 3 | 4>(1);
  const scenes =
    tab === 1
      ? CHAPTER_1_SCENES
      : tab === 2
      ? CHAPTER_2_SCENES
      : tab === 3
      ? CHAPTER_3_SCENES
      : CHAPTER_4_SCENES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04070e]/88 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-[#d9a84e]/35 bg-[#0c1322] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-wide text-[#f4e4c2]">
              Chapter &amp; Scene Selection
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Jump directly into any Chapter 1, Chapter 2, Chapter 3, or Chapter 4 scene
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close chapter select"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setTab(1)}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              tab === 1
                ? 'bg-[#d9a84e] text-[#0a0e14]'
                : 'border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Ch. 1 · Finding W Book
          </button>
          <button
            onClick={() => setTab(2)}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              tab === 2
                ? 'bg-[#72efdd] text-[#081218]'
                : 'border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Ch. 2 · Unknown World
          </button>
          <button
            onClick={() => setTab(3)}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              tab === 3
                ? 'bg-[#c084fc] text-[#0b0714]'
                : 'border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Ch. 3 · Forgotten Secrets
          </button>
          <button
            onClick={() => setTab(4)}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              tab === 4
                ? 'bg-[#f59e0b] text-[#0c0802]'
                : 'border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Ch. 4 · Pelicon Desert
          </button>
        </div>

        <div className="mt-4 grid gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
          {scenes.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onSelectScene(sc.id)}
              className="group rounded-lg border border-white/10 bg-[#11192b] p-3.5 text-left transition-colors hover:border-[#d9a84e]/60 hover:bg-[#182238]"
            >
              <div
                className={`text-xs font-medium ${
                  tab === 4
                    ? 'text-[#f59e0b]'
                    : tab === 3
                    ? 'text-[#c084fc]'
                    : tab === 2
                    ? 'text-[#72efdd]'
                    : 'text-[#d9a84e]'
                }`}
              >
                {sc.number}
              </div>
              <div className="font-display mt-0.5 text-sm font-semibold text-[#f4e4c2] group-hover:text-white">
                {sc.title}
              </div>
              <div className="mt-1 text-xs text-slate-400">{sc.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04070e]/90 p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-[#d9a84e]/45 bg-[#0b1120] p-7 text-center shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close credits"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Celestial SVG Emblem */}
        <svg
          width="68"
          height="68"
          viewBox="0 0 68 68"
          fill="none"
          aria-hidden="true"
          className="mx-auto mb-3"
        >
          <circle cx="34" cy="34" r="30" stroke="#D9A84E" strokeOpacity="0.4" strokeWidth="1" />
          <circle
            cx="34"
            cy="34"
            r="23"
            stroke="#F4D57B"
            strokeOpacity="0.7"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <path
            d="M34 20C27 17 19 17 13 20V46C19 43 27 43 34 46.5C41 43 49 43 55 46V20C49 17 41 17 34 20Z"
            stroke="#F4D57B"
            strokeWidth="1.8"
            fill="rgba(217,168,78,0.12)"
          />
          <path d="M34 20V46.5" stroke="#D9A84E" strokeWidth="1.4" />
        </svg>

        <h2 className="font-display bg-gradient-to-b from-[#fff3c4] via-[#e4b354] to-[#a8711c] bg-clip-text text-3xl font-bold tracking-[0.22em] text-transparent">
          THE BOOK
        </h2>
        <p className="mt-1 text-xs font-medium tracking-[0.24em] text-[#f4e4c2]/90 uppercase">
          A Fantasy Adventure Game
        </p>

        <div className="my-5 flex items-center gap-3">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#d9a84e]/60" />
          <span className="text-[11px] text-[#d9a84e]">✦</span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#d9a84e]/60" />
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.22em] text-[#d9a84e] uppercase">
              Studio &amp; Technology
            </div>
            <div className="font-display mt-1 text-base font-semibold tracking-wider text-white">
              MADE WITH NUBLIX TECH
            </div>
            <div className="text-xs text-slate-400">Developed by Nublix Tech</div>
          </div>

          <div className="grid gap-3 border-t border-white/10 pt-4 text-xs sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-[#10182b] p-3">
              <div className="font-semibold tracking-wider text-[#f4e4c2] uppercase">
                Story &amp; Chapters
              </div>
              <p className="mt-1 text-slate-400">
                Chapters 1–4: The Enchantable Island, Unknown World, House of Forgotten Secrets &amp; War of Pelicon Desert
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#10182b] p-3">
              <div className="font-semibold tracking-wider text-[#72efdd] uppercase">
                Companions &amp; Cast
              </div>
              <p className="mt-1 text-slate-400">
                Nateleon Kennedy, Jafr, Princess Eita Yusa, Sneh, Lumi, Orvellan &amp; Mother
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#d9a84e] px-6 py-2 text-xs font-semibold tracking-wider text-[#090d16] uppercase transition-colors hover:bg-[#e7bd6d]"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

interface NewGameConfirmModalProps {
  existingSave: SaveProgress | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const NewGameConfirmModal: React.FC<NewGameConfirmModalProps> = ({
  existingSave,
  onConfirm,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04070e]/90 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#d9a84e]/45 bg-[#0c1322] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="font-display text-xl font-semibold tracking-wider text-[#f4e4c2]">
            BEGIN CHAPTER 1
          </h2>
          <button
            onClick={onClose}
            aria-label="Close new game confirmation"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <p>
            Step into <span className="font-semibold text-[#f4e4c2]">Brook Village</span> on The Enchantable Island as Nateleon Kennedy and his loyal snail companion Jafr.
          </p>
          {existingSave && (
            <div className="rounded-lg border border-amber-400/35 bg-amber-950/35 p-3 text-xs text-amber-200">
              An active save exists at <span className="font-semibold">Chapter {existingSave.chapter}</span>. Starting a new adventure will replace your saved checkpoint once you reach Chapter 1’s next checkpoint.
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-[#d9a84e] px-5 py-2 text-xs font-semibold tracking-wider text-[#090d16] uppercase shadow-lg transition-colors hover:bg-[#e7bd6d]"
          >
            Start Adventure
          </button>
        </div>
      </div>
    </div>
  );
};

interface ExitConfirmModalProps {
  onReturnMenu: () => void;
  onReplayIntro: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  onReturnMenu,
  onReplayIntro,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#03050c]/95 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#d9a84e]/40 bg-[#0b1120] p-7 text-center shadow-2xl">
        <div className="font-display text-xs font-semibold tracking-[0.26em] text-[#d9a84e] uppercase">
          THE BOOK · SANCTUARY REST
        </div>
        <h2 className="font-display mt-2 text-2xl font-semibold text-[#f4e4c2]">
          Closing the Tome
        </h2>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          Your progress is stored safely in this world’s ledger. May the pages keep your story safe until you return.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={onReturnMenu}
            className="w-full rounded-lg bg-[#d9a84e] px-5 py-2.5 text-xs font-semibold tracking-wider text-[#090d16] uppercase transition-colors hover:bg-[#e7bd6d]"
          >
            Return to Main Menu
          </button>
          <button
            onClick={onReplayIntro}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold tracking-wider text-slate-200 uppercase transition-colors hover:border-[#d9a84e]/45 hover:bg-white/10"
          >
            Replay Cinematic Intro
          </button>
        </div>
      </div>
    </div>
  );
};
