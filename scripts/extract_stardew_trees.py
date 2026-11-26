from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(r"c:\Users\Noctus\Documents\Tessera_legacy")
SRC = ROOT / "tree" / "PC _ Computer - Stardew Valley - Environment - Trees.png"
OUT_DIR = ROOT / "public" / "map"
PREVIEW = Path(r"C:\Users\Noctus\.gemini\antigravity\brain\ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70\scratch\stardew_all_weather_trees.png")

im = Image.open(SRC).convert("RGBA")

# Clean crop boxes (x0, y0, x1, y1) on the 486x1280 Stardew sheet
# Excludes rectangular tiled canopies (mossy/jungle rows) so every tree keeps natural silhouettes.
SPECS = [
    # --- Full Trees: Lush Spring / Forest ---
    ("stardew_tree_oak.png",             (0,   0,    48,  86)),    # Spring Oak (Lush Green)
    ("stardew_tree_round.png",           (0,   160,  48,  246)),   # Spring Maple (Round Green)
    ("stardew_tree_pine.png",            (0,   322,  48,  410)),   # Evergreen Pine
    ("stardew_tree_mahogany.png",        (0,   484,  48,  566)),   # Hardwood Mahogany
    ("stardew_tree_fern.png",            (0,   961,  48,  1044)),  # Curled Giant Fern
    # --- Full Trees: Summer / Aqua / Cobalt / Oasis ---
    ("stardew_tree_summer_oak.png",      (145, 0,    193, 86)),    # Summer Deep-Teal Oak
    ("stardew_tree_summer_maple.png",    (145, 160,  193, 244)),   # Summer Teal-Gold Maple
    ("stardew_tree_palm.png",            (0,   1142, 48,  1205)),  # Tropical Island Palm
    ("stardew_tree_palm_tall.png",       (145, 1124, 193, 1205)),  # Tall Coconut Palm
    # --- Full Trees: Autumn / Sandstone / Canyon ---
    ("stardew_tree_autumn_oak.png",      (292, 0,    340, 86)),    # Autumn Amber-Orange Oak
    ("stardew_tree_maple.png",           (292, 160,  340, 246)),   # Autumn Crimson-Plum Maple
    ("stardew_tree_autumn_pine.png",     (292, 322,  340, 410)),   # Autumn Olive-Gold Pine
    ("stardew_tree_autumn_mahogany.png", (292, 484,  340, 566)),   # Autumn Golden Mahogany
    ("stardew_tree_autumn_fern.png",     (292, 960,  340, 1044)),  # Autumn Golden Fern
    # --- Full Trees: Snow / Ice / Tundra ---
    ("stardew_tree_winter_oak.png",      (438, 0,    486, 86)),    # Frosted Bare Winter Oak
    ("stardew_tree_winter_maple.png",    (438, 160,  486, 246)),   # Snow-Dusted Bare Maple
    ("stardew_tree_winter_pine.png",     (438, 322,  486, 410)),   # Snow-Covered Winter Pine
    ("stardew_tree_winter_mahogany.png", (438, 484,  486, 566)),   # Frosted Winter Mahogany
    ("stardew_tree_winter_dead.png",     (438, 644,  486, 726)),   # Frosted Gnarled Dead Tree
    ("stardew_tree_winter_fern.png",     (438, 960,  486, 1044)),  # Frosted Pale-Mint Fern
    # --- Full Trees: Volcanic / Wasteland / Cosmic / Mushroom ---
    ("stardew_tree_dead.png",            (292, 644,  340, 726)),   # Gnarled Dead Tree
    ("stardew_tree_scorched.png",        (292, 804,  340, 886)),   # Tall Dead Wasteland Tree
    ("stardew_tree_mushroom.png",        (292, 1120, 340, 1206)),  # Giant Red Mushroom Tree
    ("stardew_tree_mossy_mushroom.png",  (387, 1134, 437, 1206)),  # Vine-draped Mushroom Tree
    ("stardew_tree_mystic.png",          (436, 1120, 486, 1206)),  # Mystic Blue Tree
    # --- Sub-components: Tall Stumps & Mushroom Pillars ---
    ("stardew_stump_oak.png",            (32,  96,   48,  128)),   # Oak Tall Stump
    ("stardew_stump_mossy.png",          (128, 106,  144, 132)),   # Mossy Stump
    ("stardew_stump_winter.png",         (470, 96,   486, 128)),   # Frosted Winter Stump
    ("stardew_stump_autumn.png",         (324, 96,   340, 128)),   # Autumn Stump
    ("stardew_stump_palm.png",           (32,  1216, 48,  1248)),  # Palm Tall Log Stump
    ("stardew_pillar_mushroom.png",      (324, 1216, 340, 1248)),  # Mushroom Stone Pillar
    # --- Sub-components: Low Cut Logs / Rooted Trunk Bases ---
    ("stardew_log_oak.png",              (16,  144,  32,  160)),   # Spring Cut Oak Log Base
    ("stardew_log_autumn.png",           (308, 144,  324, 160)),   # Autumn Cut Log Base
    ("stardew_log_winter.png",           (454, 144,  470, 160)),   # Frosted Cut Log Base
    ("stardew_log_mystic.png",           (454, 1264, 470, 1280)),  # Mystic Cut Log Base
    ("stardew_log_fern.png",             (32,  1056, 48,  1088)),  # Fern Rhizome Bulb Stump
    ("stardew_log_palm.png",             (16,  1264, 32,  1280)),  # Palm Cut Base
    ("stardew_log_mushroom.png",         (308, 1264, 324, 1280)),  # Cracked Mushroom Base
    # --- Sub-components: Stage-4 Saplings ---
    ("stardew_sapling_green.png",        (0,   96,   16,  128)),   # Young Green Oak Sapling
    ("stardew_sapling_summer.png",       (145, 96,   161, 128)),   # Young Teal Summer Sapling
    ("stardew_sapling_autumn.png",       (292, 256,  308, 288)),   # Autumn Crimson Sapling
    ("stardew_sapling_winter.png",       (438, 96,   454, 128)),   # Frosted Winter Sapling
    ("stardew_sapling_mystic.png",       (438, 1216, 454, 1248)),  # Blue Mystic Sapling
    ("stardew_sapling_mushroom.png",     (292, 1216, 308, 1248)),  # Tall Mushroom Sprout
    ("stardew_sapling_palm.png",         (0,   1216, 16,  1248)),  # Young Palm Sapling
    # --- Sub-components: Stage-3 Young Sprouts & Leaf Clusters ---
    ("stardew_sprout_spring.png",        (16,  128,  32,  144)),   # Spring Oak Leafy Sprout
    ("stardew_sprout_summer.png",        (161, 128,  177, 144)),   # Summer Teal Leafy Sprout
    ("stardew_sprout_autumn.png",        (308, 288,  324, 304)),   # Autumn Crimson Sprout
    ("stardew_sprout_pine.png",          (16,  448,  32,  464)),   # Evergreen Pine Sprout
    ("stardew_sprout_winter.png",        (454, 128,  470, 144)),   # Winter Frosted Sprout
    ("stardew_sprout_fern.png",          (16,  1088, 32,  1104)),  # Baby Curled Fern Frond
    ("stardew_sprout_mystic.png",        (454, 1248, 470, 1264)),  # Baby Blue Mystic Sprout
    ("stardew_sprout_mushroom.png",      (308, 1248, 324, 1264)),  # Baby Red Mushroom
    ("stardew_sprout_palm.png",          (16,  1248, 32,  1264)),  # Baby Coconut Palm Sprout
]

