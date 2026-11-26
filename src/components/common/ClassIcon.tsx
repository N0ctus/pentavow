import React from 'react';
import { JobType } from '../../types/game';
import {
  Swords,
  Shield,
  Flame,
  Zap,
  Target,
  Crosshair,
  Sparkles,
  Star,
  Skull,
  Sun,
  ShieldCheck,
  Leaf,
  Wind,
  Crown
} from 'lucide-react';

interface ClassConfig {
  label: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  shadowColor: string;
  icon: (sizeClass: string) => React.ReactNode;
}

const CLASS_CONFIGS: Record<string, ClassConfig> = {
  WARRIOR: {
    label: 'Warrior',
    borderColor: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.25)',
    textColor: '#fca5a5',
    shadowColor: 'rgba(239, 68, 68, 0.6)',
    icon: (s) => <Swords className={s} />
  },
  VANGUARD: {
    label: 'Warrior',
    borderColor: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.25)',
    textColor: '#fca5a5',
    shadowColor: 'rgba(239, 68, 68, 0.6)',
    icon: (s) => <Swords className={s} />
  },
  GUARDIAN: {
    label: 'Guardian',
    borderColor: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.25)',
    textColor: '#93c5fd',
    shadowColor: 'rgba(59, 130, 246, 0.6)',
    icon: (s) => <Shield className={s} />
  },
  BERSERKER: {
    label: 'Berserker',
    borderColor: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.25)',
    textColor: '#fdba74',
    shadowColor: 'rgba(249, 115, 22, 0.6)',
    icon: (s) => <Flame className={s} />
  },
  ROGUE: {
    label: 'Rogue',
    borderColor: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.25)',
    textColor: '#d8b4fe',
    shadowColor: 'rgba(168, 85, 247, 0.6)',
    icon: (s) => <Zap className={s} />
  },
  SHADOWBLADE: {
    label: 'Rogue',
    borderColor: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.25)',
    textColor: '#d8b4fe',
    shadowColor: 'rgba(168, 85, 247, 0.6)',
    icon: (s) => <Zap className={s} />
  },
  ASSASSIN: {
    label: 'Assassin',
    borderColor: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.25)',
    textColor: '#fda4af',
    shadowColor: 'rgba(244, 63, 94, 0.6)',
    icon: (s) => <Target className={s} />
  },
  HUNTER: {
    label: 'Hunter',
    borderColor: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.25)',
    textColor: '#6ee7b7',
    shadowColor: 'rgba(16, 185, 129, 0.6)',
    icon: (s) => <Crosshair className={s} />
  },
  MAGE: {
    label: 'Mage',
    borderColor: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.25)',
    textColor: '#a5b4fc',
    shadowColor: 'rgba(99, 102, 241, 0.6)',
    icon: (s) => <Sparkles className={s} />
  },
  SPELLWEAVER: {
    label: 'Mage',
    borderColor: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.25)',
    textColor: '#a5b4fc',
    shadowColor: 'rgba(99, 102, 241, 0.6)',
    icon: (s) => <Sparkles className={s} />
  },
  ARCHMAGE: {
    label: 'Archmage',
    borderColor: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.25)',
    textColor: '#67e8f9',
    shadowColor: 'rgba(6, 182, 212, 0.6)',
    icon: (s) => <Star className={s} />
  },
  WARLOCK: {
    label: 'Warlock',
    borderColor: '#9333ea',
    bgColor: 'rgba(147, 51, 234, 0.25)',
    textColor: '#d8b4fe',
    shadowColor: 'rgba(147, 51, 234, 0.6)',
    icon: (s) => <Skull className={s} />
  },
  DEATH_KNIGHT: {
    label: 'Death Knight',
    borderColor: '#14b8a6',
    bgColor: 'rgba(20, 184, 166, 0.25)',
    textColor: '#5eead4',
    shadowColor: 'rgba(20, 184, 166, 0.6)',
    icon: (s) => <Skull className={s} />
  },
  DEMON_HUNTER: {
    label: 'Demon Hunter',
    borderColor: '#84cc16',
    bgColor: 'rgba(132, 204, 22, 0.25)',
    textColor: '#bef264',
    shadowColor: 'rgba(132, 204, 22, 0.6)',
    icon: (s) => <Flame className={s} />
  },
  PRIEST: {
    label: 'Priest',
    borderColor: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.25)',
    textColor: '#fde047',
    shadowColor: 'rgba(234, 179, 8, 0.6)',
    icon: (s) => <Sun className={s} />
  },
  LIGHTBEARER: {
    label: 'Priest',
    borderColor: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.25)',
    textColor: '#fde047',
    shadowColor: 'rgba(234, 179, 8, 0.6)',
    icon: (s) => <Sun className={s} />
  },
  PALADIN: {
    label: 'Paladin',
    borderColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.25)',
    textColor: '#fde68a',
    shadowColor: 'rgba(245, 158, 11, 0.6)',
    icon: (s) => <ShieldCheck className={s} />
  },
  DRUID: {
    label: 'Druid',
    borderColor: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.25)',
    textColor: '#86efac',
    shadowColor: 'rgba(34, 197, 94, 0.6)',
    icon: (s) => <Leaf className={s} />
  },
  SHAMAN: {
    label: 'Shaman',
    borderColor: '#0ea5e9',
    bgColor: 'rgba(14, 165, 233, 0.25)',
    textColor: '#7dd3fc',
    shadowColor: 'rgba(14, 165, 233, 0.6)',
    icon: (s) => <Wind className={s} />
  },
  MONK: {
    label: 'Monk',
    borderColor: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.25)',
    textColor: '#fde68a',
    shadowColor: 'rgba(217, 119, 6, 0.6)',
    icon: (s) => <Crown className={s} />
  },
  EVOKER: {
    label: 'Evoker',
    borderColor: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.25)',
    textColor: '#bae6fd',
    shadowColor: 'rgba(56, 189, 248, 0.6)',
    icon: (s) => <Zap className={s} />
  }
};

