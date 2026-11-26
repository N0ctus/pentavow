import React, { useMemo } from 'react';

export interface RealmPortalProps {
  size?: 'sm' | 'md' | 'lg' | number;
  interactive?: boolean;
  showRiftAura?: boolean;
  showParticles?: boolean;
  showRealmOrbs?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export const RealmPortal: React.FC<RealmPortalProps> = ({
  size = 'md',
  interactive = true,
  showRiftAura = true,
  showParticles = true,
  showRealmOrbs = true,
  className = '',
  onClick,
  style,
}) => {
  // Resolve width in pixels (height is derived to preserve authentic cropped 642:952 aspect ratio)
  const widthPx = useMemo(() => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 80; // Ideal for Overworld Map Landmark
      case 'md':
        return 110;
      case 'lg':
        return 160; // Ideal for Fast Travel Modal showcase
      default:
        return 110;
    }
  }, [size]);

  // Exact aspect ratio of cropped sprite: 642 x 952 (1 : 1.4828)
  const heightPx = Math.round(widthPx * 1.483);

  // 6 Elemental Realm Sigil Orbs (3 along left pillar, 3 along right pillar)
  // Perfectly symmetric: Left column at -4%, Right column at 104% (Center is exact 50%)
  const realmOrbs = useMemo(() => [
    { name: 'Fire (Torii)', color: '#ef4444', x: -4, y: 28, delay: '0s' },
    { name: 'Water (Abyss)', color: '#06b6d4', x: -4, y: 52, delay: '0.5s' },
    { name: 'Wind (Gale)', color: '#10b981', x: -4, y: 76, delay: '1.0s' },
    { name: 'Thunder (Storm)', color: '#f59e0b', x: 104, y: 28, delay: '0.25s' },
    { name: 'Light (Sanctuary)', color: '#fef08a', x: 104, y: 52, delay: '0.75s' },
    { name: 'Dark (Void)', color: '#c084fc', x: 104, y: 76, delay: '1.25s' },
  ], []);

  // Rising dimensional pixel sparks (centered inside the portal doorway: 20% - 80%)
  const sparks = useMemo(() => [
    { x: 36, y: 82, delay: '0.1s', dur: '2.5s', size: 3, color: '#38bdf8' },
    { x: 50, y: 88, delay: '0.7s', dur: '2.8s', size: 4, color: '#facc15' },
    { x: 64, y: 84, delay: '1.4s', dur: '2.3s', size: 3, color: '#c084fc' },
    { x: 44, y: 76, delay: '1.9s', dur: '2.6s', size: 4, color: '#f43f5e' },
  ], []);

  return (
    <div
      onClick={onClick}
      className={`relative select-none flex flex-col items-center justify-center transition-all ${
        interactive ? 'cursor-pointer group hover:scale-108 active:scale-95' : ''
      } ${className}`}
      style={{
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        ...style,
      }}
    >
      {/* 1. Ground Dimensional Rift & Cobblestone Aura */}
      {showRiftAura && (
        <>
          {/* Broad pulsing ambient back-glow */}
          <div
            className="absolute rounded-2xl bg-gradient-to-t from-purple-600/40 via-cyan-400/35 to-amber-400/30 blur-xl pointer-events-none group-hover:opacity-100 group-hover:scale-115 transition-all duration-500"
            style={{
              width: '115%',
              height: '110%',
            }}
          />

          {/* Ground rift ellipse puddle with breathing wave */}
          <div
            className="absolute -bottom-2 w-[130%] h-[24%] rounded-full pointer-events-none animate-realm-rift"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.75) 0%, rgba(56, 189, 248, 0.45) 45%, transparent 75%)',
              filter: 'blur(3px)',
            }}
          />
        </>
      )}

      {/* 2. Inner Dimensional Stargate Opening with Authentic 16-Bit Doorway Vortex */}
      {/* Doorway is located at left: 20.3%, width: 59.4%, top: 2.2%, height: 94.5% */}
      <div
        className="absolute z-0 overflow-hidden pointer-events-none flex items-center justify-center bg-slate-950 shadow-[inset_0_0_12px_rgba(0,0,0,0.95)]"
        style={{
          left: '20.3%',
          top: '2.5%',
          width: '59.4%',
          height: '94%',
          borderRadius: '3px',
        }}
      >
        {/* Authentic 16-Bit Pixel Art Doorway Portal Swirl (41 frames) */}
        <div
          className="w-full h-full animate-doorway-portal"
          style={{
            backgroundImage: 'url(/portals/doorway_portal_arcane.png)',
            backgroundSize: '4100% 100%',
            imageRendering: 'pixelated',
          }}
        />

        {/* Central Dimensional Singularity Pulsing */}
        <div className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#ffffff,0_0_18px_#c084fc] animate-ping opacity-85" />
      </div>

      {/* 3. Authentic 16-Bit Pixel Art Stone Portal Gate Overlay */}
      <img
        src="/portals/realm_portal.png"
        alt="Realm Portal"
        className="w-full h-full object-fill relative z-10 transition-all duration-300 group-hover:brightness-110"
        style={{
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 0 14px rgba(168, 85, 247, 0.85)) drop-shadow(0 0 22px rgba(56, 189, 248, 0.5))',
        }}
      />

      {/* 4. Apex Keystone Crown Sunburst Star Flare */}
      <div
        className="absolute z-20 pointer-events-none animate-portal-crest-glint"
        style={{
          top: '1.5%',
          left: '50%',
        }}
      >
        {/* Golden Diamond Core */}
        <div className="w-3.5 h-3.5 bg-gradient-to-tr from-amber-300 via-white to-yellow-200 rotate-45 rounded-[1px] shadow-[0_0_12px_#facc15,0_0_20px_#ffffff]" />
        
        {/* Crosshair Diamond Rays */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-[1.5px] bg-white blur-[0.5px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-[1.5px] bg-white blur-[0.5px]" />
      </div>

      {/* 5. 6 Floating Elemental Realm Sigil Orbs */}
      {showRealmOrbs && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {realmOrbs.map((orb, i) => (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${orb.x}%`,
                top: `${orb.y}%`,
              }}
              title={orb.name}
            >
              <div
                className="flex items-center justify-center animate-realm-orb"
                style={{ animationDelay: orb.delay }}
              >
                {/* Outer Elemental Glow */}
                <div
                  className="w-3.5 h-3.5 rounded-full blur-[2px] transition-transform group-hover:scale-125"
                  style={{ backgroundColor: orb.color, opacity: 0.85 }}
                />
                {/* Inner Radiant Core */}
                <div
                  className="absolute w-2 h-2 rounded-full border border-white/80 shadow-sm"
                  style={{
                    backgroundColor: orb.color,
                    boxShadow: `0 0 8px ${orb.color}, 0 0 12px ${orb.color}`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. Rising Dimensional Sparks */}
      {showParticles && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {sparks.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-sm animate-realm-spark"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                backgroundColor: s.color,
                boxShadow: `0 0 6px ${s.color}`,
                animationDelay: s.delay,
                animationDuration: s.dur,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
