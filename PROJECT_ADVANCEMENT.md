# Tessera Legacy — Complete Project Advancement & Technical Architecture

> **Document Purpose:** Comprehensive reference covering all systems, data schemas, asset pipelines, UI components, combat engines, multiplayer networking, and current status. Future agent sessions and developers can read this single document for complete project context without inspecting every file in the repository.  
> **Last Updated:** November 2026  
> **Project Root:** `c:\Users\Noctus\Documents\Tessera_legacy`  
> **Live Dev Server:** `http://localhost:5173` (Vite 6.0 + React 18 + TypeScript 5.7)

---

## 1. Executive Summary & Vision

* **Genre:** 2D Vertical Mobile-First Co-op MMORPG (Inspired by *Logres: Japanese RPG*, *Fire Emblem Heroes*, and *Pokemon Mystery Dungeon*).
* **Viewport Target:** Centered mobile container (`430px × 850px` on desktop, responsive full-height on mobile browsers).
* **Core Combat Loop:** No-mana 5-weapon hotbar combat, auto-attacking every 2.0s, active weapon skill rotations, cooldown management, and 100% **Ether Gauge** Ultimate skills.
* **Overworld:** 120×120 tilemap (2880×2880px) per realm rendered with authentic *Pokemon Mystery Dungeon* autotiled tilesets, dynamic weather overlays, Stardew Valley-inspired environmental props, roaming field enemies, autonomous wandering AI Hunters, and seamless drop-in World Boss fights.
* **Progression:** 17 specialized classes across 3 evolutionary paths (Martial, Arcane, Divine), 425+ collectible weapons (1★ to 5★ Mythics), weapon forge refinement (+1 to +10 milestones), cosmetic Hero Skins, and 72 distinct realm worlds.
* **Networking & Persistence:** Serverless P2P multiplayer via Trystero (WebRTC / BitTorrent tracker), client-side `localStorage` persistence, and optional Google Cloud Save synchronization.

---

## 2. Directory Structure & File Map

