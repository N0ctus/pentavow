import json
import os
from collections import deque
from PIL import Image
import numpy as np

SRC_DIR = r"C:\Users\Noctus\Documents\Tessera_legacy\swords"
OUT_DIR = r"C:\Users\Noctus\Documents\Tessera_legacy\public\swords"
META_OUT = r"C:\Users\Noctus\Documents\Tessera_legacy\scripts\extracted_mythic_meta.json"

SHEET_FILES = {
    "FIRE": "Game Boy Advance - Summon Night_ Swordcraft Story 2 - Weapons - Fire Swords.png",
    "WATER": "Game Boy Advance - Summon Night_ Swordcraft Story 2 - Weapons - Water Swords.png",
    "WIND": "Game Boy Advance - Summon Night_ Swordcraft Story 2 - Weapons - Wind Swords.png",
    "LIGHTNING": "Game Boy Advance - Summon Night_ Swordcraft Story 2 - Weapons - Lightning Swords.png",
}

# 17 Class-Story Mythic Animated Swords mapped cleanly to Jobs, Lore, & Allowed Categories
CLASS_MYTHIC_SPECS = [
    {"job": "WARRIOR",      "sheet": "FIRE",      "row": 32, "element": "FIRE",  "category": "GREATBLADE", "name": "Enma-Seal Inferno Odachi",    "active": "Hellfire Iaido",        "ult": "Imperial Bladestorm Cataclysm",  "effect": "DAMAGE",   "atk": 320, "matk": 90,  "desc": "Ancient paper-talisman odachi blazing with Warsong flame. Signature Mythic sword of the Bushido Samurai."},
    {"job": "GUARDIAN",     "sheet": "WATER",     "row": 39, "element": "WATER", "category": "GREATBLADE", "name": "Glacial Aegis Sovereign",     "active": "Permafrost Bulwark",    "ult": "Frozen Bastion of Kamigawa",     "effect": "BUFF_DEF", "atk": 250, "matk": 140, "desc": "Fortress-forged frostblade sealed in eternal ice. Shields allies against catastrophic blows."},
    {"job": "BERSERKER",    "sheet": "FIRE",      "row": 31, "element": "FIRE",  "category": "GREATBLADE", "name": "Magma Rage-Tooth Zanbato",    "active": "Savaging Rend",         "ult": "Volcanic Fury Guillotine",       "effect": "DAMAGE",   "atk": 345, "matk": 70,  "desc": "Serrated flame greatsword dripping with molten iron, growing deadlier as Berserker rage rises."},
    {"job": "ROGUE",        "sheet": "WIND",      "row": 26, "element": "WIND",  "category": "DAGGERS",    "name": "Tempest Shinobi Kunai",       "active": "Gale Mirage Strike",    "ult": "Phantom Wind Assassin Arts",     "effect": "DAMAGE",   "atk": 305, "matk": 100, "desc": "Weightless emerald storm kunai allowing Shinobi Rogues to strike from unseen blindspots."},
    {"job": "ASSASSIN",     "sheet": "LIGHTNING", "row": 27, "element": "DARK",  "category": "DAGGERS",    "name": "Nether-Volt Shadow Tanto",    "active": "Venom Arc Slash",       "ult": "Execution of Nine Shadows",      "effect": "DAMAGE",   "atk": 325, "matk": 110, "desc": "Sleek violet plasma tanto crackling with paralyzing dark venom for lethal critical assassinations."},
    {"job": "HUNTER",       "sheet": "WIND",      "row": 23, "element": "WIND",  "category": "DAGGERS",    "name": "Galehorn Beast-Fang",         "active": "Razor Fang Ambush",     "ult": "Hurricane Predator Barrage",     "effect": "DAMAGE",   "atk": 310, "matk": 95,  "desc": "Curved wind-drake fang paired with Kyudo tracking arts to pierce armor at any distance."},
    {"job": "MAGE",         "sheet": "LIGHTNING", "row": 17, "element": "LIGHT", "category": "STAFF",      "name": "Stormwave Spellblade",        "active": "Arcane Bolt Flamberge", "ult": "Prismatic Thunder Resonance",    "effect": "DAMAGE",   "atk": 120, "matk": 340, "desc": "Undulating thunder-etched flamberge channeling high-voltage mana directly through elemental weaves."},
    {"job": "ARCHMAGE",     "sheet": "WATER",     "row": 36, "element": "WATER", "category": "STAFF",      "name": "Chrono-Frost Astral Blade",   "active": "Temporal Frost Pulse",  "ult": "Rime-Clockwork Supernova",       "effect": "DAMAGE",   "atk": 110, "matk": 365, "desc": "Mechanical celestial gearblade frozen in starlight, bending time and glacial torrents."},
    {"job": "WARLOCK",      "sheet": "LIGHTNING", "row": 35, "element": "DARK",  "category": "TOME",       "name": "Void-Spark Demon Edge",       "active": "Cursed Plasma Rupture", "ult": "Abyssal Dragon-Eye Oblivion",    "effect": "DAMAGE",   "atk": 135, "matk": 355, "desc": "Sentient demon-eyed stormblade pulsing with forbidden nether hexes and soul-draining lightning."},
    {"job": "DEATH_KNIGHT", "sheet": "WATER",     "row": 24, "element": "WATER", "category": "GREATBLADE", "name": "Permafrost Runeblade",        "active": "Oblivion Frost Cleave", "ult": "Apocalypse Glacier Scourge",     "effect": "DAMAGE",   "atk": 295, "matk": 225, "desc": "Cruel frost-bitten runeblade freezing enemy marrow while draining strength in unholy silence."},
    {"job": "DEMON_HUNTER", "sheet": "FIRE",      "row": 19, "element": "FIRE",  "category": "DAGGERS",    "name": "Cinderclaw Twin-Glaive",      "active": "Fel-Flame Rush",        "ult": "Metamorphosis Blazing Finale",   "effect": "DAMAGE",   "atk": 330, "matk": 150, "desc": "Hooked crimson crescent warglaive forged from demon horns for relentless airborne combos."},
    {"job": "PRIEST",       "sheet": "WATER",     "row": 38, "element": "WATER", "category": "RELIC",      "name": "Seraphic Dewdrop Blade",      "active": "Pure Spring Blessing",  "ult": "Sanctuary Lotus Resurrection",   "effect": "HEAL",     "atk": 115, "matk": 325, "desc": "Winged pearl-hilted sanctuary sword weeping luminous restorative dew across injured allies."},
    {"job": "PALADIN",      "sheet": "LIGHTNING", "row": 34, "element": "LIGHT", "category": "GREATBLADE", "name": "Celestial Dawn Excalibur",    "active": "Radiant Thunder Smite", "ult": "Valiant Heaven's Decree",        "effect": "DAMAGE",   "atk": 300, "matk": 220, "desc": "Winged dragoncrest holy broadsword crackling with golden retribution and righteous light."},
    {"job": "DRUID",        "sheet": "WIND",      "row": 28, "element": "WIND",  "category": "RELIC",      "name": "Sylphwood Blossom Sabre",     "active": "Emerald Canopy Mend",   "ult": "Whispering Glade Renewal",       "effect": "HEAL",     "atk": 130, "matk": 315, "desc": "Living emerald leaf-blade blossoming with healing mist woven by spirits of the glade."},
    {"job": "SHAMAN",       "sheet": "LIGHTNING", "row": 30, "element": "LIGHT", "category": "RELIC",      "name": "Thundertotem Stormblade",     "active": "Ancestral Shockstrike", "ult": "Sky-Totem Maelstrom Fury",       "effect": "DAMAGE",   "atk": 240, "matk": 285, "desc": "Totem-bound lightning spireblade uniting earth, sky, and storm ancestor spirits."},
    {"job": "MONK",         "sheet": "WIND",      "row": 11, "element": "WIND",  "category": "DAGGERS",    "name": "Zephyr Chi-Talon",            "active": "Cyclone Palm Flurry",   "ult": "Heavenly Windwalker Spiral",     "effect": "DAMAGE",   "atk": 315, "matk": 160, "desc": "Swept emerald gale talon channeling pure inner Chi into blinding supersonic strikes."},
    {"job": "EVOKER",       "sheet": "FIRE",      "row": 35, "element": "FIRE",  "category": "RELIC",      "name": "Dragonflight Ignis Brand",    "active": "Cinder Breath Surge",   "ult": "Five-Flight Pyre Cataclysm",     "effect": "DAMAGE",   "atk": 150, "matk": 360, "desc": "Crimson wyrm-crested mystic brand burning with the primordial breath of ancient dragonflights."},
]


