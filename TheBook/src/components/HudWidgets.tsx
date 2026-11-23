import React from 'react';
import type { DialogueEmotion, MinimapState, PortraitId } from '../game/types';

export function resolvePortraitId(speaker: string, explicit?: PortraitId): PortraitId {
  if (explicit) return explicit;
  const s = speaker.toLowerCase();
  if (s.includes('mother') || s.includes('mom')) return 'mother';
  if (s.includes('eita') || s.includes('princess')) return 'eita';
  if (s.includes('jafr')) return 'jafr';
  if (s.includes('sneh')) return 'sneh';
  if (s.includes('lumi')) return 'lumi';
  if (s.includes('orvellan') || s.includes('keeper') || s.includes('voice')) return 'orvellan';
  if (s.includes('warrior') || s.includes('guardian')) return 'warrior';
  if (s.includes('villager')) return 'villager';
  return 'nate';
}

export function formatEmotionLabel(emotion?: DialogueEmotion): string | null {
  switch (emotion) {
    case 'happy':
      return 'Warm';
    case 'concerned':
      return 'Concerned';
    case 'surprised':
      return 'Startled';
    case 'calm':
      return 'Composed';
    case 'sad':
      return 'Sorrowful';
    case 'angry':
      return 'Determined';
    case 'curious':
      return 'Curious';
    case 'emotional':
      return 'Heartfelt';
    default:
      return null;
  }
}