```
Tessera_legacy/
├── .gitignore                     # Ignores node_modules, dist, temp/, raw_source_assets/, .env
├── index.html                     # HTML5 entry with mobile meta viewport & canvas setup
├── package.json                   # Dependencies: react, react-dom, lucide-react, trystero
├── postcss.config.js              # PostCSS with Tailwind & Autoprefixer
├── tailwind.config.js             # Custom colors, animation keyframes, font families
├── tsconfig.json                  # Strict TypeScript configuration
├── vite.config.ts                 # Port 5173, host enabled, ignored watcher roots
├── PROJECT_ADVANCEMENT.md         # Master technical reference & architecture (This file)
├── Tessera_legacy_GDD.md          # Original Game Design Document
├── public/                        # Deployed, production-ready static assets (226 MB, 3,012 files)
│   ├── battlegrounds/             # 72 Final Fantasy Brave Exvius battle arena backdrops (JPG)
│   ├── bosses/                    # 49 Boss animated action frames (idle/attack PNGs)
│   ├── characters/                # 92 Character skin folders with 4-dir idle/walk/run cycles
│   ├── enemies/                   # 56 Enemy sprite folders with animation frames
│   ├── map/                       # 85 Environmental props (Stardew trees, shrines, lanterns)
│   ├── pmd_tilesets/              # 61 PMD dungeon tileset directories with atlas.png packs
│   ├── pmd_weather/               # 84 Weather overlay sprite frames (Rain, Snow, Sakura, Sand)
│   ├── portals/                   # Realm portal animations
│   ├── sounds/feh/                # 312 Fire Emblem Heroes studio WAV sound effects
│   └── swords/                    # 425 Individual weapon icons and catalog JSON
├── raw_source_assets/             # Master uncompressed archives (53.6 MB, 1,439 files)
│   ├── Animals/                   # Suikoden Star Leap animal spritesheets
│   ├── Battle background ff/      # Original 72 FFBE environment plates
│   ├── caracters/                 # Master character animation sheets
│   ├── FE caracters/              # Master Fire Emblem / Samurai Kingdom boss sheets
│   ├── FE Ennemies/               # Master field monster sheets
│   ├── Monsters/                  # 650+ monster source sprites
│   ├── swords/                    # Master weapon sheet assets
│   ├── Tiles/                     # Master PMD dungeon atlas candidates
│   ├── tree/                      # Master tree prop sheets
│   ├── weather/                   # Master weather sprite frames
│   └── README.md                  # Detailed manifest of raw source folders
├── scripts/                       # Asset pipeline and metadata generation scripts (104 files)
│   ├── extract_all_pmd_tilesets.py # Python tileset atlas generator
│   ├── extract_caracters.py       # Character frame extractor
│   ├── extract_mythic_swords.py   # Mythic weapon slice tool
│   ├── extract_suikoden_monsters.py# Field monster extractor
│   ├── generate_legendary_150_ts.py# TypeScript catalog generator
│   └── process_map_assets.cjs     # Map prop build script
└── src/                           # Complete game application source code (52 files)
    ├── App.tsx                    # Root shell, code-splitting Suspense, mobile frame
    ├── main.tsx                   # React 18 DOM mount
    ├── index.css                  # Tailwind directives & custom scrollbars
    ├── types/
    │   └── game.ts                # Complete TypeScript type definitions
    ├── state/
    │   └── useGameStore.ts        # Central reactive game store & action dispatchers
    ├── data/                      # Game catalogs, database records & configurations
    │   ├── battlegrounds.ts       # 72 Battleground definitions & tileset mappings
    │   ├── bigMaps.ts             # 120x120 Procedural map generators & prop spawn tables
    │   ├── customizationParts.ts  # Hairstyle, skin, eye customization parts
    │   ├── dungeons.ts            # 3-Wave Elemental Dungeon trials & boss raids
    │   ├── enemies.ts             # Normal & Boss enemy templates, stats, drops
    │   ├── jobs.ts                # 17 Classes, evolution trees, EXP tables, stat traits
    │   ├── legendarySwords.ts     # 150+ 5-Star Legendary weapons
    │   ├── materials.ts           # Slime essence, thorn fangs, crafting mats
    │   ├── mythicWeapons.ts       # Class-exclusive 5★ Mythic signature blades
    │   ├── noviceGuide.ts         # 6 Novice hunter tutorial steps & currency rewards
    │   ├── quests.ts              # Story quests, bounties, weapon locks
    │   ├── realms.ts              # 72 Realm configurations (Whispering Glade, etc.)
    │   ├── skins.ts               # Collectible Hero Skins catalog & rarities
    │   ├── summonNightWeapons.ts  # Summon Night weapon catalog
    │   └── weapons.ts             # Master weapon map, starter loadouts, stats
    ├── services/
    │   ├── coopMultiplayer.ts     # Trystero P2P room, presence broadcast, battle sync
    │   └── googleSyncService.ts   # Google Drive AppData cloud backup & restore
    ├── utils/
    │   ├── audioManager.ts        # FEH studio WAV player + procedural Web Audio fallback
    │   ├── combatUtils.ts         # Damage formulas, elemental multipliers, refinements
    │   ├── pmdTileEngine.ts       # 24x24 Autotile bitmask solver & A* pathfinder
    │   └── spritecastEffectEngine.ts# Particle physics VFX hit explosions
    └── components/
        ├── battle/                # Combat arena view & visual FX components
        │   ├── AnimeElementalSlash.tsx  # Anime weapon slash animations
        │   ├── BattleArena.tsx          # Master side-view combat arena component
        │   ├── BossStrikeVisual.tsx     # Boss heavy attack visual overlays
        │   ├── DamagePopup.tsx          # Floating damage numbers & heal text
        │   ├── SpriteCastHitEffect.tsx  # PVFX physics hit sparks
        │   └── WeaponStrikeVisual.tsx   # Player weapon impact effects
        ├── common/                # Reusable UI & presentation widgets
        │   ├── AnimatedWeaponIcon.tsx   # Rarity glow, animated border weapon icon
        │   ├── AstralSummonsAltar.tsx   # Overworld shrine visual
        │   ├── ClassIcon.tsx            # SVG class badges
        │   ├── RealmPortal.tsx          # Swirling realm gateway component
        │   └── SpriteRenderer.tsx       # Multi-frame character & boss animator
        ├── layout/                # Global persistent shells
        │   ├── BottomDock.tsx           # Overworld 4-tab nav / In-Battle 5-slot hotbar
        │   └── TopHud.tsx               # Player portrait, HP, EXP, Currencies, Settings
        ├── map/                   # Overworld map components
        │   ├── OverworldMap.tsx         # 2880px scrollable map, A*, collision, camera
        │   ├── PmdTilemapCanvas.tsx     # High-perf HTML5 canvas autotiled renderer
        │   └── PmdWeatherOverlay.tsx    # Rain, snow, sakura petal particle overlays
        └── modals/                # Overlays & sub-screens (Code-split lazy loaded)
            ├── AccountChoiceModal.tsx   # Guest vs Google Sync selector
            ├── CoopModal.tsx            # Room code joiner, peer lobby list
            ├── DungeonModal.tsx         # Elemental 3-wave dungeon selector
            ├── GachaModal.tsx           # Hero Skins & Weapons Tessera summon
            ├── HeroOnboardingModal.tsx  # Name input, class choice, intro lore
            ├── JobModal.tsx             # 17-Class evolution tree & mastery advancement
            ├── LoadoutModal.tsx         # Weapon equip, sort/search, +10 forge forge
            ├── ProfileModal.tsx         # Avatar customization & name editor
            ├── QuestModal.tsx           # Story & bounty quest rewards tracker
            ├── RealmTravelModal.tsx     # 72-Realm world map travel selector
            └── SettingsModal.tsx        # Audio volume, data wipe, cloud export
```

