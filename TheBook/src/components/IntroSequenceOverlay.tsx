import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import type { IntroStage } from '../game/types';

interface IntroSequenceOverlayProps {
  stage: IntroStage;
  elapsed: number;
  onSkip: () => void;
  onUnlockAudio: () => void;
}

export const IntroSequenceOverlay: React.FC<IntroSequenceOverlayProps> = ({
  stage,
  elapsed,
  onSkip,
  onUnlockAudio,
}) => {
  const [audioHintDismissed, setAudioHintDismissed] = useState(false);

  if (stage === 'menu') return null;

  const handleSurfacePointerDown = () => {
    onUnlockAudio();
    setAudioHintDismissed(true);
  };

  // Compute smooth opacities across the 17.5s opening timeline
  const darkScrimOpacity =
    elapsed < 1.1
      ? 0.92
      : elapsed < 2.6
      ? Math.max(0.18, 0.92 - ((elapsed - 1.1) / 1.5) * 0.74)
      : elapsed > 16.6
      ? Math.max(0.12, 0.22 - ((elapsed - 16.6) / 0.9) * 0.1)
      : 0.18;

  const sparkOpacity =
    elapsed < 0.25
      ? elapsed / 0.25
      : elapsed < 2.2
      ? 1
      : elapsed < 3.4
      ? Math.max(0, 1 - (elapsed - 2.2) / 1.2)
      : 0;

  const whisperCaptionOpacity =
    elapsed > 2.2 && elapsed < 4.5
      ? Math.min(1, Math.min((elapsed - 2.2) / 0.7, (4.5 - elapsed) / 0.7))
      : 0;

  const titleOpacity =
    elapsed >= 9.8 && elapsed <= 15.0
      ? Math.min(1, Math.min((elapsed - 9.8) / 1.0, (15.0 - elapsed) / 0.9))
      : 0;

  return (
    <div
      onMouseDown={handleSurfacePointerDown}
      className="fixed inset-0 z-30 select-none overflow-hidden"
    >
      {/* Dynamic dark veil that lifts smoothly as the ancient library reveals */}
      <div
        className="pointer-events-none absolute inset-0 bg-[#03050a] transition-opacity duration-300"
        style={{ opacity: darkScrimOpacity }}
      />

      {/* Subtle vignette around edges (no blur filter over WebGL) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 54% 48%, rgba(4, 7, 15, 0) 32%, rgba(3, 5, 11, 0.78) 100%)',
        }}
      />

      {/* Scene 1: Tiny golden spark emerging in the dark */}
      {sparkOpacity > 0.01 && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ opacity: sparkOpacity }}
        >
          <div
            className="h-4 w-4 rounded-full"
            style={{
              background:
                'radial-gradient(circle, #fff7d6 0%, #f5c962 45%, rgba(217,168,78,0) 75%)',
              boxShadow: '0 0 28px 8px rgba(244, 198, 92, 0.45)',
            }}
          />
        </div>
      )}

      {/* Scene 1 -> 2 Atmospheric Sub-line */}
      {whisperCaptionOpacity > 0.01 && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center px-6 text-center"
          style={{ opacity: whisperCaptionOpacity }}
        >
          <p className="font-display text-sm tracking-[0.28em] text-[#f4e4c2]/90 uppercase sm:text-base">
            In the silence between forgotten pages...
          </p>
        </div>
      )}

      {/* Scene 3: Metallic Gold Engraved Title Reveal */}
      {titleOpacity > 0.01 && (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          style={{ opacity: titleOpacity }}
        >
          {/* Engraved Celestial Book Crest SVG */}
          <svg
            width="84"
            height="68"
            viewBox="0 0 84 68"
            fill="none"
            aria-hidden="true"
            className="mb-4 drop-shadow-[0_6px_18px_rgba(0,0,0,0.85)]"
          >
            <circle cx="42" cy="34" r="30" stroke="#D9A84E" strokeOpacity="0.45" strokeWidth="1" />
            <circle
              cx="42"
              cy="34"
              r="24"
              stroke="#F4D57B"
              strokeOpacity="0.65"
              strokeWidth="1.2"
              strokeDasharray="3 4"
            />
            <path
              d="M42 18C34 14 23 14 14 17.5V48.5C23 45 34 45 42 49.5C50 45 61 45 70 48.5V17.5C61 14 50 14 42 18Z"
              stroke="#F4D57B"
              strokeWidth="2"
              fill="rgba(12, 18, 34, 0.72)"
            />
            <path d="M42 18V49.5" stroke="#D9A84E" strokeWidth="1.6" />
            <path d="M42 6L44.5 11.5L50 14L44.5 16.5L42 22L39.5 16.5L34 14L39.5 11.5L42 6Z" fill="#FFE69D" />
          </svg>

          <h1
            className="font-display bg-gradient-to-b from-[#fff3c4] via-[#e4b354] to-[#9b6819] bg-clip-text text-5xl font-bold tracking-[0.22em] text-transparent sm:text-7xl lg:text-8xl"
            style={{
              filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.92))',
            }}
          >
            THE BOOK
          </h1>

          {/* Engraved metallic rule with center diamond */}
          <div className="mt-4 flex w-full max-w-md items-center gap-3">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#d9a84e] to-[#f4e4c2]" />
            <span className="text-xs text-[#f6d378]">✦</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#d9a84e] to-[#f4e4c2]" />
          </div>

          <p className="font-display mt-3 text-xs font-semibold tracking-[0.34em] text-[#f4e4c2] uppercase sm:text-sm">
            AN ADVENTURE BEYOND THE PAGES
          </p>

          <div className="mt-5 rounded-md border border-[#d9a84e]/35 bg-[#090f1d]/85 px-4 py-1.5 text-[11px] font-semibold tracking-[0.26em] text-[#d9a84e] uppercase shadow-lg">
            MADE WITH NUBLIX TECH
          </div>
        </div>
      )}

      {/* Top corner controls: Audio prompt + Skip Intro */}
      <div className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between p-6 sm:p-8">
        <div className="text-[11px] font-medium tracking-[0.22em] text-[#d9a84e]/80 uppercase">
          {!audioHintDismissed ? (
            <button
              type="button"
              onClick={handleSurfacePointerDown}
              className="flex items-center gap-2 rounded-lg border border-[#d9a84e]/30 bg-[#0a101d]/85 px-3.5 py-2 text-xs text-[#f4e4c2] transition-colors hover:border-[#d9a84e]"
            >
              <Volume2 className="h-3.5 w-3.5 text-[#d9a84e]" />
              <span>Click anywhere for sound</span>
            </button>
          ) : (
            <span className="hidden sm:inline">NUBLIX TECH</span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSkip();
          }}
          className="rounded-lg border border-[#d9a84e]/45 bg-[#0a101d]/90 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-[#f4e4c2] uppercase transition-colors hover:border-[#f4d57b] hover:bg-[#131d33] hover:text-white"
        >
          Skip Intro · Space
        </button>
      </div>
    </div>
  );
};