interface PortraitAvatarProps {
  portrait: PortraitId;
  emotion?: DialogueEmotion;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PortraitAvatar: React.FC<PortraitAvatarProps> = ({
  portrait,
  emotion = 'calm',
  size = 'md',
  className = '',
}) => {
  const dim =
    size === 'sm' ? 'h-11 w-11' : size === 'lg' ? 'h-[76px] w-[76px]' : 'h-14 w-14';

  const happy = emotion === 'happy' || emotion === 'emotional';
  const worried = emotion === 'concerned' || emotion === 'sad';
  const surprised = emotion === 'surprised';
  const curious = emotion === 'curious';
  const angry = emotion === 'angry';

  const bgGradient =
    portrait === 'mother'
      ? 'from-[#1a2744] via-[#131d33] to-[#0b101d]'
      : portrait === 'eita'
      ? 'from-[#1d2e57] via-[#14203e] to-[#0b1224]'
      : portrait === 'jafr'
      ? 'from-[#142c33] via-[#0e1f27] to-[#09131a]'
      : portrait === 'sneh'
      ? 'from-[#2f1a33] via-[#1d1124] to-[#0f0a14]'
      : portrait === 'lumi'
      ? 'from-[#102e3a] via-[#0b1f2c] to-[#07131c]'
      : portrait === 'orvellan'
      ? 'from-[#221938] via-[#151026] to-[#0a0814]'
      : portrait === 'warrior'
      ? 'from-[#2e2014] via-[#1e150e] to-[#0f0b08]'
      : 'from-[#192438] via-[#101826] to-[#090d16]';

  // Brow & mouth adjustments driven by emotion
  const leftBrowY = surprised ? 29.5 : worried ? 31.2 : angry ? 32.5 : 30.8;
  const rightBrowY = curious ? 29.2 : leftBrowY;
  const leftBrowTilt = worried ? -9 : angry ? 12 : surprised ? -6 : 0;
  const rightBrowTilt = worried ? 9 : angry ? -12 : curious ? 7 : surprised ? 6 : 0;
  const eyeRy = surprised ? 2.6 : happy ? 1.85 : 2.15;

  const mouthPath = surprised
    ? 'M 47.5 52.8 A 2.5 2.4 0 1 0 52.5 52.8 A 2.5 2.4 0 1 0 47.5 52.8'
    : happy
    ? 'M 45.2 51.8 Q 50 55.6 54.8 51.8'
    : worried
    ? 'M 46.2 53.6 Q 50 51.4 53.8 53.6'
    : angry
    ? 'M 46.0 53.2 L 54.0 52.6'
    : 'M 46.2 52.4 Q 50 53.8 53.8 52.4';

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border-2 border-[#d9a84e]/80 bg-gradient-to-b ${bgGradient} shadow-lg ${dim} ${className}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id={`glow-${portrait}`} cx="50%" cy="38%" r="55%">
            <stop
              offset="0%"
              stopColor={
                portrait === 'lumi'
                  ? '#72efdd'
                  : portrait === 'orvellan'
                  ? '#a78bfa'
                  : '#f6d388'
              }
              stopOpacity="0.22"
            />
            <stop offset="100%" stopColor="#090d14" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill={`url(#glow-${portrait})`} />

        {portrait === 'jafr' || portrait === 'sneh' ? (
          // Jafr & Sneh snail companions
          <g>
            <ellipse cx="50" cy="78" rx="34" ry="12" fill={portrait === 'jafr' ? '#e7c582' : '#f2b8cf'} />
            <circle cx="58" cy="54" r="22" fill={portrait === 'jafr' ? '#b9823c' : '#d6689c'} stroke="#f4e4c2" strokeWidth="1.6" />
            <circle cx="58" cy="54" r="14" fill="none" stroke={portrait === 'jafr' ? '#7a4b18' : '#8c2d5c'} strokeWidth="2.5" />
            <circle cx="58" cy="54" r="7" fill="none" stroke={portrait === 'jafr' ? '#57330c' : '#661d42'} strokeWidth="2" />
            <ellipse cx="32" cy="60" rx="12" ry="11" fill={portrait === 'jafr' ? '#f5dca4' : '#f9d4e3'} />
            <line x1="28" y1="50" x2="24" y2="34" stroke={portrait === 'jafr' ? '#f5dca4' : '#f9d4e3'} strokeWidth="3.2" strokeLinecap="round" />
            <line x1="36" y1="50" x2="39" y2="33" stroke={portrait === 'jafr' ? '#f5dca4' : '#f9d4e3'} strokeWidth="3.2" strokeLinecap="round" />
            <circle cx="24" cy="33" r="4.2" fill="#ffffff" />
            <circle cx="39" cy="32" r="4.2" fill="#ffffff" />
            <circle cx="24.5" cy="33" r="2.1" fill="#18212f" />
            <circle cx="39.5" cy="32" r="2.1" fill="#18212f" />
            <path
              d={happy ? 'M 26 62 Q 31 66 37 62' : 'M 27 63 Q 31 64 36 63'}
              fill="none"
              stroke="#5b341b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        ) : portrait === 'lumi' ? (
          // Lumi luminous Whispering Woods spirit
          <g>
            <circle cx="50" cy="48" r="26" fill="#38bdf8" opacity="0.22" />
            <circle cx="50" cy="48" r="18" fill="#72efdd" opacity="0.88" />
            <circle cx="43" cy="45" r="2.6" fill="#08202c" />
            <circle cx="57" cy="45" r="2.6" fill="#08202c" />
            <circle cx="43.8" cy="44" r="0.9" fill="#ffffff" />
            <circle cx="57.8" cy="44" r="0.9" fill="#ffffff" />
            <path d="M 45 53 Q 50 56.5 55 53" fill="none" stroke="#083344" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 30 44 Q 20 32 32 28 Q 37 36 35 44 Z" fill="#a5f3fc" opacity="0.72" />
            <path d="M 70 44 Q 80 32 68 28 Q 63 36 65 44 Z" fill="#a5f3fc" opacity="0.72" />
          </g>
        ) : portrait === 'warrior' ? (
          // Pelicon Knight / Guardian
          <g>
            <path d="M 18 96 Q 22 68 50 66 Q 78 68 82 96 Z" fill="#4b5563" stroke="#d9a84e" strokeWidth="2" />
            <path d="M 36 68 L 50 86 L 64 68 Z" fill="#991b1b" />
            <path d="M 28 52 C 28 24 72 24 72 52 L 68 62 L 32 62 Z" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.4" />
            <path d="M 47 16 L 53 16 L 55 30 L 45 30 Z" fill="#d97706" />
            <rect x="35" y="42" width="30" height="7" rx="2" fill="#0f172a" />
            <circle cx="43" cy="45.5" r="1.9" fill="#fde68a" />
            <circle cx="57" cy="45.5" r="1.9" fill="#fde68a" />
          </g>
        ) : (
          // Humanoid Portraits: Mother, Princess Eita, Nate, Orvellan, Villager
          <g>
            {/* Neck & Shoulders / Gown / Tunic */}
            <path
              d="M 14 98 C 16 72 30 66 50 66 C 70 66 84 72 86 98 Z"
              fill={
                portrait === 'mother' || portrait === 'eita'
                  ? '#1d3c7a'
                  : portrait === 'orvellan'
                  ? '#2e1d52'
                  : portrait === 'villager'
                  ? '#6b4f3a'
                  : '#1b3564'
              }
              stroke="#d9a84e"
              strokeWidth="1.6"
            />
            {/* Ivory Lace / Collar V-Neck */}
            {(portrait === 'mother' || portrait === 'eita') && (
              <path d="M 36 67 L 50 88 L 64 67 Q 50 71 36 67 Z" fill="#f6efe0" stroke="#d9a84e" strokeWidth="1.2" />
            )}
            {portrait === 'nate' && (
              <path d="M 37 67 L 50 85 L 63 67 Z" fill="#e8e2d5" />
            )}
            {/* Sapphire Pendant on Eita */}
            {portrait === 'eita' && (
              <g>
                <circle cx="50" cy="74" r="3" fill="#2563eb" stroke="#fbbf24" strokeWidth="1" />
              </g>
            )}
            {/* Neck */}
            <rect x="44" y="55" width="12" height="16" rx="5" fill="#f1c5a8" />

            {/* Back Hair / Updo */}
            {portrait === 'mother' && (
              <>
                <circle cx="50" cy="18" r="11" fill="#3b2318" />
                <ellipse cx="50" cy="36" rx="22" ry="22" fill="#4a2c1e" />
              </>
            )}
            {portrait === 'eita' && (
              <path
                d="M 24 44 C 22 22 36 16 50 16 C 64 16 78 22 76 44 L 78 78 C 72 72 68 62 66 54 L 34 54 C 32 62 28 72 22 78 Z"
                fill="#523222"
              />
            )}
            {portrait === 'orvellan' && (
              <path
                d="M 24 48 C 22 20 38 14 50 14 C 62 14 78 20 76 48 L 72 68 L 28 68 Z"
                fill="#475569"
              />
            )}

            {/* Face */}
            <path
              d="M 33 34 C 33 23 67 23 67 34 C 67 51 59 60 50 61 C 41 60 33 51 33 34 Z"
              fill={portrait === 'orvellan' ? '#e5d5c5' : '#f7d2b8'}
            />
            {/* Soft Cheek Warmth */}
            <ellipse cx="39.5" cy="46.5" rx="3.4" ry="1.8" fill="#e58f7c" opacity="0.34" />
            <ellipse cx="60.5" cy="46.5" rx="3.4" ry="1.8" fill="#e58f7c" opacity="0.34" />

            {/* Eyes */}
            <ellipse cx="42.5" cy="39.5" rx="2.6" ry={eyeRy} fill="#1f1722" />
            <ellipse cx="57.5" cy="39.5" rx="2.6" ry={eyeRy} fill="#1f1722" />
            <circle cx="43.3" cy="38.8" r="0.85" fill="#ffffff" />
            <circle cx="58.3" cy="38.8" r="0.85" fill="#ffffff" />

            {/* Eyebrows */}
            <line
              x1="38.5"
              y1={leftBrowY}
              x2="45.5"
              y2={leftBrowY}
              stroke="#3b2318"
              strokeWidth="1.6"
              strokeLinecap="round"
              transform={`rotate(${leftBrowTilt} 42 ${leftBrowY})`}
            />
            <line
              x1="54.5"
              y1={rightBrowY}
              x2="61.5"
              y2={rightBrowY}
              stroke="#3b2318"
              strokeWidth="1.6"
              strokeLinecap="round"
              transform={`rotate(${rightBrowTilt} 58 ${rightBrowY})`}
            />

            {/* Nose & Expressive Mouth */}
            <path d="M 50 42 L 49.2 46.8 L 51.2 47.4" fill="none" stroke="#c89174" strokeWidth="1.1" strokeLinecap="round" />
            <path
              d={mouthPath}
              fill={surprised ? '#7f1d1d' : 'none'}
              stroke={portrait === 'mother' || portrait === 'eita' ? '#b45a5a' : '#8f4d43'}
              strokeWidth="1.75"
              strokeLinecap="round"
            />

            {/* Mother's Gold Wire Glasses (matching Enchanted Library Character Sheet) */}
            {portrait === 'mother' && (
              <g stroke="#d9a84e" strokeWidth="1.35" fill="rgba(186,230,253,0.08)">
                <ellipse cx="42.5" cy="39.8" rx="6.2" ry="5.0" />
                <ellipse cx="57.5" cy="39.8" rx="6.2" ry="5.0" />
                <line x1="48.7" y1="39.5" x2="51.3" y2="39.5" />
                <circle cx="33" cy="48" r="1.4" fill="#f7ebd2" stroke="none" />
                <circle cx="67" cy="48" r="1.4" fill="#f7ebd2" stroke="none" />
              </g>
            )}

            {/* Front Hair / Bangs & Royal Tiara */}
            {portrait === 'mother' && (
              <path
                d="M 31 37 C 31 20 69 20 69 37 C 64 28 56 26 50 28 C 44 26 36 28 31 37 Z"
                fill="#4a2c1e"
              />
            )}
            {portrait === 'eita' && (
              <>
                <path
                  d="M 31 38 C 31 21 69 21 69 38 C 63 29 55 27 50 29 C 45 27 37 29 31 38 Z"
                  fill="#5e3a28"
                />
                {/* Royal Tiara */}
                <path d="M 37 25 L 43 17 L 50 22 L 57 17 L 63 25 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.9" />
                <circle cx="50" cy="21" r="2.2" fill="#2563eb" />
              </>
            )}
            {portrait === 'nate' && (
              <path
                d="M 30 37 C 30 18 70 18 70 37 C 66 28 60 32 54 27 C 48 31 42 26 36 31 Z"
                fill="#3d2418"
              />
            )}
            {portrait === 'orvellan' && (
              <path
                d="M 41 53 C 41 64 59 64 59 53 L 54 68 L 46 68 Z"
                fill="#cbd5e1"
              />
            )}
          </g>
        )}
      </svg>
    </div>
  );
};

interface MinimapRadarProps {
  minimap: MinimapState;
}

export const MinimapRadar: React.FC<MinimapRadarProps> = ({ minimap }) => {
  const arrowDeg = 180 - (minimap.yaw * 180) / Math.PI;
  const maxR = 39;

  return (
    <div className="relative h-28 w-28 shrink-0 rounded-full border-2 border-[#d9a84e]/65 bg-[#080d16]/90 shadow-xl sm:h-32 sm:w-32">
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-label="Area minimap radar">
        {/* Terrain Radar Background & Concentric Rings */}
        <circle cx="50" cy="50" r="44" fill="#0b1320" stroke="#d9a84e" strokeOpacity="0.22" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="29" fill="none" stroke="#94a3b8" strokeOpacity="0.16" strokeWidth="0.7" />
        <circle cx="50" cy="50" r="14" fill="none" stroke="#94a3b8" strokeOpacity="0.14" strokeWidth="0.7" />
        <line x1="50" y1="7" x2="50" y2="93" stroke="#94a3b8" strokeOpacity="0.12" strokeWidth="0.6" />
        <line x1="7" y1="50" x2="93" y2="50" stroke="#94a3b8" strokeOpacity="0.12" strokeWidth="0.6" />

        {/* Cardinals */}
        <text x="50" y="9.5" textAnchor="middle" fill="#f4e4c2" fontSize="6.5" fontWeight="700">
          N
        </text>
        <text x="91.5" y="52.2" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="600">
          E
        </text>
        <text x="50" y="95.5" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="600">
          S
        </text>
        <text x="8.5" y="52.2" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="600">
          W
        </text>

        {/* Objective / Enemy / Ally / Portal Markers */}
        {minimap.markers.map((m) => {
          let rx = (m.dx / minimap.scale) * maxR;
          let ry = (m.dz / minimap.scale) * maxR;
          const distR = Math.hypot(rx, ry);
          if (distR > maxR) {
            rx = (rx / distR) * maxR;
            ry = (ry / distR) * maxR;
          }
          const mx = 50 + rx;
          const my = 50 + ry;

          if (m.kind === 'quest') {
            return (
              <polygon
                key={m.id}
                points={`${mx},${my - 3.8} ${mx + 3.8},${my} ${mx},${my + 3.8} ${mx - 3.8},${my}`}
                fill="#fbbf24"
                stroke="#090d14"
                strokeWidth="0.8"
              />
            );
          }
          if (m.kind === 'enemy') {
            return (
              <polygon
                key={m.id}
                points={`${mx},${my - 3} ${mx + 2.8},${my + 2.5} ${mx - 2.8},${my + 2.5}`}
                fill="#ef4444"
                stroke="#090d14"
                strokeWidth="0.7"
              />
            );
          }
          if (m.kind === 'portal') {
            return (
              <circle
                key={m.id}
                cx={mx}
                cy={my}
                r="3.2"
                fill="#a855f7"
                stroke="#e9d5ff"
                strokeWidth="1"
              />
            );
          }
          if (m.kind === 'ally') {
            return (
              <circle
                key={m.id}
                cx={mx}
                cy={my}
                r="2.7"
                fill="#72efdd"
                stroke="#090d14"
                strokeWidth="0.7"
              />
            );
          }
          return (
            <rect
              key={m.id}
              x={mx - 2}
              y={my - 2}
              width="4"
              height="4"
              fill="#cbd5e1"
              opacity="0.75"
            />
          );
        })}

        {/* Player Direction Chevron */}
        <g transform={`translate(50 50) rotate(${arrowDeg})`}>
          <polygon
            points="0,-5.5 4.2,4.5 0,2.2 -4.2,4.5"
            fill="#38bdf8"
            stroke="#f8fafc"
            strokeWidth="0.9"
          />
        </g>
      </svg>
    </div>
  );
};
