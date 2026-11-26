import React from 'react';
import { ElementType } from '../../types/game';

export interface BossStrikeData {
  id: string;
  targetHunterId: string;
  element: ElementType;
  x: number;
  y: number;
  isAoE?: boolean;
  isHeavy?: boolean;
}

const ELEMENT_PALETTES: Record<
  ElementType,
  { main: string; secondary: string; light: string; bgGlow: string }
> = {
  FIRE: {
    main: '#ef4444',
    secondary: '#f97316',
    light: '#fef08a',
    bgGlow: 'rgba(239, 68, 68, 0.65)'
  },
  WATER: {
    main: '#06b6d4',
    secondary: '#3b82f6',
    light: '#a5f3fc',
    bgGlow: 'rgba(6, 182, 212, 0.65)'
  },
  WIND: {
    main: '#10b981',
    secondary: '#34d399',
    light: '#d1fae5',
    bgGlow: 'rgba(16, 185, 129, 0.65)'
  },
  LIGHT: {
    main: '#f59e0b',
    secondary: '#facc15',
    light: '#ffffff',
    bgGlow: 'rgba(245, 158, 11, 0.65)'
  },
  DARK: {
    main: '#a855f7',
    secondary: '#9333ea',
    light: '#e9d5ff',
    bgGlow: 'rgba(168, 85, 247, 0.65)'
  }
};

export const BossStrikeVisual: React.FC<{ strike: BossStrikeData }> = ({ strike }) => {
  const colors = ELEMENT_PALETTES[strike.element] || ELEMENT_PALETTES.FIRE;
  const isHeavy = !!strike.isHeavy;
  const isAoE = !!strike.isAoE;
  const size = isAoE ? 110 : isHeavy ? 95 : 80;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center overflow-visible">
      {/* 1. Animated Beast Claw Rend / Elemental Strike Arc */}
      <div className="relative animate-boss-claw flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox="-50 -50 100 100"
          className="overflow-visible pointer-events-none"
          style={{
            filter: `drop-shadow(0 0 12px ${colors.main}) drop-shadow(0 0 20px ${colors.secondary})`
          }}
        >
          <defs>
            <linearGradient id={`bossClawGrad-${strike.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="35%" stopColor={colors.light} />
              <stop offset="70%" stopColor={colors.main} />
              <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.2" />
            </linearGradient>
            <radialGradient id={`bossShockGrad-${strike.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor={colors.light} />
              <stop offset="80%" stopColor={colors.main} />
              <stop offset="100%" stopColor={colors.secondary} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Triple Claw Slashes (Ferocious Monster Rend) */}
          {/* Top Claw Slash */}
          <path
            d="M -32 -24 Q 2 -2 34 22"
            stroke={`url(#bossClawGrad-${strike.id})`}
            strokeWidth={isHeavy ? '5' : '3.5'}
            strokeLinecap="round"
          />
          <path
            d="M -32 -24 Q 2 -2 34 22"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Middle Claw Slash */}
          <path
            d="M -22 -34 Q 12 -12 44 12"
            stroke={`url(#bossClawGrad-${strike.id})`}
            strokeWidth={isHeavy ? '6' : '4.5'}
            strokeLinecap="round"
          />
          <path
            d="M -22 -34 Q 12 -12 44 12"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Bottom Claw Slash */}
          <path
            d="M -42 -12 Q -8 10 24 34"
            stroke={`url(#bossClawGrad-${strike.id})`}
            strokeWidth={isHeavy ? '5' : '3.5'}
            strokeLinecap="round"
          />
          <path
            d="M -42 -12 Q -8 10 24 34"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Cross Slash Counter-Rend for Heavy / AoE Attacks */}
          {(isHeavy || isAoE) && (
            <>
              <path
                d="M 32 -26 Q -2 -2 -34 24"
                stroke={`url(#bossClawGrad-${strike.id})`}
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <path
                d="M 32 -26 Q -2 -2 -34 24"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}

          {/* White-Hot Core Spark Impact Star */}
          <polygon
            points="0,-14 3.5,-3.5 14,0 3.5,3.5 0,14 -3.5,3.5 -14,0 -3.5,-3.5"
            fill="#ffffff"
          />
          <circle cx="0" cy="0" r="4.5" fill={colors.light} />

          {/* Radiating Elemental Impact Shards */}
          {[0, 60, 120, 180, 240, 300].map(deg => {
            const rad = (deg * Math.PI) / 180;
            const r1 = isHeavy ? 28 : 20;
            return (
              <line
                key={deg}
                x1="0"
                y1="0"
                x2={r1 * Math.cos(rad)}
                y2={r1 * Math.sin(rad)}
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.85"
              />
            );
          })}
        </svg>
      </div>

      {/* 2. Expanding Elemental Shockwave Ring */}
      <div
        className="absolute rounded-full pointer-events-none animate-ping"
        style={{
          width: isAoE ? '90px' : isHeavy ? '75px' : '60px',
          height: isAoE ? '90px' : isHeavy ? '75px' : '60px',
          border: `2.5px solid ${colors.main}`,
          boxShadow: `0 0 16px ${colors.secondary}, inset 0 0 10px ${colors.light}`,
          opacity: 0.8
        }}
      />
    </div>
  );
};
