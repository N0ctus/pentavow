import { ElementType } from '../types/game';

export type PmdTilesetId =
  | 'buried-relic-1'
  | 'buried-relic-2'
  | 'buried-relic-3'
  | 'darknight-relic'
  | 'desert-region'
  | 'electric-maze'
  | 'frosty-forest'
  | 'great-canyon'
  | 'howling-forest-1'
  | 'howling-forest-2'
  | 'ice-maze'
  | 'joyous-tower'
  | 'lapis-cave'
  | 'lightning-field'
  | 'magma-cavern-1'
  | 'magma-cavern-2'
  | 'meteor-cave'
  | 'mt-blaze'
  | 'mt-faraway-1'
  | 'mt-faraway-2'
  | 'mt-freeze'
  | 'mt-steel-1'
  | 'mt-steel-2'
  | 'mt-thunder-peak'
  | 'mt-thunder'
  | 'murky-cave'
  | 'normal-maze'
  | 'northern-range-1'
  | 'northern-range-2'
  | 'northwind-field'
  | 'pitfall-valley'
  | 'poison-maze'
  | 'purity-forest-1'
  | 'purity-forest-2'
  | 'purity-forest-3'
  | 'purity-forest-4'
  | 'purity-forest-5'
  | 'purity-forest-6'
  | 'rescue-team-maze'
  | 'rock-path'
  | 'silent-chasm'
  | 'silver-trench'
  | 'sinister-woods'
  | 'sky-tower'
  | 'snow-path'
  | 'solar-cave'
  | 'southern-cavern-1'
  | 'southern-cavern-2'
  | 'stormy-sea-1'
  | 'stormy-sea-2'
  | 'thunderwave-cave'
  | 'tiny-woods'
  | 'uproar-forest'
  | 'water-maze'
  | 'waterfall-pond'
  | 'western-cave-1'
  | 'western-cave-2'
  | 'wish-cave-1'
  | 'wish-cave-2'
  | 'wyvern-hill';

export type MapArchetype =
  | 'PLAINS_RIVER'
  | 'FOREST_GROVE'
  | 'SHRINE_COURTYARD'
  | 'LAKESIDE_SHORE'
  | 'LAVA_CANYON'
  | 'SUNKEN_RUINS'
  | 'ROOT_TUNNEL'
  | 'CRYSTAL_SANCTUM'
  | 'CITY_AVENUE'
  | 'CASTLE_HALL'
  | 'FROZEN_CITADEL'
  | 'SNOW_PEAKS'
  | 'DESERT_DUNES'
  | 'MARSH_BOARDWALK'
  | 'COLOSSEUM_ARENA'
  | 'VOID_ISLANDS'
  | 'VERANDA_PAGODA'
  | 'COASTAL_CLIFFS';

export type WeatherEffect =
  | 'NONE'
  | 'SAKURA'
  | 'SNOW'
  | 'BLIZZARD'
  | 'HAIL'
  | 'EMBERS'
  | 'FIREFLIES'
  | 'VOID_STARS'
  | 'MIST'
  | 'RAIN'
  | 'SANDSTORM'
  | 'CLOUD_SHADOWS';

export type PropTheme =
  | 'LUSH_OAK'
  | 'BAMBOO_SHRINE'
  | 'VOLCANIC_EMBER'
  | 'GLACIAL_ICE'
  | 'DESERT_RUIN'
  | 'CYBER_CITY'
  | 'CASTLE_TORCH'
  | 'FAIRY_GLOW'
  | 'VOID_CRYSTAL'
  | 'AUTUMN_FESTIVAL'
  | 'DEAD_WASTELAND';

export interface BattlegroundDefinition {
  id: string;
  name: string;
  filename: string;
  category: 'PLAINS' | 'FOREST' | 'VOLCANO' | 'WATER' | 'MOUNTAIN' | 'DESERT' | 'SACRED' | 'COSMIC' | 'FORTRESS';
  element: ElementType;
  description: string;
  mapBlueprint: string;
  tilesetId: PmdTilesetId;
  archetype: MapArchetype;
  propTheme: PropTheme;
  weatherEffect: WeatherEffect;
  accentColor: string;
  recommendedLevel: number;
  seed: number;
}

