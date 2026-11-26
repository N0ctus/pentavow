import React from 'react';
import { ElementType } from '../../types/game';
import { ANIME_ELEMENTS, getElementColor } from '../../utils/combatUtils';

export type AttackArchetype =
  | 'SLASH'
  | 'BLOW'
  | 'ARROW'
  | 'ULTIMATE_BURST'
  | 'IAIDO_SLASH'
  | 'SPIN_SLASH'
  | 'FLUID_WHIP'
  | 'HEAVY_SLAM';

interface AnimeElementalSlashProps {
  element?: ElementType;
  archetype?: AttackArchetype;
  isUltimate?: boolean;
}

export const AnimeElementalSlash: React.FC<AnimeElementalSlashProps> = ({
  element = 'FIRE',
  archetype = 'SLASH',
  isUltimate = false,
}) => {
  const meta = ANIME_ELEMENTS[element] || ANIME_ELEMENTS['FIRE'];
  const elementColor = getElementColor(element);
  const scale = isUltimate ? 1.6 : 1.0;

  // 1. BLUNT KINETIC BLOW ARCHETYPE (Inspired by atk_blow_right.png)
  // Double concentric sonic-boom shock rings with radial spike coronas & pressure blast
  if (archetype === 'BLOW') {
    return (
      <svg
        width={160 * scale}
        height={160 * scale}
        viewBox="-80 -80 160 160"
        className="overflow-visible pointer-events-none"
        style={{ filter: `drop-shadow(0 0 ${isUltimate ? '25px' : '15px'} ${elementColor})` }}
      >
        <defs>
          <radialGradient id={`blowCoreGrad-${element}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor={elementColor} />
            <stop offset="70%" stopColor={elementColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Central White-Hot Impact Flash */}
        <circle cx="0" cy="0" r="18" fill={`url(#blowCoreGrad-${element})`} />
        <circle cx="0" cy="0" r="8" fill="#ffffff" />

        {/* Outer Expanding Shockwave Ring (Sonic Boom) */}
        <circle
          cx="0"
          cy="0"
          r="48"
          fill="none"
          stroke={elementColor}
          strokeWidth="4"
          className="animate-ping"
          opacity="0.8"
        />

        {/* Inner Secondary Shockwave Ring */}
        <circle
          cx="0"
          cy="0"
          r="32"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeDasharray="8 4"
        />

        {/* Radial Spike Coronas (Air pressure burst) */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, idx) => {
          const len = idx % 2 === 0 ? 58 : 42;
          return (
            <line
              key={deg}
              x1="0"
              y1="0"
              x2={len * Math.cos((deg * Math.PI) / 180)}
              y2={len * Math.sin((deg * Math.PI) / 180)}
              stroke={idx % 2 === 0 ? '#ffffff' : elementColor}
              strokeWidth={idx % 2 === 0 ? '3.5' : '2'}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    );
  }

  // 2. RANGED PROJECTILE VOLLEY ARCHETYPE (Inspired by atk_arrows_right.png)
  // High-velocity streaking beams + cascading multi-spark detonations
  if (archetype === 'ARROW') {
    return (
      <svg
        width={180 * scale}
        height={90 * scale}
        viewBox="-90 -45 180 90"
        className="overflow-visible pointer-events-none"
        style={{ filter: `drop-shadow(0 0 16px ${elementColor})` }}
      >
        <defs>
          <linearGradient id={`arrowTrailGrad-${element}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={elementColor} stopOpacity="0" />
            <stop offset="60%" stopColor={elementColor} />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Upper Projectile Streak */}
        <path
          d="M -75 -20 L 40 -12"
          stroke={`url(#arrowTrailGrad-${element})`}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="42" cy="-12" r="3" fill="#ffffff" />

        {/* Main Center Projectile Streak */}
        <path
          d="M -85 0 L 55 0"
          stroke={`url(#arrowTrailGrad-${element})`}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <polygon points="55,-6 72,0 55,6 59,0" fill="#ffffff" />
        <circle cx="55" cy="0" r="4.5" fill="#fef08a" />

        {/* Lower Projectile Streak */}
        <path
          d="M -70 18 L 45 10"
          stroke={`url(#arrowTrailGrad-${element})`}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="47" cy="10" r="3" fill="#ffffff" />

        {/* Impact Cluster Detonations */}
        <g transform="translate(62, 0)">
          <polygon points="0,-14 3,-4 14,0 3,4 0,14 -3,4 -14,0 -3,-4" fill="#ffffff" />
          <circle cx="0" cy="0" r="5" fill={elementColor} className="animate-ping" />
        </g>
        <circle cx="35" cy="-18" r="2" fill="#ffffff" />
        <circle cx="50" cy="16" r="2.5" fill="#fde047" />
      </svg>
    );
  }

  // 3. ULTIMATE BURST ERUPTION ARCHETYPE (Inspired by skill_cutin.png & skill_wallpaper_attr_*)
  if (archetype === 'ULTIMATE_BURST' || isUltimate) {
    return (
      <svg
        width={240 * scale}
        height={240 * scale}
        viewBox="-120 -120 240 240"
        className="overflow-visible pointer-events-none"
        style={{ filter: `drop-shadow(0 0 35px ${elementColor})` }}
      >
        <defs>
          <radialGradient id={`ultCoreGrad-${element}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor={elementColor} />
            <stop offset="70%" stopColor={elementColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Blinding Central Starburst Sphere */}
        <circle cx="0" cy="0" r="38" fill={`url(#ultCoreGrad-${element})`} />
        <circle cx="0" cy="0" r="16" fill="#ffffff" />

        {/* Dual Cross Energy Slashes (X-Cut) */}
        <path
          d="M -90 -90 Q 0 0 90 90"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M -90 -90 Q 0 0 90 90"
          stroke={elementColor}
          strokeWidth="12"
          opacity="0.6"
          strokeLinecap="round"
        />
        <path
          d="M -90 90 Q 0 0 90 -90"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M -90 90 Q 0 0 90 -90"
          stroke={elementColor}
          strokeWidth="12"
          opacity="0.6"
          strokeLinecap="round"
        />

        {/* Swirling Elemental Energy Rings */}
        <circle
          cx="0"
          cy="0"
          r="72"
          fill="none"
          stroke={elementColor}
          strokeWidth="3.5"
          strokeDasharray="24 12"
          className="animate-spin"
        />
        <circle
          cx="0"
          cy="0"
          r="95"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeDasharray="16 16"
        />

        {/* Radiating 16-Ray Nova Spikes */}
        {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg, i) => {
          const r1 = i % 2 === 0 ? 98 : 78;
          return (
            <line
              key={deg}
              x1="0"
              y1="0"
              x2={r1 * Math.cos((deg * Math.PI) / 180)}
              y2={r1 * Math.sin((deg * Math.PI) / 180)}
              stroke={i % 2 === 0 ? '#ffffff' : elementColor}
              strokeWidth={i % 2 === 0 ? '4' : '2'}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    );
  }

  // 4. IAIDO QUICKDRAW SLASH ARCHETYPE (SpriteCast High-Speed Cut + Supersonic Streaks)
  if (archetype === 'IAIDO_SLASH') {
    return (
      <svg
        width={220 * scale}
        height={160 * scale}
        viewBox="-110 -80 220 160"
        className="overflow-visible pointer-events-none"
        style={{ filter: `drop-shadow(0 0 ${isUltimate ? '28px' : '18px'} ${elementColor})` }}
      >
        <defs>
          <linearGradient id={`iaidoBladeGrad-${element}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={elementColor} stopOpacity="0" />
            <stop offset="30%" stopColor={elementColor} />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="70%" stopColor={elementColor} />
            <stop offset="100%" stopColor={elementColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Supersonic Speed Streaks (Ahead of and behind cut) */}
        <line x1="-100" y1="52" x2="80" y2="-44" stroke="#ffffff" strokeWidth="1.2" opacity="0.6" strokeDasharray="16 8" />
        <line x1="-80" y1="36" x2="100" y2="-60" stroke={elementColor} strokeWidth="1.5" opacity="0.7" />
        <line x1="-70" y1="65" x2="90" y2="-25" stroke={elementColor} strokeWidth="1.2" opacity="0.5" />

        {/* Outer Elemental Glow Shear */}
        <path
          d="M -95 55 Q 0 0 95 -55 Q 20 8 -95 55 Z"
          fill={elementColor}
          opacity="0.4"
        />

        {/* Razor Hairline Blade Cut Core */}
        <path
          d="M -105 60 L 105 -60"
          stroke={`url(#iaidoBladeGrad-${element})`}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M -105 60 L 105 -60"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Split Radiance Shock Burst at center */}
        <polygon points="0,-18 5,-4 22,0 5,4 0,18 -5,4 -22,0 -5,-4" fill="#ffffff" />
        <polygon points="-8,-8 0,-3 8,-8 3,0 8,8 0,3 -8,8 -3,0" fill={elementColor} opacity="0.8" />
        <circle cx="0" cy="0" r="4" fill="#ffffff" className="animate-ping" />

        {/* Ejected High-Speed Shards */}
        <polygon points="45,-25 50,-24 47,-20" fill="#ffffff" />
        <polygon points="-40,30 -36,35 -43,33" fill={elementColor} />
        <polygon points="70,-48 76,-46 72,-42" fill="#ffffff" />
      </svg>
    );
  }

  // 5. SPINNING WHIRLWIND SLASH ARCHETYPE (SpriteCast 360-degree Elliptical Smear + Tangential Shards)
  if (archetype === 'SPIN_SLASH') {
    return (
      <svg
        width={200 * scale}
        height={140 * scale}
        viewBox="-100 -70 200 140"
        className="overflow-visible pointer-events-none"
        style={{ filter: `drop-shadow(0 0 ${isUltimate ? '26px' : '16px'} ${elementColor})` }}
      >
        <defs>
          <linearGradient id={`spinGrad-${element}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor={elementColor} />
            <stop offset="90%" stopColor={elementColor} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Outer Expanding Whirling Ring */}
        <ellipse
          cx="0"
          cy="0"
          rx="78"
          ry="36"
          fill="none"
          stroke={elementColor}
          strokeWidth="2"
          strokeDasharray="18 10"
          opacity="0.6"
          className="animate-spin"
        />

        {/* Thick Blade Sweep Smear (Perspective Ellipse) */}
        <path
          d="M -75 0 C -75 -35 75 -35 75 0 C 75 30 -50 38 -80 10 C -60 22 55 18 55 0 C 55 -20 -55 -20 -55 0 Z"
          fill={`url(#spinGrad-${element})`}
          opacity="0.85"
        />

        {/* White-Hot Core Blade Edge */}
        <path
          d="M -75 0 C -75 -32 75 -32 75 0 C 75 28 -40 34 -72 8"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Tangential Flung Droplets/Shards based on SpriteCast `out` & `carry` */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const px = 72 * Math.cos(rad);
          const py = 32 * Math.sin(rad);
          return (
            <circle
              key={deg}
              cx={px}
              cy={py}
              r={i % 2 === 0 ? 3.5 : 2}
              fill={i % 2 === 0 ? '#ffffff' : elementColor}
              opacity="0.9"
            />
          );
        })}

        {/* Center Vortex Flash */}
        <circle cx="0" cy="0" r="10" fill={elementColor} opacity="0.7" className="animate-pulse" />
        <circle cx="0" cy="0" r="4" fill="#ffffff" />
      </svg>
    );
  }

  // 6. FLUID ELEMENTAL WHIP ARCHETYPE (SpriteCast Undulating Fluid Ribbon + Speed-Stretched Droplets)
  if (archetype === 'FLUID_WHIP') {
    return (
      <svg
        width={210 * scale}
        height={130 * scale}
        viewBox="-105 -65 210 130"
        className="overflow-visible pointer-events-none"
        style={{ filter: `drop-shadow(0 0 ${isUltimate ? '25px' : '16px'} ${elementColor})` }}
      >
        <defs>
          <linearGradient id={`whipGrad-${element}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={elementColor} stopOpacity="0.2" />
            <stop offset="40%" stopColor={elementColor} />
            <stop offset="85%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Outer Fluid Sheath Ribbon */}
        <path
          d="M -85 25 Q -35 -50 15 15 T 90 -25"
          fill="none"
          stroke={elementColor}
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* Main Undulating Ribbon */}
        <path
          d="M -85 25 Q -35 -50 15 15 T 90 -25"
          fill="none"
          stroke={`url(#whipGrad-${element})`}
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* White-Hot Core Crest */}
        <path
          d="M -60 10 Q -25 -42 15 15 T 85 -22"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Speed-Stretched Teardrop Droplets along trajectory */}
        <ellipse cx="-40" cy="-22" rx="6" ry="2.5" transform="rotate(-30 -40 -22)" fill="#ffffff" />
        <ellipse cx="25" cy="18" rx="5" ry="2" transform="rotate(25 25 18)" fill={elementColor} />
        <ellipse cx="65" cy="-10" rx="7" ry="2.8" transform="rotate(-35 65 -10)" fill="#ffffff" />

        {/* Tip Crack Detonation */}
        <g transform="translate(90, -25)">
          <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#ffffff" />
          <circle cx="0" cy="0" r="4" fill={elementColor} className="animate-ping" />
        </g>
      </svg>
    );
  }

  // 7. HEAVY GROUND SLAM ARCHETYPE (SpriteCast 2.5D Elliptical Shockwave + Fissures + Rock Debris)
  if (archetype === 'HEAVY_SLAM') {
    return (
      <svg
        width={220 * scale}
        height={160 * scale}
        viewBox="-110 -60 220 160"
        className="overflow-visible pointer-events-none"
        style={{ filter: `drop-shadow(0 0 ${isUltimate ? '30px' : '18px'} ${elementColor})` }}
      >
        <defs>
          <radialGradient id={`slamGrad-${element}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor={elementColor} />
            <stop offset="85%" stopColor={elementColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Vertical Kinetic Impact Plunge Pillar */}
        <line x1="0" y1="-50" x2="0" y2="40" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
        <line x1="0" y1="-50" x2="0" y2="40" stroke={elementColor} strokeWidth="12" opacity="0.5" strokeLinecap="round" />

        {/* Outer 2.5D Perspective Ground Shockwave Ellipse */}
        <ellipse
          cx="0"
          cy="42"
          rx="85"
          ry="26"
          fill="none"
          stroke={elementColor}
          strokeWidth="3.5"
          className="animate-ping"
          opacity="0.8"
        />

        {/* Inner Compressed Shockwave Ring */}
        <ellipse
          cx="0"
          cy="42"
          rx="55"
          ry="18"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
        />

        {/* Impact Ground Flash Core */}
        <ellipse
          cx="0"
          cy="42"
          rx="28"
          ry="10"
          fill={`url(#slamGrad-${element})`}
        />

        {/* Ground Fissure Fracture Lines (Radiating out from impact center) */}
        <path
          d="M 0 42 L -25 45 L -45 42 L -68 47"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 0 42 L 28 44 L 52 40 L 72 45"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 0 42 L -12 52 L -28 56"
          fill="none"
          stroke={elementColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 0 42 L 15 50 L 32 55"
          fill="none"
          stroke={elementColor}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Exploding Rock Debris & Flying Chunks */}
        <polygon points="-40,15 -34,18 -38,24 -44,20" fill="#ffffff" />
        <polygon points="35,10 42,12 40,19 32,16" fill={elementColor} />
        <polygon points="-18,-5 -12,-3 -15,4 -22,1" fill="#fef08a" />
        <polygon points="22,-8 28,-5 25,2 18,0" fill="#ffffff" />
      </svg>
    );
  }

  // 8. MELEE BLADE SLASH ARCHETYPE (Default: Inspired by slash_ef.png)
  // Enhanced with crescent blade trails + cross-slash bursts per element
  switch (element) {
    case 'FIRE':
      return (
        <svg
          width={190 * scale}
          height={120 * scale}
          viewBox="-20 -20 190 120"
          className="overflow-visible pointer-events-none filter drop-shadow-[0_0_22px_#ef4444]"
        >
          <defs>
            <linearGradient id="flameBladeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.2" />
              <stop offset="30%" stopColor="#dc2626" />
              <stop offset="70%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
            <radialGradient id="flameCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fef08a" />
              <stop offset="80%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Primary Searing Crescent Arc */}
          <path
            d="M 5 85 Q 60 -30 160 15 Q 90 5 15 90 Z"
            fill="url(#flameBladeGrad)"
            stroke="#fef08a"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Secondary Cross-Slash (X-Cut from slash_ef.png) */}
          <path
            d="M 40 10 Q 90 45 145 95"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M 40 10 Q 90 45 145 95"
            stroke="#f97316"
            strokeWidth="6"
            opacity="0.5"
            strokeLinecap="round"
          />

          {/* Inner Flame Tongue */}
          <path
            d="M 28 75 Q 68 -10 142 22 Q 85 12 38 80 Z"
            fill="#facc15"
            opacity="0.85"
          />

          {/* Fiery Embers & Spark Bursts */}
          <circle cx="160" cy="15" r="6" fill="url(#flameCoreGrad)" />
          <polygon points="160,5 163,15 173,15 165,20 168,30 160,23 152,30 155,20 147,15 157,15" fill="#ffffff" />
          <circle cx="85" cy="5" r="3.5" fill="#f97316" className="animate-ping" />
          <circle cx="115" cy="8" r="3" fill="#fde047" />
          <circle cx="50" cy="40" r="2.5" fill="#ef4444" />
        </svg>
      );

    case 'WATER':
      return (
        <svg
          width={190 * scale}
          height={120 * scale}
          viewBox="-20 -20 190 120"
          className="overflow-visible pointer-events-none filter drop-shadow-[0_0_20px_#0284c7]"
        >
          <defs>
            <linearGradient id="waterFlowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0c4a6e" stopOpacity="0.2" />
              <stop offset="40%" stopColor="#0284c7" />
              <stop offset="80%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>
          </defs>

          {/* Surging Tidal Crescent Blade */}
          <path
            d="M 10 90 C 40 15 110 -20 165 20 C 115 5 65 40 22 95 Z"
            fill="url(#waterFlowGrad)"
            stroke="#e0f2fe"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Secondary Cross-Water Cut */}
          <path
            d="M 45 10 Q 95 45 150 90"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Frothing Wave Foam Crests (Ukiyo-e Style) */}
          <path
            d="M 105 2 C 110 -4 120 -2 124 4 C 128 -2 138 0 142 6 C 148 2 158 8 165 20"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="170" cy="28" r="3.5" fill="#bae6fd" className="animate-ping" />
          <circle cx="90" cy="18" r="3" fill="#38bdf8" />
          <circle cx="55" cy="55" r="2.5" fill="#e0f2fe" />
        </svg>
      );

    case 'WIND':
      return (
        <svg
          width={190 * scale}
          height={120 * scale}
          viewBox="-20 -20 190 120"
          className="overflow-visible pointer-events-none filter drop-shadow-[0_0_20px_#10b981]"
        >
          <defs>
            <linearGradient id="windGaleGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#064e3b" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#a7f3d0" />
            </linearGradient>
          </defs>

          {/* Primary Razor Wind Arc */}
          <path
            d="M 15 85 Q 75 -25 165 10 Q 100 10 32 90 Z"
            fill="url(#windGaleGrad)"
            stroke="#a7f3d0"
            strokeWidth="3"
          />

          {/* Secondary Cross-Cutter Streak */}
          <path
            d="M 40 10 Q 90 45 150 90"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Tertiary Lower Gale Streak */}
          <path
            d="M 5 95 Q 65 20 130 45"
            fill="none"
            stroke="#6ee7b7"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          <polygon points="165,10 172,13 165,16 158,13" fill="#ffffff" className="animate-spin" />
          <circle cx="80" cy="15" r="3" fill="#a7f3d0" />
          <circle cx="120" cy="10" r="2.5" fill="#34d399" />
        </svg>
      );

    case 'LIGHT':
      return (
        <svg
          width={190 * scale}
          height={120 * scale}
          viewBox="-20 -20 190 120"
          className="overflow-visible pointer-events-none filter drop-shadow-[0_0_28px_#f59e0b]"
        >
          <defs>
            <linearGradient id="lightRayGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" stopOpacity="0.1" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>

          {/* Blinding Piercing Beam */}
          <path
            d="M 10 85 L 165 10 L 148 20 L 5 95 Z"
            fill="url(#lightRayGrad)"
            stroke="#ffffff"
            strokeWidth="2.5"
          />

          {/* Secondary Cross Beam */}
          <path
            d="M 40 10 L 150 90"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* 8-Point Holy Prismatic Starburst */}
          <g transform="translate(155, 12)">
            <polygon points="0,-24 4,-6 24,0 4,6 0,24 -4,6 -24,0 -4,-6" fill="#ffffff" />
            <polygon points="-14,-14 0,-4 14,-14 4,0 14,14 0,4 -14,14 -4,0" fill="#fef08a" opacity="0.85" />
            <circle cx="0" cy="0" r="6" fill="#f59e0b" />
          </g>

          <circle cx="120" cy="20" r="3.5" fill="#ffffff" className="animate-ping" />
        </svg>
      );

    case 'DARK':
      return (
        <svg
          width={190 * scale}
          height={120 * scale}
          viewBox="-20 -20 190 120"
          className="overflow-visible pointer-events-none filter drop-shadow-[0_0_26px_#a855f7]"
        >
          <defs>
            <linearGradient id="voidBladeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b0764" stopOpacity="0.2" />
              <stop offset="40%" stopColor="#7e22ce" />
              <stop offset="80%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>

          {/* Jagged Void Sickle Arc */}
          <path
            d="M 10 90 Q 60 -30 165 15 Q 105 2 22 95 Z"
            fill="url(#voidBladeGrad)"
            stroke="#c084fc"
            strokeWidth="3"
          />

          {/* Secondary Cross Void Cut */}
          <path
            d="M 40 10 Q 90 45 145 90"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Pitch-Black Dimensional Void Core */}
          <path
            d="M 28 80 Q 70 -8 140 24 Q 92 12 36 85 Z"
            fill="#090d16"
          />

          <circle cx="165" cy="15" r="4" fill="#e879f9" className="animate-ping" />
          <circle cx="135" cy="22" r="3" fill="#c084fc" />
        </svg>
      );
  }
};
