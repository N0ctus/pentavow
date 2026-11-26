import { ElementType, JobType } from '../types/game';

export function getElementalMultiplier(attacker: ElementType, defender: ElementType, job?: JobType): number {
  let mult = 1.0;

  if (attacker === defender) {
    mult = 1.0;
  } else if (
    (attacker === 'FIRE' && defender === 'WIND') ||
    (attacker === 'WIND' && defender === 'WATER') ||
    (attacker === 'WATER' && defender === 'FIRE') ||
    (attacker === 'LIGHT' && defender === 'DARK') ||
    (attacker === 'DARK' && defender === 'LIGHT')
  ) {
    mult = 1.5;
    if (job === 'SPELLWEAVER') {
      mult = 1.75; // Arcane Surge passive: +25% elemental weakness damage
    }
  } else if (
    (attacker === 'FIRE' && defender === 'WATER') ||
    (attacker === 'WATER' && defender === 'WIND') ||
    (attacker === 'WIND' && defender === 'FIRE')
  ) {
    mult = 0.75; // Resisted
  }

  return mult;
}

export function getWeaknessElement(defender: ElementType): ElementType {
  switch (defender) {
    case 'FIRE': return 'WATER';
    case 'WATER': return 'WIND';
    case 'WIND': return 'FIRE';
    case 'DARK': return 'LIGHT';
    case 'LIGHT': return 'DARK';
  }
}

export function getElementColor(element: ElementType): string {
  switch (element) {
    case 'FIRE': return '#ef4444';
    case 'WATER': return '#3b82f6';
    case 'WIND': return '#10b981';
    case 'LIGHT': return '#f59e0b';
    case 'DARK': return '#8b5cf6';
  }
}

export function getElementBgClass(element: ElementType): string {
  const meta = ANIME_ELEMENTS[element];
  return meta ? meta.badgeClass : 'bg-slate-800 text-slate-200 border-slate-700';
}

export interface AnimeElementInfo {
  type: ElementType;
  name: string;
  breathingStyle: string;
  techniqueSub: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  bgGradientClass: string;
  badgeClass: string;
}

export const ANIME_ELEMENTS: Record<ElementType, AnimeElementInfo> = {
  FIRE: {
    type: 'FIRE',
    name: 'Fire',
    breathingStyle: 'Flame Technique',
    techniqueSub: 'En-do Crimson Arc',
    primaryColor: '#ef4444',
    secondaryColor: '#f59e0b',
    glowColor: 'rgba(239, 68, 68, 0.7)',
    bgGradientClass: 'from-red-600 via-orange-500 to-amber-400',
    badgeClass: 'bg-gradient-to-r from-red-950/90 via-red-900/60 to-orange-950/80 text-orange-200 border border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
  },
  WATER: {
    type: 'WATER',
    name: 'Water',
    breathingStyle: 'Tidal Technique',
    techniqueSub: 'Sui-ryu Constant Flow',
    primaryColor: '#0ea5e9',
    secondaryColor: '#38bdf8',
    glowColor: 'rgba(14, 165, 233, 0.7)',
    bgGradientClass: 'from-blue-600 via-cyan-500 to-sky-300',
    badgeClass: 'bg-gradient-to-r from-blue-950/90 via-cyan-900/60 to-sky-950/80 text-cyan-200 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.5)]',
  },
  WIND: {
    type: 'WIND',
    name: 'Wind',
    breathingStyle: 'Tempest Technique',
    techniqueSub: 'Fusha-jin Gale Slashes',
    primaryColor: '#10b981',
    secondaryColor: '#34d399',
    glowColor: 'rgba(16, 185, 129, 0.7)',
    bgGradientClass: 'from-emerald-600 via-teal-500 to-green-300',
    badgeClass: 'bg-gradient-to-r from-emerald-950/90 via-teal-900/60 to-emerald-950/80 text-emerald-200 border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
  },
  LIGHT: {
    type: 'LIGHT',
    name: 'Light',
    breathingStyle: 'Solar Technique',
    techniqueSub: 'Nichirin Radiant Starburst',
    primaryColor: '#f59e0b',
    secondaryColor: '#fde047',
    glowColor: 'rgba(245, 158, 11, 0.75)',
    bgGradientClass: 'from-amber-500 via-yellow-400 to-amber-100',
    badgeClass: 'bg-gradient-to-r from-amber-950/90 via-yellow-900/60 to-amber-950/80 text-amber-200 border border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.6)]',
  },
  DARK: {
    type: 'DARK',
    name: 'Dark',
    breathingStyle: 'Abyssal Technique',
    techniqueSub: 'Kuro-kage Nether Fissure',
    primaryColor: '#a855f7',
    secondaryColor: '#c084fc',
    glowColor: 'rgba(168, 85, 247, 0.75)',
    bgGradientClass: 'from-purple-600 via-violet-500 to-fuchsia-400',
    badgeClass: 'bg-gradient-to-r from-purple-950/90 via-violet-900/60 to-purple-950/80 text-purple-200 border border-purple-400/70 shadow-[0_0_12px_rgba(168,85,247,0.6)]',
  },
};