---

## 3. Core Systems & Architecture

### 3.1 State Management (`src/state/useGameStore.ts`)
* **Store Pattern:** Custom lightweight hook with external listener set and unified `gameActions` dispatcher (avoids heavy Redux/Zustand overhead).
* **Persistence:** Serializes to `localStorage` under key `tessera_legacy_save_v1`.
* **State Shape:**
  * `player`: Name, current job, job levels (`Record<JobType, {level, exp}>`), gold (starts 2500), Tessera Shards (starts 500), Hero Feathers (starts 200), inventory (`Weapon[]`), equipped weapon IDs (up to 5), weapon upgrades (`Record<weaponId, level>`), materials, quest progress, avatar customization, unlocked skins.
  * `currentHp` / `maxHp`: Calculated dynamically from player base job stats + total equipment stats + shared job mastery passives.
  * `currentRealmId`: Active realm (defaults to `'whispering-glade'`).
  * `view`: `'OVERWORLD'` or `'BATTLE'`.
  * `activeTab`: `'MAP'`, `'EQUIP'`, `'JOBS'`, `'SUMMON'`.
  * `battles`: Active `BattleInstance` dictionary with real-time combatant HP, ether, status effects.
  * `enemies`: Overworld mobs for current realm (20 regular packs + 4 vanguard elites + 4 corner guardians + 1 world boss).
  * `aiHunters`: 5 autonomous wandering AI players (Aiden, Seraphina, Lyra, Orion, Kael).

### 3.2 Combat System (`src/components/battle/BattleArena.tsx`)
* **Viewport Layout:** Side-view JRPG style. Left 35% holds the Boss / Monsters; Right 65% holds the Player + up to 4 AI / Co-op Allies.
* **Auto-Attacks:** Fixed `2.0s` interval using the Main Weapon's element and archetype.
* **5-Weapon Hotbar:**
  * Active skills place individual slots on cooldown (`6s` to `15s`).
  * Each active skill generates **+25% to +40% Ether Charge**.
  * Reaching **100% Ether** activates golden radiant borders and enables devastating multi-hit **Ultimate Skills** (resetting Ether to 0%).
* **Samurai Kingdom Stagger & Break System:**
  * Dealing continuous damage builds the Boss's **Stagger Meter** (0 to 100).
  * At 100 Stagger, triggers a **Multi-Phase Stagger Break** window where the boss is paralyzed, takes critical weakness damage, and drops extra loot.
* **Active Reaction Counterplay (Guard / Parry):**
  * Player can tap Guard right before incoming heavy strikes to reduce damage by 80% and trigger a **Perfect Parry** counter-burst.
* **Elemental Affinity Matrix:**
  * Fire 🔥 beats Wind 🍃 (`1.5x`) beats Water 💧 (`1.5x`) beats Fire 🔥 (`1.5x`).
  * Light ☀️ ↔ Dark 🌙 (Mutual `1.5x` weakness).
  * Resisted elements deal `0.75x`.
* **Cross-Class Status Afflictions:**
  * **Chilled (Water):** Slows boss cast speed; physical strikes trigger **Freeze Shatter** bonus damage.
  * **Oiled (Wind):** Next Fire attack triggers **Combustion Blast** dealing massive AoE burst damage.
  * **Holy Cross (Divine):** Light attacks place radiant marks that heal striking allies for 15% of damage dealt.

### 3.3 Overworld & Tilemap Engine (`src/utils/pmdTileEngine.ts`)
* **Dimensions:** 120×120 tiles (`24px` tile size = `2880px × 2880px` canvas).
* **Autotiling:** Uses Pokemon Mystery Dungeon 47-tile Wang/blob bitmasking to seamlessly blend wall borders, shoreline water, bridges, cobblestone roads, and sanctuary courtyards.
* **Pathfinding:** 8-direction A* algorithm with corner-cutting prevention and dynamic entity avoidance.
* **Camera:** Smoothly lerps to center on player coordinates with boundary clamping.
* **World Spawns:**
  * **Safe Haven (South):** Sanctuary zone with 100% HP regeneration, Job Board, and Astral Altar.
  * **20 Roaming Field Packs:** Regular mobs and level-scaled Vanguard Elites.
  * **4 Corner Guardians:** Northwest, Northeast, Southwest, Southeast wardens dropping exclusive 5★ Corner Swords.
  * **North Sanctum:** Massive World Boss (e.g. *Guardian Seiryu*, *Abyssal Stag*).

