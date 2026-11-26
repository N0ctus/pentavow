import { EnemyTemplate } from '../types/game';

export const ENEMY_TEMPLATES: Record<string, EnemyTemplate> = {
  // --- AUTHENTIC SIMPLE FIELD ENEMIES (Source: FE Ennemies) ---
  'frost-sasquatch': {
    id: 'frost-sasquatch',
    name: 'Frost Yeti Sasquatch',
    element: 'WATER',
    maxHp: 3200,
    atk: 110,
    matk: 80,
    def: 65,
    isBoss: false,
    attackInterval: 2.2,
    skills: [
      {
        name: 'Glacial Smash',
        castTime: 1.4,
        cooldown: 5.5,
        multiplier: 1.7,
        isAoE: false,
        description: 'Slams massive frozen fists into the earth creating ice shards.'
      }
    ],
    expReward: 180,
    goldReward: 160,
    shardReward: 14,
    size: 52,
    spriteType: 'enemy_sasquatch'
  },
  'shadowclaw-felicia': {
    id: 'shadowclaw-felicia',
    name: 'Shadowclaw Felicia',
    element: 'WIND',
    maxHp: 2600,
    atk: 130,
    matk: 40,
    def: 45,
    isBoss: false,
    attackInterval: 1.8,
    skills: [
      {
        name: 'Rolling Scratch',
        castTime: 1.1,
        cooldown: 4.5,
        multiplier: 1.8,
        isAoE: false,
        description: 'Acrobatic somersault slash with razor sharp claws.'
      }
    ],
    expReward: 170,
    goldReward: 150,
    shardReward: 12,
    size: 48,
    spriteType: 'enemy_felicia'
  },
  'frog-keroro': {
    id: 'frog-keroro',
    name: 'Frog Shinobi Keroro',
    element: 'WATER',
    maxHp: 1800,
    atk: 75,
    matk: 60,
    def: 35,
    isBoss: false,
    attackInterval: 2.4,
    skills: [
      {
        name: 'Keron Shuriken',
        castTime: 1.2,
        cooldown: 5,
        multiplier: 1.4,
        isAoE: false,
        description: 'Hurls spinning aquatic throwing stars.'
      }
    ],
    expReward: 120,
    goldReward: 110,
    shardReward: 8,
    size: 44,
    spriteType: 'enemy_keroro'
  },
  'gunner-giroro': {
    id: 'gunner-giroro',
    name: 'Crimson Gunner Giroro',
    element: 'FIRE',
    maxHp: 2800,
    atk: 120,
    matk: 30,
    def: 55,
    isBoss: false,
    attackInterval: 2.1,
    skills: [
      {
        name: 'Gatling Barrage',
        castTime: 1.5,
        cooldown: 6,
        multiplier: 1.7,
        isAoE: true,
        description: 'Unleashes a rapid fire heavy cannon burst.'
      }
    ],
    expReward: 190,
    goldReward: 170,
    shardReward: 15,
    size: 46,
    spriteType: 'enemy_giroro'
  },
  'ninja-dororo': {
    id: 'ninja-dororo',
    name: 'Azure Shinobi Dororo',
    element: 'WIND',
    maxHp: 2200,
    atk: 115,
    matk: 50,
    def: 40,
    isBoss: false,
    attackInterval: 1.9,
    skills: [
      {
        name: 'Shadow Katana Slash',
        castTime: 1.1,
        cooldown: 4.8,
        multiplier: 1.6,
        isAoE: false,
        description: 'Silent quick-draw blade strike from behind the target.'
      }
    ],
    expReward: 160,
    goldReward: 140,
    shardReward: 12,
    size: 44,
    spriteType: 'enemy_dororo'
  },
  'striker-tamama': {
    id: 'striker-tamama',
    name: 'Chi Striker Tamama',
    element: 'LIGHT',
    maxHp: 2500,
    atk: 125,
    matk: 90,
    def: 42,
    isBoss: false,
    attackInterval: 2.0,
    skills: [
      {
        name: 'Tamama Impact',
        castTime: 1.6,
        cooldown: 6,
        multiplier: 1.9,
        isAoE: false,
        description: 'Blasts a high-density beam of celestial energy.'
      }
    ],
    expReward: 175,
    goldReward: 155,
    shardReward: 14,
    size: 44,
    spriteType: 'enemy_tamama'
  },
  'tech-kululu': {
    id: 'tech-kululu',
    name: 'Karakuri Tech Kululu',
    element: 'WIND',
    maxHp: 2100,
    atk: 60,
    matk: 135,
    def: 38,
    isBoss: false,
    attackInterval: 2.3,
    skills: [
      {
        name: 'Sonic Distortion',
        castTime: 1.7,
        cooldown: 6.5,
        multiplier: 1.8,
        isAoE: true,
        description: 'Emits deafening high-pitch soundwaves interrupting casts.'
      }
    ],
    expReward: 165,
    goldReward: 145,
    shardReward: 13,
    size: 44,
    spriteType: 'enemy_kululu'
  },
  'spearman-keiji': {
    id: 'spearman-keiji',
    name: 'Wild Spearman Keiji',
    element: 'FIRE',
    maxHp: 3800,
    atk: 145,
    matk: 30,
    def: 70,
    isBoss: false,
    attackInterval: 2.1,
    skills: [
      {
        name: 'Crimson Spear Thrust',
        castTime: 1.3,
        cooldown: 5.2,
        multiplier: 1.8,
        isAoE: false,
        description: 'Fierce charging two-handed spear thrust.'
      }
    ],
    expReward: 220,
    goldReward: 200,
    shardReward: 18,
    size: 50,
    spriteType: 'enemy_keiji'
  },
  'warlord-hideyoshi': {
    id: 'warlord-hideyoshi',
    name: 'Golden Warlord Hideyoshi',
    element: 'LIGHT',
    maxHp: 4200,
    atk: 150,
    matk: 100,
    def: 80,
    isBoss: false,
    attackInterval: 2.2,
    skills: [
      {
        name: 'Sunfire Cleave',
        castTime: 1.5,
        cooldown: 6,
        multiplier: 2.0,
        isAoE: true,
        description: 'Swings an ornate golden nodachi engulfed in sunlight.'
      }
    ],
    expReward: 260,
    goldReward: 240,
    shardReward: 22,
    size: 52,
    spriteType: 'enemy_hideyoshi'
  },
  'demon-dairokuten': {
    id: 'demon-dairokuten',
    name: 'Demon Warlord Dairokuten',
    element: 'DARK',
    maxHp: 6500,
    atk: 180,
    matk: 160,
    def: 95,
    isBoss: false,
    attackInterval: 2.4,
    skills: [
      {
        name: 'Hellfire Brand',
        castTime: 1.8,
        cooldown: 7.5,
        multiplier: 2.2,
        isAoE: true,
        description: 'Calls down abyssal hellfire branding all enemies.'
      }
    ],
    expReward: 350,
    goldReward: 320,
    shardReward: 30,
    size: 56,
    spriteType: 'enemy_dairokuten'
  },

  // --- COMPATIBILITY MAPPINGS FOR STARTER ROAMERS ---
  'moss-slime': {
    id: 'moss-slime',
    name: 'Frog Shinobi Keroro',
    element: 'WATER',
    maxHp: 1400,
    atk: 55,
    matk: 40,
    def: 30,
    isBoss: false,
    attackInterval: 2.5,
    skills: [
      {
        name: 'Water Shuriken',
        castTime: 1.5,
        cooldown: 6,
        multiplier: 1.3,
        isAoE: false,
        description: 'Throws aquatic shuriken at target.'
      }
    ],
    expReward: 80,
    goldReward: 60,
    shardReward: 5,
    size: 44,
    spriteType: 'enemy_keroro'
  },
  'thorn-wolf': {
    id: 'thorn-wolf',
    name: 'Shadowclaw Felicia',
    element: 'WIND',
    maxHp: 2400,
    atk: 95,
    matk: 20,
    def: 45,
    isBoss: false,
    attackInterval: 2.2,
    skills: [
      {
        name: 'Savage Scratch',
        castTime: 1.2,
        cooldown: 5,
        multiplier: 1.6,
        isAoE: false,
        description: 'Vicious feline claw strike that rends armor.'
      }
    ],
    expReward: 160,
    goldReward: 140,
    shardReward: 12,
    size: 48,
    spriteType: 'enemy_felicia'
  },
  'gale-hawk': {
    id: 'gale-hawk',
    name: 'Frost Yeti Sasquatch',
    element: 'WATER',
    maxHp: 2200,
    atk: 85,
    matk: 70,
    def: 40,
    isBoss: false,
    attackInterval: 2.0,
    skills: [
      {
        name: 'Ice Punch',
        castTime: 1.4,
        cooldown: 5.5,
        multiplier: 1.5,
        isAoE: false,
        description: 'Strikes with freezing fists.'
      }
    ],
    expReward: 140,
    goldReward: 120,
    shardReward: 10,
    size: 48,
    spriteType: 'enemy_sasquatch'
  },
  'ninja-hotarubi': {
    id: 'ninja-hotarubi',
    name: 'Illusionist Hotarubi',
    element: 'WIND',
    maxHp: 2450,
    atk: 112,
    matk: 135,
    def: 42,
    isBoss: false,
    attackInterval: 1.95,
    skills: [
      {
        name: 'Phantom Butterfly Flurry',
        castTime: 1.2,
        cooldown: 5,
        multiplier: 1.75,
        isAoE: true,
        description: 'Summons spectral butterflies that scatter illusionary gale cuts.'
      }
    ],
    expReward: 175,
    goldReward: 155,
    shardReward: 14,
    size: 46,
    spriteType: 'enemy_hotarubi'
  },
  'kunoichi-akeginu': {
    id: 'kunoichi-akeginu',
    name: 'Blood-Mist Akeginu',
    element: 'FIRE',
    maxHp: 2750,
    atk: 138,
    matk: 95,
    def: 48,
    isBoss: false,
    attackInterval: 1.9,
    skills: [
      {
        name: 'Crimson Mist Slash',
        castTime: 1.1,
        cooldown: 4.8,
        multiplier: 1.85,
        isAoE: false,
        description: 'Unleashes an incendiary crimson mist arc from concealed blades.'
      }
    ],
    expReward: 195,
    goldReward: 175,
    shardReward: 16,
    size: 48,
    spriteType: 'enemy_akeginu'
  },
  'venom-jimushi': {
    id: 'venom-jimushi',
    name: 'Shadow Fang Jimushi',
    element: 'DARK',
    maxHp: 2900,
    atk: 145,
    matk: 85,
    def: 52,
    isBoss: false,
    attackInterval: 2.0,
    skills: [
      {
        name: 'Serpent Seal Bite',
        castTime: 1.3,
        cooldown: 5.5,
        multiplier: 1.9,
        isAoE: false,
        description: 'Sudden subterranean ambush erupting with cursed venom fangs.'
      }
    ],
    expReward: 210,
    goldReward: 185,
    shardReward: 17,
    size: 48,
    spriteType: 'enemy_jimushi'
  },
  'chaos-kotaro': {
    id: 'chaos-kotaro',
    name: 'Chaos Ninja Kotaro Fuma',
    element: 'DARK',
    maxHp: 3350,
    atk: 165,
    matk: 120,
    def: 55,
    isBoss: false,
    attackInterval: 1.75,
    skills: [
      {
        name: 'Fuma Nightmare Claw',
        castTime: 1.1,
        cooldown: 4.5,
        multiplier: 1.95,
        isAoE: true,
        description: 'Wild demonic cyclone tear across frontline hunters.'
      }
    ],
    expReward: 245,
    goldReward: 210,
    shardReward: 20,
    size: 50,
    spriteType: 'enemy_kotaro'
  },
  'mist-saizo': {
    id: 'mist-saizo',
    name: 'Mist-Spear Saizo',
    element: 'WATER',
    maxHp: 3100,
    atk: 152,
    matk: 110,
    def: 58,
    isBoss: false,
    attackInterval: 1.85,
    skills: [
      {
        name: 'Rime Crescent Thrust',
        castTime: 1.2,
        cooldown: 5,
        multiplier: 1.85,
        isAoE: false,
        description: 'Blindingly fast frost-spear lunge leaving frozen mist trails.'
      }
    ],
    expReward: 230,
    goldReward: 200,
    shardReward: 18,
    size: 50,
    spriteType: 'enemy_saizo'
  },
  'chevalier-dartagnan': {
    id: 'chevalier-dartagnan',
    name: "Gilded Chevalier D'Artagnan",
    element: 'LIGHT',
    maxHp: 3250,
    atk: 148,
    matk: 140,
    def: 62,
    isBoss: false,
    attackInterval: 1.85,
    skills: [
      {
        name: 'Royal Fleur Rapier',
        castTime: 1.2,
        cooldown: 5,
        multiplier: 1.9,
        isAoE: false,
        description: 'Precision triple-thrust gleaming with radiant golden crests.'
      }
    ],
    expReward: 240,
    goldReward: 220,
    shardReward: 19,
    size: 50,
    spriteType: 'enemy_dartagnan'
  },
  'vengeful-mitsunari': {
    id: 'vengeful-mitsunari',
    name: 'Vengeful Blade Mitsunari',
    element: 'DARK',
    maxHp: 3600,
    atk: 178,
    matk: 125,
    def: 54,
    isBoss: false,
    attackInterval: 1.7,
    skills: [
      {
        name: 'Violet Flash Iaido',
        castTime: 1.0,
        cooldown: 4.5,
        multiplier: 2.05,
        isAoE: false,
        description: 'Furious shadow-quickdraw slicing in a single blink.'
      }
    ],
    expReward: 270,
    goldReward: 240,
    shardReward: 22,
    size: 50,
    spriteType: 'enemy_mitsunari'
  },
  'thief-goemon': {
    id: 'thief-goemon',
    name: 'Shadow Thief Goemon',
    element: 'WIND',
    maxHp: 2150,
    atk: 125,
    matk: 65,
    def: 38,
    isBoss: false,
    attackInterval: 1.8,
    skills: [
      {
        name: 'Blazing Smoke Bomb',
        castTime: 1.1,
        cooldown: 5,
        multiplier: 1.7,
        isAoE: true,
        description: 'Detonates explosive flash-powder bursting with fire sparks.'
      }
    ],
    expReward: 165,
    goldReward: 190,
    shardReward: 14,
    size: 46,
    spriteType: 'enemy_goemon'
  },
  'peach-momotaro': {
    id: 'peach-momotaro',
    name: 'Peach Champion Momotaro',
    element: 'LIGHT',
    maxHp: 3400,
    atk: 160,
    matk: 120,
    def: 64,
    isBoss: false,
    attackInterval: 2.0,
    skills: [
      {
        name: 'Bestial Vanguard Surge',
        castTime: 1.4,
        cooldown: 5.5,
        multiplier: 1.95,
        isAoE: true,
        description: 'Charges alongside spirit hound, monkey, and pheasant companions.'
      }
    ],
    expReward: 255,
    goldReward: 235,
    shardReward: 21,
    size: 52,
    spriteType: 'enemy_momotaro'
  },
  'tactician-hanbei': {
    id: 'tactician-hanbei',
    name: 'Clockwork Tactician Hanbei',
    element: 'WIND',
    maxHp: 3050,
    atk: 120,
    matk: 168,
    def: 50,
    isBoss: false,
    attackInterval: 1.95,
    skills: [
      {
        name: 'Crimson Whip Gale',
        castTime: 1.3,
        cooldown: 5,
        multiplier: 1.88,
        isAoE: true,
        description: 'Sweeps the field with segmented whip-blade storm needles.'
      }
    ],
    expReward: 225,
    goldReward: 205,
    shardReward: 18,
    size: 48,
    spriteType: 'enemy_hanbei'
  },
  'guardian-seiryu': {
    id: 'guardian-seiryu',
    name: 'Guardian Deity Seiryu',
    element: 'DARK',
    maxHp: 50000,
    atk: 280,
    matk: 320,
    def: 120,
    isBoss: true,
    attackInterval: 2.6,
    skills: [
      {
        name: 'Azure Dragon Roar',
        castTime: 3.0,
        cooldown: 12,
        multiplier: 2.4,
        isAoE: true,
        description: 'Celestial dragon roar creating shockwaves across the field.'
      },
      {
        name: 'Draconic Breath',
        castTime: 1.8,
        cooldown: 7,
        multiplier: 1.9,
        isAoE: false,
        description: 'Concentrated burst of azure dragon fire at highest threat.'
      },
      {
        name: 'Celestial Calamity',
        castTime: 2.5,
        cooldown: 18,
        multiplier: 1.8,
        isAoE: true,
        description: 'Summons cosmic draconic storms shaking the realm.'
      }
    ],
    expReward: 1200,
    goldReward: 2500,
    shardReward: 150,
    size: 90,
    spriteType: 'boss_seiryu'
  },
  'abyssal-stag': {
    id: 'guardian-seiryu',
    name: 'Guardian Deity Seiryu',
    element: 'DARK',
    maxHp: 50000,
    atk: 280,
    matk: 320,
    def: 120,
    isBoss: true,
    attackInterval: 2.6,
    skills: [
      {
        name: 'Azure Dragon Roar',
        castTime: 3.0,
        cooldown: 12,
        multiplier: 2.4,
        isAoE: true,
        description: 'Celestial dragon roar creating shockwaves across the field.'
      },
      {
        name: 'Draconic Breath',
        castTime: 1.8,
        cooldown: 7,
        multiplier: 1.9,
        isAoE: false,
        description: 'Concentrated burst of azure dragon fire at highest threat.'
      },
      {
        name: 'Celestial Calamity',
        castTime: 2.5,
        cooldown: 18,
        multiplier: 1.8,
        isAoE: true,
        description: 'Summons cosmic draconic storms shaking the realm.'
      }
    ],
    expReward: 1200,
    goldReward: 2500,
    shardReward: 150,
    size: 90,
    spriteType: 'boss_seiryu'
  },
  'scarlet-akazonae': {
    id: 'scarlet-akazonae',
    name: 'Scarlet Warlord Akazonae',
    element: 'FIRE',
    maxHp: 65000,
    atk: 310,
    matk: 240,
    def: 125,
    isBoss: true,
    attackInterval: 2.4,
    skills: [
      {
        name: 'Crimson Lance Strike',
        castTime: 1.6,
        cooldown: 6,
        multiplier: 1.8,
        isAoE: false,
        description: 'Charging spear thrust enveloped in red-hot embers.'
      },
      {
        name: 'Infernal Cavalry Charge',
        castTime: 2.4,
        cooldown: 12,
        multiplier: 2.2,
        isAoE: true,
        description: 'Ghostly vanguard charge trampling all hunters in fire.'
      }
    ],
    expReward: 1500,
    goldReward: 3200,
    shardReward: 180,
    size: 80,
    spriteType: 'boss_akazonae'
  },
  'master-onmyoji': {
    id: 'master-onmyoji',
    name: 'Master Onmyoji Abe',
    element: 'WATER',
    maxHp: 72000,
    atk: 220,
    matk: 380,
    def: 115,
    isBoss: true,
    attackInterval: 2.5,
    skills: [
      {
        name: 'Talisman Hex Curse',
        castTime: 1.8,
        cooldown: 7,
        multiplier: 1.9,
        isAoE: false,
        description: 'Spiritual paper charm detonating with mystic force.'
      },
      {
        name: 'Torrential Shikigami',
        castTime: 2.8,
        cooldown: 14,
        multiplier: 2.3,
        isAoE: true,
        description: 'Unleashes water spirits in a spiraling whirlpool vortex.'
      }
    ],
    expReward: 1800,
    goldReward: 3800,
    shardReward: 210,
    size: 80,
    spriteType: 'boss_onmyoji'
  },
  'dark-horseman': {
    id: 'dark-horseman',
    name: 'Dread Horseman Kage',
    element: 'WIND',
    maxHp: 80000,
    atk: 340,
    matk: 260,
    def: 140,
    isBoss: true,
    attackInterval: 2.4,
    skills: [
      {
        name: 'Shadow Lance Cleave',
        castTime: 1.5,
        cooldown: 6,
        multiplier: 1.8,
        isAoE: false,
        description: 'Heavy shadow slash crushing vanguard defenses.'
      },
      {
        name: 'Storm Trample',
        castTime: 2.6,
        cooldown: 13,
        multiplier: 2.3,
        isAoE: true,
        description: 'Armored steed gallop cutting through all enemies like wind.'
      }
    ],
    expReward: 2100,
    goldReward: 4200,
    shardReward: 240,
    size: 80,
    spriteType: 'boss_dark_horseman'
  },
  'boss-hideyoshi': {
    id: 'boss-hideyoshi',
    name: 'Supreme Warlord Hideyoshi',
    element: 'LIGHT',
    maxHp: 88000,
    atk: 330,
    matk: 310,
    def: 140,
    isBoss: true,
    attackInterval: 2.3,
    skills: [
      {
        name: 'Golden Sun Cleave',
        castTime: 1.6,
        cooldown: 7,
        multiplier: 1.9,
        isAoE: false,
        description: 'Radiant blade cut charged with blinding solar energy.'
      },
      {
        name: 'Imperial Decree',
        castTime: 2.5,
        cooldown: 14,
        multiplier: 2.4,
        isAoE: true,
        description: 'Command of the Sun Emperor striking all combatants with heavenly spears.'
      },
      {
        name: 'Aura of Prosperity',
        castTime: 3.0,
        cooldown: 22,
        multiplier: 2.0,
        isAoE: true,
        description: 'Golden shockwave shaking the desert foundations.'
      }
    ],
    expReward: 2200,
    goldReward: 4500,
    shardReward: 250,
    size: 90,
    spriteType: 'boss_hideyoshi'
  },
  'boss-dairokuten': {
    id: 'boss-dairokuten',
    name: 'Sixth Demon King Dairokuten',
    element: 'DARK',
    maxHp: 120000,
    atk: 420,
    matk: 460,
    def: 160,
    isBoss: true,
    attackInterval: 2.2,
    skills: [
      {
        name: 'Demon Blade Oblivion',
        castTime: 1.8,
        cooldown: 6,
        multiplier: 2.1,
        isAoE: false,
        description: 'Void-infused cursed slash cleaving armor to dust.'
      },
      {
        name: 'Hellfire Cataclysm',
        castTime: 2.8,
        cooldown: 12,
        multiplier: 2.6,
        isAoE: true,
        description: 'Unleashes dark flames consuming the entire astral realm.'
      },
      {
        name: 'Dimensional Fracture',
        castTime: 3.5,
        cooldown: 20,
        multiplier: 3.0,
        isAoE: true,
        description: 'Rips spacetime itself, overwhelming all opposing souls.'
      }
    ],
    expReward: 3500,
    goldReward: 8000,
    shardReward: 400,
    size: 95,
    spriteType: 'boss_dairokuten'
  },
  'boss-nobunaga': {
    id: 'boss-nobunaga',
    name: 'Demon King Nobunaga Oda',
    element: 'FIRE',
    maxHp: 92000,
    atk: 360,
    matk: 340,
    def: 145,
    isBoss: true,
    attackInterval: 2.25,
    skills: [
      {
        name: 'Honnoji Crimson Draw',
        castTime: 1.6,
        cooldown: 6,
        multiplier: 2.0,
        isAoE: false,
        description: 'Sweeping demon-katana draw ignited with infernal royal fire.'
      },
      {
        name: 'Empire of Ashen Flame',
        castTime: 2.6,
        cooldown: 13,
        multiplier: 2.5,
        isAoE: true,
        description: 'Rains amethyst-crimson fire pillars across every opposing combatant.'
      }
    ],
    expReward: 2500,
    goldReward: 5200,
    shardReward: 280,
    size: 88,
    spriteType: 'boss_nobunaga'
  },
  'boss-tenzen': {
    id: 'boss-tenzen',
    name: 'Undying Warlord Tenzen',
    element: 'DARK',
    maxHp: 105000,
    atk: 390,
    matk: 370,
    def: 155,
    isBoss: true,
    attackInterval: 2.2,
    skills: [
      {
        name: 'Cursed Blood Edge',
        castTime: 1.5,
        cooldown: 6,
        multiplier: 2.05,
        isAoE: false,
        description: 'Relentless immortal strike tearing shadow wounds through armor.'
      },
      {
        name: 'Immortal Nether Hex',
        castTime: 2.7,
        cooldown: 14,
        multiplier: 2.55,
        isAoE: true,
        description: 'Unleashes violet malefic shockwaves surging from undying spirit.'
      }
    ],
    expReward: 2900,
    goldReward: 6200,
    shardReward: 320,
    size: 88,
    spriteType: 'boss_tenzen'
  },
  'boss-kenshin': {
    id: 'boss-kenshin',
    name: 'God of War Kenshin Uesugi',
    element: 'WATER',
    maxHp: 96000,
    atk: 375,
    matk: 350,
    def: 150,
    isBoss: true,
    attackInterval: 2.15,
    skills: [
      {
        name: 'Bishamonten Frost Slash',
        castTime: 1.5,
        cooldown: 6,
        multiplier: 2.0,
        isAoE: false,
        description: 'Supersonic glacial katana draw piercing defenses in frost.'
      },
      {
        name: 'Echigo Blizzard Vortex',
        castTime: 2.6,
        cooldown: 13,
        multiplier: 2.45,
        isAoE: true,
        description: 'Summons raging silver winter gales around the entire battlefield.'
      }
    ],
    expReward: 2650,
    goldReward: 5500,
    shardReward: 295,
    size: 88,
    spriteType: 'boss_kenshin'
  },
  'boss-taishogun': {
    id: 'boss-taishogun',
    name: 'Celestial Shogun Ashikaga',
    element: 'LIGHT',
    maxHp: 112000,
    atk: 380,
    matk: 410,
    def: 165,
    isBoss: true,
    attackInterval: 2.3,
    skills: [
      {
        name: 'Radiant Wing Saber',
        castTime: 1.6,
        cooldown: 6.5,
        multiplier: 2.1,
        isAoE: false,
        description: 'Heaven-forged dual sabre strike cutting with blazing solar light.'
      },
      {
        name: 'Shogunate Star Judgment',
        castTime: 2.8,
        cooldown: 15,
        multiplier: 2.6,
        isAoE: true,
        description: 'Calls down celestial thunderbeams from winged golden crests.'
      }
    ],
    expReward: 3100,
    goldReward: 6800,
    shardReward: 340,
    size: 92,
    spriteType: 'boss_taishogun'
  },
  'boss-dairokuten-maou': {
    id: 'boss-dairokuten-maou',
    name: 'Eclipse Sovereign Dairokuten',
    element: 'DARK',
    maxHp: 135000,
    atk: 445,
    matk: 485,
    def: 175,
    isBoss: true,
    attackInterval: 2.1,
    skills: [
      {
        name: 'Abyssal Wing Rend',
        castTime: 1.7,
        cooldown: 6,
        multiplier: 2.2,
        isAoE: false,
        description: 'Demonic crescent wing-slash shattering shields with void flame.'
      },
      {
        name: 'Cobalt Eclipse Cataclysm',
        castTime: 2.9,
        cooldown: 14,
        multiplier: 2.8,
        isAoE: true,
        description: 'Engulfs the entire realm in cobalt-indigo hellfire dragons.'
      }
    ],
    expReward: 4000,
    goldReward: 9500,
    shardReward: 460,
    size: 96,
    spriteType: 'boss_dairokuten_maou'
  },
  'boss-ieyasu': {
    id: 'boss-ieyasu',
    name: 'Sun-Fist Regent Ieyasu',
    element: 'LIGHT',
    maxHp: 98000,
    atk: 395,
    matk: 290,
    def: 170,
    isBoss: true,
    attackInterval: 2.2,
    skills: [
      {
        name: 'Toshogu Golden Breaker',
        castTime: 1.5,
        cooldown: 6,
        multiplier: 2.05,
        isAoE: false,
        description: 'Earth-shattering armored gauntlet blow blazing with sunlight.'
      },
      {
        name: 'Unbreakable Bonds Barrage',
        castTime: 2.5,
        cooldown: 13,
        multiplier: 2.4,
        isAoE: true,
        description: 'Golden energy pillars erupt across the arena in radiant defiance.'
      }
    ],
    expReward: 2750,
    goldReward: 5800,
    shardReward: 300,
    size: 90,
    spriteType: 'boss_ieyasu'
  },

  // --- SUIKODEN STAR LEAP COLOR-MATCHED WORLD BOSSES ---
  'boss-estoque': {
    id: 'boss-estoque',
    name: 'Verdant Colossus Estoque',
    element: 'WIND',
    maxHp: 94000,
    atk: 365,
    matk: 310,
    def: 165,
    isBoss: true,
    attackInterval: 2.25,
    skills: [
      {
        name: 'Emerald Horn Goring',
        castTime: 1.5,
        cooldown: 6,
        multiplier: 2.0,
        isAoE: false,
        description: 'Charges forward with razor-sharp emerald war-horns.'
      },
      {
        name: 'Tempest Stampede',
        castTime: 2.6,
        cooldown: 13,
        multiplier: 2.45,
        isAoE: true,
        description: 'Shakes the forest floor with an earth-shattering gale quake.'
      }
    ],
    expReward: 2600,
    goldReward: 5400,
    shardReward: 290,
    size: 92,
    spriteType: 'boss_estoque'
  },
  'boss-redulse-a': {
    id: 'boss-redulse-a',
    name: 'Silver-Fang Warlord Red Ulse',
    element: 'WATER',
    maxHp: 102000,
    atk: 390,
    matk: 330,
    def: 155,
    isBoss: true,
    attackInterval: 2.1,
    skills: [
      {
        name: 'Glacial Claw Frenzy',
        castTime: 1.4,
        cooldown: 5.5,
        multiplier: 2.05,
        isAoE: false,
        description: 'Unleashes an eight-hit whirlwind of silver frost-claw slashes.'
      },
      {
        name: 'Crimson Snow Howl',
        castTime: 2.5,
        cooldown: 12.5,
        multiplier: 2.5,
        isAoE: true,
        description: 'Feral frost-scarlet shockwave freezing all nearby intruders.'
      }
    ],
    expReward: 2800,
    goldReward: 6000,
    shardReward: 315,
    size: 92,
    spriteType: 'boss_redulse_a'
  },
  'boss-redulse-b': {
    id: 'boss-redulse-b',
    name: 'Blood-Moon Destroyer Red Ulse',
    element: 'FIRE',
    maxHp: 118000,
    atk: 425,
    matk: 380,
    def: 165,
    isBoss: true,
    attackInterval: 2.05,
    skills: [
      {
        name: 'Infernal Rend Combo',
        castTime: 1.4,
        cooldown: 5.5,
        multiplier: 2.15,
        isAoE: false,
        description: 'Tears through steel with blazing obsidian-scarlet claws.'
      },
      {
        name: 'Volcanic Blood Moon',
        castTime: 2.7,
        cooldown: 13.5,
        multiplier: 2.65,
        isAoE: true,
        description: 'Erupts magma shockwaves beneath every challenger.'
      }
    ],
    expReward: 3300,
    goldReward: 7400,
    shardReward: 370,
    size: 94,
    spriteType: 'boss_redulse_b'
  },

  // --- SUIKODEN STAR LEAP FIELD MONSTERS ---
  'bird-knight': {
    id: 'bird-knight',
    name: 'Crimson Bird Knight',
    element: 'FIRE',
    maxHp: 2900,
    atk: 130,
    matk: 65,
    def: 52,
    isBoss: false,
    attackInterval: 1.9,
    skills: [{ name: 'Dive Talon', castTime: 1.2, cooldown: 5, multiplier: 1.7, isAoE: false, description: 'High-speed swooping talon strike.' }],
    expReward: 185,
    goldReward: 165,
    shardReward: 14,
    size: 48,
    spriteType: 'enemy_bird_knight'
  },
  'black-tiger': {
    id: 'black-tiger',
    name: 'Obsidian Fang Tiger',
    element: 'DARK',
    maxHp: 3300,
    atk: 145,
    matk: 55,
    def: 60,
    isBoss: false,
    attackInterval: 1.85,
    skills: [{ name: 'Shadow Pounce', castTime: 1.2, cooldown: 5, multiplier: 1.8, isAoE: false, description: 'Rending night-fang bite.' }],
    expReward: 205,
    goldReward: 185,
    shardReward: 16,
    size: 50,
    spriteType: 'enemy_black_tiger'
  },
  'blade-bull': {
    id: 'blade-bull',
    name: 'Frosthorn Blade Bull',
    element: 'WATER',
    maxHp: 3700,
    atk: 140,
    matk: 45,
    def: 78,
    isBoss: false,
    attackInterval: 2.2,
    skills: [{ name: 'Glacial Charge', castTime: 1.4, cooldown: 5.5, multiplier: 1.85, isAoE: false, description: 'Impales targets with frosted blade horns.' }],
    expReward: 225,
    goldReward: 200,
    shardReward: 18,
    size: 52,
    spriteType: 'enemy_blade_bull'
  },
  'bonbon': {
    id: 'bonbon',
    name: 'Cobalt Puff Bonbon',
    element: 'WATER',
    maxHp: 1950,
    atk: 75,
    matk: 95,
    def: 42,
    isBoss: false,
    attackInterval: 2.1,
    skills: [{ name: 'Aqua Puff Bounce', castTime: 1.1, cooldown: 4.5, multiplier: 1.5, isAoE: false, description: 'Rapidly slams into targets in a watery swirl.' }],
    expReward: 135,
    goldReward: 120,
    shardReward: 10,
    size: 42,
    spriteType: 'enemy_bonbon'
  },
  'crow-tengu': {
    id: 'crow-tengu',
    name: 'Midnight Crow Tengu',
    element: 'DARK',
    maxHp: 3100,
    atk: 138,
    matk: 85,
    def: 55,
    isBoss: false,
    attackInterval: 1.9,
    skills: [{ name: 'BlackFeather Flurry', castTime: 1.3, cooldown: 5.2, multiplier: 1.75, isAoE: true, description: 'Unleashes razor dark feathers across the sky.' }],
    expReward: 195,
    goldReward: 175,
    shardReward: 15,
    size: 50,
    spriteType: 'enemy_crow_tengu'
  },
  'crystal-shield': {
    id: 'crystal-shield',
    name: 'Amethyst Crystal Shield',
    element: 'DARK',
    maxHp: 4100,
    atk: 95,
    matk: 135,
    def: 92,
    isBoss: false,
    attackInterval: 2.3,
    skills: [{ name: 'Prism Reflection', castTime: 1.5, cooldown: 6, multiplier: 1.85, isAoE: true, description: 'Fires refracted violet crystal beams.' }],
    expReward: 235,
    goldReward: 215,
    shardReward: 20,
    size: 48,
    spriteType: 'enemy_crystal_shield'
  },
  'demon-dog': {
    id: 'demon-dog',
    name: 'Cinderflame Demon Hound',
    element: 'FIRE',
    maxHp: 2700,
    atk: 128,
    matk: 70,
    def: 48,
    isBoss: false,
    attackInterval: 1.85,
    skills: [{ name: 'Ember Snap', castTime: 1.1, cooldown: 4.8, multiplier: 1.7, isAoE: false, description: 'Scorching bite ignited with volcanic ash.' }],
    expReward: 175,
    goldReward: 155,
    shardReward: 13,
    size: 46,
    spriteType: 'enemy_demon_dog'
  },
  'eagle-man': {
    id: 'eagle-man',
    name: 'Sunwing Eagle Vanguard',
    element: 'LIGHT',
    maxHp: 2850,
    atk: 132,
    matk: 75,
    def: 52,
    isBoss: false,
    attackInterval: 1.95,
    skills: [{ name: 'Solar Swoop', castTime: 1.2, cooldown: 5, multiplier: 1.75, isAoE: false, description: 'Golden aerial cleave descending from above.' }],
    expReward: 185,
    goldReward: 170,
    shardReward: 14,
    size: 48,
    spriteType: 'enemy_eagle_man'
  },
  'eau-mouton': {
    id: 'eau-mouton',
    name: 'Glacier Cloud Mouton',
    element: 'WATER',
    maxHp: 2550,
    atk: 105,
    matk: 90,
    def: 60,
    isBoss: false,
    attackInterval: 2.15,
    skills: [{ name: 'Frost Ram', castTime: 1.2, cooldown: 5.2, multiplier: 1.65, isAoE: false, description: 'Butts opponents with icy crystal fleece.' }],
    expReward: 165,
    goldReward: 150,
    shardReward: 12,
    size: 46,
    spriteType: 'enemy_eau_mouton'
  },
  'electric-snail': {
    id: 'electric-snail',
    name: 'Volt-Shell Snail',
    element: 'LIGHT',
    maxHp: 2950,
    atk: 112,
    matk: 120,
    def: 72,
    isBoss: false,
    attackInterval: 2.25,
    skills: [{ name: 'Static Whip', castTime: 1.3, cooldown: 5.5, multiplier: 1.7, isAoE: false, description: 'Extends an electrified golden pseudopod strike.' }],
    expReward: 190,
    goldReward: 170,
    shardReward: 15,
    size: 46,
    spriteType: 'enemy_electric_snail'
  },
  'furfur': {
    id: 'furfur',
    name: 'Golden Furfur',
    element: 'LIGHT',
    maxHp: 2050,
    atk: 88,
    matk: 102,
    def: 45,
    isBoss: false,
    attackInterval: 2.0,
    skills: [{ name: 'Amber Fuzz Whirl', castTime: 1.1, cooldown: 4.8, multiplier: 1.6, isAoE: true, description: 'Spins rapidly kicking up golden sparks.' }],
    expReward: 145,
    goldReward: 135,
    shardReward: 11,
    size: 42,
    spriteType: 'enemy_furfur'
  },
  'gray-ulse': {
    id: 'gray-ulse',
    name: 'Mossmane Lycan Ulse',
    element: 'WIND',
    maxHp: 3500,
    atk: 148,
    matk: 70,
    def: 64,
    isBoss: false,
    attackInterval: 1.9,
    skills: [{ name: 'Gale Claw Combo', castTime: 1.3, cooldown: 5.5, multiplier: 1.9, isAoE: false, description: 'Unleashes rapid moss-wind martial claw strikes.' }],
    expReward: 220,
    goldReward: 195,
    shardReward: 17,
    size: 52,
    spriteType: 'enemy_gray_ulse'
  },
  'grizzly-bear': {
    id: 'grizzly-bear',
    name: 'Highland Grizzly',
    element: 'WIND',
    maxHp: 3900,
    atk: 155,
    matk: 30,
    def: 75,
    isBoss: false,
    attackInterval: 2.35,
    skills: [{ name: 'Timber Maul', castTime: 1.4, cooldown: 5.8, multiplier: 1.95, isAoE: false, description: 'Heavy crushing paw slam with roaring force.' }],
    expReward: 230,
    goldReward: 210,
    shardReward: 18,
    size: 54,
    spriteType: 'enemy_grizzly_bear'
  },
  'keraunos': {
    id: 'keraunos',
    name: 'Thunderhorn Keraunos',
    element: 'LIGHT',
    maxHp: 3850,
    atk: 150,
    matk: 110,
    def: 74,
    isBoss: false,
    attackInterval: 2.15,
    skills: [{ name: 'Lightning Gore', castTime: 1.4, cooldown: 5.8, multiplier: 1.9, isAoE: true, description: 'Tramples earth beneath crackles of amber lightning.' }],
    expReward: 235,
    goldReward: 215,
    shardReward: 19,
    size: 54,
    spriteType: 'enemy_keraunos'
  },
  'lava-snail': {
    id: 'lava-snail',
    name: 'Magma-Shell Snail',
    element: 'FIRE',
    maxHp: 3150,
    atk: 115,
    matk: 130,
    def: 76,
    isBoss: false,
    attackInterval: 2.25,
    skills: [{ name: 'Molten Stretch', castTime: 1.3, cooldown: 5.5, multiplier: 1.8, isAoE: false, description: 'Snaps forward in a burst of superheated magma.' }],
    expReward: 195,
    goldReward: 175,
    shardReward: 16,
    size: 46,
    spriteType: 'enemy_lava_snail'
  },
  'nightmare': {
    id: 'nightmare',
    name: 'Ember-Forge Nightmare',
    element: 'FIRE',
    maxHp: 3650,
    atk: 152,
    matk: 115,
    def: 72,
    isBoss: false,
    attackInterval: 2.05,
    skills: [{ name: 'Blazing Cleaver', castTime: 1.35, cooldown: 5.5, multiplier: 1.9, isAoE: false, description: 'Swings a crimson-forged heavy scimitar.' }],
    expReward: 230,
    goldReward: 205,
    shardReward: 18,
    size: 50,
    spriteType: 'enemy_nightmare'
  },
  'phantom': {
    id: 'phantom',
    name: 'Cobalt Dread Phantom',
    element: 'DARK',
    maxHp: 3550,
    atk: 146,
    matk: 120,
    def: 70,
    isBoss: false,
    attackInterval: 2.05,
    skills: [{ name: 'Spectral Saber', castTime: 1.35, cooldown: 5.5, multiplier: 1.85, isAoE: false, description: 'Cleaves targets with a ghostly cobalt blade.' }],
    expReward: 225,
    goldReward: 200,
    shardReward: 17,
    size: 50,
    spriteType: 'enemy_phantom'
  },
  'poison-spider': {
    id: 'poison-spider',
    name: 'Venomweaver Spider',
    element: 'DARK',
    maxHp: 2450,
    atk: 118,
    matk: 95,
    def: 46,
    isBoss: false,
    attackInterval: 1.9,
    skills: [{ name: 'Toxin Pincer', castTime: 1.15, cooldown: 5, multiplier: 1.7, isAoE: false, description: 'Delivers venomous purplefang slashes.' }],
    expReward: 170,
    goldReward: 150,
    shardReward: 13,
    size: 46,
    spriteType: 'enemy_poison_spider'
  },
  'roar-wolf': {
    id: 'roar-wolf',
    name: 'Suncrest Roar Wolf',
    element: 'LIGHT',
    maxHp: 2800,
    atk: 134,
    matk: 75,
    def: 52,
    isBoss: false,
    attackInterval: 1.85,
    skills: [{ name: 'Sunburst Lunge', castTime: 1.15, cooldown: 4.8, multiplier: 1.75, isAoE: false, description: 'Fierce golden-maned predatory bite.' }],
    expReward: 185,
    goldReward: 165,
    shardReward: 14,
    size: 48,
    spriteType: 'enemy_roar_wolf'
  },
  'roc': {
    id: 'roc',
    name: 'Amber Sky Roc',
    element: 'WIND',
    maxHp: 3100,
    atk: 136,
    matk: 85,
    def: 56,
    isBoss: false,
    attackInterval: 1.95,
    skills: [{ name: 'Cyclone Wings', castTime: 1.3, cooldown: 5.2, multiplier: 1.8, isAoE: true, description: 'Whips up tearing amber updrafts across the field.' }],
    expReward: 200,
    goldReward: 180,
    shardReward: 15,
    size: 50,
    spriteType: 'enemy_roc'
  },
  'shadow-dog': {
    id: 'shadow-dog',
    name: 'Dusk-Tail Shadow Dog',
    element: 'DARK',
    maxHp: 2750,
    atk: 132,
    matk: 80,
    def: 50,
    isBoss: false,
    attackInterval: 1.85,
    skills: [{ name: 'Gloom Bite', castTime: 1.15, cooldown: 4.8, multiplier: 1.75, isAoE: false, description: 'Quick ambush bite infused with twilight energy.' }],
    expReward: 180,
    goldReward: 160,
    shardReward: 14,
    size: 46,
    spriteType: 'enemy_shadow_dog'
  },
  'slime-snail': {
    id: 'slime-snail',
    name: 'Tide-Shell Slime Snail',
    element: 'WATER',
    maxHp: 2650,
    atk: 98,
    matk: 112,
    def: 68,
    isBoss: false,
    attackInterval: 2.2,
    skills: [{ name: 'Hydro Whip', castTime: 1.25, cooldown: 5.2, multiplier: 1.65, isAoE: false, description: 'Extends a surging aqua pseudopod slam.' }],
    expReward: 175,
    goldReward: 155,
    shardReward: 13,
    size: 46,
    spriteType: 'enemy_slime_snail'
  },
  'white-tiger': {
    id: 'white-tiger',
    name: 'Glacier White Tiger',
    element: 'WATER',
    maxHp: 3350,
    atk: 146,
    matk: 65,
    def: 60,
    isBoss: false,
    attackInterval: 1.85,
    skills: [{ name: 'Frostbite Rend', castTime: 1.2, cooldown: 5, multiplier: 1.85, isAoE: false, description: 'Swift snowy claw slash freezing wounds solid.' }],
    expReward: 210,
    goldReward: 190,
    shardReward: 16,
    size: 50,
    spriteType: 'enemy_white_tiger'
  },
  'wind-tiger': {
    id: 'wind-tiger',
    name: 'Emerald Gale Tiger',
    element: 'WIND',
    maxHp: 3250,
    atk: 144,
    matk: 65,
    def: 58,
    isBoss: false,
    attackInterval: 1.85,
    skills: [{ name: 'Cyclone Claw', castTime: 1.2, cooldown: 5, multiplier: 1.8, isAoE: false, description: 'Razor-wind saber tiger slash.' }],
    expReward: 205,
    goldReward: 185,
    shardReward: 16,
    size: 50,
    spriteType: 'enemy_wind_tiger'
  },
  'wolf': {
    id: 'wolf',
    name: 'Timberfang Wolf',
    element: 'WIND',
    maxHp: 2350,
    atk: 118,
    matk: 40,
    def: 46,
    isBoss: false,
    attackInterval: 1.8,
    skills: [{ name: 'Pack Fang', castTime: 1.1, cooldown: 4.5, multiplier: 1.65, isAoE: false, description: 'Ferocious rushing woodland bite.' }],
    expReward: 155,
    goldReward: 140,
    shardReward: 11,
    size: 46,
    spriteType: 'enemy_wolf'
  }
};
