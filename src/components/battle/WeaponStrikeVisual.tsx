import React from 'react';
import { ElementType } from '../../types/game';
import { AnimatedWeaponIcon } from '../common/AnimatedWeaponIcon';

export interface WeaponStrikeData {
  id: string;
  weaponIcon: string;
  animatedIcon?: string;
  animFrames?: number;
  weaponName: string;
  element: ElementType;
  x: number;
  y: number;
  isUltimate?: boolean;
  isCrit?: boolean;
  angleOffset?: number;
}

const ELEMENT_PALETTES: Record<
  ElementType,
  { main: string; secondary: string; light: string; bgGlow: string }
> = {
  FIRE: {
    main: '#ef4444',
    secondary: '#f97316',
    light: '#fef08a',
    bgGlow: 'rgba(239, 68, 68, 0.6)'
  },
  WATER: {
    main: '#06b6d4',
    secondary: '#3b82f6',
    light: '#a5f3fc',
    bgGlow: 'rgba(6, 182, 212, 0.6)'
  },
  WIND: {
    main: '#10b981',
    secondary: '#34d399',
    light: '#d1fae5',
    bgGlow: 'rgba(16, 185, 129, 0.6)'
  },
  LIGHT: {
    main: '#f59e0b',
    secondary: '#facc15',
    light: '#ffffff',
    bgGlow: 'rgba(245, 158, 11, 0.6)'
  },
  DARK: {
    main: '#a855f7',
    secondary: '#9333ea',
    light: '#e9d5ff',
    bgGlow: 'rgba(168, 85, 247, 0.6)'
  }
};

export const WeaponStrikeVisual: React.FC<{ strike: WeaponStrikeData; centered?: boolean }> = ({
  strike,
  centered = true
}) => {
  const colors = ELEMENT_PALETTES[strike.element] || ELEMENT_PALETTES.FIRE;
  const isUlt = !!strike.isUltimate;
  const size = isUlt ? 68 : 50;

  return (
    <div
      className="absolute pointer-events-none z-40 -translate-x-1/2 -translate-y-1/2"
      style={{
        left: centered ? '50%' : `${strike.x}%`,
        top: centered ? '50%' : `${strike.y}%`
      }}
    >
      {/* 1. Flying & Slashing Sword Sprite */}
      <div
        className={isUlt ? 'animate-weapon-ult-slash' : 'animate-weapon-slash'}
        style={{
          transformOrigin: 'center center'
        }}
      >
        {/* Elemental Blade Trail Arc */}
        <svg
          width={size * 2.2}
          height={size * 1.8}
          viewBox="-30 -30 160 120"
          className="absolute -top-6 -left-8 pointer-events-none animate-elemental-arc overflow-visible"
        >
          <defs>
            <linearGradient id={`bladeArcGrad-${strike.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.main} stopOpacity="0" />
              <stop offset="40%" stopColor={colors.secondary} stopOpacity="0.85" />
              <stop offset="85%" stopColor={colors.light} stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
            <radialGradient id={`coreGlowGrad-${strike.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor={colors.light} />
              <stop offset="100%" stopColor={colors.main} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Searing Elemental Blade Arc */}
          <path
            d="M 10 80 Q 55 -25 130 15 Q 70 0 20 85 Z"
            fill={`url(#bladeArcGrad-${strike.id})`}
            stroke={colors.light}
            strokeWidth={isUlt ? '3.5' : '2'}
            strokeLinecap="round"
          />

          {/* Secondary Razor Motion Trail */}
          <path
            d="M 25 72 Q 65 -8 118 25"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="16 8"
            opacity="0.9"
            strokeLinecap="round"
          />

          {/* Blade Tip Spark */}
          <circle cx="130" cy="15" r={isUlt ? '7' : '5'} fill={`url(#coreGlowGrad-${strike.id})`} />
          <polygon
            points="130,5 133,15 143,15 135,21 138,31 130,24 122,31 125,21 117,15 127,15"
            fill="#ffffff"
          />
        </svg>

        {/* Authentic Pixel Weapon Sprite */}
        <div className="relative flex items-center justify-center">
          <AnimatedWeaponIcon
            icon={strike.weaponIcon}
            animatedIcon={strike.animatedIcon}
            animFrames={strike.animFrames}
            alt={strike.weaponName}
            frameDurationSec={0.07}
            className="select-none transition-transform"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              filter: `drop-shadow(0 0 10px ${colors.main}) drop-shadow(0 0 20px ${colors.secondary}) drop-shadow(0 0 30px ${colors.light})`
            }}
          />

          {/* Elemental Aura Particles Orbiting Weapon */}
          <span
            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-ping opacity-90"
            style={{ backgroundColor: colors.light }}
          />
          <span
            className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full animate-ping opacity-80"
            style={{ backgroundColor: colors.secondary }}
          />
        </div>
      </div>

      {/* 2. Expanding Elemental Impact Ring On Boss Body */}
      <div
        className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ping"
        style={{
          left: '50%',
          top: '50%',
          width: isUlt ? '120px' : '75px',
          height: isUlt ? '120px' : '75px',
          border: `3px solid ${colors.main}`,
          boxShadow: `0 0 25px ${colors.secondary}, inset 0 0 18px ${colors.light}`,
          opacity: 0.85
        }}
      />

      {/* 3. High Impact Radial Rays on Hits */}
      <svg
        width={isUlt ? 160 : 110}
        height={isUlt ? 160 : 110}
        viewBox="-55 -55 110 110"
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-visible"
        style={{ left: '50%', top: '50%' }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => {
          const len = idx % 2 === 0 ? (isUlt ? 52 : 36) : (isUlt ? 38 : 26);
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1="0"
              y1="0"
              x2={len * Math.cos(rad)}
              y2={len * Math.sin(rad)}
              stroke={idx % 2 === 0 ? '#ffffff' : colors.main}
              strokeWidth={idx % 2 === 0 ? '3' : '2'}
              strokeLinecap="round"
              opacity="0.9"
            />
          );
        })}
      </svg>
    </div>
  );
};
