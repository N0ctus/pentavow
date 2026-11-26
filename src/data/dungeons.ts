import { DungeonDefinition } from '../types/game';

export const DUNGEONS: DungeonDefinition[] = [
  {
    id: 'dungeon-infernal-spire',
    name: 'Infernal Spire',
    description: 'Tower of blazing lava and fiery spirits. Exploit with Water magic and attacks!',
    element: 'FIRE',
    recommendedLevel: 10,
    waves: [
      {
        waveNumber: 1,
        enemyTemplateId: 'enemy_giroro',
        enemyName: 'Crimson Gunner Giroro',
        enemyHp: 2200,
        enemyElement: 'FIRE',
        isBoss: false,
        spriteType: 'enemy_giroro'
      },
      {
        waveNumber: 2,
        enemyTemplateId: 'enemy_keiji',
        enemyName: 'Wild Spearman Keiji',
        enemyHp: 5500,
        enemyElement: 'FIRE',
        isBoss: false,
        spriteType: 'enemy_keiji'
      },
      {
        waveNumber: 3,
        enemyTemplateId: 'scarlet-akazonae',
        enemyName: 'Scarlet Warlord Akazonae',
        enemyHp: 28000,
        enemyElement: 'FIRE',
        isBoss: true,
        spriteType: 'boss_akazonae'
      }
    ],
    rewardGold: 1200,
    rewardExp: 600,
    rewardShards: 80
  },
  {
    id: 'dungeon-sunken-catacombs',
    name: 'Sunken Catacombs',
    description: 'Flooded subterranean crypt guarded by torrential sea creatures. Use Wind elements!',
    element: 'WATER',
    recommendedLevel: 14,
    waves: [
      {
        waveNumber: 1,
        enemyTemplateId: 'enemy_keroro',
        enemyName: 'Frog Shinobi Keroro',
        enemyHp: 2800,
        enemyElement: 'WATER',
        isBoss: false,
        spriteType: 'enemy_keroro'
      },
      {
        waveNumber: 2,
        enemyTemplateId: 'enemy_sasquatch',
        enemyName: 'Frost Yeti Sasquatch',
        enemyHp: 7200,
        enemyElement: 'WATER',
        isBoss: false,
        spriteType: 'enemy_sasquatch'
      },
      {
        waveNumber: 3,
        enemyTemplateId: 'master-onmyoji',
        enemyName: 'Master Onmyoji Abe',
        enemyHp: 38000,
        enemyElement: 'WATER',
        isBoss: true,
        spriteType: 'boss_onmyoji'
      }
    ],
    rewardGold: 1800,
    rewardExp: 900,
    rewardShards: 120
  },
  {
    id: 'dungeon-zephyr-peaks',
    name: 'Zephyr Peaks',
    description: 'High-altitude crags scourged by gale-force storms. Fire weapons deal maximum damage!',
    element: 'WIND',
    recommendedLevel: 18,
    waves: [
      {
        waveNumber: 1,
        enemyTemplateId: 'enemy_dororo',
        enemyName: 'Azure Shinobi Dororo',
        enemyHp: 3500,
        enemyElement: 'WIND',
        isBoss: false,
        spriteType: 'enemy_dororo'
      },
      {
        waveNumber: 2,
        enemyTemplateId: 'enemy_felicia',
        enemyName: 'Shadowclaw Felicia',
        enemyHp: 9000,
        enemyElement: 'WIND',
        isBoss: false,
        spriteType: 'enemy_felicia'
      },
      {
        waveNumber: 3,
        enemyTemplateId: 'dark-horseman',
        enemyName: 'Dread Horseman Kage',
        enemyHp: 48000,
        enemyElement: 'WIND',
        isBoss: true,
        spriteType: 'boss_dark_horseman'
      }
    ],
    rewardGold: 2600,
    rewardExp: 1400,
    rewardShards: 160
  },
  {
    id: 'dungeon-honnoji-inferno',
    name: 'Honnoji Crimson Citadel',
    description: 'Burning Sengoku fortress commanded by Demon King Nobunaga Oda and Kunoichi vanguard.',
    element: 'FIRE',
    recommendedLevel: 26,
    waves: [
      {
        waveNumber: 1,
        enemyTemplateId: 'kunoichi-akeginu',
        enemyName: 'Blood-Mist Akeginu',
        enemyHp: 5800,
        enemyElement: 'FIRE',
        isBoss: false,
        spriteType: 'enemy_akeginu'
      },
      {
        waveNumber: 2,
        enemyTemplateId: 'tactician-hanbei',
        enemyName: 'Clockwork Tactician Hanbei',
        enemyHp: 11500,
        enemyElement: 'WIND',
        isBoss: false,
        spriteType: 'enemy_hanbei'
      },
      {
        waveNumber: 3,
        enemyTemplateId: 'boss-nobunaga',
        enemyName: 'Demon King Nobunaga Oda',
        enemyHp: 62000,
        enemyElement: 'FIRE',
        isBoss: true,
        spriteType: 'boss_nobunaga'
      }
    ],
    rewardGold: 3400,
    rewardExp: 1850,
    rewardShards: 210
  },
  {
    id: 'dungeon-echigo-blizzard',
    name: 'Echigo Frost Sanctuary',
    description: 'Frozen mountain temple guarded by Mist-Spear Saizo and the God of War Kenshin Uesugi.',
    element: 'WATER',
    recommendedLevel: 34,
    waves: [
      {
        waveNumber: 1,
        enemyTemplateId: 'mist-saizo',
        enemyName: 'Mist-Spear Saizo',
        enemyHp: 7400,
        enemyElement: 'WATER',
        isBoss: false,
        spriteType: 'enemy_saizo'
      },
      {
        waveNumber: 2,
        enemyTemplateId: 'chevalier-dartagnan',
        enemyName: "Gilded Chevalier D'Artagnan",
        enemyHp: 14500,
        enemyElement: 'LIGHT',
        isBoss: false,
        spriteType: 'enemy_dartagnan'
      },
      {
        waveNumber: 3,
        enemyTemplateId: 'boss-kenshin',
        enemyName: 'God of War Kenshin Uesugi',
        enemyHp: 76000,
        enemyElement: 'WATER',
        isBoss: true,
        spriteType: 'boss_kenshin'
      }
    ],
    rewardGold: 4200,
    rewardExp: 2400,
    rewardShards: 260
  },
  {
    id: 'dungeon-eclipse-shogunate',
    name: 'Eclipse Shogunate Spire',
    description: 'Forbidden astral pinnacle ruled by Chaos Fuma ninjas and Eclipse Sovereign Dairokuten.',
    element: 'DARK',
    recommendedLevel: 46,
    waves: [
      {
        waveNumber: 1,
        enemyTemplateId: 'chaos-kotaro',
        enemyName: 'Chaos Ninja Kotaro Fuma',
        enemyHp: 9600,
        enemyElement: 'DARK',
        isBoss: false,
        spriteType: 'enemy_kotaro'
      },
      {
        waveNumber: 2,
        enemyTemplateId: 'vengeful-mitsunari',
        enemyName: 'Vengeful Blade Mitsunari',
        enemyHp: 18000,
        enemyElement: 'DARK',
        isBoss: false,
        spriteType: 'enemy_mitsunari'
      },
      {
        waveNumber: 3,
        enemyTemplateId: 'boss-dairokuten-maou',
        enemyName: 'Eclipse Sovereign Dairokuten',
        enemyHp: 98000,
        enemyElement: 'DARK',
        isBoss: true,
        spriteType: 'boss_dairokuten_maou'
      }
    ],
    rewardGold: 5800,
    rewardExp: 3400,
    rewardShards: 350
  }
];