export const ALL_BATTLEGROUNDS: BattlegroundDefinition[] = [
  // 01
  {
    id: 'argus-plains',
    name: 'Argus Plains',
    filename: 'FFBE Argus Plains.jpg',
    category: 'PLAINS',
    element: 'WIND',
    description: 'Endless vibrant emerald meadows stretching beneath crisp blue skies, scattered white clouds, and distant blue-green mountain ridges with a shimmering far-off lake.',
    mapBlueprint: 'Wide emerald grassy expanse using Water Maze grass walls and lush open clearings, bordered north by mountain ridges, a shimmering eastern lake, and stone paths linking the southern haven to a sunlit central arena.',
    tilesetId: 'purity-forest-4',
    archetype: 'PLAINS_RIVER',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'CLOUD_SHADOWS',
    accentColor: '#34d399',
    recommendedLevel: 5,
    seed: 101
  },
  // 02
  {
    id: 'battlegrounds',
    name: 'Sunset Canyon Pass',
    filename: 'FFBE Battlegrounds.jpg',
    category: 'MOUNTAIN',
    element: 'FIRE',
    description: 'A dramatic rocky canyon gorge at sunset where blazing golden-orange sunlight pours through twin cliff walls onto dust-swept red-ochre stone ground.',
    mapBlueprint: 'Twin terraced sandstone canyon walls framing a central sun-scorched combat gorge, with narrow mountain defiles, boulder cover, and a fiery western outlook bridge.',
    tilesetId: 'great-canyon',
    archetype: 'LAVA_CANYON',
    propTheme: 'DESERT_RUIN',
    weatherEffect: 'NONE',
    accentColor: '#f59e0b',
    recommendedLevel: 22,
    seed: 102
  },
  // 03
  {
    id: 'brown-sands',
    name: 'Brown Sands',
    filename: 'FFBE Brown Sands.jpg',
    category: 'DESERT',
    element: 'FIRE',
    description: 'Sunbaked reddish-brown savanna dirt road flanked by dry grass tufts and flat-topped acacia trees beneath a hazy golden morning sky.',
    mapBlueprint: 'Rust-red savanna plateau bisected by a wide packed-earth highway, dotted with acacia/palm groves, dry canyon outcrops, and an eastern oasis spring.',
    tilesetId: 'desert-region',
    archetype: 'DESERT_DUNES',
    propTheme: 'DESERT_RUIN',
    weatherEffect: 'NONE',
    accentColor: '#ea580c',
    recommendedLevel: 38,
    seed: 103
  },
  // 04
  {
    id: 'carbuncle-grove',
    name: 'Carbuncle Grove',
    filename: 'FFBE Carbuncle Grove BG.jpg',
    category: 'FOREST',
    element: 'LIGHT',
    description: 'Enchanted nocturnal forest glade framed by overarching gnarled roots and glowing cyan-white wisps drifting above mossy stepping stones.',
    mapBlueprint: 'Dense forest canopy enclosing a winding misty glade with bioluminescent mushroom clusters, glowing fairy pools, and a sacred stone circle at the heart.',
    tilesetId: 'waterfall-pond',
    archetype: 'FOREST_GROVE',
    propTheme: 'FAIRY_GLOW',
    weatherEffect: 'FIREFLIES',
    accentColor: '#38bdf8',
    recommendedLevel: 18,
    seed: 104
  },
  // 05
  {
    id: 'castle-hein',
    name: 'Castle Hein',
    filename: 'FFBE Castle Hein.jpg',
    category: 'FOREST',
    element: 'DARK',
    description: 'Cavernous golden-brown subterranean hall woven from giant twisted tree roots converging toward a pitch-black tunnel maw.',
    mapBlueprint: 'Organic labyrinth of golden earthen walls and winding root-tunnel corridors branching into shadowed chambers and a central hollow boss cavern.',
    tilesetId: 'darknight-relic',
    archetype: 'ROOT_TUNNEL',
    propTheme: 'DEAD_WASTELAND',
    weatherEffect: 'NONE',
    accentColor: '#ca8a04',
    recommendedLevel: 32,
    seed: 105
  },
  // 06
  {
    id: 'city-of-ash',
    name: 'City of Ash Anabeth',
    filename: 'FFBE City of Ash Anabeth.jpg',
    category: 'WATER',
    element: 'DARK',
    description: 'Haunting submerged sunken metropolis shrouded in cold slate-blue cavern mist, with a ruined spiral tower glowing dimly above shallow flooded stone.',
    mapBlueprint: 'Flooded ruin basins crisscrossed by crumbling stone causeways leading to a central submerged spire courtyard surrounded by murky water moats.',
    tilesetId: 'murky-cave',
    archetype: 'SUNKEN_RUINS',
    propTheme: 'CASTLE_TORCH',
    weatherEffect: 'NONE',
    accentColor: '#64748b',
    recommendedLevel: 28,
    seed: 106
  },
  // 07
  {
    id: 'crystal-tower-entrance',
    name: 'Crystal Tower Entrance',
    filename: 'FFBE Crystal Tower Entrance.jpg',
    category: 'SACRED',
    element: 'LIGHT',
    description: 'Bright emerald meadows crisscrossed by stony trails leading toward colossal jagged azure-blue crystal formations erupting from a hilltop beneath vivid blue skies.',
    mapBlueprint: 'Lush grassland south transitioning north into crystalline blue wall formations, sparkling mana streams, and a sapphire crystal courtyard around the boss shrine.',
    tilesetId: 'lapis-cave',
    archetype: 'CRYSTAL_SANCTUM',
    propTheme: 'VOID_CRYSTAL',
    weatherEffect: 'NONE',
    accentColor: '#38bdf8',
    recommendedLevel: 55,
    seed: 107
  },
  // 08
  {
    id: 'dalnakya-plains',
    name: 'Dalnakya Plains',
    filename: 'FFBE Dalnakya Plains.jpg',
    category: 'PLAINS',
    element: 'WIND',
    description: 'Overcast twilight meadow blanketed in low rolling mist beneath dark storm clouds, with scattered silhouette trees and shallow reflective rainwater puddles.',
    mapBlueprint: 'Misty olive-green woodland plains with winding fog-draped forest walls, shallow mirror puddles, ancient stone shrine plaza, and wooden river bridge.',
    tilesetId: 'sinister-woods',
    archetype: 'PLAINS_RIVER',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#10b981',
    recommendedLevel: 6,
    seed: 108
  },
  // 09
  {
    id: 'deserted-highroad',
    name: 'Deserted Highroad',
    filename: 'FFBE Deserted Highroad.jpg',
    category: 'DESERT',
    element: 'WIND',
    description: 'Cracked arid stone highroad lined with gnarled leafless dead trees and boulders under gloomy gray mountain storm clouds.',
    mapBlueprint: 'Shattered cobblestone highroad running north-south through cracked wasteland earth, flanked by deadwood thickets, canyon walls, and dry stream beds.',
    tilesetId: 'rock-path',
    archetype: 'DESERT_DUNES',
    propTheme: 'DEAD_WASTELAND',
    weatherEffect: 'NONE',
    accentColor: '#a3a3a3',
    recommendedLevel: 20,
    seed: 109
  },
  // 10
  {
    id: 'desolate-landing',
    name: 'Desolate Landing',
    filename: 'FFBE Desolate Landing.jpg',
    category: 'COSMIC',
    element: 'DARK',
    description: 'Eerie violet-crimson twilight coastline where dark rocky cliff terraces overlook a winding blackened river and sparse wind-bent trees.',
    mapBlueprint: 'Split canyon cliffs bounding a dark winding river channel with stone bridge crossings, weathered cliff pillars, and violet dusk ambient mist.',
    tilesetId: 'northwind-field',
    archetype: 'COASTAL_CLIFFS',
    propTheme: 'DEAD_WASTELAND',
    weatherEffect: 'NONE',
    accentColor: '#c084fc',
    recommendedLevel: 44,
    seed: 110
  },
  // 11
  {
    id: 'dim-wetlands',
    name: 'Dim Wetlands',
    filename: 'FFBE Dim Wetlands.jpg',
    category: 'WATER',
    element: 'DARK',
    description: 'Surreal nightmarish marsh glowing with neon magenta-violet grass and giant canopy mushrooms beneath a pitch-black stormy sky.',
    mapBlueprint: 'Flooded twilight marshland linked by wooden plank walkways, glowing violet mushroom clearings, and sunken misty pools.',
    tilesetId: 'poison-maze',
    archetype: 'MARSH_BOARDWALK',
    propTheme: 'FAIRY_GLOW',
    weatherEffect: 'NONE',
    accentColor: '#d946ef',
    recommendedLevel: 34,
    seed: 111
  },
  // 12
  {
    id: 'dollet-2',
    name: 'Dollet Cliffside Square',
    filename: 'FFBE Dollet 2.jpg',
    category: 'FORTRESS',
    element: 'FIRE',
    description: 'Expansive brick-paved coastal plaza nestled beside sheer tan cliffside rock under warm sunset clouds.',
    mapBlueprint: 'Wide rectangular brick-paved fortress terrace anchored against eastern cliff walls, featuring cobbled avenues and defensive perimeter parapets.',
    tilesetId: 'pitfall-valley',
    archetype: 'CITY_AVENUE',
    propTheme: 'CASTLE_TORCH',
    weatherEffect: 'NONE',
    accentColor: '#f59e0b',
    recommendedLevel: 24,
    seed: 112
  },
  // 13
  {
    id: 'dome-exploration',
    name: 'Sunken Dome Vault',
    filename: 'FFBE Dome Exploration.jpg',
    category: 'FORTRESS',
    element: 'WATER',
    description: 'Dimly lit ruined subterranean stone arena filled with toppled aqueduct arches, cracked flagstones, and drifting blue spirit wisps.',
    mapBlueprint: 'Collapsed circular cavern dome of gray slate masonry surrounded by subterranean water moats, broken stone ramps, and ghostly blue braziers.',
    tilesetId: 'western-cave-2',
    archetype: 'CASTLE_HALL',
    propTheme: 'VOID_CRYSTAL',
    weatherEffect: 'NONE',
    accentColor: '#38bdf8',
    recommendedLevel: 40,
    seed: 113
  },
  // 14
  {
    id: 'downtown-mysidia',
    name: 'Downtown Mysidia',
    filename: 'FFBE Downtown Mysidia.jpg',
    category: 'FORTRESS',
    element: 'LIGHT',
    description: 'Moonlit cobblestone grand boulevard lined with classical stone townhouses and glowing emerald-cyan streetlamps stretching into the night.',
    mapBlueprint: 'Symmetrical urban cobblestone grand avenue flanked by city building wall blocks, cross-alleys, plaza squares, and paired glowing emerald streetlamps.',
    tilesetId: 'wish-cave-1',
    archetype: 'CITY_AVENUE',
    propTheme: 'CYBER_CITY',
    weatherEffect: 'NONE',
    accentColor: '#10b981',
    recommendedLevel: 30,
    seed: 114
  },
  // 15
  {
    id: 'earth-shrine-bg',
    name: 'Earth Shrine Inner Vault',
    filename: 'FFBE Earth Shrine BG.jpg',
    category: 'SACRED',
    element: 'LIGHT',
    description: 'Moss-draped ancient stone sanctuary with vaulted arched colonnades, grand stone staircase, and warm flickering wall torches.',
    mapBlueprint: 'Symmetrical temple sanctum courtyard bordered by fluted stone columns, moss-edged water channels, grand steps, and perimeter forest.',
    tilesetId: 'buried-relic-3',
    archetype: 'SHRINE_COURTYARD',
    propTheme: 'BAMBOO_SHRINE',
    weatherEffect: 'NONE',
    accentColor: '#fbbf24',
    recommendedLevel: 8,
    seed: 115
  },
  // 16
  {
    id: 'earth-shrine',
    name: 'Earth Shrine',
    filename: 'FFBE Earth Shrine.jpg',
    category: 'SACRED',
    element: 'LIGHT',
    description: 'Ancient overgrown temple courtyard with stone archways, mossy staircase ascending toward shadowed sanctuaries, and golden torchlight.',
    mapBlueprint: 'Iconic Earth Shrine sanctum at the heart of emerald woods, complete with carved courtyard tiles, eastern lotus river, grand bridge, and Jizo grove.',
    tilesetId: 'howling-forest-1',
    archetype: 'SHRINE_COURTYARD',
    propTheme: 'BAMBOO_SHRINE',
    weatherEffect: 'SAKURA',
    accentColor: '#34d399',
    recommendedLevel: 10,
    seed: 116
  },
  // 17
  {
    id: 'elmaul-archives-2',
    name: 'Elmaul Archives Depths',
    filename: 'FFBE Elmaul Archives 2.jpg',
    category: 'FORTRESS',
    element: 'DARK',
    description: 'Shadowy ruined grand library with toppled oak bookshelves, scattered ancient tomes, and dusty stone floors lit by shafts of pale amber light.',
    mapBlueprint: 'Maze of tall archive wall stacks forming quiet reading aisles, study alcoves, and a vaulted central scholar rotunda.',
    tilesetId: 'darknight-relic',
    archetype: 'CASTLE_HALL',
    propTheme: 'CASTLE_TORCH',
    weatherEffect: 'NONE',
    accentColor: '#d97706',
    recommendedLevel: 35,
    seed: 117
  },
  // 18
  {
    id: 'elmaul-archives',
    name: 'Elmaul Archives Exterior',
    filename: 'FFBE Elmaul Archives.jpg',
    category: 'FORTRESS',
    element: 'WIND',
    description: 'Tiered pale stone citadel of stepped cubic ziggurat towers standing behind a vast cobblestone courtyard beneath emerald night skies.',
    mapBlueprint: 'Broad cobbled forecourt opening onto stepped sandstone ziggurat bastion walls, side garden corridors, and a grand northern archive gate.',
    tilesetId: 'solar-cave',
    archetype: 'CITY_AVENUE',
    propTheme: 'DESERT_RUIN',
    weatherEffect: 'NONE',
    accentColor: '#34d399',
    recommendedLevel: 33,
    seed: 118
  },
  // 19
  {
    id: 'emerald-lake',
    name: 'Emerald Lake',
    filename: 'FFBE Emerald Lake.jpg',
    category: 'WATER',
    element: 'WATER',
    description: 'Sunbeams piercing a lush forest canopy onto a mirror-clear turquoise woodland lake with graceful waterfowl and emerald mossy grass.',
    mapBlueprint: 'Sunlit forest enclosure surrounding a sparkling turquoise woodland basin with lilypad shallows, timber pier bridge, and mossy lakeside trails.',
    tilesetId: 'purity-forest-2',
    archetype: 'LAKESIDE_SHORE',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#10b981',
    recommendedLevel: 14,
    seed: 119
  },
  // 20
  {
    id: 'expedition',
    name: 'Sunbeam Expedition Plains',
    filename: 'FFBE Expedition.jpg',
    category: 'PLAINS',
    element: 'LIGHT',
    description: 'Golden-green highland meadow illuminated by crepuscular sunbeams breaking through towering white clouds over distant blue mountain peaks.',
    mapBlueprint: 'Bright pastoral valley bordered by distant mountain ridges, wildflowers, winding creek bridge, and open expedition camp clearings.',
    tilesetId: 'purity-forest-3',
    archetype: 'PLAINS_RIVER',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#fbbf24',
    recommendedLevel: 7,
    seed: 120
  },
  // 21
  {
    id: 'fabul-castle',
    name: 'Fabul Castle Guard',
    filename: 'FFBE Fabul Castle Guard.jpg',
    category: 'FORTRESS',
    element: 'LIGHT',
    description: 'Interior stone fortress corridor lined with fluted columns, crossed broadswords mounted on brick walls, and glowing blue crystal sconces.',
    mapBlueprint: 'Fortified castle hall of gray-white marble walls, flanking pillar colonnades, central duel arena, and glowing blue crystal sconces.',
    tilesetId: 'wish-cave-1',
    archetype: 'CASTLE_HALL',
    propTheme: 'VOID_CRYSTAL',
    weatherEffect: 'NONE',
    accentColor: '#60a5fa',
    recommendedLevel: 26,
    seed: 121
  },
  // 22
  {
    id: 'falfa-hill',
    name: 'Falfa Hill',
    filename: 'FFBE Falfa Hill.jpg',
    category: 'PLAINS',
    element: 'WIND',
    description: 'Sweeping bright green hillside studded with mossy boulders overlooking a towering snow-capped mountain range beneath clear blue skies.',
    mapBlueprint: 'Elevated grassy hillside terraces leading north toward rugged rocky foothills, crossed by winding stone paths and twin brooks.',
    tilesetId: 'wyvern-hill',
    archetype: 'PLAINS_RIVER',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#4ade80',
    recommendedLevel: 9,
    seed: 122
  },
  // 23
  {
    id: 'farplane',
    name: 'The Farplane',
    filename: 'FFBE Farplane.jpg',
    category: 'COSMIC',
    element: 'DARK',
    description: 'Cosmic dimensional terrace of cracked amethyst stone floating before swirling spiral galaxies, glowing violet crystals, and shattered stone monoliths.',
    mapBlueprint: 'Floating purple-stone sanctuary islands suspended over deep astral void chasms, linked by narrow crystal-lit stone causeways.',
    tilesetId: 'northwind-field',
    archetype: 'VOID_ISLANDS',
    propTheme: 'VOID_CRYSTAL',
    weatherEffect: 'VOID_STARS',
    accentColor: '#c084fc',
    recommendedLevel: 60,
    seed: 123
  },
  // 24
  {
    id: 'festival-autumn-moon',
    name: 'Festival of the Autumn Moon',
    filename: 'FFBE Festival of the Autumn Moon.jpg',
    category: 'WATER',
    element: 'WATER',
    description: 'Golden sandy shoreline meeting gentle ocean surf under a deep twilight azure sky with a pale crescent moon and coastal pine cliffs.',
    mapBlueprint: 'Golden crescent beachfront sloping into deep blue ocean surf on the north/east with coastal cliff headlands and festival lantern paths.',
    tilesetId: 'purity-forest-1',
    archetype: 'LAKESIDE_SHORE',
    propTheme: 'AUTUMN_FESTIVAL',
    weatherEffect: 'NONE',
    accentColor: '#fbbf24',
    recommendedLevel: 21,
    seed: 124
  },
  // 25
  {
    id: 'badlands',
    name: "Fina's Psyche Badlands",
    filename: "FFBE Fina's Psyche Badlands.jpg",
    category: 'DESERT',
    element: 'FIRE',
    description: 'Surreal crimson-sky badlands where jagged dark stone mesas surround a barren crater plain bisected by a distant glowing red pillar of light.',
    mapBlueprint: 'Red-rock crater basin ringed by jagged volcanic canyon walls, cracked earth fissures, and a central ritual monolith ring.',
    tilesetId: 'magma-cavern-2',
    archetype: 'LAVA_CANYON',
    propTheme: 'VOLCANIC_EMBER',
    weatherEffect: 'EMBERS',
    accentColor: '#ef4444',
    recommendedLevel: 48,
    seed: 125
  },
  // 26
  {
    id: 'floating-sands',
    name: 'Floating Sands',
    filename: 'FFBE Floating Sands.jpg',
    category: 'DESERT',
    element: 'LIGHT',
    description: 'Golden wind-rippled desert dunes beneath ominous twilight clouds where massive rocky islands levitate magically in mid-air above ancient ribcage ruins.',
    mapBlueprint: 'Golden desert dune sea featuring raised sandstone island plateaus, buried rib-bone ruins, oasis pool, and ancient desert obelisks.',
    tilesetId: 'desert-region',
    archetype: 'DESERT_DUNES',
    propTheme: 'DESERT_RUIN',
    weatherEffect: 'SANDSTORM',
    accentColor: '#fbbf24',
    recommendedLevel: 45,
    seed: 126
  },
  // 27
  {
    id: 'foggy-thicket',
    name: 'Foggy Thicket',
    filename: 'FFBE Foggy Thicket BG.jpg',
    category: 'FOREST',
    element: 'WIND',
    description: 'Dense emerald bamboo thicket carpeted in lush forest moss, softly veiled in cool silver-green mountain mist.',
    mapBlueprint: 'Tightly woven bamboo forest labyrinth with mossy trails, hidden Jizo shrines, mist-shrouded clearings, and a quiet forest spring.',
    tilesetId: 'purity-forest-5',
    archetype: 'FOREST_GROVE',
    propTheme: 'BAMBOO_SHRINE',
    weatherEffect: 'MIST',
    accentColor: '#34d399',
    recommendedLevel: 12,
    seed: 127
  },
  // 28
  {
    id: 'forbidden-land',
    name: 'Forbidden Land Eureka',
    filename: 'FFBE Forbidden Land.jpg',
    category: 'SACRED',
    element: 'LIGHT',
    description: 'Dazzling white-marble sand dunes bathed in radiant beams of celestial sunlight, ringed by lush distant greenery and pale crystalline arches.',
    mapBlueprint: 'Radiant chalk-white basin ringed by lush oasis ridges and alabaster sanctuary walls, with gleaming cyan spring pools.',
    tilesetId: 'sky-tower',
    archetype: 'CRYSTAL_SANCTUM',
    propTheme: 'DESERT_RUIN',
    weatherEffect: 'NONE',
    accentColor: '#bae6fd',
    recommendedLevel: 54,
    seed: 128
  },
  // 29
  {
    id: 'forgotten-walls',
    name: 'Forgotten Walls',
    filename: 'FFBE Forgotten Walls.jpg',
    category: 'DESERT',
    element: 'LIGHT',
    description: 'Sun-bleached sandstone ruins featuring a weathered stone archway casting dramatic shadows across smooth golden desert sand.',
    mapBlueprint: 'Crumbling sandstone fortress walls and central sand-drifted triumphal archway bisecting an ancient buried desert citadel.',
    tilesetId: 'desert-region',
    archetype: 'DESERT_DUNES',
    propTheme: 'DESERT_RUIN',
    weatherEffect: 'NONE',
    accentColor: '#eab308',
    recommendedLevel: 39,
    seed: 129
  },
  // 30
  {
    id: 'fortress-outlook',
    name: 'Fortress Outlook',
    filename: 'FFBE Fortress Outlook.jpg',
    category: 'FORTRESS',
    element: 'WIND',
    description: 'Bright green rolling meadow looking north toward crumbling white-stone castle battlements perched on rocky hills under crisp blue skies.',
    mapBlueprint: 'Grassy southern plain climbing toward ruined northern stone castle battlements with courtyard gates and hillside watchtowers.',
    tilesetId: 'mt-steel-1',
    archetype: 'SHRINE_COURTYARD',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#22c55e',
    recommendedLevel: 16,
    seed: 130
  },
  // 31
  {
    id: 'fulan-pass',
    name: 'Fulan Pass',
    filename: 'FFBE Fulan Pass.jpg',
    category: 'PLAINS',
    element: 'LIGHT',
    description: 'Broad cobblestone highway cutting horizontally through sunlit green pastures dotted with shady oak trees under a blinding midday sun.',
    mapBlueprint: 'Grand east-west cobblestone road intersecting a north-south mountain pass across verdant grassy meadows and flanking oaks.',
    tilesetId: 'tiny-woods',
    archetype: 'PLAINS_RIVER',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#4ade80',
    recommendedLevel: 11,
    seed: 131
  },
  // 32
  {
    id: 'fuzzy-flats',
    name: 'Fuzzy Flats',
    filename: 'FFBE Fuzzy Flats.jpg',
    category: 'SACRED',
    element: 'LIGHT',
    description: 'Dreamlike nocturnal field of pale silver-white grass illuminated by dozens of floating luminescent fireflies beneath dark mountain ridges.',
    mapBlueprint: 'Silver-pale misty flats framed by dark alpine wall borders, glowing lantern pools, and floating spore lights.',
    tilesetId: 'mt-faraway-1',
    archetype: 'PLAINS_RIVER',
    propTheme: 'FAIRY_GLOW',
    weatherEffect: 'NONE',
    accentColor: '#a7f3d0',
    recommendedLevel: 29,
    seed: 132
  },
  // 33
  {
    id: 'galebreak',
    name: 'Galebreak Crags',
    filename: 'FFBE Galebreak.jpg',
    category: 'MOUNTAIN',
    element: 'WIND',
    description: 'Wind-scoured dusty brown highland plateau perched below craggy gray fortress cliffs under sweeping turquoise storm-cloud skies.',
    mapBlueprint: 'Rugged rocky highland plateau carved by wind-swept cliff walls, narrow cliffside passes, and a fortress overlook bastion.',
    tilesetId: 'mt-thunder-peak',
    archetype: 'SNOW_PEAKS',
    propTheme: 'DESERT_RUIN',
    weatherEffect: 'RAIN',
    accentColor: '#2dd4bf',
    recommendedLevel: 35,
    seed: 133
  },
  // 34
  {
    id: 'georl-garrison-ruins',
    name: 'Georl Garrison Ruins',
    filename: 'FFBE Georl Garrison Ruins.jpg',
    category: 'FORTRESS',
    element: 'WATER',
    description: 'Rain-soaked cobblestone military boulevard leading to a circular fountain plaza surrounded by ruined city buildings in a heavy downpour.',
    mapBlueprint: 'Rain-slicked stone garrison road converging on a central circular fountain plaza surrounded by ruined city quarters and glowing streetlamps.',
    tilesetId: 'mt-thunder',
    archetype: 'CITY_AVENUE',
    propTheme: 'CYBER_CITY',
    weatherEffect: 'RAIN',
    accentColor: '#60a5fa',
    recommendedLevel: 36,
    seed: 134
  },
  // 35
  {
    id: 'giant-forest',
    name: 'Giant Forest',
    filename: 'FFBE Giant Forest.jpg',
    category: 'FOREST',
    element: 'WIND',
    description: 'Colossal baobab-like bottle trees towering over sunlit golden-green savanna grass beneath fluffy summer cumulus clouds.',
    mapBlueprint: 'Savanna forest of massive spaced tree-wall trunks creating natural clearings across warm golden-olive grassland.',
    tilesetId: 'uproar-forest',
    archetype: 'FOREST_GROVE',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#84cc16',
    recommendedLevel: 19,
    seed: 135
  },
  // 36
  {
    id: 'golzas-canyon',
    name: 'Golzas Canyon',
    filename: 'FFBE Golzas Canyon.jpg',
    category: 'VOLCANO',
    element: 'FIRE',
    description: 'Blazing sunset canyon where a glowing molten red-orange river winds between cracked sandstone ledges and scorched mesa cliffs.',
    mapBlueprint: 'Deep fiery canyon cleft with a winding molten lava river crossed by basalt slab bridges and flanked by ember-lit boulder ridges.',
    tilesetId: 'magma-cavern-1',
    archetype: 'LAVA_CANYON',
    propTheme: 'VOLCANIC_EMBER',
    weatherEffect: 'EMBERS',
    accentColor: '#f97316',
    recommendedLevel: 17,
    seed: 136
  },
  // 37
  {
    id: 'golzas-peak',
    name: 'Golzas Peak',
    filename: 'FFBE Golzas Peak.jpg',
    category: 'MOUNTAIN',
    element: 'WIND',
    description: 'Verdant highland valley flanked by towering sheer cliff walls on the right and a tranquil blue mountain river winding along the left.',
    mapBlueprint: 'Asymmetric mountain river valley with a wide western water channel, cliff walls along the east, and pine-lined grassy trails.',
    tilesetId: 'mt-thunder-peak',
    archetype: 'COASTAL_CLIFFS',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#38bdf8',
    recommendedLevel: 23,
    seed: 137
  },
  // 38
  {
    id: 'golzas-wharf',
    name: 'Golzas Wharf',
    filename: 'FFBE Golzas Wharf.jpg',
    category: 'FORTRESS',
    element: 'LIGHT',
    description: 'Ancient stone rune circle plaza framed by ruined stone pillars, glowing runic stele tablets, and arched stone gate ruins under dappled clouds.',
    mapBlueprint: 'Circular runic stone wharf plaza surrounded by ruined arches, ancient tablet walls, and a southern harbor causeway.',
    tilesetId: 'buried-relic-2',
    archetype: 'SHRINE_COURTYARD',
    propTheme: 'DESERT_RUIN',
    weatherEffect: 'NONE',
    accentColor: '#fbbf24',
    recommendedLevel: 25,
    seed: 138
  },
  // 39
  {
    id: 'grassy-road',
    name: 'Grassy Road',
    filename: 'FFBE Grassy Road.jpg',
    category: 'PLAINS',
    element: 'WIND',
    description: 'Sunlit green dirt path winding smoothly through lush wooded clearings and leafy roadside oaks beneath clear azure skies.',
    mapBlueprint: 'Winding woodland trail cutting diagonally through verdant grass walls, connecting shaded clearings and a tranquil woodland brook.',
    tilesetId: 'howling-forest-1',
    archetype: 'PLAINS_RIVER',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#22c55e',
    recommendedLevel: 4,
    seed: 139
  },
  // 40
  {
    id: 'grave-of-the-warriors',
    name: 'Grave of the Warriors',
    filename: 'FFBE Grave of the Warriors.jpg',
    category: 'PLAINS',
    element: 'WIND',
    description: 'Vibrant emerald hillside where shattered rusted mech wreckage rests peacefully amid wildflowers under bright sky-blue clouds.',
    mapBlueprint: 'Open emerald meadow punctuated by ancient rusted monument ruins and boulders at the central hilltop plateau.',
    tilesetId: 'purity-forest-4',
    archetype: 'PLAINS_RIVER',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#34d399',
    recommendedLevel: 27,
    seed: 140
  },
  // 41
  {
    id: 'heavensplit-peaks',
    name: 'Heavensplit Peaks',
    filename: 'FFBE Heavensplit Peaks.jpg',
    category: 'MOUNTAIN',
    element: 'DARK',
    description: 'Barren rocky mountain summit flat beneath ominous purple-black storm clouds and distant craggy peaks piercing the cloud layer.',
    mapBlueprint: 'Bleak high-altitude stone ridge surrounded by sheer chasm walls, wind-carved rock spires, and glowing storm-lit pools.',
    tilesetId: 'mt-faraway-1',
    archetype: 'SNOW_PEAKS',
    propTheme: 'DEAD_WASTELAND',
    weatherEffect: 'NONE',
    accentColor: '#a855f7',
    recommendedLevel: 42,
    seed: 141
  },
  // 42
  {
    id: 'helmna-heights',
    name: 'Helmna Heights',
    filename: 'FFBE Helmna Heights.jpg',
    category: 'FOREST',
    element: 'WATER',
    description: 'Enchanted mossy forest interior where a crystal-clear shallow brook ripples over rounded stones beneath an emerald tree canopy.',
    mapBlueprint: 'Lush mossy woodland bisected by a winding rocky shallow brook with stepping stones and dense forest tree walls.',
    tilesetId: 'waterfall-pond',
    archetype: 'FOREST_GROVE',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#2dd4bf',
    recommendedLevel: 15,
    seed: 142
  },
  // 43
  {
    id: 'hidden-wasteland',
    name: 'Hidden Wasteland',
    filename: 'FFBE Hidden Wasteland.jpg',
    category: 'DESERT',
    element: 'FIRE',
    description: 'Parched cracked-clay desert basin ringed by jagged red-orange canyon boulders beneath bright white clouds and blue sky.',
    mapBlueprint: 'Dry cracked-earth basin walled in by jagged canyon crags, winding dry washes, and ancient sandstone pillars.',
    tilesetId: 'rescue-team-maze',
    archetype: 'DESERT_DUNES',
    propTheme: 'DESERT_RUIN',
    weatherEffect: 'NONE',
    accentColor: '#f97316',
    recommendedLevel: 37,
    seed: 143
  },
  // 44
  {
    id: 'howling-mountains',
    name: 'Howling Mountains',
    filename: 'FFBE Howling Mountains.jpg',
    category: 'MOUNTAIN',
    element: 'WATER',
    description: 'Moonlit alpine mountain crest dusted in cool silver snow, flanked by pine silhouettes under an enormous glowing full moon.',
    mapBlueprint: 'Moonlit snowy pine summit trail winding up to a high circular crater lookout bathed in icy moonlight.',
    tilesetId: 'mt-freeze',
    archetype: 'SNOW_PEAKS',
    propTheme: 'GLACIAL_ICE',
    weatherEffect: 'BLIZZARD',
    accentColor: '#93c5fd',
    recommendedLevel: 41,
    seed: 144
  },
  // 45
  {
    id: 'klon-palisades',
    name: 'Klon Palisades',
    filename: 'FFBE Klon Palisades.jpg',
    category: 'WATER',
    element: 'WATER',
    description: 'Dramatic sea-cliff grass terraces overlooking foaming deep-blue ocean waves crashing against ruined cliffside stone arches.',
    mapBlueprint: 'Grassy sea-cliff ledges winding above roaring blue ocean surf on the east/north with stone cliff arches and coastal bridges.',
    tilesetId: 'stormy-sea-1',
    archetype: 'COASTAL_CLIFFS',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#0ea5e9',
    recommendedLevel: 26,
    seed: 145
  },
  // 46
  {
    id: 'kolobos-marsh',
    name: 'Kolobos Marsh',
    filename: 'FFBE Kolobos Marsh.jpg',
    category: 'WATER',
    element: 'WATER',
    description: 'Storm-lashed marshland featuring a weathered wooden plank pier over murky flooded reeds as distant lightning strikes dark clouds.',
    mapBlueprint: 'Flooded wetland covered by interlocking wooden boardwalks and piers bridging isolated tree islands across stormy marsh water.',
    tilesetId: 'murky-cave',
    archetype: 'MARSH_BOARDWALK',
    propTheme: 'DEAD_WASTELAND',
    weatherEffect: 'RAIN',
    accentColor: '#64748b',
    recommendedLevel: 31,
    seed: 146
  },
  // 47
  {
    id: 'kopan-ruins',
    name: 'Kopan Ruins',
    filename: 'FFBE Kopan Ruins.jpg',
    category: 'SACRED',
    element: 'WIND',
    description: 'Sunlit ancient woodland clearing where mossy stone paving leads toward twin weathered fox statues beside a cascading white waterfall.',
    mapBlueprint: 'Lush forest clearing with central cobbled plaza leading north to twin fox guardian statues before a rushing waterfall pool.',
    tilesetId: 'howling-forest-1',
    archetype: 'SHRINE_COURTYARD',
    propTheme: 'BAMBOO_SHRINE',
    weatherEffect: 'NONE',
    accentColor: '#34d399',
    recommendedLevel: 13,
    seed: 147
  },
  // 48
  {
    id: 'kudalaska-pass',
    name: 'Kudalaska Pass',
    filename: 'FFBE Kudalaska Pass.jpg',
    category: 'MOUNTAIN',
    element: 'FIRE',
    description: 'Shadowy natural rock cavern archway framing a sunlit valley floor striped with dramatic mountain shadows.',
    mapBlueprint: 'Carved cavern pass opening at both ends into sunny canyon ledges, with thick rocky pillars and warm boulder shadows.',
    tilesetId: 'silent-chasm',
    archetype: 'ROOT_TUNNEL',
    propTheme: 'VOLCANIC_EMBER',
    weatherEffect: 'NONE',
    accentColor: '#d97706',
    recommendedLevel: 29,
    seed: 148
  },
  // 49
  {
    id: 'lake-dorr-2',
    name: 'Lake Dorr Misty Shore',
    filename: 'FFBE Lake Dorr 2.jpg',
    category: 'WATER',
    element: 'WATER',
    description: 'Broad misty shoreline where calm slate-blue lake water laps gently against curved golden sand and damp coastal grass.',
    mapBlueprint: 'Sweeping western misty lake basin bounded by a curved sandy-grassy shoreline and tranquil wooden pier outlooks.',
    tilesetId: 'stormy-sea-2',
    archetype: 'LAKESIDE_SHORE',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'MIST',
    accentColor: '#38bdf8',
    recommendedLevel: 27,
    seed: 149
  },
  // 50
  {
    id: 'lake-dorr',
    name: 'Lake Dorr',
    filename: 'FFBE Lake Dorr.jpg',
    category: 'WATER',
    element: 'WATER',
    description: 'Radiant sunlit lake reflecting towering twilight clouds and snow-dusted peaks along a curved sandy beach and grassy headland.',
    mapBlueprint: 'Crystal-clear western lake basin with curved sandy beaches, eastern grassy highlands, lotus shallows, and lakeside shrines.',
    tilesetId: 'lapis-cave',
    archetype: 'LAKESIDE_SHORE',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#38bdf8',
    recommendedLevel: 25,
    seed: 150
  },
  // 51
  {
    id: 'lake-granceno',
    name: 'Lake Granceno',
    filename: 'FFBE Lake Granceno.jpg',
    category: 'PLAINS',
    element: 'LIGHT',
    description: 'Sunlit golden-amber grassland surrounding a tranquil blue desert oasis pool dotted with flat-topped savanna acacia trees.',
    mapBlueprint: 'Golden grassland basin centered on a shimmering blue oasis watering hole ringed by savanna palm/acacia clusters.',
    tilesetId: 'lightning-field',
    archetype: 'LAKESIDE_SHORE',
    propTheme: 'DESERT_RUIN',
    weatherEffect: 'NONE',
    accentColor: '#eab308',
    recommendedLevel: 20,
    seed: 151
  },
  // 52
  {
    id: 'lake-ryusei',
    name: 'Lake Ryusei',
    filename: 'FFBE Lake Ryusei.jpg',
    category: 'WATER',
    element: 'WATER',
    description: 'Vibrant emerald lakeside meadow overlooking a serene sky-blue alpine lake and wooded peninsula beneath bright summer clouds.',
    mapBlueprint: 'Lush emerald lakeside pasture stretching north to an expansive blue lake with a wooded peninsula bridge to the boss island.',
    tilesetId: 'silver-trench',
    archetype: 'LAKESIDE_SHORE',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#06b6d4',
    recommendedLevel: 16,
    seed: 152
  },
  // 53
  {
    id: 'land-of-darkness',
    name: 'Land of Darkness',
    filename: 'FFBE Land of Darkness.jpg',
    category: 'COSMIC',
    element: 'DARK',
    description: 'Desolate cracked obsidian wasteland bathed in eerie violet twilight beneath a looming black solar eclipse haloed in white light.',
    mapBlueprint: 'Fractured obsidian wasteland ringed by pitch-black void fissures, shattered stone monoliths, and a central eclipse altar.',
    tilesetId: 'southern-cavern-1',
    archetype: 'VOID_ISLANDS',
    propTheme: 'DEAD_WASTELAND',
    weatherEffect: 'VOID_STARS',
    accentColor: '#9333ea',
    recommendedLevel: 62,
    seed: 153
  },
  // 54
  {
    id: 'land-of-fading-memories',
    name: 'Land of Fading Memories',
    filename: 'FFBE Land of Fading Memories.jpg',
    category: 'DESERT',
    element: 'FIRE',
    description: 'Blinding amber-orange sandstorm sweeping across half-buried ruined rooftops and distant silhouetted pillars beneath a burning sun.',
    mapBlueprint: 'Amber-gold desert buried ruins where half-sunken city blocks poke out of sweeping sand channels and storm-swept dunes.',
    tilesetId: 'meteor-cave',
    archetype: 'DESERT_DUNES',
    propTheme: 'DESERT_RUIN',
    weatherEffect: 'SANDSTORM',
    accentColor: '#f59e0b',
    recommendedLevel: 49,
    seed: 154
  },
  // 55
  {
    id: 'lanzelt-estuary',
    name: 'Lanzelt Estuary',
    filename: 'FFBE Lanzelt Estuary.jpg',
    category: 'WATER',
    element: 'WATER',
    description: 'Wide gravelly river mouth where shallow blue water meets lush green riverside meadows and dense green woodland banks.',
    mapBlueprint: 'Wide gravel-and-grass river valley cut by a sweeping azure river bend with twin timber bridges connecting verdant banks.',
    tilesetId: 'stormy-sea-1',
    archetype: 'PLAINS_RIVER',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#0284c7',
    recommendedLevel: 18,
    seed: 155
  },
  // 56
  {
    id: 'lanzelt-highlands',
    name: 'Lanzelt Highlands',
    filename: 'FFBE Lanzelt Highlands.jpg',
    category: 'MOUNTAIN',
    element: 'WATER',
    description: 'Expansive snow-swept alpine plateau undulating toward jagged snow-capped peaks glowing under an orange-blue dawn horizon.',
    mapBlueprint: 'Rolling snowfield highland divided by glacial ice cliffs, frozen stream channels, and alpine pass ridges.',
    tilesetId: 'northern-range-2',
    archetype: 'SNOW_PEAKS',
    propTheme: 'GLACIAL_ICE',
    weatherEffect: 'NONE',
    accentColor: '#60a5fa',
    recommendedLevel: 38,
    seed: 156
  },
  // 57
  {
    id: 'lanzelt-lowlands',
    name: 'Lanzelt Lowlands',
    filename: 'FFBE Lanzelt Lowlands.jpg',
    category: 'MOUNTAIN',
    element: 'WIND',
    description: 'Overgrown mossy rock plateau facing a steep stratified cliff wall pierced by a dark rectangular mine cave entrance.',
    mapBlueprint: 'Rocky highland terrace beneath sheer northern cliff walls leading into a carved subterranean cavern threshold.',
    tilesetId: 'northern-range-1',
    archetype: 'ROOT_TUNNEL',
    propTheme: 'DESERT_RUIN',
    weatherEffect: 'NONE',
    accentColor: '#84cc16',
    recommendedLevel: 21,
    seed: 157
  },
  // 58
  {
    id: 'lanzelt-mountains',
    name: 'Lanzelt Mountains',
    filename: 'FFBE Lanzelt Mountains.jpg',
    category: 'MOUNTAIN',
    element: 'WATER',
    description: 'Dense snow-buried evergreen pine forest veiled in icy mountain blizzards and drifted blue-white snowbanks.',
    mapBlueprint: 'Thickly forested snowy mountain maze of frost-laden pine walls winding between frozen snowdrifts and glacial pools.',
    tilesetId: 'frosty-forest',
    archetype: 'FOREST_GROVE',
    propTheme: 'GLACIAL_ICE',
    weatherEffect: 'HAIL',
    accentColor: '#bae6fd',
    recommendedLevel: 39,
    seed: 158
  },
  // 59
  {
    id: 'lanzelt-ruins',
    name: 'Lanzelt Ruins',
    filename: 'FFBE Lanzelt Ruins.jpg',
    category: 'SACRED',
    element: 'WATER',
    description: 'Subterranean ancient stone sanctum bathed in electric cyan luminescence from cascading spirit waterfalls and carved runic flagstones.',
    mapBlueprint: 'Symmetrical sunken stone temple interior laced with glowing cyan mana canals, grand arched bridges, and crystalline pillars.',
    tilesetId: 'lapis-cave',
    archetype: 'CRYSTAL_SANCTUM',
    propTheme: 'VOID_CRYSTAL',
    weatherEffect: 'NONE',
    accentColor: '#22d3ee',
    recommendedLevel: 43,
    seed: 159
  },
  // 60
  {
    id: 'lanzelt-snowfields',
    name: 'Lanzelt Snowfields',
    filename: 'FFBE Lanzelt Snowfields.jpg',
    category: 'MOUNTAIN',
    element: 'WATER',
    description: 'Moonlit crystalline snowfield dotted with frosted pine trees before towering white alpine peaks under a bright winter moon.',
    mapBlueprint: 'Broad open snowfield clearing dotted with snowy pines, glacial ponds, and frozen ridge borders.',
    tilesetId: 'snow-path',
    archetype: 'SNOW_PEAKS',
    propTheme: 'GLACIAL_ICE',
    weatherEffect: 'BLIZZARD',
    accentColor: '#7dd3fc',
    recommendedLevel: 37,
    seed: 160
  },
  // 61
  {
    id: 'latius-woods',
    name: 'Latius Woods',
    filename: 'FFBE Latius Woods.jpg',
    category: 'FOREST',
    element: 'WIND',
    description: 'Sun-dappled ancient forest glade framed by colossal mossy tree roots and red-capped woodland toadstools.',
    mapBlueprint: 'Thick lush forest canopy opening into dappled sun-lit clearings, winding dirt paths, and glowing woodland mushroom patches.',
    tilesetId: 'tiny-woods',
    archetype: 'FOREST_GROVE',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#4ade80',
    recommendedLevel: 5,
    seed: 161
  },
  // 62
  {
    id: 'lechios-hills',
    name: 'Lechios Hills',
    filename: 'FFBE Lechios Hills.jpg',
    category: 'PLAINS',
    element: 'WIND',
    description: 'Rolling bright-green pasture hills dotted with lone leafy shade trees beneath puffy white cumulus clouds.',
    mapBlueprint: 'Rolling pastoral meadow hills with gentle winding streams, oak groves, and a central sunlit hilltop shrine.',
    tilesetId: 'purity-forest-2',
    archetype: 'PLAINS_RIVER',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#22c55e',
    recommendedLevel: 8,
    seed: 162
  },
  // 63
  {
    id: 'lightshade-valley',
    name: 'Lightshade Valley',
    filename: 'FFBE Lightshade Valley.jpg',
    category: 'MOUNTAIN',
    element: 'WIND',
    description: 'Windswept cracked-earth mountain pass where blowing mist drifts across barren valley ground between jagged snow-dusted peaks.',
    mapBlueprint: 'Cracked earth canyon valley pinched between high snowy ridge walls, misty defiles, and weathered rock cairns.',
    tilesetId: 'mt-blaze',
    archetype: 'SNOW_PEAKS',
    propTheme: 'DEAD_WASTELAND',
    weatherEffect: 'NONE',
    accentColor: '#94a3b8',
    recommendedLevel: 34,
    seed: 163
  },
  // 64
  {
    id: 'line-under-construction',
    name: 'Railway Construction Line',
    filename: 'FFBE Line Under Construction.jpg',
    category: 'FORTRESS',
    element: 'FIRE',
    description: 'Industrial timber-decked railway platform overlooking misty snow-capped industrial mountains under overcast gray skies.',
    mapBlueprint: 'Long wooden-and-steel elevated rail platform spanning across rugged rocky mountain terrain with supply crates and track bridges.',
    tilesetId: 'mt-steel-2',
    archetype: 'CITY_AVENUE',
    propTheme: 'CYBER_CITY',
    weatherEffect: 'NONE',
    accentColor: '#94a3b8',
    recommendedLevel: 30,
    seed: 164
  },
  // 65
  {
    id: 'londell-road',
    name: 'Londell Road',
    filename: 'FFBE Londell Road.jpg',
    category: 'SACRED',
    element: 'LIGHT',
    description: 'Ancient mossy cobblestone road passing beneath weathered stone triumphal arches glowing against a golden amber twilight sky.',
    mapBlueprint: 'Golden twilight meadow highway lined by sequential ruined stone arches leading toward a sunlit sanctuary plaza.',
    tilesetId: 'buried-relic-1',
    archetype: 'SHRINE_COURTYARD',
    propTheme: 'DESERT_RUIN',
    weatherEffect: 'NONE',
    accentColor: '#fbbf24',
    recommendedLevel: 22,
    seed: 165
  },
  // 66
  {
    id: 'lordless-castle',
    name: 'Lordless Castle',
    filename: 'FFBE Lordless Castle 2.jpg',
    category: 'FORTRESS',
    element: 'WATER',
    description: 'Frozen sapphire ice lake fractured with glowing frost fissures leading to a dark silhouetted castle and ruined viaduct under starry night.',
    mapBlueprint: 'Shattered frozen glacial moat surrounding a northern castle courtyard island reached across cracked ice causeways.',
    tilesetId: 'ice-maze',
    archetype: 'FROZEN_CITADEL',
    propTheme: 'GLACIAL_ICE',
    weatherEffect: 'SNOW',
    accentColor: '#38bdf8',
    recommendedLevel: 46,
    seed: 166
  },
  // 67
  {
    id: 'lost-city-of-dipan',
    name: 'Lost City of Dipan',
    filename: 'FFBE Lost City of Dipan.jpg',
    category: 'FORTRESS',
    element: 'LIGHT',
    description: 'Sun-bleached ruined metropolis of broken Greco-Roman marble pillars, crumbling amphitheaters, and domed towers.',
    mapBlueprint: 'Ancient ruined city square ringed by broken marble colonnades, sunken dry plazas, and paved imperial walkways.',
    tilesetId: 'western-cave-1',
    archetype: 'CITY_AVENUE',
    propTheme: 'DESERT_RUIN',
    weatherEffect: 'NONE',
    accentColor: '#eab308',
    recommendedLevel: 36,
    seed: 167
  },
  // 68
  {
    id: 'lumfa-plains',
    name: 'Lumfa Plains',
    filename: 'FFBE Lumfa Plains.jpg',
    category: 'PLAINS',
    element: 'WIND',
    description: 'Tranquil wide open steppe of soft yellow-green prairie grass stretching toward hazy blue foothills and a distant silver river.',
    mapBlueprint: 'Wide sunlit steppe plains bordered by gentle northern hill walls and a serene winding silver river in the distance.',
    tilesetId: 'wyvern-hill',
    archetype: 'PLAINS_RIVER',
    propTheme: 'LUSH_OAK',
    weatherEffect: 'NONE',
    accentColor: '#84cc16',
    recommendedLevel: 10,
    seed: 168
  },
  // 69
  {
    id: 'lunar-new-year-2019',
    name: 'Crimson Blossom Pavilion',
    filename: 'FFBE Lunar New Year 2019.jpg',
    category: 'SACRED',
    element: 'FIRE',
    description: 'Ornate red-lacquered wooden temple veranda overlooking vibrant cherry blossoms, glowing paper lanterns, and an emerald pagoda pond.',
    mapBlueprint: 'Grand red-lacquered veranda boardwalks spanning an enchanted lotus pond toward an island pagoda garden framed by blooming sakura trees.',
    tilesetId: 'purity-forest-6',
    archetype: 'VERANDA_PAGODA',
    propTheme: 'AUTUMN_FESTIVAL',
    weatherEffect: 'SAKURA',
    accentColor: '#f43f5e',
    recommendedLevel: 28,
    seed: 169
  },
  // 70
  {
    id: 'macalania-woods',
    name: 'Macalania Woods',
    filename: 'FFBE Macalania Woods.jpg',
    category: 'FOREST',
    element: 'WATER',
    description: 'Bioluminescent nocturnal crystal forest where a glowing cyan path winds past shimmering trees and floating starlight beneath a crescent moon.',
    mapBlueprint: 'Luminous azure crystal path winding through dark forest walls, shimmering sapphire pools, and glowing ice-crystal clearings.',
    tilesetId: 'lapis-cave',
    archetype: 'CRYSTAL_SANCTUM',
    propTheme: 'VOID_CRYSTAL',
    weatherEffect: 'NONE',
    accentColor: '#38bdf8',
    recommendedLevel: 47,
    seed: 170
  },
  // 71
  {
    id: 'magi-training-grounds',
    name: 'Magi Training Grounds',
    filename: 'FFBE Magi Training Grounds.jpg',
    category: 'COSMIC',
    element: 'DARK',
    description: 'Shattered stone sanctuary floor strewn with torn violet tapestries and breached dark-brick walls bathed in arcane shadows.',
    mapBlueprint: 'Ruined circular arcane duel chamber with breached masonry walls, scattered purple-draped pillars, and glowing summoning rings.',
    tilesetId: 'southern-cavern-2',
    archetype: 'CASTLE_HALL',
    propTheme: 'VOID_CRYSTAL',
    weatherEffect: 'NONE',
    accentColor: '#a855f7',
    recommendedLevel: 50,
    seed: 171
  },
  // 72
  {
    id: 'main-colosseum',
    name: 'Main Colosseum',
    filename: 'FFBE Main Colosseum.jpg',
    category: 'FORTRESS',
    element: 'FIRE',
    description: 'Sun-drenched grand circular gladiatorial colosseum with golden sand combat floor surrounded by multi-tiered stone spectator arches.',
    mapBlueprint: 'Grand circular golden sand arena enclosed by thick concentric stone colosseum walls, four cardinal gate tunnels, and flaming braziers.',
    tilesetId: 'buried-relic-1',
    archetype: 'COLOSSEUM_ARENA',
    propTheme: 'CASTLE_TORCH',
    weatherEffect: 'NONE',
    accentColor: '#f59e0b',
    recommendedLevel: 52,
    seed: 172
  }
];

