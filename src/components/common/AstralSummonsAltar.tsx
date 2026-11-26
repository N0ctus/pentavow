import React, { useMemo } from 'react';

export interface AstralSummonsAltarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  isSummoning?: boolean;
  interactive?: boolean;
  showRiftAura?: boolean;
  showParticles?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export const AstralSummonsAltar: React.FC<AstralSummonsAltarProps> = ({
  size = 'md',
  isSummoning = false,
  interactive = true,
  showRiftAura = true,
  showParticles = true,
  className = '',
  onClick,
  style,
}) => {
  // Resolve numeric pixel size
  const pxSize = useMemo(() => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 88; // Ideal for Overworld Map Landmark
      case 'md':
        return 130;
      case 'lg':
        return 210; // Ideal for Gacha Banner Centerpiece
      case 'xl':
        return 280; // Ideal for Gacha Ritual Full Screen
      default:
        return 130;
    }
  }, [size]);

  // Positions for 8 floating prismatic crystal polyhedra (angles in degrees around circle)
  const crystalAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  // Deterministic star particles
  const particles = useMemo(() => [
    { x: 28, y: 70, delay: '0s', dur: '2.1s', size: 3, color: '#38bdf8' },
    { x: 42, y: 82, delay: '0.6s', dur: '2.6s', size: 4, color: '#c084fc' },
    { x: 58, y: 76, delay: '1.1s', dur: '2.3s', size: 3, color: '#facc15' },
    { x: 70, y: 84, delay: '0.3s', dur: '2.8s', size: 4, color: '#67e8f9' },
    { x: 50, y: 64, delay: '1.5s', dur: '2.0s', size: 5, color: '#f472b6' },
  ], []);

  return (
    <div
      onClick={onClick}
      className={`relative select-none flex items-center justify-center transition-all ${
        interactive ? 'cursor-pointer group hover:scale-105 active:scale-95' : ''
      } ${className}`}
      style={{
        width: `${pxSize}px`,
        height: `${pxSize}px`,
        ...style,
      }}
    >
      {/* 1. Ground Dimensional Rift & Cosmic Nebula Aura */}
      {showRiftAura && (
        <>
          {/* Broad pulsing cosmic nebula */}
          <div
            className={`absolute rounded-full pointer-events-none transition-all duration-500 ${
              isSummoning
                ? 'w-[140%] h-[140%] bg-gradient-to-tr from-purple-600/60 via-cyan-400/50 to-pink-500/60 blur-2xl animate-pulse'
                : 'w-[115%] h-[115%] bg-gradient-to-tr from-purple-700/35 via-cyan-500/25 to-amber-500/30 blur-xl group-hover:scale-110 group-hover:opacity-100'
            }`}
          />
          {/* Ground rift ellipse puddle */}
          <div
            className="absolute -bottom-2 w-[110%] h-[26%] rounded-full pointer-events-none"
            style={{
              background: isSummoning
                ? 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.8) 0%, rgba(168, 85, 247, 0.6) 45%, transparent 75%)'
                : 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.65) 0%, rgba(6, 182, 212, 0.35) 50%, transparent 80%)',
              filter: 'blur(3px)',
            }}
          />
        </>
      )}

      {/* 2. Vertical Celestial Light Pillar (Shoots upward during summoning or hover) */}
      <div
        className={`absolute top-0 inset-x-0 mx-auto w-[22%] h-[160%] -translate-y-1/4 pointer-events-none transition-opacity duration-300 ${
          isSummoning ? 'opacity-100 animate-astral-beam' : 'opacity-0 group-hover:opacity-30'
        }`}
        style={{
          background: 'linear-gradient(to top, rgba(6,182,212,0.85) 0%, rgba(168,85,247,0.7) 50%, rgba(255,255,255,0.9) 80%, transparent 100%)',
          filter: 'blur(4px)',
          clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
        }}
      />

      {/* 3. Golden Sacred Geometry Mandala Array (Rotating Ring & 8-Point Octagram) */}
      <div
        className={`absolute inset-0 m-auto w-[94%] h-[94%] pointer-events-none transition-transform duration-700 ${
          isSummoning ? 'animate-astral-vortex-fast scale-105' : 'animate-astral-mandala'
        }`}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Outer Ring with Celestial Dash Markers */}
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="url(#sacredGold)"
            strokeWidth="1.5"
            strokeDasharray="6 3 2 3"
            opacity={isSummoning ? 0.95 : 0.75}
            className="filter drop-shadow-[0_0_6px_rgba(250,204,21,0.7)]"
          />
          {/* Secondary Concentric Circle */}
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="url(#sacredCyan)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity={0.65}
          />
          {/* Inner Interlocking Sacred Squares (8-Point Octagram) */}
          <rect
            x="36"
            y="36"
            width="128"
            height="128"
            fill="none"
            stroke="url(#sacredGold)"
            strokeWidth="1.2"
            opacity={0.65}
            transform="rotate(0 100 100)"
          />
          <rect
            x="36"
            y="36"
            width="128"
            height="128"
            fill="none"
            stroke="url(#sacredGold)"
            strokeWidth="1.2"
            opacity={0.65}
            transform="rotate(45 100 100)"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="sacredGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="sacredCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 4. Core Authentic Pixel Art Stone Archway Image (Derived directly from user's uploaded art) */}
      <div className="relative w-[86%] h-[86%] flex items-center justify-center">
        <img
          src="/portals/astral_altar_cutout.png"
          alt="Astral Summoning Altar"
          className={`w-full h-full object-contain relative z-10 transition-all duration-300 ${
            isSummoning ? 'brightness-125 contrast-110' : 'group-hover:brightness-110'
          }`}
          style={{
            imageRendering: 'pixelated',
            filter: isSummoning
              ? 'drop-shadow(0 0 18px rgba(6, 182, 212, 1)) drop-shadow(0 0 28px rgba(245, 158, 11, 0.9))'
              : 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.75)) drop-shadow(0 0 20px rgba(6, 182, 212, 0.5))',
          }}
        />

        {/* 5. Central Galaxy Vortex (Inside Stone Archway) */}
        <div
          className="absolute z-20 pointer-events-none rounded-full overflow-hidden flex items-center justify-center"
          style={{
            width: '38%',
            height: '48%',
            top: '26%',
            left: '31%',
          }}
        >
          {/* Swirling Galaxy Nebula Layer 1 */}
          <div
            className={`absolute inset-0 rounded-full transition-transform ${
              isSummoning ? 'animate-astral-vortex-fast' : 'animate-astral-vortex'
            }`}
            style={{
              background: 'conic-gradient(from 0deg, rgba(168,85,247,0.85) 0deg, rgba(6,182,212,0.9) 90deg, rgba(236,72,153,0.8) 180deg, rgba(250,204,21,0.7) 270deg, rgba(168,85,247,0.85) 360deg)',
              filter: 'blur(2px)',
              opacity: isSummoning ? 0.95 : 0.75,
            }}
          />

          {/* Reverse Rotating Star Spiral Layer 2 */}
          <div
            className="absolute inset-[15%] rounded-full animate-astral-vortex-reverse"
            style={{
              background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.95) 0%, rgba(147,197,253,0.8) 35%, rgba(192,132,252,0.6) 70%, transparent 100%)',
              filter: 'blur(1px)',
            }}
          />

          {/* White-Hot Astral Core Singularity */}
          <div
            className={`w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_#ffffff] transition-all ${
              isSummoning ? 'scale-150 animate-ping' : 'animate-pulse scale-100'
            }`}
          />
        </div>

        {/* 6. Arcane Glowing Runes Highlight Overlay on Archway */}
        <div
          className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-300 ${
            isSummoning ? 'opacity-100' : 'opacity-80 animate-astral-rune-pulse'
          }`}
          style={{
            background: 'radial-gradient(circle at 50% 32%, rgba(6, 182, 212, 0.45) 0%, rgba(168, 85, 247, 0.3) 30%, transparent 60%)',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* 7. 8 Floating Prismatic Astral Crystals in Golden Wireframe Cages */}
      {crystalAngles.map((angle, idx) => {
        const rad = (angle * Math.PI) / 180;
        const radiusPercent = 44; // Distance from center
        const xPct = 50 + radiusPercent * Math.cos(rad);
        const yPct = 50 + radiusPercent * Math.sin(rad);

        return (
          <div
            key={idx}
            className="absolute pointer-events-none z-30 transition-all duration-300 flex items-center justify-center animate-astral-crystal-bob"
            style={{
              left: `${xPct}%`,
              top: `${yPct}%`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${idx * 0.35}s`,
            }}
          >
            {/* Prismatic Crystal Gemstone */}
            <div
              className={`rounded-sm transition-transform duration-300 ${
                isSummoning ? 'scale-135' : 'group-hover:scale-115'
              }`}
              style={{
                width: `${Math.max(6, pxSize * 0.075)}px`,
                height: `${Math.max(8, pxSize * 0.11)}px`,
                background: 'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 30%, #a855f7 65%, #f43f5e 100%)',
                clipPath: 'polygon(50% 0%, 100% 30%, 80% 100%, 20% 100%, 0% 30%)',
                boxShadow: isSummoning
                  ? '0 0 12px #38bdf8, 0 0 18px #facc15'
                  : '0 0 6px #38bdf8, 0 0 10px #c084fc',
              }}
            />

            {/* Subtle Diamond Wireframe Highlight */}
            <div
              className="absolute inset-0 border border-amber-300/80 transform rotate-45 pointer-events-none"
              style={{
                width: `${Math.max(10, pxSize * 0.11)}px`,
                height: `${Math.max(10, pxSize * 0.11)}px`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%) rotate(45deg)',
              }}
            />
          </div>
        );
      })}

      {/* 8. Rising Celestial Star Motes (Particles) */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-astral-star-float"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 6px ${p.color}`,
                animationDelay: p.delay,
                animationDuration: p.dur,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