### 3.4 Job & Evolution System (`src/data/jobs.ts`)
17 classes structured across 3 distinct evolutionary paths:
1. **Martial Path:**
   * **Warrior** *(Base)* → **Guardian** *(Tank/Shield)*, **Berserker** *(Heavy 2H Cleave)*, **Rogue** *(Daggers/Stealth)*, **Assassin** *(Crit Burst)*, **Hunter** *(Bow/Ranged)*.
2. **Arcane Path:**
   * **Mage** *(Base)* → **Archmage** *(3-Element Staves)*, **Warlock** *(Dark/DoT Tomes)*, **Death Knight** *(Melee Necromancy)*, **Demon Hunter** *(Agile Magic DPS)*.
3. **Divine & Primal Path:**
   * **Priest** *(Base)* → **Paladin** *(Holy Tank/Healer)*, **Druid** *(Nature Regen)*, **Shaman** *(Elemental Totems)*, **Monk** *(Fist/Qi Heals)*, **Evoker** *(Astral Summons)*.
* **Class Mastery Rule:** Players must reach **Lv. 10 (Mastery)** in their current class before unlocking the ability to switch or advance to specialized classes.
* **Cross-Job Passives:** Stat bonuses earned on one class (`+5% Max HP`, `+5% Crit Rate`) permanently enhance all other classes.

### 3.5 Weapons & Forge System (`src/data/weapons.ts` & `src/components/modals/LoadoutModal.tsx`)
* **Weapon Types:** Greatblade, Shield, Staff, Tome, Mace, Relic, Twin Daggers, Bow.
* **Rarities:** 1★ (Common), 2★ (Uncommon), 3★ (Rare), 4★ (Epic), 5★ (Legendary & Mythic).
* **Refinement Forge:**
  * Weapons can be refined from `+1` to `+10` using Gold and Monster Drops (*Slime Essence*, *Thorn Fangs*, *Gale Feathers*, *Abyssal Cores*).
  * **+3 Milestone:** +10% Active Skill Multiplier.
  * **+5 Milestone:** -1.0s Skill Cooldown.
  * **+7 Milestone:** +15% Ether Generation.
  * **+10 Masterwork:** Unlocks secondary passive trait (e.g., Guaranteed Critical on first hit).

### 3.6 Audio Engine (`src/utils/audioManager.ts`)
* **Audio Library:** 312 studio-quality 16-bit WAV samples extracted from *Fire Emblem Heroes* located in `/sounds/feh/`.
* **Caching:** Preloads core combat SFX on first user gesture into decoded `AudioBuffer` memory cache.
* **Web Audio Synthesis Fallback:** If a sound file fails or is offline, synthesizes procedural tones using Web Audio oscillators.
* **BGM:** Background music synthesizer with mute state persistence in `localStorage`.

### 3.7 P2P Co-op & Cloud Sync (`src/services/coopMultiplayer.ts`)
* **P2P Multiplayer:** Uses Trystero with BitTorrent/WebRTC trackers.
* **Zero Backend:** No paid server infrastructure required. Players in the same room code automatically see each other's live coordinates, character skins, job titles, and combat damage/heal events.
* **Cloud Sync:** Optional Google Drive `appDataFolder` backup enabling cross-device save portability.

---

## 4. Complete 72 Realms & Battlegrounds Index

All 72 realms map 1:1 between an FFBE battle arena backdrop (`/battlegrounds/*.jpg`) and an authentic PMD tileset atlas (`/pmd_tilesets/*/atlas.png`):

