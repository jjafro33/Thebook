import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Film, Volume2, VolumeX } from 'lucide-react';
import type { SaveProgress } from '../game/types';

interface TitleScreenProps {
  save: SaveProgress | null;
  muted: boolean;
  modalOpen: boolean;
  onNewGame: () => void;
  onContinue: (save: SaveProgress) => void;
  onOpenChapters: () => void;
  onOpenSettings: () => void;
  onOpenCredits: () => void;
  onOpenExit: () => void;
  onReplayIntro: () => void;
  onToggleMute: () => void;
  onHoverItem: () => void;
}

function describeSave(save: SaveProgress): string {
  const chLabel = `Chapter ${save.chapter}`;
  if (save.chapter === 4) {
    return `${chLabel} · ${save.chapter4Completed ? 'Pelicon Outskirts' : 'War of Pelicon Desert'}`;
  }
  if (save.chapter === 3) {
    return `${chLabel} · ${save.chapter3Completed ? 'Valley of Silent Bells' : 'House of Secrets'}`;
  }
  if (save.chapter === 2) {
    return `${chLabel} · ${save.chapter2Completed ? 'Morning Portal' : 'The Unknown World'}`;
  }
  return `${chLabel} · Finding W Book`;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  save,
  muted,
  modalOpen,
  onNewGame,
  onContinue,
  onOpenChapters,
  onOpenSettings,
  onOpenCredits,
  onOpenExit,
  onReplayIntro,
  onToggleMute,
  onHoverItem,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(save ? 1 : 0);
  const [noSaveNotice, setNoSaveNotice] = useState(false);

  const menuItems = useMemo(
    () => [
      {
        id: 'new_game',
        label: 'NEW GAME',
        sub: 'Begin Chapter 1 · The Enchantable Island',
        disabled: false,
      },
      {
        id: 'continue',
        label: 'CONTINUE',
        sub: save ? describeSave(save) : 'No saved journey found yet',
        disabled: !save,
      },
      {
        id: 'chapters',
        label: 'CHAPTER SELECT',
        sub: 'Jump into Chapters 1–4 & key scenes',
        disabled: false,
      },
      {
        id: 'settings',
        label: 'SETTINGS',
        sub: 'Graphics, Audio & Key Bindings',
        disabled: false,
      },
      {
        id: 'credits',
        label: 'CREDITS',
        sub: 'THE BOOK · MADE WITH NUBLIX TECH',
        disabled: false,
      },
      {
        id: 'exit',
        label: 'EXIT GAME',
        sub: 'Close the tome & rest',
        disabled: false,
      },
    ],
    [save]
  );

  const triggerMenuAction = (id: string) => {
    if (id === 'new_game') {
      onNewGame();
    } else if (id === 'continue') {
      if (save) {
        onContinue(save);
      } else {
        setNoSaveNotice(true);
        window.setTimeout(() => setNoSaveNotice(false), 2600);
      }
    } else if (id === 'chapters') {
      onOpenChapters();
    } else if (id === 'settings') {
      onOpenSettings();
    } else if (id === 'credits') {
      onOpenCredits();
    } else if (id === 'exit') {
      onOpenExit();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modalOpen) return;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        onHoverItem();
        setSelectedIndex((prev) => (prev + 1) % menuItems.length);
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        onHoverItem();
        setSelectedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
      } else if (e.code === 'Enter') {
        if (document.activeElement?.tagName === 'BUTTON') return;
        e.preventDefault();
        const active = menuItems[selectedIndex];
        if (active) triggerMenuAction(active.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, selectedIndex, menuItems, save]);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between px-6 py-6 sm:px-10 sm:py-8 lg:px-16 lg:py-10">
      {/* Subtle dark atmospheric gradient framing left menu & upper title without blurring 3D */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'linear-gradient(90deg, rgba(4, 7, 15, 0.88) 0%, rgba(5, 9, 18, 0.62) 38%, rgba(5, 9, 18, 0.14) 72%, rgba(4, 7, 15, 0.32) 100%)',
        }}
      />

      {/* Top Row: Studio Branding + Audio/Intro Quick Controls */}
      <div className="pointer-events-auto mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.24em] text-[#d9a84e] uppercase">
          <BookOpen className="h-4 w-4 text-[#f4d57b]" />
          <span>MADE WITH NUBLIX TECH</span>
        </div>

        {/* Upper-center Logo Lockup on Wide Displays */}
        <div className="hidden flex-col items-center text-center md:flex">
          <h1
            className="font-display bg-gradient-to-b from-[#fff3c4] via-[#e4b354] to-[#a66e1a] bg-clip-text text-3xl font-bold tracking-[0.24em] text-transparent lg:text-4xl xl:text-5xl"
            style={{ filter: 'drop-shadow(0 4px 16px rgba(0, 0, 0, 0.9))' }}
          >
            THE BOOK
          </h1>
          <div className="mt-1 flex items-center gap-2.5 text-[10px] font-medium tracking-[0.28em] text-[#f4e4c2]/85 uppercase">
            <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#d9a84e]" />
            <span>AN ADVENTURE BEYOND THE PAGES</span>
            <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#d9a84e]" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onMouseEnter={onHoverItem}
            onClick={onReplayIntro}
            className="flex items-center gap-1.5 rounded-lg border border-[#d9a84e]/35 bg-[#0a101d]/90 px-3 py-1.5 text-xs font-medium text-[#f4e4c2] transition-colors hover:border-[#d9a84e] hover:bg-[#131d33]"
          >
            <Film className="h-3.5 w-3.5 text-[#d9a84e]" />
            <span className="hidden sm:inline">Replay Intro</span>
          </button>
          <button
            type="button"
            onMouseEnter={onHoverItem}
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            className="rounded-lg border border-white/15 bg-[#0a101d]/90 p-2 text-slate-200 transition-colors hover:border-[#d9a84e]/50 hover:text-white"
          >
            {muted ? <VolumeX className="h-4 w-4 text-amber-400" /> : <Volume2 className="h-4 w-4 text-[#d9a84e]" />}
          </button>
        </div>
      </div>

      {/* Center Left Vertical Fantasy Navigation */}
      <div className="pointer-events-auto mx-auto my-auto flex w-full max-w-[1600px] items-center justify-between">
        <div className="w-full max-w-sm">
          {/* Compact Logo for Mobile / Small Viewports */}
          <div className="mb-6 md:hidden">
            <h1 className="font-display bg-gradient-to-b from-[#fff3c4] via-[#e4b354] to-[#a66e1a] bg-clip-text text-4xl font-bold tracking-[0.2em] text-transparent">
              THE BOOK
            </h1>
            <p className="mt-1 text-[11px] font-medium tracking-[0.22em] text-[#f4e4c2]/85 uppercase">
              AN ADVENTURE BEYOND THE PAGES
            </p>
          </div>

          <nav aria-label="Main Menu" className="flex flex-col gap-2">
            {menuItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => {
                    if (selectedIndex !== idx) {
                      setSelectedIndex(idx);
                      onHoverItem();
                    }
                  }}
                  onClick={() => triggerMenuAction(item.id)}
                  className={`group relative flex w-full items-center justify-between rounded-lg border px-5 py-3 text-left transition-all duration-150 ${
                    isSelected
                      ? 'translate-x-1.5 border-[#f4d57b]/80 bg-[#121c33]/95 shadow-[0_6px_22px_rgba(217,168,78,0.18)]'
                      : 'border-white/12 bg-[#090f1d]/85 hover:border-[#d9a84e]/45 hover:bg-[#0e1629]/92'
                  } ${item.disabled ? 'opacity-65' : ''}`}
                >
                  {/* Gold left accent bar */}
                  <span
                    className={`absolute inset-y-2 left-0 w-1 rounded-r transition-opacity ${
                      isSelected ? 'bg-[#f4d57b] opacity-100' : 'bg-[#d9a84e] opacity-0'
                    }`}
                  />

                  <div className="pl-1">
                    <div
                      className={`font-display text-sm font-semibold tracking-[0.18em] transition-colors sm:text-base ${
                        isSelected ? 'text-[#fff1c9]' : 'text-[#e5d9be] group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400">
                      {item.sub}
                    </div>
                  </div>

                  <span
                    className={`text-xs transition-transform duration-150 ${
                      isSelected ? 'translate-x-0 text-[#f4d57b]' : '-translate-x-1 text-slate-500 opacity-0 group-hover:opacity-75'
                    }`}
                  >
                    ✦
                  </span>
                </button>
              );
            })}
          </nav>

          {noSaveNotice && (
            <div className="mt-3 rounded-lg border border-amber-400/40 bg-[#141926]/95 px-4 py-2 text-xs text-amber-200">
              No saved adventure yet. Select <span className="font-semibold">NEW GAME</span> to begin Chapter 1.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Safe Margin Footer */}
      <div className="pointer-events-auto mx-auto flex w-full max-w-[1600px] items-center justify-between text-xs text-slate-400">
        <span>
          Up / Down Navigate · Enter Select · WASD Move · V Observe · Tab Bag · Esc Pause
        </span>
        <span className="hidden font-medium tracking-[0.16em] text-[#d9a84e]/85 sm:inline">
          CHAPTERS 1–4 COMPLETE
        </span>
      </div>
    </div>
  );
};
