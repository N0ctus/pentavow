import json
import os
from PIL import Image
import numpy as np

SWORDS_DIR = r"C:\Users\Noctus\Documents\Tessera_legacy\public\swords"
OUT_TS = r"C:\Users\Noctus\Documents\Tessera_legacy\src\data\legendarySwords.ts"

CATEGORIES = ["GREATBLADE", "DAGGERS", "BOW", "STAFF", "TOME", "MACE", "RELIC", "SHIELD"]

LEGEND_NAMES = {
    "FIRE": [
        "Ignis Sovereign", "Pyreheart", "Solstice Brand", "Vulcan Edge", "Cinderfang", "Inferno Crest",
        "Magmawyrm Blade", "Phoenixflare", "Scarlet Oath", "Blaze of Muspel", "Flameborne", "Ashenwrath",
    ],
    "WATER": [
        "Leviathan Fang", "Glacial Eclipse", "Oceanus Brand", "Frostwyrm Edge", "Maelstrom edge", "Abyssal Tide",
        "Sapphire Tempest", "Cryo Sovereign", "Nereid's Cry", "Deluge Cleaver", "Tidal Aegis", "Rimeheart",
    ],
    "WIND": [
        "Galebreak", "Zephyr Sovereign", "Emerald Fang", "Skyrend", "Tempest Wing", "Sylphide Edge",
        "Cyclone Talon", "Verdant Storm", "Aero Excalibur", "Whirlwind Oath", "Cloudpiercer", "Viridian Sky",
    ],
    "LIGHT": [
        "Dawnbreaker", "Aureole Blade", "Celestial Zenith", "Astral Excalibur", "Seraph's Edge", "Solaria",
        "Luminous Covenant", "Sanctified Crest", "Gilded Valkyrie", "Radiant Horizon", "Holy Halo", "Golden Judgment",
    ],
    "DARK": [
        "Ebon Requiem", "Nightfall Edge", "Obsidian Sovereign", "Voidcleaver", "Soulrender", "Dreadfang",
        "Bloodmoon Oath", "Netherworld Brand", "Phantom Guillotine", "Umbral Majesty", "Cursed Eclipse", "Abyssal Crown",
    ],
}

NOUNS_BY_CAT = {
    "GREATBLADE": ["Nodachi", "Odachi", "Greatsword", "Claymore", "Calibur", "katana"],
    "DAGGERS": ["Twin Fangs", "Shadowblades", "Kris", "Stilettos", "Dirks"],
    "BOW": ["Starbow", "Greatbow", "Skybow", "Warbow"],
    "STAFF": ["Archstaff", "Rod", "Scepter", "Spire"],
    "TOME": ["Codex", "Grimoire", "Scripture", "Lexicon"],
    "MACE": ["Greathammer", "Flail", "Maul", "Warhammer"],
    "RELIC": ["Relic", "Trident", "Halberd", "Astrolabe"],
    "SHIELD": ["Bulwark", "Aegis", "Bastion", "Pavise"],
}


def sample_element(num: int) -> str:
    im = Image.open(os.path.join(SWORDS_DIR, f"sword_{num}.png")).convert("RGBA")
    arr = np.array(im)
    rgb = arr[:, :, :3].astype(np.float32)
    mask = arr[:, :, 3] > 0
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    vivid = mask & (sat > 24) & (rgb.max(axis=2) > 55)
    mr, mg, mb = (rgb[vivid] if np.any(vivid) else rgb[mask]).mean(axis=0)
    if max(mr, mg, mb) - min(mr, mg, mb) < 22:
        return "LIGHT" if max(mr, mg, mb) > 170 else "DARK"
    if mr >= mg + 30 and mr >= mb + 30:
        return "FIRE"
    if mg >= mr + 12 and mg >= mb + 10:
        return "WIND"
    if mb >= mr + 22 and mb >= mg + 12:
        return "WATER"
    if mr >= 130 and mb >= 130 and mg < 115:
        return "DARK"
    if mr >= 170 and mg >= 145 and mb < 115:
        return "LIGHT"
    return "FIRE" if mr > mb else "DARK"