| Realm # | Realm Name | Battleground Plate | PMD Tileset Atlas | World Boss |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Whispering Glade | `FFBE Earth Shrine.jpg` | `purity-forest-4` | Guardian Seiryu |
| **2** | Grand Canyon Depths | `FFBE Argus Plains.jpg` | `great-canyon` | Grand Canyon Golem |
| **3** | Sunken Desert Dune | `FFBE Brown Sands.jpg` | `desert-region` | Dune Sandworm |
| **4** | Waterfall Grotto | `FFBE Dim Wetlands.jpg` | `waterfall-pond` | Leviathan Hydra |
| **5** | Darknight Catacombs | `FFBE City of Ash Anabeth.jpg` | `darknight-relic` | Shadow Fiend |
| **6** | Murky Depths | `FFBE Foggy Thicket BG.jpg` | `murky-cave` | Bog Abomination |
| **7** | Lapis Crystalline Cavern | `FFBE Crystal Tower Entrance.jpg` | `lapis-cave` | Crystal Behemoth |
| **8** | Sinister Sylvan Thicket | `FFBE Giant Forest.jpg` | `sinister-woods` | Ancient Treant |
| **9** | Crag of the Basalt Peaks | `FFBE Desolate Landing.jpg` | `rock-path` | Basalt Colossus |
| **10** | Northwind Tundra Expanse | `FFBE Galebreak.jpg` | `northwind-field` | Frost Wyrm |
| **11** | Venomous Mire Labyrinth | `FFBE Dim Wetlands.jpg` | `poison-maze` | Chimera Manticore |
| **12** | Pitfall Chasm Gorge | `FFBE Forgotten Walls.jpg` | `pitfall-valley` | Chasm Devourer |
| **13** | Obsidian Western Bastion | `FFBE Georl Garrison Ruins.jpg` | `western-cave-2` | Obsidian Titan |
| **14** | Wishing Well Caverns | `FFBE Carbuncle Grove BG.jpg` | `wish-cave-1` | Astral Chimera |
| **15** | Buried Relic Sepulcher | `FFBE Castle Hein.jpg` | `buried-relic-3` | Tomb Phantasm |
| **16** | Howling Canopy Wilds | `FFBE Dalnakya Plains.jpg` | `howling-forest-1` | Dire Alpha Wolf |
| **...** | *[Realms 17–72]* | *Indexed in `src/data/battlegrounds.ts`* | *Indexed in `src/data/battlegrounds.ts`* | *Unique World Boss per Realm* |

---

## 5. Verification & Health Status

* **TypeScript Typechecking:** ✅ `tsc --noEmit` passes with **0 errors**.
* **Vite Production Build:** ✅ `npm run build` succeeds in **6.95s**, bundling 2,223 modules cleanly into `dist/`.
* **Static Asset References:** ✅ **100% verified** (all 526 static asset URLs in `/battlegrounds`, `/bosses`, `/characters`, `/enemies`, `/swords`, `/pmd_tilesets`, and `/sounds/feh` exist on disk).
* **Live Server:** ✅ Vite dev server operational at `http://localhost:5173`.

---

## 6. Recent Repository Cleanup Log

* **Removed `temp/` folder:** Purged `temp/pokemon-survivors-extracted` (**112.5 MB, 12,676 files**), removing obsolete downloaded repository files.
* **Removed empty folders:** Deleted `Magic attacks/` (0 files).
* **Removed bytecode cache:** Cleaned all `__pycache__` directories in `scripts/`.
* **Purged 41 Agent Scratch Scripts:** Removed temporary log-inspection and transcript scripts from `scripts/` while preserving all 104 core asset generation and metadata tools.
* **Organized Raw Assets:** Moved 10 loose root folders (`Animals`, `Battle background ff`, `caracters`, `FE caracters`, `FE Ennemies`, `Monsters`, `swords`, `Tiles`, `tree`, `weather`) into `raw_source_assets/` and documented them in `raw_source_assets/README.md`.
* **Updated `.gitignore`:** Added `temp/` and `raw_source_assets/`.

---

## 7. Upcoming Enhancement Roadmap

1. **Desktop Combat Hotkeys:**
   * Keys `1`–`5`: Trigger weapon active skill or ultimate.
   * `Spacebar`: Activate Guard / Reaction Parry.
   * `A`: Toggle Auto-Attack on/off.
   * `Escape` / `F`: Flee encounter.
2. **Mobile Virtual Joystick:**
   * Semi-transparent on-screen analog thumbstick for direct mobile movement control alongside tap-to-move.
3. **Dynamic BGM Engine:**
   * Contextual transitions between peaceful sanctuary exploration, driving normal combat rhythms, and orchestral World Boss / Dungeon themes.
4. **Boss Ground Danger Telegraphs:**
   * Visual pulsing red hazard zones on the arena floor before boss heavy attacks to clearly signal Guard/Parry timing.
5. **Quality-of-Life Tools:**
   * **"Auto-Equip Best Loadout"** button in `LoadoutModal`.
   * **Weapon Salvage System** to dismantle surplus 1★–3★ duplicate weapons into gold and enhancement materials.
6. **Daily Bounty Board:**
   * Recurring daily quest contracts for continuous endgame replayability.
