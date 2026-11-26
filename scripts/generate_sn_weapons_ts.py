import json
import os

META_PATH = r"C:\Users\Noctus\Documents\Tessera_legacy\scripts\extracted_swords_meta.json"
OUT_TS_PATH = r"C:\Users\Noctus\Documents\Tessera_legacy\src\data\summonNightWeapons.ts"

PREFIXES_BY_ELEMENT = {
    "FIRE": [
        "Ember", "Crimson", "Blaze", "Pyre", "Infernal", "Vulcan", "Cinder", "Scorching",
        "Magma", "Scarlet", "Sunfire", "Ignis", "Phoenix", "Brimstone", "Ash", "Solar",
    ],
    "WATER": [
        "Azure", "Glacial", "Frost", "Tidal", "Abyssal", "Crystal", "Sapphire", "Mist",
        "Siren", "Rime", "Deluge", "Oceanic", "Permafrost", "Aqua", "Tempest", "Icebound",
    ],
    "WIND": [
        "Gale", "Zephyr", "Verdant", "Emerald", "Cyclone", "Tempest", "Sylph", "Whirlwind",
        "Falcon", "Jade", "Mantis", "Breeze", "Storm", "Feather", "Viridian", "Aero",
    ],
    "LIGHT": [
        "Aureole", "Radiant", "Seraphic", "Chrono", "Astral", "Celestial", "Dawn", "Luminous",
        "Sanctified", "Sunlit", "Golden", "Gilded", "Valiant", "Valkyrie", "Halo", "Sovereign",
    ],
    "DARK": [
        "Obsidian", "Shadow", "Nightmare", "Abyss", "Cursed", "Dusk", "Venom", "Phantom",
        "Ebon", "Void", "Bloodmoon", "Demon", "Dread", "Grim", "Twilight", "Nether",
    ],
}

NOUNS_BY_FAMILY = {
    "SWORD": [
        "Sabre", "Katana", "Broadsword", "Edge", "Brand", "Claymore", "Falchion",
        "Dirk", "Estoc", "Scimitar", "Glaive", "Blade", "Longsword", "Tachi", "Bastard Sword", "Fang",
    ],
    "AXE": [
        "Battleaxe", "Cleaver", "Greataxe", "Tomahawk", "Reaver", "Warhammer", "Bardiche",
        "Crescent Axe", "Morningstar", "Maul", "Splitter", "Hatchet", "Labrys", "Gorgon Axe", "Executioner", "Crusher",
    ],
    "SPEAR": [
        "Pike", "Halberd", "Lance", "Trident", "Glaive", "Partisan", "Naginata",
        "Javelin", "Harpoon", "Spire", "Ranseur", "Scepter-Lance", "Longspear", "Guisarme", "Valkyrie Lance", "Awl",
    ],
    "BOW": [
        "Shortbow", "Longbow", "Recurve", "Composite Bow", "Greatbow", "Crossbow", "Warbow",
        "Yumi", "Hornbow", "Windbow", "Wingbow", "Galebow", "Starbow", "Arcbow", "Hunter Bow", "Sovereign Bow",
    ],
}

TIERS = {
    1: ["Apprentice", "Iron", "Rough", "Weathered", "Recruit"],
    2: ["Tempered", "Honed", "Reinforced", "Steel", "Vanguard"],
    3: ["Crafted", "Knightly", "Mythril", "Runed", "Guild"],
    4: ["Masterwork", "Artisan", "Demon-Bane", "Guardian", "Heroic"],
}