def flood_fill_black_to_alpha(rgba: np.ndarray, black_tol: int = 8) -> np.ndarray:
    h, w, _ = rgba.shape
    out = rgba.copy()
    is_dark = np.all(out[:, :, :3] <= black_tol, axis=2)
    visited = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        if is_dark[0, x] and not visited[0, x]:
            visited[0, x] = True; q.append((0, x))
        if is_dark[h - 1, x] and not visited[h - 1, x]:
            visited[h - 1, x] = True; q.append((h - 1, x))
    for y in range(h):
        if is_dark[y, 0] and not visited[y, 0]:
            visited[y, 0] = True; q.append((y, 0))
        if is_dark[y, w - 1] and not visited[y, w - 1]:
            visited[y, w - 1] = True; q.append((y, w - 1))
    while q:
        cy, cx = q.popleft()
        out[cy, cx, 3] = 0
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_dark[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))
    return out


def extract_row_frames(sheet_arr: np.ndarray, row: int) -> list[np.ndarray]:
    cleaned_frames = []
    for c in range(11):
        cell = sheet_arr[row * 64:(row + 1) * 64, c * 64:(c + 1) * 64]
        if not np.any(cell[:, :, :3] > 10):
            continue
        padded = np.zeros((68, 68, 4), dtype=np.uint8)
        padded[:, :, 3] = 255
        padded[2:66, 2:66] = cell
        cleaned = flood_fill_black_to_alpha(padded, black_tol=8)[2:66, 2:66]
        cleaned_frames.append(cleaned)
    return cleaned_frames