def main():
    used = set()
    weapons = []
    # sword_40 .. sword_150 -> 111 5-Star Legendaries
    # 40..115 -> BOSS_DROP (World Bosses & Dungeons + Gacha)
    # 116..145 -> CORNER_DROP (4-Corner Map Guardians)
    # 146..150 -> BOUNTY_100 (100-Enemy Bounties)
    for idx, num in enumerate(range(40, 151)):
        elem = sample_element(num)
        cat = CATEGORIES[(idx + num) % len(CATEGORIES)]
        if num >= 146:
            source = "BOUNTY_100"
        elif num >= 116:
            source = "CORNER_DROP"
        else:
            source = "BOSS_DROP"

        bases = LEGEND_NAMES[elem]
        suffixes = NOUNS_BY_CAT[cat]
        name = f"{bases[(idx * 3 + num) % len(bases)]} {suffixes[(idx + num) % len(suffixes)].title()}"
        if name in used:
            name = f"Apex {name}"
        if name in used:
            name = f"Mythic {name} #{num}"
        used.add(name)

        is_caster = cat in ("STAFF", "TOME", "RELIC")
        is_tank = cat == "SHIELD"
        if source == "BOUNTY_100":
            tier_atk = 305 + (num - 146) * 8
            tier_matk = 305 + (num - 146) * 8
        elif source == "CORNER_DROP":
            tier_atk = 278 + (idx % 6) * 6
            tier_matk = 285 + (idx % 6) * 6
        else:
            tier_atk = 250 + (idx % 8) * 6
            tier_matk = 260 + (idx % 8) * 6

        atk = 95 if is_caster else (140 if is_tank else tier_atk)
        matk = tier_matk if is_caster else (95 if is_tank else 65 + (idx % 5) * 10)
        eff = "BUFF_DEF" if is_tank else "DAMAGE"

        source_desc = (
            "100-Enemy Slayer Bounty Sovereign Relic."
            if source == "BOUNTY_100"
            else "Looted from the formidable Corner Guardians at the 4 edges of each 120×120 Realm."
            if source == "CORNER_DROP"
            else "Spoil of World Bosses and Celestial Dungeons."
        )

        w = {
            "id": f"w-leg-{num:03d}",
            "icon": f"/swords/sword_{num}.png",
            "name": name,
            "rarity": 5,
            "element": elem,
            "category": cat,
            "baseAtk": atk,
            "baseMatk": matk,
            "cooldownSec": 6 if cat in ("DAGGERS", "BOW") else 7,
            "etherGain": 38 if source != "BOSS_DROP" else 35,
            "activeSkillName": f"{elem.title()} Overdrive" if eff == "DAMAGE" else "Absolute Bastion",
            "activeMultiplier": 0.45 if eff == "BUFF_DEF" else round(2.65 + (idx % 4) * 0.12, 2),
            "ultimateSkillName": f"Celestial {elem.title()} Cataclysm" if eff == "DAMAGE" else "Eternal Aegis",
            "ultimateMultiplier": 0.85 if eff == "BUFF_DEF" else round(7.6 + (idx % 5) * 0.45, 2),
            "effectType": eff,
            "hits": 1 if is_tank else (3 if cat in ("DAGGERS", "BOW") else 2),
            "ultHits": 1 if is_tank else (7 if cat in ("DAGGERS", "BOW") else 5),
            "description": f"Five-star ancestral relic (#{num}). {source_desc}",
            "rewardSource": source,
        }
        if cat in ("DAGGERS", "BOW"):
            w["critBonus"] = 0.38
        weapons.append(w)

    content = [
        "import { Weapon } from '../types/game';",
        "",
        "// Ancestral 5-Star Legendary Weapons (sword_40.png .. sword_150.png)",
        "export const EXTRA_FIVE_STAR_SWORDS: Weapon[] = " + json.dumps(weapons, indent=2) + ";",
        "",
    ]
    with open(OUT_TS, "w", encoding="utf-8") as f:
        f.write("\n".join(content))

    print(f"Generated {len(weapons)} 5-Star swords -> {OUT_TS}")
    counts = {}
    for w in weapons:
        counts[w["rewardSource"]] = counts.get(w["rewardSource"], 0) + 1
    print("Reward sources:", counts)


if __name__ == "__main__":
    main()
