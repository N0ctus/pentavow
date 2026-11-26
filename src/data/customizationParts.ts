import { Rarity } from '../types/game';

export type PartCategory = 'OUTFIT' | 'HAIRSTYLE' | 'CAPE' | 'ACCESSORY' | 'AURA';

export interface CustomizationPart {
  id: string;
  category: PartCategory;
  name: string;
  jpName: string; // Subtitle / classification in English
  rarity: Rarity;
  description: string;
  previewColor?: string;
  isDefault?: boolean;
}

export const ALL_CUSTOMIZATION_PARTS: CustomizationPart[] = [
  // ==========================================
  // 1. OUTFITS / BODY ARMOR
  // ==========================================
  {
    id: 'outfit_novice',
    category: 'OUTFIT',
    name: 'Novice Mercenary Garb',
    jpName: 'Rookie Mercenary',
    rarity: 3,
    description: 'Practical leather brigandine and linen tunic worn by rookie heroes.',
    isDefault: true,
  },
  {
    id: 'outfit_askr',
    category: 'OUTFIT',
    name: 'Askr Lord Regalia',
    jpName: 'Alfonse Prince Armor',
    rarity: 5,
    description: 'Ceremonial white, cobalt blue and gold scrollwork armor of the Askr royal prince.',
  },
  {
    id: 'outfit_embla',
    category: 'OUTFIT',
    name: 'Emblian Shadow Vestments',
    jpName: 'Veronica Imperial Robes',
    rarity: 5,
    description: 'Imperial velvet robe lined with midnight purple and cursed gold filigree.',
  },
  {
    id: 'outfit_divine_dragon',
    category: 'OUTFIT',
    name: 'Divine Dragon Monarch Plate',
    jpName: 'Marth Naga Armor',
    rarity: 5,
    description: 'Radiant dragon scale cuirass blessed by Naga with scarlet trim and gold pauldrons.',
  },
  {
    id: 'outfit_pegasus',
    category: 'OUTFIT',
    name: 'Pegasus Knight Flight-Armor',
    jpName: 'Sky Knight Armor',
    rarity: 4,
    description: 'Lightweight silver breastplate and sky-blue tunic favored by aerial knights.',
  },
  {
    id: 'outfit_myrmidon',
    category: 'OUTFIT',
    name: 'Swordmaster Samurai Gi',
    jpName: 'Swordmaster Robes',
    rarity: 4,
    description: 'Crimson haori, corded obi sash, and wrapped hakama for blinding blade strikes.',
  },
  {
    id: 'outfit_grandmaster',
    category: 'OUTFIT',
    name: 'Grandmaster Tactical Coat',
    jpName: 'Robin Tactician Coat',
    rarity: 4,
    description: 'Deep purple trench coat etched with arcane protective crests and gold borders.',
  },
  {
    id: 'outfit_valkyrie',
    category: 'OUTFIT',
    name: 'Valkyrie Maiden Armor',
    jpName: 'Shieldmaiden Plate',
    rarity: 5,
    description: 'Sanctified platinum plate armor worn by celestial shieldmaidens.',
  },
  {
    id: 'outfit_ninja',
    category: 'OUTFIT',
    name: 'Shinobi Night Shozoku',
    jpName: 'Shadow Assassin Suit',
    rarity: 4,
    description: 'Silent midnight cloth and mesh cuirass engineered for undetectable assassination.',
  },

  // ==========================================
  // 2. HAIRSTYLES
  // ==========================================
  {
    id: 'spiky',
    category: 'HAIRSTYLE',
    name: 'Spiky Hero Mane',
    jpName: 'Dynamic Hero Hair',
    rarity: 3,
    description: 'Classic dynamic spiky bangs of a resolute fantasy hero.',
    isDefault: true,
  },
  {
    id: 'twintails',
    category: 'HAIRSTYLE',
    name: 'High Twin Tails',
    jpName: 'High Ribbon Tails',
    rarity: 3,
    description: 'Bouncy anime twintails tied high with ribbon clasps.',
    isDefault: true,
  },
  {
    id: 'ponytail',
    category: 'HAIRSTYLE',
    name: 'Samurai High Ponytail',
    jpName: 'Warrior Ponytail',
    rarity: 3,
    description: 'Disciplined high ponytail sweeping back from the brow.',
    isDefault: true,
  },
  {
    id: 'wild_rogue',
    category: 'HAIRSTYLE',
    name: 'Wild Rogue Mane',
    jpName: 'Windblown Mane',
    rarity: 3,
    description: 'Untamed windblown locks with a sharp rebellious edge.',
    isDefault: true,
  },
  {
    id: 'wizard_flow',
    category: 'HAIRSTYLE',
    name: 'Sage Flowing Locks',
    jpName: 'Scholar Long Locks',
    rarity: 3,
    description: 'Calm flowing locks parted cleanly with noble poise.',
    isDefault: true,
  },
  {
    id: 'mystic_bob',
    category: 'HAIRSTYLE',
    name: 'Mystic Bob Cut',
    jpName: 'Princess Bob Cut',
    rarity: 3,
    description: 'Graceful shoulder-length hime-cut with straight blunt fringe.',
    isDefault: true,
  },
  {
    id: 'askr_lord',
    category: 'HAIRSTYLE',
    name: 'Askr Prince Royal Sweep',
    jpName: 'Alfonse Swept Cut',
    rarity: 4,
    description: 'Side-swept noble locks with an adventurous cowlick.',
  },
  {
    id: 'anime_heroine',
    category: 'HAIRSTYLE',
    name: 'Princess Royal Braid',
    jpName: 'Royal Braid Style',
    rarity: 4,
    description: 'Elaborate royal ponytail braided with side ribbons and anime bangs.',
  },
  {
    id: 'swordmaster_topknot',
    category: 'HAIRSTYLE',
    name: 'Swordmaster Topknot',
    jpName: 'Samurai Topknot',
    rarity: 4,
    description: 'Traditional samurai warrior topknot tied tight with white washi cord.',
  },
  {
    id: 'pegasus_braid',
    category: 'HAIRSTYLE',
    name: 'Pegasus Sky Braids',
    jpName: 'Wing Braids',
    rarity: 4,
    description: 'Side twin braids with feathers woven directly into the strands.',
  },
  {
    id: 'legendary_twin_spires',
    category: 'HAIRSTYLE',
    name: 'Legendary Valkyrie Twintails',
    jpName: 'Valkyrie Spire Tails',
    rarity: 5,
    description: 'Majestic spiraling twintails adorned with golden wing barrettes.',
  },
  {
    id: 'draconic_locks',
    category: 'HAIRSTYLE',
    name: 'Divine Dragon Flowing Mane',
    jpName: 'Dragon Monarch Hair',
    rarity: 5,
    description: 'Mythic voluminous hair shimmering with celestial iridescence.',
  },

  // ==========================================
  // 3. CAPES & MANTLES
  // ==========================================
  {
    id: 'none',
    category: 'CAPE',
    name: 'No Cape',
    jpName: 'Unequipped',
    rarity: 3,
    description: 'Light travel stance without shoulder mantles.',
    isDefault: true,
  },
  {
    id: 'cape_royal',
    category: 'CAPE',
    name: 'Askr Royal Mantle',
    jpName: 'Prince Blue Cloak',
    rarity: 4,
    description: 'Fluttering azure blue cape lined with crimson silk and lion clasps.',
  },
  {
    id: 'cape_shadow',
    category: 'CAPE',
    name: 'Emblian Shadow Mantle',
    jpName: 'Raven Dark Cloak',
    rarity: 4,
    description: 'Velvet raven-feather cloak with dark amethyst brooches.',
  },
  {
    id: 'cape_askr_wings',
    category: 'CAPE',
    name: 'Askr Golden Wing Mantle',
    jpName: 'Golden Wing Mantle',
    rarity: 5,
    description: 'Luminescent golden wing-shaped capelets that pulse with celestial speed.',
  },
  {
    id: 'cape_flame_scarf',
    category: 'CAPE',
    name: 'Flame Dragon Long Scarf',
    jpName: 'Blazing Long Scarf',
    rarity: 4,
    description: 'Blazing crimson scarf trailing in the wind with burning embers.',
  },
  {
    id: 'cape_celestial',
    category: 'CAPE',
    name: 'Tsukuyomi Starlight Cloak',
    jpName: 'Star Constellation Cloak',
    rarity: 5,
    description: 'Deep navy silk cape embedded with glowing silver constellation stars.',
  },
  {
    id: 'cape_samurai_jinbaori',
    category: 'CAPE',
    name: 'Shogun War Jinbaori',
    jpName: 'Commander Battle Coat',
    rarity: 4,
    description: 'Heavy gold-embroidered brocade coat emblazoned with warrior crest.',
  },

  // ==========================================
  // 4. ACCESSORIES & HEADGEAR
  // ==========================================
  {
    id: 'none',
    category: 'ACCESSORY',
    name: 'No Accessory',
    jpName: 'Unequipped',
    rarity: 3,
    description: 'Clean silhouette without headgear or companion.',
    isDefault: true,
  },
  {
    id: 'acc_spirit_kitsune',
    category: 'ACCESSORY',
    name: 'Spirit Kitsune Familiar',
    jpName: 'Mystic Fox Familiar',
    rarity: 5,
    description: 'A mystical white anime spirit fox familiar resting atop your head with playful spirit fire.',
  },
  {
    id: 'acc_golden_tiara',
    category: 'ACCESSORY',
    name: 'Golden Diadem of Archanea',
    jpName: 'Royal Gold Crown',
    rarity: 5,
    description: 'Royal tiara crafted of purest orichalcum set with a brilliant azure gem.',
  },
  {
    id: 'acc_ribbon_bow',
    category: 'ACCESSORY',
    name: 'Crimson Heroine Ribbon Bow',
    jpName: 'Red Silk Ribbon',
    rarity: 3,
    description: 'Cute oversized red silk ribbon bow tied gracefully behind the crown.',
  },
  {
    id: 'acc_dragon_horns',
    category: 'ACCESSORY',
    name: 'Divine Dragon Kami Horns',
    jpName: 'Dragon Kami Horns',
    rarity: 4,
    description: 'Curved pearlescent draconic horns humming with ancient dragon mana.',
  },
  {
    id: 'acc_valkyrie_wings',
    category: 'ACCESSORY',
    name: 'Valkyrie Wing Hairpins',
    jpName: 'Winged Hair Clips',
    rarity: 4,
    description: 'Pair of winged barrettes that catch the sunlight like swan feathers.',
  },
  {
    id: 'acc_eyepatch',
    category: 'ACCESSORY',
    name: 'Tactician Dark Eyepatch',
    jpName: 'Veteran Leather Eyepatch',
    rarity: 3,
    description: 'Leather eyepatch worn by seasoned veterans of countless campaigns.',
  },
  {
    id: 'acc_fox_mask',
    category: 'ACCESSORY',
    name: 'Kitsune Shrine Festival Mask',
    jpName: 'Painted Fox Mask',
    rarity: 4,
    description: 'Hand-painted porcelain fox mask worn jauntily tilted to the side.',
  },
  {
    id: 'acc_samurai_kabuto',
    category: 'ACCESSORY',
    name: 'Crescent Moon Kabuto Crest',
    jpName: 'Crescent Gold Horns',
    rarity: 4,
    description: 'Iconic golden crescent horn crest worn by legendary samurai warlords.',
  },

  // ==========================================
  // 5. MYTHIC AURAS
  // ==========================================
  {
    id: 'none',
    category: 'AURA',
    name: 'No Aura',
    jpName: 'Unequipped',
    rarity: 3,
    description: 'Concealed spiritual presence without visual emissions.',
    isDefault: true,
  },
  {
    id: 'aura_resplendent_fire',
    category: 'AURA',
    name: 'Resplendent Muspell Flames',
    jpName: 'Muspell Flame Aura',
    rarity: 5,
    description: 'Roaring embers and crimson flame ribbons rising up from the ground.',
  },
  {
    id: 'aura_mythic_stars',
    category: 'AURA',
    name: 'Mythic Asgard Starlight',
    jpName: 'Celestial Stardust Aura',
    rarity: 5,
    description: 'Orbiting constellation stardust and sparkling diamonds radiating power.',
  },
  {
    id: 'aura_sakura',
    category: 'AURA',
    name: 'Kamigawa Sakura Petal Storm',
    jpName: 'Sakura Whirlwind Aura',
    rarity: 4,
    description: 'Whirlwind of gentle cherry blossom petals spiraling around your steps.',
  },
  {
    id: 'aura_divine_halo',
    category: 'AURA',
    name: 'Celestial Holy Halo',
    jpName: 'Sacred Light Halo',
    rarity: 5,
    description: 'Golden radiant rings of sacred light floating above your crown.',
  },
  {
    id: 'aura_void_mist',
    category: 'AURA',
    name: 'Emblian Shadow Mist',
    jpName: 'Dark Nether Mist',
    rarity: 4,
    description: 'Swirling dark purple nether wisps enveloping your stance.',
  },
];

// Helper maps and default unlocked lists
export const DEFAULT_UNLOCKED_PARTS: Record<PartCategory, string[]> = {
  OUTFIT: ['outfit_novice'],
  HAIRSTYLE: ['spiky', 'twintails', 'ponytail', 'wild_rogue', 'wizard_flow', 'mystic_bob'],
  CAPE: ['none'],
  ACCESSORY: ['none', 'acc_ribbon_bow', 'acc_eyepatch'],
  AURA: ['none'],
};

export const PART_MAP: Record<string, CustomizationPart> = ALL_CUSTOMIZATION_PARTS.reduce(
  (acc, part) => {
    acc[part.id] = part;
    return acc;
  },
  {} as Record<string, CustomizationPart>
);