SKILLS_BY_FAMILY = {
    "SWORD": {
        "active": ["Cross Slash", "Crescent Rend", "Flash Cut", "Iaido Thrust", "Blade Vortex", "Twin Fang"],
        "ult": ["Swordcraft Finale", "Thousand-Edge Tempest", "Heavenly Severance", "Dragonflare Cleave"],
    },
    "AXE": {
        "active": ["Skull Splitter", "Seismic Chop", "Whirlwind Heave", "Armor Breaker", "Raging Cleave", "Earthshaker"],
        "ult": ["Titan Guillotine", "Cataclysmic Smash", "Sundering Maelstrom", "Berserk Execution"],
    },
    "SPEAR": {
        "active": ["Dragon Impale", "Piercing Spiral", "Gale Thrust", "Astral Skewer", "Crescent Sweep", "Starfall Dive"],
        "ult": ["Sky-Piercing Barrage", "Gungnir Lance", "Constellation Thrust", "Imperial Impale"],
    },
    "BOW": {
        "active": ["Piercing Volley", "Twin Arrow", "Ricochet Shot", "Windpiercer", "Falcon Snipe", "Rapid Burst"],
        "ult": ["Starfall Rain", "Thousand-Feather Storm", "Celestial Snipe", "Tempest Quiver"],
    },
}


def pick_category(family: str, pos_in_sheet: int, rarity: int) -> str:
    if family == "BOW":
        return "BOW"
    if family == "SWORD":
        # Earlier sleek swords & curved knives map nicely to DAGGERS for Rogue/Assassin/Monk/DH,
        # heavier & glowing blades map to GREATBLADE for Warrior/Guardian/Berserker/Paladin/DK
        if pos_in_sheet % 3 == 1:
            return "DAGGERS"
        return "GREATBLADE"
    if family == "AXE":
        # Hammers/flanged maces -> MACE (Shaman); Heavy axes -> GREATBLADE (Warrior/Berserker/Paladin)
        if pos_in_sheet % 3 == 0:
            return "MACE"
        return "GREATBLADE"
    if family == "SPEAR":
        # Arcane/angelic spears -> RELIC / STAFF; martial lances -> GREATBLADE / RELIC
        if pos_in_sheet % 4 == 0:
            return "STAFF"
        if pos_in_sheet % 4 == 3:
            return "GREATBLADE"
        return "RELIC"
    return "GREATBLADE"