def render_aligned_32x32_strip(frames: list[np.ndarray]) -> tuple[Image.Image, Image.Image]:
    """Rotate each frame -45 deg using shared union bbox so animations never jitter."""
    rotated = []
    ux0, uy0, ux1, uy1 = 9999, 9999, -1, -1
    for f in frames:
        pil_f = Image.fromarray(f, "RGBA").rotate(-45.0, resample=Image.Resampling.NEAREST, expand=True)
        arr = np.array(pil_f)
        ys, xs = np.where(arr[:, :, 3] > 0)
        if len(xs) > 0:
            ux0 = min(ux0, int(xs.min()))
            uy0 = min(uy0, int(ys.min()))
            ux1 = max(ux1, int(xs.max()) + 1)
            uy1 = max(uy1, int(ys.max()) + 1)
        rotated.append(pil_f)

    uw = max(1, ux1 - ux0)
    uh = max(1, uy1 - uy0)
    scale = min(1.0, 30.0 / max(uw, uh))
    nw = max(1, int(round(uw * scale)))
    nh = max(1, int(round(uh * scale)))
    ox = (32 - nw) // 2
    oy = (32 - nh) // 2

    n = len(rotated)
    strip = Image.new("RGBA", (32 * n, 32), (0, 0, 0, 0))
    first_frame_img = None

    for idx, pil_r in enumerate(rotated):
        cropped = pil_r.crop((ux0, uy0, ux1, uy1))
        if scale < 1.0:
            cropped = cropped.resize((nw, nh), Image.Resampling.NEAREST)
        canvas = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
        canvas.paste(cropped, (ox, oy), cropped)
        if idx == 0:
            first_frame_img = canvas
        strip.paste(canvas, (idx * 32, 0), canvas)

    return first_frame_img, strip


def main():
    loaded_sheets = {
        k: np.array(Image.open(os.path.join(SRC_DIR, fname)).convert("RGBA"))
        for k, fname in SHEET_FILES.items()
    }

    extracted = []
    for spec in CLASS_MYTHIC_SPECS:
        slug = spec["job"].lower()
        frames = extract_row_frames(loaded_sheets[spec["sheet"]], spec["row"])
        first_img, strip_img = render_aligned_32x32_strip(frames)

        static_name = f"mythic_{slug}.png"
        anim_name = f"mythic_{slug}_anim.png"
        first_img.save(os.path.join(OUT_DIR, static_name), optimize=True)
        strip_img.save(os.path.join(OUT_DIR, anim_name), optimize=True)

        extracted.append({
            **spec,
            "id": f"w-mythic-{slug}",
            "icon": f"/swords/{static_name}",
            "animatedIcon": f"/swords/{anim_name}",
            "animFrames": len(frames),
        })

    with open(META_OUT, "w", encoding="utf-8") as f:
        json.dump(extracted, f, indent=2)
    print(f"Extracted {len(extracted)} animated Mythic Class Swords into {OUT_DIR}")
    for e in extracted:
        print(f"  {e['job']:14s} | {e['element']:5s} | {e['animFrames']:2d}f | {e['name']} -> {e['animatedIcon']}")


if __name__ == "__main__":
    main()