# Remove deprecated rectangular tree exports if still present
for obsolete in ("stardew_tree_mossy.png", "stardew_tree_jungle.png"):
    p = OUT_DIR / obsolete
    if p.exists():
        p.unlink()
        print(f"Removed obsolete rectangular sprite: {obsolete}")

cols = 6
rows = (len(SPECS) + cols - 1) // cols
preview = Image.new("RGBA", (cols * 124, rows * 195), (28, 36, 44, 255))
draw = ImageDraw.Draw(preview)

for idx, (fname, box) in enumerate(SPECS):
    sub = im.crop(box)
    bb = sub.getbbox()
    if bb:
        sub = sub.crop(bb)
    w, h = sub.size
    scaled = sub.resize((w * 2, h * 2), Image.NEAREST)
    scaled.save(OUT_DIR / fname)
    print(f"Saved {fname:32s} native=({w}x{h}) -> scaled=({w*2}x{h*2})")

    c_i = idx % cols
    r_i = idx // cols
    ox = c_i * 124 + (124 - scaled.width) // 2
    oy = r_i * 195 + 188 - scaled.height
    preview.paste(scaled, (ox, oy), scaled)
    label = fname.replace("stardew_", "").replace(".png", "").upper()
    draw.text((c_i * 124 + 4, r_i * 195 + 4), label, fill=(255, 235, 140, 255))

preview.save(PREVIEW)
print("Preview saved:", PREVIEW)
