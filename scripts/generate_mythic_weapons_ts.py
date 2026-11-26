import json
from pathlib import Path

ROOT = Path(r"c:\Users\Noctus\Documents\Tessera_legacy")
META_PATH = ROOT / "scripts" / "extracted_mythic_meta.json"
OUT_PATH = ROOT / "src" / "data" / "mythicWeapons.ts"

meta = json.loads(META_PATH.read_text(encoding="utf-8"))

lines = [
    "import { JobType, Weapon } from '../types/game';",
    "",
    "// ============================================================================",
    "// CLASS-STORY ANIMATED MYTHIC SWORDS (Summon Night: Swordcraft Story 2)",
    "// One bespoke animated Mythic blade per Playable Class (17 total).",
    "// Base paths (WARRIOR, MAGE, PRIEST) unlock at journey start;",
    "// Advanced classes awaken their Mythic Blade upon Class Advancement or Boss/Gacha.",
    "// ============================================================================",
    "export const MYTHIC_CLASS_WEAPONS: Weapon[] = [",
]

for item in meta:
    job = item["job"]
    wid = item["id"]
    name = item["name"].replace("'", "\\'")
    active = item["active"].replace("'", "\\'")
    ult = item["ult"].replace("'", "\\'")
    desc = item["desc"].replace("'", "\\'")
    effect = item["effect"]
    element = item["element"]
    cat = item["category"]
    atk = item["atk"]
    matk = item["matk"]
    icon = item["icon"]
    anim_icon = item["animatedIcon"]
    frames = item["animFrames"]

    # High-impact Mythic tuning matching each class archetype
    is_heal = effect == "HEAL"
    is_buff = effect == "BUFF_DEF"
    is_fast = cat == "DAGGERS"
    cooldown = 5 if is_fast else (6 if is_heal else 7)
    ether_gain = 35 if (is_heal or is_buff) else 32
    active_mult = 2.6 if is_heal else (2.4 if is_buff else 3.15)
    ult_mult = 6.2 if is_heal else (5.8 if is_buff else 9.6)
    hits = 1 if (is_heal or is_buff) else (4 if is_fast else 3)
    ult_hits = 1 if (is_heal or is_buff) else (9 if is_fast else 6)
    crit_bonus = 0.42 if is_fast else 0.30

    lines.extend([
        "  {",
        f"    id: '{wid}',",
        f"    icon: '{icon}',",
        f"    animatedIcon: '{anim_icon}',",
        f"    animFrames: {frames},",
        "    isMythic: true,",
        f"    mythicJob: '{job}',",
        "    rewardSource: 'MYTHIC',",
        f"    name: '{name}',",
        "    rarity: 5,",
        f"    element: '{element}',",
        f"    category: '{cat}',",
        f"    baseAtk: {atk},",
        f"    baseMatk: {matk},",
        f"    cooldownSec: {cooldown},",
        f"    etherGain: {ether_gain},",
        f"    activeSkillName: '{active}',",
        f"    activeMultiplier: {active_mult},",
        f"    ultimateSkillName: '{ult}',",
        f"    ultimateMultiplier: {ult_mult},",
        f"    effectType: '{effect}',",
        f"    hits: {hits},",
        f"    ultHits: {ult_hits},",
        f"    critBonus: {crit_bonus},",
        f"    description: '{desc}'",
        "  },",
    ])

lines.extend([
    "];",
    "",
    "export const MYTHIC_WEAPON_BY_JOB: Partial<Record<JobType, Weapon>> = MYTHIC_CLASS_WEAPONS.reduce(",
    "  (acc, weapon) => {",
    "    if (weapon.mythicJob) acc[weapon.mythicJob] = weapon;",
    "    return acc;",
    "  },",
    "  {} as Partial<Record<JobType, Weapon>>",
    ");",
    "",
    "// Alias fallback for backward-compatible legacy jobs",
    "MYTHIC_WEAPON_BY_JOB.VANGUARD = MYTHIC_WEAPON_BY_JOB.WARRIOR;",
    "MYTHIC_WEAPON_BY_JOB.SPELLWEAVER = MYTHIC_WEAPON_BY_JOB.MAGE;",
    "MYTHIC_WEAPON_BY_JOB.LIGHTBEARER = MYTHIC_WEAPON_BY_JOB.PRIEST;",
    "MYTHIC_WEAPON_BY_JOB.SHADOWBLADE = MYTHIC_WEAPON_BY_JOB.ASSASSIN;",
    "",
    "export const MYTHIC_STARTER_IDS = new Set<string>([",
    "  'w-mythic-warrior',",
    "  'w-mythic-mage',",
    "  'w-mythic-priest',",
    "]);",
    "",
])

OUT_PATH.write_text("\n".join(lines), encoding="utf-8")
print(f"Generated {OUT_PATH} with {len(meta)} Mythic class swords.")