interface ClassIconProps {
  job: JobType | string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export const ClassIcon: React.FC<ClassIconProps> = ({
  job,
  size = 'md',
  showLabel = false,
  showTooltip = false,
  className = ''
}) => {
  const normKey = (job || 'WARRIOR').toUpperCase();
  const config = CLASS_CONFIGS[normKey] || CLASS_CONFIGS.WARRIOR;

  const sizeClasses = {
    xs: { box: 'w-4 h-4 rounded-md', icon: 'w-2.5 h-2.5', text: 'text-[8px]' },
    sm: { box: 'w-5 h-5 rounded-md', icon: 'w-3 h-3', text: 'text-[9px]' },
    md: { box: 'w-7 h-7 rounded-lg', icon: 'w-4 h-4', text: 'text-[10px]' },
    lg: { box: 'w-9 h-9 rounded-xl', icon: 'w-5 h-5', text: 'text-xs' }
  }[size];

  return (
    <div
      className={`inline-flex items-center space-x-1.5 select-none ${className}`}
      title={showTooltip ? config.label : undefined}
    >
      {/* High-visibility glowing class badge */}
      <div
        className={`${sizeClasses.box} flex items-center justify-center shrink-0 border transition-all`}
        style={{
          borderColor: config.borderColor,
          background: `radial-gradient(circle at 35% 35%, ${config.bgColor} 0%, rgba(15, 23, 42, 0.95) 100%)`,
          boxShadow: `0 0 10px ${config.shadowColor}, inset 0 0 6px ${config.bgColor}`,
          color: config.textColor
        }}
      >
        {config.icon(sizeClasses.icon)}
      </div>

      {showLabel && (
        <span
          className={`font-black tracking-wide uppercase ${sizeClasses.text}`}
          style={{ color: config.textColor, textShadow: `0 0 8px ${config.shadowColor}` }}
        >
          {config.label}
        </span>
      )}
    </div>
  );
};