export const BATTLEGROUND_MAP = new Map<string, BattlegroundDefinition>(
  ALL_BATTLEGROUNDS.map(bg => [bg.id, bg])
);

export function getBattlegroundById(id: string): BattlegroundDefinition | undefined {
  const cleanId = id.startsWith('bg-') ? id.slice(3) : id;
  return BATTLEGROUND_MAP.get(cleanId);
}

/**
 * Returns a battleground image path for a given realm, battleground-realm, or combat circumstance.
 */
export function getBattlegroundForCombat(realmId?: string, isBoss?: boolean, element?: ElementType): string {
  // Check if traveling directly in one of the 72 Battleground World Maps
  if (realmId) {
    const directBg = getBattlegroundById(realmId);
    if (directBg) {
      return `/battlegrounds/${directBg.filename}`;
    }
  }

  switch (realmId) {
    case 'whispering-glade':
      return isBoss ? '/battlegrounds/FFBE Earth Shrine.jpg' : '/battlegrounds/FFBE Dalnakya Plains.jpg';
    case 'infernal-caldera':
      return isBoss ? '/battlegrounds/FFBE Golzas Peak.jpg' : '/battlegrounds/FFBE Golzas Canyon.jpg';
    case 'sunken-abyss':
      return isBoss ? '/battlegrounds/FFBE Lake Dorr 2.jpg' : '/battlegrounds/FFBE Lake Dorr.jpg';
    case 'galebreak-crags':
      return isBoss ? '/battlegrounds/FFBE Heavensplit Peaks.jpg' : '/battlegrounds/FFBE Galebreak.jpg';
    case 'sunken-sands':
      return isBoss ? '/battlegrounds/FFBE Brown Sands.jpg' : '/battlegrounds/FFBE Floating Sands.jpg';
    case 'celestial-farplane':
      return isBoss ? '/battlegrounds/FFBE Crystal Tower Entrance.jpg' : '/battlegrounds/FFBE Farplane.jpg';
    default:
      break;
  }

  switch (element) {
    case 'FIRE':
      return '/battlegrounds/FFBE Golzas Canyon.jpg';
    case 'WATER':
      return '/battlegrounds/FFBE Lake Dorr.jpg';
    case 'WIND':
      return '/battlegrounds/FFBE Galebreak.jpg';
    case 'LIGHT':
      return '/battlegrounds/FFBE Floating Sands.jpg';
    case 'DARK':
      return '/battlegrounds/FFBE Farplane.jpg';
    default:
      return '/battlegrounds/FFBE Dalnakya Plains.jpg';
  }
}