def main():
    with open(META_PATH, "r", encoding="utf-8") as f:
        meta = json.load(f)

    # Track per-sheet index
    sheet_counters: dict[str, int] = {}
    used_names: set[str] = set()
    weapons_ts = []

    for idx, entry in enumerate(meta):
        src = entry["source"]
        pos = sheet_counters.get(src, 0)
        sheet_counters[src] = pos + 1

        game = entry["game"]
        family = entry["family"]
        elem = entry["element"]
        num = entry["num"]
        icon = entry["file"]

        # Tier scaling across the 40 sprites in each sheet:
        # 0..9 -> 1* Common, 10..19 -> 2* Uncommon, 20..31 -> 3* Rare, 32..39 -> 4* Epic
        if pos >= 32:
            rarity = 4
        elif pos >= 20:
            rarity = 3
        elif pos >= 10:
            rarity = 2
        else:
            rarity = 1

        category = pick_category(family, pos, rarity)

        prefs = PREFIXES_BY_ELEMENT[elem]
        nouns = NOUNS_BY_FAMILY[family]
        tier_words = TIERS[rarity]
        pref = prefs[(pos * 3 + idx) % len(prefs)]
        noun = nouns[(pos + (0 if game == "SN2" else 5)) % len(nouns)]
        tier_tag = tier_words[(pos + idx) % len(tier_words)]

        candidate = f"{pref} {noun}"
        if candidate in used_names:
            candidate = f"{tier_tag} {pref} {noun}"
        if candidate in used_names:
            candidate = f"{pref} {noun} {game}-{pos + 1}"
        used_names.add(candidate)

        is_caster = category in ("RELIC", "STAFF", "TOME")
        if rarity == 4:
            atk = 115 + (pos % 8) * 5 if is_caster else 172 + (pos % 8) * 6
            matk = 148 + (pos % 8) * 6 if is_caster else 45 + (pos % 8) * 6
            cd = 6 if family != "BOW" else 5
            act_mult = round(1.85 + (pos % 4) * 0.1, 2)
            ult_mult = round(4.5 + (pos % 4) * 0.25, 2)
            hits = 2 if category in ("DAGGERS", "BOW") else 1
            ult_hits = 4 if family in ("BOW", "SWORD") else 3
            ether = 30
        elif rarity == 3:
            atk = 82 + (pos % 7) * 4 if is_caster else 122 + (pos % 7) * 5
            matk = 108 + (pos % 7) * 5 if is_caster else 28 + (pos % 7) * 4
            cd = 6 if family == "AXE" else 5
            act_mult = round(1.45 + (pos % 4) * 0.05, 2)
            ult_mult = round(3.2 + (pos % 4) * 0.2, 2)
            hits = 2 if category == "DAGGERS" else 1
            ult_hits = 3
            ether = 25
        elif rarity == 2:
            atk = 58 + (pos % 6) * 4 if is_caster else 86 + (pos % 6) * 4
            matk = 76 + (pos % 6) * 4 if is_caster else 16 + (pos % 6) * 3
            cd = 5
            act_mult = round(1.25 + (pos % 3) * 0.05, 2)
            ult_mult = round(2.6 + (pos % 3) * 0.15, 2)
            hits = 1
            ult_hits = 2
            ether = 22
        else:
            atk = 40 + (pos % 5) * 3 if is_caster else 56 + (pos % 5) * 4
            matk = 50 + (pos % 5) * 3 if is_caster else 10 + (pos % 5) * 2
            cd = 5
            act_mult = round(1.1 + (pos % 3) * 0.05, 2)
            ult_mult = round(2.2 + (pos % 3) * 0.1, 2)
            hits = 1
            ult_hits = 2
            ether = 20

        skill_set = SKILLS_BY_FAMILY[family]
        act_name = f"{elem.title()} {skill_set['active'][(pos + idx) % len(skill_set['active'])]}"
        ult_name = skill_set["ult"][(pos + idx) % len(skill_set["ult"])]
        crit_bonus = 0.28 if (rarity == 5 and category in ("DAGGERS", "BOW")) else (0.15 if category in ("DAGGERS", "BOW") else 0)

        desc = (
            f"Authentic Summon Night ({game}) mastercraft {family.lower()} etched with {elem.lower()} guardian summonite. "
            f"Forged for Swordcraft masters in Kamigawa Sanctuary."
        )

        wid = f"w-sn-{game.lower()}-{family.lower()}-{pos + 1:02d}"
        obj = {
            "id": wid,
            "icon": icon,
            "name": candidate,
            "rarity": rarity,
            "element": elem,
            "category": category,
            "baseAtk": atk,
            "baseMatk": matk,
            "cooldownSec": cd,
            "etherGain": ether,
            "activeSkillName": act_name,
            "activeMultiplier": act_mult,
            "ultimateSkillName": ult_name,
            "ultimateMultiplier": ult_mult,
            "effectType": "DAMAGE",
            "hits": hits,
            "ultHits": ult_hits,
            "description": desc,
        }
        if crit_bonus:
            obj["critBonus"] = crit_bonus
        weapons_ts.append(obj)

    lines = [
        "import { Weapon } from '../types/game';",
        "",
        "// Auto-generated from extracted Summon Night: Swordcraft Story 2 & 3 weapon sprite sheets",
        "// 280 unique craft weapons mapped to sword_151.png .. sword_430.png",
        "export const SUMMON_NIGHT_WEAPONS: Weapon[] = " + json.dumps(weapons_ts, indent=2) + ";",
        "",
    ]
    with open(OUT_TS_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"Generated {len(weapons_ts)} weapon definitions -> {OUT_TS_PATH}")
    # Summary by rarity and category
    by_r = {r: sum(1 for w in weapons_ts if w["rarity"] == r) for r in (3, 4, 5)}
    by_c = {}
    for w in weapons_ts:
        by_c[w["category"]] = by_c.get(w["category"], 0) + 1
    print("By rarity:", by_r)
    print("By category:", by_c)


if __name__ == "__main__":
    main()
