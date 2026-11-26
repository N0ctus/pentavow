# Game Design & Technical Architecture Document
**Title:** *Tessera_legacy*  
**Genre:** 2D Vertical Weapon-Driven Co-op RPG (Inspired by *Logres*)  
**Target Platform:** Mobile-First Web Browser (`430px × 850px` centered viewport on desktop, responsive full-screen on mobile)  
**Tech Stack:** React 18+, TypeScript, Tailwind CSS, Lucide-React (UI icons), Custom SVG/HTML5 Canvas (Sprites & VFX), `localStorage` (Persistence)

---

## 1. Google Antigravity Master Execution Prompt
*(Copy and paste this section directly into Google Antigravity's Agent prompt box after placing this file in your project root.)*

> **Project Goal:** Read `Tessera_legacy_GDD.md` and build a playable, vertical-screen 2D browser MMORPG prototype titled **"Tessera_legacy"** following all specifications in the document.
>
> **Tech Stack & Setup:**
> * Initialize a clean **React + TypeScript + Vite + Tailwind CSS** project formatted for a centered vertical mobile viewport (`430px × 850px` on desktop, responsive on mobile).
> * Use `localStorage` to persist player progress, unlocked jobs, inventory, and currency.
> * Use clean, illustrated SVG or HTML5 Canvas chibi-style vector sprites and animated visual effects so everything runs locally with zero external asset links.
>
> **Execution Plan (Complete & Verify Milestone by Milestone):**
> * **Milestone 1 (Foundation & Overworld):** Implement `types/game.ts`, `data/*.ts`, `useGameStore.ts`, the Top HUD, Bottom Navigation Dock, and the scrollable 2D overworld map (*The Whispering Glade*) with roaming monsters, the *Abyssal Stag* World Boss, autonomous AI Hunters, and clickable **"Battle in Progress"** drop-in markers.
> * **Milestone 2 (Weapon-Driven Combat & Co-op Boss Logic):** Implement the side-view battle arena with 2-second auto-attacks, the 5-slot weapon hotbar (no mana bars), weapon cooldowns, 100% **Ether Gauge** Ultimate Skills, elemental affinities, boss threat/aggro, and AI allies dropping into World Boss fights mid-battle.
> * **Milestone 3 (Job System & Weapon Gacha):** Implement the Job Switcher (*Vanguard*, *Spellweaver*, *Lightbearer*, *Shadowblade*), weapon loadout filtering, and the **Tessera Summon (Gacha)** modal using **Tessera Shards**.
>
> **Browser Verification:**
> After completing each milestone, launch the dev server, open the built-in browser preview, and verify movement, seamless battle drop-in, weapon skill cooldowns/ultimates, job switching, and gacha pulls with zero console or layout errors.

---

## 2. Core Concept & Gameplay Loop
Players take the role of Relic Hunters in the realm of **Tessera_legacy**. Unlike traditional RPGs that rely on mana bars and rigid character classes, combat revolves around **5-weapon hotbar synergies**, **cooldown management**, and **flexible job switching**.

### The Core Loop
1. **Explore Open Field:** Roam *The Whispering Glade* alongside autonomous AI players.
2. **Seamless Drop-In Combat:** Engage roaming monsters or tap active battles ("crossed-swords" indicator) to jump into ongoing **World Boss** fights mid-battle without lobby matchmaking.
3. **Weapon & Ether Rotation:** Auto-attack automatically while tapping equipped weapons to trigger Active Skills, stack buffs, and charge each weapon's **Ether Gauge** to 100% for Ultimate Skills.
4. **Earn & Summon:** Collect Gold, EXP, and **Tessera Shards** from defeated bosses to pull new weapons from the **Tessera Summon (Gacha)** and level up multiple Jobs.

---

## 3. World, Map & Seamless Co-op Mechanics

### 3.1 Overworld Map: *The Whispering Glade*
* **Dimensions:** `1600px × 1600px` scrollable 2D map with camera following the player.
* **Zones:**
  * **Safe Haven (South):** Sanctuary camp where players spawn, heal to 100% automatically, and access the Job Board and Summon Altar.
  * **Outer Meadows (East/West):** Spawns low-to-mid-level roaming monsters (*Moss Slime*, *Thorn Wolf*, *Gale Hawk*).
  * **Tessera Crater (Center):** Spawns the massive World Boss (**"Abyssal Stag"** — 50,000 HP, multi-phase attacks, respawns 30 seconds after defeat).

### 3.2 Autonomous AI Players & Drop-In System
To simulate an active MMO server locally:
* **AI Population:** 4–6 AI Hunters roam the map with distinct names, visible Job badges, and equipped weapons.
* **AI Behavior State Machine:**
  * `WANDERING`: Moves toward random waypoints or nearby monsters.
  * `ENGAGING`: Touches a monster/boss, spawning a **Battle Instance** on the map.
  * `IN_BATTLE`: Displays an interactive **"Battle in Progress" (Crossed Swords + Player Count `1/5`)** marker above the encounter.
* **Drop-In Rules:**
  * Up to **5 Hunters** (1 Human Player + up to 4 AI Allies) can occupy a single Battle Instance.
  * **Player Joining AI:** Tapping an active battle icon on the map immediately transitions the player into that ongoing fight with the boss's current remaining HP intact.
  * **AI Joining Player:** If the player initiates a fight against the World Boss, nearby AI Hunters automatically pathfind to the boss and drop into the battle every 4–6 seconds until the party reaches 5/5.

---

## 4. Combat System Specifications

### 4.1 No-Mana Weapon Hotbar
* Players equip **1 Main Weapon** + **4 Sub-Weapons** (5 active battle slots total).
* **Auto-Attack:** Every `2.0s`, the character automatically strikes the target using the Main Weapon's element for `1.0x ATK`.
* **Active Skill (Tap):**
  * Triggers the weapon's skill immediately.
  * Places that specific weapon slot on **Cooldown** (`6s` to `15s` depending on weapon tier).
  * Grants **+25% to +50% Ether Charge** to that weapon's gauge.
* **Ultimate Skill (100% Ether Gauge):**
  * When a weapon's Ether Gauge reaches `100%`, its icon ignites with a golden border.
  * Tapping it unleashes a high-multiplier Ultimate Skill (e.g., 5-hit elemental burst, massive party shield, or full party heal) and resets Ether to `0%`.

### 4.2 Elemental Affinity Matrix
All weapons and monsters belong to one of **5 Elements**:
* **Fire** → beats **Wind** (`1.5x` damage) → beats **Water** (`1.5x` damage) → beats **Fire** (`1.5x` damage)
* **Light** ↔ **Dark** (Mutual `1.5x` weakness against each other)
* Resisted elements deal `0.75x` damage.

### 4.3 Boss Threat (Aggro) & Role Synergy
* **Aggro Table:** Each participant in battle generates Threat (`Damage Dealt × Threat Modifier`).
* The boss targets the Hunter with the highest Threat.
* **Boss Telegraphing:** Before heavy AoE attacks (e.g., *"Abyssal Rupture"*), the boss displays a `3.0s` warning cast bar, prompting Tanks to pop Damage Reduction buffs and Healers to prepare group heals.

---

## 5. Job System & Classes
Players can switch jobs anytime while in the **Safe Haven** or outside of battle. Each job levels independently (`Lv. 1` to `Lv. 50`) and unlocks permanent passive stat bonuses (`+5% Max HP`, `+5% Crit Rate`, etc.) shared across all jobs.

| Job Name | Role | Allowed Weapons | Base Stat Bias | Passive Trait |
| :--- | :--- | :--- | :--- | :--- |
| **Vanguard** | Tank | Greatblade, Shield | High HP / DEF | **Iron Will:** `+150%` Threat generation; `+20%` damage reduction. |
| **Spellweaver** | Magic DPS | Staff, Tome | High MATK | **Arcane Surge:** `+25%` elemental weakness damage. |
| **Lightbearer** | Healer / Buff | Mace, Relic | High MDEF / Heal | **Grace:** Healing skills also boost party ATK by `15%` for `10s`. |
| **Shadowblade** | Crit DPS | Twin Daggers, Bow | High SPD / CRIT | **Assassinate:** `+30%` Critical Hit Rate; auto-attacks hit twice. |

---

## 6. Weapon Catalog & Gacha (Tessera Summon)

### 6.1 Rarity Tiers & Drop Rates
* **Rare (3★ — 70%):** Solid starter weapons with single-target strikes or basic heals.
* **Epic (4★ — 25%):** Multi-hit skills, elemental buffs, or party-wide heals.
* **Legendary (5★ — 5%):** Signature weapons with screen-shaking Ultimates, multi-hit combos (`7x` hits), and team-wide stat amplifiers.

### 6.2 Signature Weapon Database (`weapons.ts`)
1. **Sunfire Claymore** *(5★ Fire Greatblade — Vanguard)*
   * **Active:** *Blazing Cleave* — Deals `220%` Fire DMG + High Threat (`CD: 8s`, `+35% Ether`).
   * **Ultimate:** *Solar Nova* — Deals `550%` Fire DMG (3 hits) + Grants `40%` Damage Shield to self for `10s`.
2. **Astral Conduit** *(5★ Light Staff — Spellweaver)*
   * **Active:** *Starfall* — Deals `260%` Light AoE DMG (`CD: 9s`, `+35% Ether`).
   * **Ultimate:** *Judgment Ray* — Deals `700%` Light DMG (5 hits) + Boosts own MATK by `50%` for `12s`.
3. **Seraphic Censer** *(5★ Light Relic — Lightbearer)*
   * **Active:** *Mending Pulse* — Heals all party members for `35%` Max HP (`CD: 10s`, `+40% Ether`).
   * **Ultimate:** *Sanctuary of Dawn* — Full party heal (`100%` HP) + Revives fallen allies + `+30%` All Stats for `15s`.
4. **Voidfang Daggers** *(5★ Dark Twin Daggers — Shadowblade)*
   * **Active:** *Phantom Flurry* — Deals `4 × 70%` Dark DMG with `+50%` Crit Rate (`CD: 7s`, `+35% Ether`).
   * **Ultimate:** *Eclipse Execution* — Deals `8 × 110%` Dark DMG + Guarantees Critical Hits for `8s`.

---

## 7. UI / UX Layout & Screen Architecture

### 7.1 Viewport Frame
* Centered vertical container (`max-w-[430px] h-[850px] mx-auto border-x border-slate-800 shadow-2xl overflow-hidden flex flex-col bg-slate-950`).

### 7.2 Persistent Top HUD (`64px` height)
* **Left:** Chibi Character Portrait + Current Job Icon + Job Level (`Lv. 12`).
* **Center:** Dynamic HP Bar (`Current / Max HP`) + EXP Progress thin bar.
* **Right:** Gold counter & **Tessera Shards** (premium gacha currency) counter.

### 7.3 Main Viewport (`flex-1`)
Switches cleanly between two primary states:
1. **Overworld View:** Interactive 2D canvas/SVG map with virtual joystick/tap-to-move, floating battle indicators, and a mini-radar in the top-right corner.
2. **Battle View:** Side-view JRPG arena. Boss/Monsters positioned on the left (`35%` width) with floating HP bar, elemental badge, and cast bar. Player + AI allies positioned on the right (`65%` width) in a staggered formation with floating damage numbers, heal popups, and animated weapon slash/spell effects.

### 7.4 Bottom Action Dock (`160px` height)
* **In Overworld:** 4 navigation tabs (**Map**, **Equip / Loadout**, **Jobs**, **Summon**).
* **In Battle:**
  * **5-Slot Weapon Hotbar:** Circular/square weapon cards showing weapon icon, elemental border, radial cooldown sweep overlay, and a vertical/circular **Ether Gauge** fill bar.
  * **Flee / Auto-Battle Toggle:** Small utility buttons above the hotbar.

---

## 8. Data Models (`src/types/game.ts`)

```typescript
export type ElementType = 'FIRE' | 'WATER' | 'WIND' | 'LIGHT' | 'DARK';
export type JobType = 'VANGUARD' | 'SPELLWEAVER' | 'LIGHTBEARER' | 'SHADOWBLADE';
export type WeaponCategory = 'GREATBLADE' | 'SHIELD' | 'STAFF' | 'TOME' | 'MACE' | 'RELIC' | 'DAGGERS' | 'BOW';
export type Rarity = 3 | 4 | 5;

export interface Weapon {
  id: string;
  name: string;
  rarity: Rarity;
  element: ElementType;
  category: WeaponCategory;
  baseAtk: number;
  baseMatk: number;
  cooldownSec: number;
  etherGain: number; // e.g., 35 means 35% per active use
  activeSkillName: string;
  activeMultiplier: number;
  ultimateSkillName: string;
  ultimateMultiplier: number;
  effectType: 'DAMAGE' | 'HEAL' | 'BUFF_DEF' | 'BUFF_ATK';
}

export interface Combatant {
  id: string;
  name: string;
  isPlayer: boolean;
  job: JobType;
  hp: number;
  maxHp: number;
  atk: number;
  matk: number;
  def: number;
  threat: number;
  equippedWeapons: Weapon[];
  cooldowns: Record<string, number>; // weaponId -> remaining seconds
  ether: Record<string, number>;     // weaponId -> 0 to 100
}

export interface BattleInstance {
  id: string;
  enemyId: string;
  enemyName: string;
  enemyElement: ElementType;
  enemyHp: number;
  enemyMaxHp: number;
  isBoss: boolean;
  participants: Combatant[]; // Max 5
  mapX: number;
  mapY: number;
}
```

---

## 9. Repository File Structure & Build Order

```text
src/
├── types/
│   └── game.ts               # All TypeScript interfaces (Weapons, Jobs, Battles)
├── data/
│   ├── jobs.ts               # Job stats, weapon restrictions, passives
│   ├── weapons.ts            # Starter + Gacha weapon catalog (16+ weapons)
│   └── enemies.ts            # Roaming mobs & Abyssal Stag boss stats
├── state/
│   └── useGameStore.ts       # Central state + localStorage auto-save hook
├── components/
│   ├── layout/
│   │   ├── TopHud.tsx        # HP, Job badge, Gold, Tessera Shards
│   │   └── BottomDock.tsx    # Navigation tabs OR 5-Weapon Battle Hotbar
│   ├── map/
│   │   └── OverworldMap.tsx  # 2D map, player movement, roaming AI, drop-in icons
│   ├── battle/
│   │   ├── BattleArena.tsx   # Side-view combat engine, auto-attack & skill ticks
│   │   └── DamagePopup.tsx   # Animated floating numbers & VFX
│   └── modals/
│       ├── LoadoutModal.tsx  # Equip 5 weapons filtered by current Job
│       ├── JobModal.tsx      # Switch jobs & view passive bonuses
│       └── GachaModal.tsx    # Spend Tessera Shards to summon weapons
└── App.tsx                   # Main mobile viewport container
```
