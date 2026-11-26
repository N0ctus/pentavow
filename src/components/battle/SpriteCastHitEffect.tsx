import React from 'react';
import { ElementType } from '../../types/game';
import { ELEMENT_VFX_PALETTES } from '../../utils/spritecastEffectEngine';

export interface SpriteCastHitProps {
  id: string;
  type: 'CRIT_BURST' | 'HIT_SPARK' | 'BLOCK_GUARD' | 'GROUND_SLAM';
  element?: ElementType;
  x: number; // percentage (0..100)
  y: number;
  scale?: number;
}

export const SpriteCastHitEffect: React.FC<SpriteCastHitProps> = ({
  id,
  type,
  element = 'FIRE',
  x,
  y,
  scale = 1
}) => {
  const pal = ELEMENT_VFX_PALETTES[element] || ELEMENT_VFX_PALETTES.FIRE;

  return (
    <div
      className="absolute pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 select-none overflow-visible"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {/* ============================================================== */}
      {/* 1. CRIT HIT (Inward pinch, jagged starburst, tilted shock ring) */}
      {/* PVFX: impacts/crit-hit                                         */}
      {/* ============================================================== */}
      {type === 'CRIT_BURST' && (
        <div className="relative flex items-center justify-center animate-spritecast-crit">
          {/* 2.5D Perspective-Flattened Ground Shockwave Ring */}
          <svg
            width={180 * scale}
            height={90 * scale}
            viewBox="-90 -45 180 90"
            className="absolute -bottom-6 pointer-events-none overflow-visible animate-spritecast-shockwave"
          >
            <ellipse
              cx="0"
              cy="0"
              rx="75"
              ry="26"
              fill="none"
              stroke={pal.primary}
              strokeWidth="4"
              strokeDasharray="22 10"
              opacity="0.85"
              style={{ filter: `drop-shadow(0 0 12px ${pal.glow})` }}
            />
            <ellipse
              cx="0"
              cy="0"
              rx="55"
              ry="18"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              opacity="0.9"
            />
          </svg>

          {/* Jagged White Starburst & Diagonal Cut */}
          <svg
            width={140 * scale}
            height={140 * scale}
            viewBox="-70 -70 140 140"
            className="overflow-visible pointer-events-none animate-spritecast-starburst"
            style={{ filter: `drop-shadow(0 0 18px ${pal.glow})` }}
          >
            <defs>
              <radialGradient id={`critGrad-${id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor={pal.light} />
                <stop offset="75%" stopColor={pal.primary} />
                <stop offset="100%" stopColor={pal.dark} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Inward-to-Outward Jagged Starburst */}
            <polygon
              points="0,-60 14,-18 58,-18 24,6 38,50 0,22 -38,50 -24,6 -58,-18 -14,-18"
              fill={`url(#critGrad-${id})`}
            />

            {/* Diagonal Iaido Slashing Line cutting through starburst */}
            <line
              x1="-65"
              y1="55"
              x2="65"
              y2="-55"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <line
              x1="-65"
              y1="55"
              x2="65"
              y2="-55"
              stroke={pal.secondary}
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.5"
            />

            {/* Flying Shards and Debris (SpriteCast Crit Chunky Shards) */}
            {[
              { x: -45, y: -35, r: 6, rot: 25 },
              { x: 48, y: -28, r: 8, rot: -40 },
              { x: -38, y: 38, r: 7, rot: 60 },
              { x: 50, y: 40, r: 6, rot: -15 },
              { x: 0, y: -52, r: 5, rot: 0 }
            ].map((shard, idx) => (
              <polygon
                key={idx}
                points={`${shard.x},${shard.y - shard.r} ${shard.x + shard.r},${shard.y + shard.r} ${shard.x - shard.r},${shard.y + shard.r * 0.5}`}
                fill={idx % 2 === 0 ? '#ffffff' : pal.light}
                transform={`rotate(${shard.rot} ${shard.x} ${shard.y})`}
              />
            ))}
          </svg>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. HIT SPARK (White needle peak, long X-cross, cooling embers)  */}
      {/* PVFX: impacts/hit-spark & metal-clang                          */}
      {/* ============================================================== */}
      {type === 'HIT_SPARK' && (
        <div className="relative flex items-center justify-center animate-spritecast-spark">
          <svg
            width={110 * scale}
            height={110 * scale}
            viewBox="-55 -55 110 110"
            className="overflow-visible pointer-events-none"
            style={{ filter: `drop-shadow(0 0 14px ${pal.glow})` }}
          >
            {/* White-Hot Core Peak */}
            <circle cx="0" cy="0" r="10" fill="#ffffff" />
            <circle cx="0" cy="0" r="18" fill={pal.secondary} opacity="0.6" className="animate-ping" />

            {/* Long Needle Cross Sparks (X-formation) */}
            <line x1="-48" y1="-48" x2="48" y2="48" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <line x1="48" y1="-48" x2="-48" y2="48" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

            {/* Secondary Cardinal Spikes */}
            <line x1="0" y1="-38" x2="0" y2="38" stroke={pal.light} strokeWidth="2" strokeLinecap="round" />
            <line x1="-38" y1="0" x2="38" y2="0" stroke={pal.light} strokeWidth="2" strokeLinecap="round" />

            {/* Radiating Ember Droplets */}
            {[
              { cx: -32, cy: -18, r: 3 },
              { cx: 30, cy: -24, r: 2.5 },
              { cx: -26, cy: 30, r: 3.5 },
              { cx: 34, cy: 22, r: 2 }
            ].map((pt, i) => (
              <circle key={i} cx={pt.cx} cy={pt.cy} r={pt.r} fill={pal.light} />
            ))}
          </svg>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. BLOCK GUARD (Hexagonal bowing barrier lens with spark edge) */}
      {/* PVFX: impacts/block-guard & holy/barrier-block                 */}
      {/* ============================================================== */}
      {type === 'BLOCK_GUARD' && (
        <div className="relative flex items-center justify-center animate-spritecast-guard">
          <svg
            width={120 * scale}
            height={140 * scale}
            viewBox="-60 -70 120 140"
            className="overflow-visible pointer-events-none"
            style={{ filter: `drop-shadow(0 0 20px ${pal.glow})` }}
          >
            {/* Bowing Barrier Lens (Convex arc resisting impact) */}
            <path
              d="M -35 -55 Q 15 0 -35 55 L -15 60 Q 35 0 -15 -60 Z"
              fill={pal.primary}
              opacity="0.75"
            />
            {/* White Energy Rim */}
            <path
              d="M -15 -60 Q 35 0 -15 60"
              stroke="#ffffff"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            {/* Hexagonal Lattice Grid on Lens */}
            <path
              d="M -5 -30 L 15 -15 L 15 15 L -5 30 M 15 -15 L 30 -5 M 15 15 L 30 5"
              stroke={pal.light}
              strokeWidth="1.5"
              fill="none"
              opacity="0.8"
            />
            {/* Sheared Edge Sparks */}
            <circle cx="28" cy="-28" r="4" fill="#ffffff" className="animate-ping" />
            <circle cx="34" cy="0" r="5" fill="#ffffff" />
            <circle cx="26" cy="28" r="4" fill="#ffffff" className="animate-ping" />
          </svg>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. GROUND SLAM (Overhead smash shockwave, crater, dust billow) */}
      {/* PVFX: impacts/ground-slam & melee/hammer-smash                 */}
      {/* ============================================================== */}
      {type === 'GROUND_SLAM' && (
        <div className="relative flex items-center justify-center animate-spritecast-slam">
          {/* Expanding 2.5D Elliptical Ground Shockwave Ring */}
          <svg
            width={200 * scale}
            height={100 * scale}
            viewBox="-100 -50 200 100"
            className="overflow-visible pointer-events-none"
            style={{ filter: `drop-shadow(0 0 18px ${pal.glow})` }}
          >
            {/* Outer Expanding Shock Wave */}
            <ellipse
              cx="0"
              cy="0"
              rx="90"
              ry="32"
              fill="none"
              stroke={pal.primary}
              strokeWidth="5"
              strokeDasharray="24 12"
              opacity="0.9"
            />
            {/* Inner High-Velocity Crest */}
            <ellipse
              cx="0"
              cy="0"
              rx="65"
              ry="22"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
            />
            {/* Ground Fissure Cracks */}
            <line x1="-70" y1="5" x2="-25" y2="0" stroke={pal.light} strokeWidth="3" strokeLinecap="round" />
            <line x1="70" y1="8" x2="30" y2="0" stroke={pal.light} strokeWidth="3" strokeLinecap="round" />
            <line x1="-15" y1="18" x2="0" y2="0" stroke={pal.light} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="18" y1="16" x2="0" y2="0" stroke={pal.light} strokeWidth="2.5" strokeLinecap="round" />

            {/* Ejected Rock Chips bouncing in arc */}
            {[-50, -25, 25, 50].map((rx, idx) => (
              <polygon
                key={idx}
                points={`${rx},-24 ${rx + 6},-18 ${rx - 4},-14`}
                fill={idx % 2 === 0 ? '#ffffff' : pal.light}
              />
            ))}
          </svg>
        </div>
      )}
    </div>
  );
};
