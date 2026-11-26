export interface MaterialItem {
  id: string;
  name: string;
  rarity: 1 | 2 | 3 | 4;
  description: string;
  dropSource: string;
}

export const CRAFTING_MATERIALS: Record<string, MaterialItem> = {
  'mat-slime-essence': {
    id: 'mat-slime-essence',
    name: 'Slime Essence',
    rarity: 1,
    description: 'Pure translucent jelly collected from Moss Slimes. Used for basic weapon tempering (+1 to +3).',
    dropSource: 'Moss Slimes'
  },
  'mat-thorn-fang': {
    id: 'mat-thorn-fang',
    name: 'Thorn Fang',
    rarity: 2,
    description: 'Hardened wooden canine tooth from Thorn Wolves. Used for mid-tier weapon refinement (+4 to +6).',
    dropSource: 'Thorn Wolves'
  },
  'mat-gale-feather': {
    id: 'mat-gale-feather',
    name: 'Gale Feather',
    rarity: 3,
    description: 'Razor-sharp razor plume vibrating with wind pressure from Gale Hawks. Used for advanced refinement (+7 to +9).',
    dropSource: 'Gale Hawks'
  },
  'mat-abyssal-core': {
    id: 'mat-abyssal-core',
    name: 'Celestial Dragon Core',
    rarity: 4,
    description: 'Pulsing condensed azure matter from Guardian Deity Seiryu. Required to forge masterwork relics.',
    dropSource: 'Guardian Deity Seiryu World Boss'
  }
};