export function getRarityBorderClass(rarity: number, isMythic?: boolean): string {
  if (isMythic) {
    return 'border-rose-400 mythic-card-glow ring-1 ring-amber-300/60';
  }
  switch (rarity) {
    case 5: return 'border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]';
    case 4: return 'border-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.45)]';
    case 3: return 'border-sky-400/85';
    case 2: return 'border-emerald-400/75';
    default: return 'border-slate-500/80';
  }
}

export function getRarityLabel(rarity: number, isMythic?: boolean): string {
  if (isMythic) return '✦ MYTHIC';
  switch (rarity) {
    case 5: return '5★ Legendary';
    case 4: return '4★ Epic';
    case 3: return '3★ Rare';
    case 2: return '2★ Uncommon';
    default: return '1★ Common';
  }
}

/**
 * Dynamic HP Scaling for Boss Encounters based on active party combatants.
 * Base HP scales by +45% per additional party member beyond 1.
 */
export function getScaledBossHp(baseHp: number, participantCount: number): number {
  if (participantCount <= 1) return baseHp;
  const scale = 1.0 + 0.45 * Math.max(0, participantCount - 1);
  return Math.round(baseHp * scale);
}

export interface RefinementMilestone {
  level: number;
  name: string;
  jpName: string;
  description: string;
  icon: string;
  badgeClass: string;
}

export const REFINEMENT_MILESTONES: RefinementMilestone[] = [
  {
    level: 3,
    name: 'Haste Edge',
    jpName: '疾風の刃',
    description: '+10% Attack Cadence (Auto-attack cooldown reduced)',
    icon: '⚡',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
  },
  {
    level: 5,
    name: 'Swift Core',
    jpName: '瞬影の核',
    description: '-1.0s Weapon Active Skill Cooldown',
    icon: '⏳',
    badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
  },
  {
    level: 7,
    name: 'Razor Edge',
    jpName: '覇気の切尖',
    description: '+20% Critical Strike Damage Multiplier',
    icon: '💥',
    badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-500/50'
  },
  {
    level: 10,
    name: 'Awakened Soul',
    jpName: '神威覚醒',
    description: '15% chance on skill cast to trigger an Echo Double-Strike',
    icon: '🔥',
    badgeClass: 'bg-amber-950/90 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
  }
];

export function getWeaponRefinementPerks(upgradeLevel: number) {
  return {
    hasteBonus: upgradeLevel >= 3 ? 0.10 : 0,
    cooldownReductionSec: upgradeLevel >= 5 ? 1.0 : 0,
    critDamageBonus: upgradeLevel >= 7 ? 0.20 : 0,
    awakenedDoubleStrike: upgradeLevel >= 10
  };
}
