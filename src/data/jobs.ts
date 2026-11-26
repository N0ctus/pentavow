import { JobDefinition, JobType, WeaponCategory } from '../types/game';

export const MAX_JOB_LEVEL = 10;

export const JOB_DEFINITIONS: Record<JobType, JobDefinition> = {
  // ==============================================================
  // 1. THE MARTIAL PATH (Martial / Bushido - Base: Warrior)
  // ==============================================================
  WARRIOR: {
    type: 'WARRIOR',
    name: 'Warrior',
    jpName: 'Samurai Warrior',
    path: 'MARTIAL',
    isBase: true,
    baseClass: 'WARRIOR',
    evolutions: ['GUARDIAN', 'BERSERKER', 'ROGUE', 'ASSASSIN', 'HUNTER'],
    role: 'Melee Brawler',
    description: 'Disciplined frontline master of blade and combat stance. Builds immense threat and cleaves foes with raw steel.',
    allowedWeapons: ['GREATBLADE', 'SHIELD'],
    baseHp: 1800,
    baseAtk: 130,
    baseMatk: 30,
    baseDef: 140,
    baseMdef: 80,
    baseCrit: 0.08,
    passiveName: 'Bushido Will',
    passiveDescription: '+120% Threat generation and +15% damage reduction in battle.',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'Max HP', bonus: 10, desc: '+10% Max HP across all classes' };
      if (lvl >= 5) return { stat: 'DEF', bonus: 8, desc: '+8% Defense' };
      return null;
    },
    legendaryWeaponId: 'w-gorehowl'
  },
  GUARDIAN: {
    type: 'GUARDIAN',
    name: 'Guardian',
    jpName: 'Iron Juggernaut',
    path: 'MARTIAL',
    isBase: false,
    baseClass: 'WARRIOR',
    role: 'Tank',
    description: 'Heavy armor and greatshield titan (Protection Warrior). Unbreakable bastion that shields party members from lethal harm.',
    allowedWeapons: ['SHIELD', 'GREATBLADE'],
    baseHp: 2200,
    baseAtk: 110,
    baseMatk: 25,
    baseDef: 180,
    baseMdef: 120,
    baseCrit: 0.05,
    passiveName: 'Iron Fortress',
    passiveDescription: '+200% Threat generation, and automatically absorbs 25% of all damage taken by party members.',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'DEF', bonus: 15, desc: '+15% Physical DEF across all classes' };
      if (lvl >= 5) return { stat: 'Max HP', bonus: 10, desc: '+10% Max HP' };
      return null;
    },
    legendaryWeaponId: 'w-bulwark-azzinoth'
  },
  BERSERKER: {
    type: 'BERSERKER',
    name: 'Berserker',
    jpName: 'Fury Champion',
    path: 'MARTIAL',
    isBase: false,
    baseClass: 'WARRIOR',
    role: 'Melee Brawler',
    description: 'Pure weapon mastery and unchecked fury (Arms / Fury Warrior). Sacrifices defense to unleash relentless devastation.',
    allowedWeapons: ['GREATBLADE', 'DAGGERS'],
    baseHp: 1650,
    baseAtk: 220,
    baseMatk: 30,
    baseDef: 100,
    baseMdef: 70,
    baseCrit: 0.20,
    passiveName: 'Raging Flurry',
    passiveDescription: 'Auto-attacks strike with +30% attack speed and gain +25% bonus damage when below 50% HP.',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'ATK', bonus: 15, desc: '+15% Physical ATK across all classes' };
      if (lvl >= 5) return { stat: 'Crit Rate', bonus: 8, desc: '+8% Critical Rate' };
      return null;
    },
    legendaryWeaponId: 'w-ashkandi'
  },
  ROGUE: {
    type: 'ROGUE',
    name: 'Rogue',
    jpName: 'Shinobi Ninja',
    path: 'MARTIAL',
    isBase: false,
    baseClass: 'WARRIOR',
    role: 'Crit DPS',
    description: 'Stealth and shadow strike master (Subtlety Rogue). Exploits vital points with lethal precision and smoke evasion.',
    allowedWeapons: ['DAGGERS', 'BOW'],
    baseHp: 1300,
    baseAtk: 185,
    baseMatk: 40,
    baseDef: 80,
    baseMdef: 80,
    baseCrit: 0.30,
    passiveName: 'Shadowstep',
    passiveDescription: '+25% Critical Hit Rate bonus, and basic attacks have a 25% chance to ignore enemy defense.',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'Crit Rate', bonus: 12, desc: '+12% Critical Rate across all classes' };
      if (lvl >= 5) return { stat: 'Crit DMG', bonus: 15, desc: '+15% Critical Damage' };
      return null;
    },
    legendaryWeaponId: 'w-fangs-devourer'
  },
  ASSASSIN: {
    type: 'ASSASSIN',
    name: 'Assassin',
    jpName: 'Shadow Assassin',
    path: 'MARTIAL',
    isBase: false,
    baseClass: 'WARRIOR',
    role: 'Crit DPS',
    description: 'Dual-wielding, poison concoctions, and swift acrobatic swordplay (Assassination / Outlaw Rogue).',
    allowedWeapons: ['DAGGERS', 'GREATBLADE'],
    baseHp: 1350,
    baseAtk: 200,
    baseMatk: 45,
    baseDef: 85,
    baseMdef: 80,
    baseCrit: 0.28,
    passiveName: 'Deadly Venom',
    passiveDescription: 'All critical hits inflict Deadly Poison, dealing additional Dark damage over time.',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'Crit DMG', bonus: 20, desc: '+20% Critical Damage across all classes' };
      if (lvl >= 5) return { stat: 'ATK', bonus: 10, desc: '+10% Physical ATK' };
      return null;
    },
    legendaryWeaponId: 'w-kingslayers'
  },
  HUNTER: {
    type: 'HUNTER',
    name: 'Hunter',
    jpName: 'Kyudo Ranger',
    path: 'MARTIAL',
    isBase: false,
    baseClass: 'WARRIOR',
    role: 'Ranged DPS',
    description: 'Master marksman and beast tracker (Marksman / Beast Mastery Hunter). Rains arrows from safety with lethal consistency.',
    allowedWeapons: ['BOW', 'DAGGERS'],
    baseHp: 1400,
    baseAtk: 195,
    baseMatk: 50,
    baseDef: 90,
    baseMdef: 90,
    baseCrit: 0.22,
    passiveName: 'Eagle Eye',
    passiveDescription: 'Attacks from range deal +20% bonus damage and cannot miss.',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'ATK', bonus: 12, desc: '+12% Physical ATK across all classes' };
      if (lvl >= 5) return { stat: 'Crit Rate', bonus: 6, desc: '+6% Critical Rate' };
      return null;
    },
    legendaryWeaponId: 'w-thoridal'
  },

  // ==============================================================
  // 2. THE ARCANE PATH (Arcane / Onmyodo - Base: Mage)
  // ==============================================================
  MAGE: {
    type: 'MAGE',
    name: 'Mage',
    jpName: 'Elemental Mage',
    path: 'ARCANE',
    isBase: true,
    baseClass: 'MAGE',
    evolutions: ['ARCHMAGE', 'WARLOCK', 'DEATH_KNIGHT', 'DEMON_HUNTER'],
    role: 'Magic DPS',
    description: 'Apprentice of celestial elements and arcane forces. Commands Fire, Water, and Wind to exploit enemy affinities.',
    allowedWeapons: ['STAFF', 'TOME'],
    baseHp: 1150,
    baseAtk: 60,
    baseMatk: 210,
    baseDef: 65,
    baseMdef: 130,
    baseCrit: 0.12,
    passiveName: 'Elemental Weaving',
    passiveDescription: '+25% elemental weakness damage (1.75x multiplier instead of 1.5x).',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'MATK', bonus: 10, desc: '+10% Magic ATK across all classes' };
      if (lvl >= 5) return { stat: 'MDEF', bonus: 8, desc: '+8% Magic Defense' };
      return null;
    },
    legendaryWeaponId: 'w-felomelorn'
  },
  ARCHMAGE: {
    type: 'ARCHMAGE',
    name: 'Archmage',
    jpName: 'Grand Archmage',
    path: 'ARCANE',
    isBase: false,
    baseClass: 'MAGE',
    role: 'Magic DPS',
    description: 'Mastery over pure Arcane, Fire, and Frost magic (Mage). Channels world-shattering cataclysms and time distortions.',
    allowedWeapons: ['STAFF', 'TOME'],
    baseHp: 1250,
    baseAtk: 65,
    baseMatk: 260,
    baseDef: 70,
    baseMdef: 155,
    baseCrit: 0.16,
    passiveName: 'Arcane Overload',
    passiveDescription: 'All spell skills generate +30% more Ether and gain +20% Magic Attack multiplier.',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'MATK', bonus: 18, desc: '+18% Magic ATK across all classes' };
      if (lvl >= 5) return { stat: 'Crit DMG', bonus: 15, desc: '+15% Critical Damage' };
      return null;
    },
    legendaryWeaponId: 'w-aluneth'
  },
  WARLOCK: {
    type: 'WARLOCK',
    name: 'Warlock',
    jpName: 'Fel Warlock',
    path: 'ARCANE',
    isBase: false,
    baseClass: 'MAGE',
    role: 'Magic DPS',
    description: 'Wielder of forbidden curses, affliction shadows, and nether demons (Warlock). Drains enemy life to empower allies.',
    allowedWeapons: ['TOME', 'STAFF'],
    baseHp: 1400,
    baseAtk: 70,
    baseMatk: 240,
    baseDef: 80,
    baseMdef: 145,
    baseCrit: 0.14,
    passiveName: 'Soul Harvest',
    passiveDescription: 'Damaging cursed enemies leeches 10% of damage dealt back as HP to the party.',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'Max HP', bonus: 12, desc: '+12% Max HP across all classes' };
      if (lvl >= 5) return { stat: 'MATK', bonus: 10, desc: '+10% Magic ATK' };
      return null;
    },
    legendaryWeaponId: 'w-ulthalesh'
  },
  DEATH_KNIGHT: {
    type: 'DEATH_KNIGHT',
    name: 'Death Knight',
    jpName: 'Unholy Death Knight',
    path: 'ARCANE',
    isBase: false,
    baseClass: 'MAGE',
    role: 'Melee Brawler',
    description: 'Unholy dark magic combined with heavy runeblade melee (Unholy Death Knight). Commands cold oblivion and decay.',
    allowedWeapons: ['GREATBLADE', 'TOME'],
    baseHp: 1900,
    baseAtk: 180,
    baseMatk: 150,
    baseDef: 135,
    baseMdef: 110,
    baseCrit: 0.12,
    passiveName: 'Rune of Decay',
    passiveDescription: 'Melee strikes also deal 40% bonus Dark magic damage and reduce target attack by 10%.',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'DEF', bonus: 10, desc: '+10% DEF across all classes' };
      if (lvl >= 5) return { stat: 'ATK', bonus: 10, desc: '+10% Physical ATK' };
      return null;
    },
    legendaryWeaponId: 'w-shadowmourne'
  },
  DEMON_HUNTER: {
    type: 'DEMON_HUNTER',
    name: 'Demon Hunter',
    jpName: 'Demon Hunter',
    path: 'ARCANE',
    isBase: false,
    baseClass: 'MAGE',
    role: 'Crit DPS',
    description: 'Absorbs demonic energy to wage blistering, aggressive melee with twin warglaives (Havoc Demon Hunter).',
    allowedWeapons: ['DAGGERS', 'GREATBLADE'],
    baseHp: 1450,
    baseAtk: 215,
    baseMatk: 110,
    baseDef: 95,
    baseMdef: 95,
    baseCrit: 0.26,
    passiveName: 'Demonic Metamorphosis',
    passiveDescription: 'Casting an Ultimate grants +35% Attack and +15% Life Steal for 12 seconds.',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'Crit Rate', bonus: 10, desc: '+10% Critical Rate across all classes' };
      if (lvl >= 5) return { stat: 'ATK', bonus: 12, desc: '+12% Physical ATK' };
      return null;
    },
    legendaryWeaponId: 'w-warglaives-azzinoth'
  },

  // ==============================================================
  // 3. THE DIVINE & PRIMAL PATH (Divine / Shinto - Base: Priest / Initiate)
  // ==============================================================
  PRIEST: {
    type: 'PRIEST',
    name: 'Priest',
    jpName: 'Holy Priest',
    path: 'DIVINE',
    isBase: true,
    baseClass: 'PRIEST',
    evolutions: ['PALADIN', 'DRUID', 'SHAMAN', 'MONK', 'EVOKER'],
    role: 'Healer / Buff',
    description: 'Spiritual devotee channeling radiant life force and sacred wards. Restores party HP and cleanses afflictions.',
    allowedWeapons: ['RELIC', 'STAFF'],
    baseHp: 1350,
    baseAtk: 80,
    baseMatk: 180,
    baseDef: 85,
    baseMdef: 150,
    baseCrit: 0.08,
    passiveName: 'Divine Grace',
    passiveDescription: 'Healing skills empower all party members with +15% ATK/MATK for 10s.',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'Heal Power', bonus: 15, desc: '+15% Healing Potency across all classes' };
      if (lvl >= 5) return { stat: 'MDEF', bonus: 10, desc: '+10% Magic Defense' };
      return null;
    },
    legendaryWeaponId: 'w-tuure'
  },
  PALADIN: {
    type: 'PALADIN',
    name: 'Paladin',
    jpName: 'Holy Paladin',
    path: 'DIVINE',
    isBase: false,
    baseClass: 'PRIEST',
    role: 'Tank',
    description: 'Combines divine faith with heavy plate armor and holy swords (Holy / Protection Paladin). Shield of the virtuous.',
    allowedWeapons: ['GREATBLADE', 'SHIELD'],
    baseHp: 2000,
    baseAtk: 140,
    baseMatk: 130,
    baseDef: 160,
    baseMdef: 140,
    baseCrit: 0.08,
    passiveName: 'Aura of Devotion',
    passiveDescription: 'Party members near the Paladin take 15% reduced damage, and threat generated is increased by 150%.',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'DEF', bonus: 12, desc: '+12% DEF across all classes' };
      if (lvl >= 5) return { stat: 'Max HP', bonus: 8, desc: '+8% Max HP' };
      return null;
    },
    legendaryWeaponId: 'w-ashbringer'
  },
  DRUID: {
    type: 'DRUID',
    name: 'Druid',
    jpName: 'Nature Druid',
    path: 'DIVINE',
    isBase: false,
    baseClass: 'PRIEST',
    role: 'Healer / Buff',
    description: 'Channels nature spirits and celestial flora to mend wounds and rejuvenate the glade (Restoration Druid).',
    allowedWeapons: ['STAFF', 'RELIC'],
    baseHp: 1500,
    baseAtk: 110,
    baseMatk: 200,
    baseDef: 95,
    baseMdef: 140,
    baseCrit: 0.10,
    passiveName: 'Rejuvenation',
    passiveDescription: 'Party members continuously regenerate 3% of their max HP every 4 seconds in battle.',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'Max HP', bonus: 15, desc: '+15% Max HP across all classes' };
      if (lvl >= 5) return { stat: 'Heal Power', bonus: 10, desc: '+10% Healing Potency' };
      return null;
    },
    legendaryWeaponId: 'w-scythe-elune'
  },
  SHAMAN: {
    type: 'SHAMAN',
    name: 'Shaman',
    jpName: 'Elemental Shaman',
    path: 'DIVINE',
    isBase: false,
    baseClass: 'PRIEST',
    role: 'Magic DPS',
    description: 'Communes with elemental ancestors, storm totems, and lightning shocks (Elemental / Enhancement Shaman).',
    allowedWeapons: ['MACE', 'RELIC'],
    baseHp: 1600,
    baseAtk: 150,
    baseMatk: 190,
    baseDef: 110,
    baseMdef: 125,
    baseCrit: 0.14,
    passiveName: 'Windfury Totem',
    passiveDescription: 'All party members gain +15% Attack Speed and a 20% chance to trigger an instant secondary attack.',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'MATK', bonus: 12, desc: '+12% Magic ATK across all classes' };
      if (lvl >= 5) return { stat: 'ATK', bonus: 10, desc: '+10% Physical ATK' };
      return null;
    },
    legendaryWeaponId: 'w-doomhammer'
  },
  MONK: {
    type: 'MONK',
    name: 'Monk',
    jpName: 'Martial Monk',
    path: 'DIVINE',
    isBase: false,
    baseClass: 'PRIEST',
    role: 'Melee Brawler',
    description: 'Harmonizes inner spiritual Chi into lightning-fast palm strikes, flying kicks, and mist mending (Windwalker Monk).',
    allowedWeapons: ['STAFF', 'DAGGERS'],
    baseHp: 1650,
    baseAtk: 180,
    baseMatk: 120,
    baseDef: 115,
    baseMdef: 115,
    baseCrit: 0.20,
    passiveName: 'Chi Mastery',
    passiveDescription: 'Consecutive attacks increase Critical Rate by +5% per strike (stacks up to +25%).',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'ATK', bonus: 14, desc: '+14% Physical ATK across all classes' };
      if (lvl >= 5) return { stat: 'Crit Rate', bonus: 8, desc: '+8% Critical Rate' };
      return null;
    },
    legendaryWeaponId: 'w-sheilun'
  },
  EVOKER: {
    type: 'EVOKER',
    name: 'Evoker',
    jpName: 'Dragon Evoker',
    path: 'DIVINE',
    isBase: false,
    baseClass: 'PRIEST',
    role: 'Magic DPS',
    description: 'Channels ancestral draconic dragonflight essence for devastating breath attacks and temporal empowerment (Evoker).',
    allowedWeapons: ['RELIC', 'STAFF'],
    baseHp: 1550,
    baseAtk: 90,
    baseMatk: 245,
    baseDef: 100,
    baseMdef: 145,
    baseCrit: 0.15,
    passiveName: 'Essence of Dragonflight',
    passiveDescription: 'All fire and light skills hit with +30% area damage and incinerate enemy defense by 15%.',
    unlockedLevelPassive: (lvl: number) => {
      if (lvl >= 10) return { stat: 'MATK', bonus: 16, desc: '+16% Magic ATK across all classes' };
      if (lvl >= 5) return { stat: 'Max HP', bonus: 10, desc: '+10% Max HP' };
      return null;
    },
    legendaryWeaponId: 'w-naszuro'
  },

  // Backward compatibility mappings
  VANGUARD: {
    type: 'VANGUARD',
    name: 'Warrior (Legacy Vanguard)',
    jpName: 'Warrior',
    path: 'MARTIAL',
    isBase: true,
    baseClass: 'WARRIOR',
    role: 'Tank',
    description: 'Frontline guardian.',
    allowedWeapons: ['GREATBLADE', 'SHIELD'],
    baseHp: 1800,
    baseAtk: 120,
    baseMatk: 40,
    baseDef: 140,
    baseMdef: 90,
    baseCrit: 0.05,
    passiveName: 'Iron Will',
    passiveDescription: '+150% Threat generation and +20% damage reduction.',
    unlockedLevelPassive: () => ({ stat: 'Max HP', bonus: 10, desc: '+10% Max HP' }),
    legendaryWeaponId: 'w-gorehowl'
  },
  SPELLWEAVER: {
    type: 'SPELLWEAVER',
    name: 'Mage (Legacy Spellweaver)',
    jpName: 'Mage',
    path: 'ARCANE',
    isBase: true,
    baseClass: 'MAGE',
    role: 'Magic DPS',
    description: 'Master of elemental spells.',
    allowedWeapons: ['STAFF', 'TOME'],
    baseHp: 1100,
    baseAtk: 60,
    baseMatk: 210,
    baseDef: 60,
    baseMdef: 130,
    baseCrit: 0.10,
    passiveName: 'Arcane Surge',
    passiveDescription: '+25% elemental weakness damage.',
    unlockedLevelPassive: () => ({ stat: 'MATK', bonus: 10, desc: '+10% MATK' }),
    legendaryWeaponId: 'w-felomelorn'
  },
  LIGHTBEARER: {
    type: 'LIGHTBEARER',
    name: 'Priest (Legacy Lightbearer)',
    jpName: 'Priest',
    path: 'DIVINE',
    isBase: true,
    baseClass: 'PRIEST',
    role: 'Healer / Buff',
    description: 'Holy restorative envoy.',
    allowedWeapons: ['RELIC', 'STAFF'],
    baseHp: 1350,
    baseAtk: 90,
    baseMatk: 160,
    baseDef: 85,
    baseMdef: 145,
    baseCrit: 0.08,
    passiveName: 'Grace',
    passiveDescription: 'Healing skills empower all party members.',
    unlockedLevelPassive: () => ({ stat: 'Heal Power', bonus: 15, desc: '+15% Healing' }),
    legendaryWeaponId: 'w-tuure'
  },
  SHADOWBLADE: {
    type: 'SHADOWBLADE',
    name: 'Rogue (Legacy Shadowblade)',
    jpName: 'Rogue',
    path: 'MARTIAL',
    isBase: false,
    baseClass: 'WARRIOR',
    role: 'Crit DPS',
    description: 'Lethal shadow assassin.',
    allowedWeapons: ['DAGGERS', 'BOW'],
    baseHp: 1200,
    baseAtk: 190,
    baseMatk: 50,
    baseDef: 75,
    baseMdef: 75,
    baseCrit: 0.35,
    passiveName: 'Assassinate',
    passiveDescription: '+30% Critical Hit Rate bonus.',
    unlockedLevelPassive: () => ({ stat: 'Crit DMG', bonus: 20, desc: '+20% Crit DMG' }),
    legendaryWeaponId: 'w-kingslayers'
  }
};

export const EXP_TABLE: number[] = Array.from({ length: 51 }, (_, i) => {
  if (i <= 1) return 100;
  return Math.floor(100 * Math.pow(1.18, i - 1));
});
