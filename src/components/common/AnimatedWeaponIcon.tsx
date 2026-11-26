import React from 'react';
import { Weapon } from '../../types/game';

interface AnimatedWeaponIconProps {
  weapon?: Pick<Weapon, 'icon' | 'animatedIcon' | 'animFrames' | 'name'> | null;
  icon?: string;
  animatedIcon?: string;
  animFrames?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  frameDurationSec?: number;
}

/**
 * Renders an animated horizontal sprite-strip weapon icon (when `animatedIcon` + `animFrames > 1` are present)
 * with crisp pixel-art stepping (`steps(N-1)` ping-pong loop), falling back to a static `<img>` otherwise.
 */
export const AnimatedWeaponIcon: React.FC<AnimatedWeaponIconProps> = ({
  weapon,
  icon,
  animatedIcon,
  animFrames,
  alt,
  className = 'w-8 h-8',
  style,
  frameDurationSec = 0.11,
}) => {
  const resolvedAnim = animatedIcon ?? weapon?.animatedIcon;
  const resolvedFrames = animFrames ?? weapon?.animFrames ?? 0;
  const resolvedIcon = icon ?? weapon?.icon ?? '/swords/sword_1.png';
  const resolvedAlt = alt ?? weapon?.name ?? 'Weapon';

  if (resolvedAnim && resolvedFrames > 1) {
    const cycleDuration = Math.max(0.45, (resolvedFrames - 1) * frameDurationSec);
    return (
      <div
        role="img"
        aria-label={resolvedAlt}
        className={`inline-block shrink-0 select-none bg-no-repeat ${className}`}
        style={{
          backgroundImage: `url(${resolvedAnim})`,
          backgroundSize: `${resolvedFrames * 100}% 100%`,
          backgroundPosition: '0% 0%',
          imageRendering: 'pixelated',
          animation: `mythicWeaponPlay ${cycleDuration.toFixed(2)}s steps(${resolvedFrames - 1}, end) infinite alternate`,
          ...style,
        }}
      />
    );
  }

  return (
    <img
      src={resolvedIcon}
      alt={resolvedAlt}
      className={`object-contain select-none ${className}`}
      style={{ imageRendering: 'pixelated', ...style }}
    />
  );
};
