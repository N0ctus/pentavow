#!/usr/bin/env python3
"""
Universal Pokemon Mystery Dungeon: Red Rescue Team Tileset Extractor (All 60 Sheets)
Extracts all 60 PMD dungeon tileset sheets from Tiles/ into clean 24x24 atlases,
47-tile blob bitmask lookups, alternate tile maps, and dual-speed palette animations.
"""

import os
import json
import numpy as np
from PIL import Image

TILESETS_CONFIG = [
    ("buried-relic-1", "Buried Relic B1F - B20F.png", "Buried Relic (B1F-B20F)", "sandstone", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water"]),
    ("buried-relic-2", "Buried Relic B21F - B50F.png", "Buried Relic (B21F-B50F)", "relic", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "unused_ground", "water", "water_sparkle"]),
    ("buried-relic-3", "Buried Relic B51F - B99F.png", "Buried Relic (B51F-B99F)", "relic", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "unused_ground", "water", "water_sparkle"]),
    ("darknight-relic", "Darknight Relic.png", "Darknight Relic", "ruins", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("desert-region", "Desert Region.png", "Desert Region", "desert", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "unused_ground", "water", "water_sparkle"]),
    ("electric-maze", "Electric Maze.png", "Electric Maze", "electric", 10, 6,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("frosty-forest", "Frosty Forest.png", "Frosty Forest", "snow", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "water"]),
    ("great-canyon", "Great Canyon.png", "Great Canyon", "canyon", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("howling-forest-1", "Howling Forest 01F - 06F.png", "Howling Forest (Lush)", "forest", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("howling-forest-2", "Howling Forest 07F - 15F.png", "Howling Forest (Dusk)", "dusk_forest", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_1_b", "wall_alt_2", "wall_alt_2_b", "ground", "ground_alt_1", "ground_alt_2", "water"]),
    ("ice-maze", "Ice Maze.png", "Ice Maze", "ice", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "unused_ground", "water"]),
    ("joyous-tower", "Joyous Tower.png", "Joyous Tower", "tower", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water"]),
    ("lapis-cave", "Lapis Cave.png", "Lapis Cave", "crystal", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("lightning-field", "Lightning Field.png", "Lightning Field", "storm", 10, 6,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "water", "water_sparkle"]),
    ("magma-cavern-1", "Magma Cavern B08F - B17F.png", "Magma Cavern (Upper)", "volcano", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "water"]),
    ("magma-cavern-2", "Magma Cavern B18F - B23F.png", "Magma Cavern (Abyssal)", "magma", 8, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_1_b", "wall_alt_2", "wall_alt_2_b", "ground", "ground_alt_1", "ground_alt_2", "water"]),
    ("meteor-cave", "Meteor Cave.png", "Meteor Cave", "crater", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "water"]),
    ("mt-blaze", "Mt. Blaze.png", "Mt. Blaze", "blaze", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "wall_alt_2_ani", "ground", "ground_alt_1", "water"]),
    ("mt-faraway-1", "Mt. Faraway 10F - 20F.png", "Mt. Faraway (Mist)", "mist_peak", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("mt-faraway-2", "Mt. Faraway 30F - 39F.png", "Mt. Faraway (Glacier)", "glacier", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "unused_ground", "water"]),
    ("mt-freeze", "Mt. Freeze.png", "Mt. Freeze", "snow", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water"]),
    ("mt-steel-1", "Mt. Steel 01F - 05F.png", "Mt. Steel (Lower)", "mountain", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("mt-steel-2", "Mt. Steel 06F - 08F.png", "Mt. Steel (Upper)", "mountain", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("mt-thunder-peak", "Mt. Thunder Peak.png", "Mt. Thunder Peak", "peak", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("mt-thunder", "Mt. Thunder.png", "Mt. Thunder", "mountain", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "water", "water_sparkle"]),
    ("murky-cave", "Murky Cave.png", "Murky Cave", "swamp", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "unused_ground", "water", "water_sparkle"]),
    ("normal-maze", "Normal Maze.png", "Normal Maze", "cave", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "water", "water_sparkle"]),
    ("northern-range-1", "Northern Range 01F - 07F.png", "Northern Range (Foothills)", "mountain", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "unused_ground", "water", "water_sparkle"]),
    ("northern-range-2", "Northern Range 08F - 16F.png", "Northern Range (Summit)", "snow", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "water"]),
    ("northwind-field", "Northwind Field 20F - 30F.png", "Northwind Field", "sky", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "unused_ground", "water"]),
    ("pitfall-valley", "Pitfall Valley B1F - B10F.png", "Pitfall Valley", "canyon", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("poison-maze", "Poison Maze.png", "Poison Maze", "poison", 10, 8,
     ["legend", "walls", "wall_alt_1", "ground", "ground_alt_1", "ground_alt_2", "unused_ground", "water_ground", "water"]),
    ("purity-forest-1", "Purity Forest 04F-07F.png", "Purity Forest (Palm)", "forest", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("purity-forest-2", "Purity Forest 13F-20F.png", "Purity Forest (Glade)", "forest", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("purity-forest-3", "Purity Forest 30F-43F.png", "Purity Forest (Deep)", "forest", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("purity-forest-4", "Purity Forest 44F-60F.png", "Purity Forest (Lush)", "forest", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("purity-forest-5", "Purity Forest 61F-79F.png", "Purity Forest (Mist)", "forest", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("purity-forest-6", "Purity Forest 80F-99F.png", "Purity Forest (Sakura)", "forest", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "unused_ground", "water", "water_sparkle"]),
    ("rescue-team-maze", "Rescue Team Maze.png", "Rescue Team Maze", "canyon", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("rock-path", "Rock Path.png", "Rock Path", "canyon", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "unused_ground", "water", "water_sparkle"]),
    ("silent-chasm", "Silent Chasm.png", "Silent Chasm", "mountain", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "unused_ground", "water", "water_sparkle"]),
    ("silver-trench", "Silver Trench B70F - B98F.png", "Silver Trench", "ocean", 10, 8,
     ["legend", "walls", "walls_b", "wall_alt_1", "wall_alt_1_b", "wall_alt_2", "wall_alt_2_b", "ground", "ground_b", "water", "water_sparkle"]),
    ("sinister-woods", "Sinister Woods.png", "Sinister Woods", "dusk_forest", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "water", "water_sparkle"]),
    ("sky-tower", "Sky Tower.png", "Sky Tower", "sky", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "water"]),
    ("snow-path", "Snow Path.png", "Snow Path", "snow", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "water", "water_sparkle"]),
    ("solar-cave", "Solar Cave B01F - B06F.png", "Solar Cave", "crystal", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "unused_ground", "water", "water_sparkle"]),
    ("southern-cavern-1", "Southern Cavern B01F - B23F.png", "Southern Cavern (Lower)", "crystal", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "unused_ground", "water", "water_sparkle"]),
    ("southern-cavern-2", "Southern Cavern B24F - B50F.png", "Southern Cavern (Crystal)", "crystal", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("stormy-sea-1", "Stormy Sea B01F - B16F.png", "Stormy Sea (Upper)", "ocean", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "water"]),
    ("stormy-sea-2", "Stormy Sea B16F - B39F.png", "Stormy Sea (Abyss)", "ocean", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "water"]),
    ("thunderwave-cave", "Thunderwave Cave.png", "Thunderwave Cave", "cave", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "unused_ground", "water", "water_sparkle"]),
    ("tiny-woods", "Tiny Woods.png", "Tiny Woods", "forest", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "water"]),
    ("uproar-forest", "Uproar Forest.png", "Uproar Forest", "forest", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "water", "water_sparkle"]),
    ("water-maze", "Water Maze.png", "Water Maze", "aquatic", 8, 8,
     ["legend", "walls", "wall_alt_1", "ground", "ground_alt_1", "ground_alt_2", "unused_ground", "water_ground", "water"]),
    ("waterfall-pond", "Waterfall Pond.png", "Waterfall Pond", "aquatic", 10, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water"]),
    ("western-cave-1", "Western Cave B1F - B27F.png", "Western Cave (Upper)", "ruins", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "unused_ground", "water", "water_sparkle"]),
    ("western-cave-2", "Western Cave B28F - B39F.png", "Western Cave (Deep)", "ruins", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "unused_ground", "water", "water_sparkle"]),
    ("wish-cave-1", "Wish Cave B01F - B13F.png", "Wish Cave (Citadel)", "tower", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "unused_ground", "water", "water_sparkle"]),
    ("wish-cave-2", "Wish Cave B90F - B99F.png", "Wish Cave (Depths)", "forest", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
    ("wyvern-hill", "Wyvern Hill.png", "Wyvern Hill", "mountain", 12, 8,
     ["legend", "walls", "wall_alt_1", "wall_alt_2", "ground", "ground_alt_1", "ground_alt_2", "water", "water_sparkle"]),
]


def detect_grid(arr):
    h, w, _ = arr.shape
    span = min(w, 500)
    is_cyan = (arr[:, 10:span, 0] == 128) & (arr[:, 10:span, 1] == 255) & (arr[:, 10:span, 2] == 255)
    is_pink = (arr[:, 10:span, 0] == 255) & (arr[:, 10:span, 1] == 128) & (arr[:, 10:span, 2] == 255)
    grid_rows = [y for y in range(80, min(h, 350)) if np.sum(is_cyan[y] | is_pink[y]) > 150]
    grid_top = next(y for y in grid_rows if (y + 25) in grid_rows and (y + 50) in grid_rows)

    v_cyan = (arr[grid_top:min(h, grid_top+100), :, 0] == 128) & (arr[grid_top:min(h, grid_top+100), :, 1] == 255) & (arr[grid_top:min(h, grid_top+100), :, 2] == 255)
    v_pink = (arr[grid_top:min(h, grid_top+100), :, 0] == 255) & (arr[grid_top:min(h, grid_top+100), :, 1] == 128) & (arr[grid_top:min(h, grid_top+100), :, 2] == 255)
    v_lines = [x for x in range(w) if np.sum(v_cyan[:, x] | v_pink[:, x]) > 40]
    x0 = v_lines[0]
    grid_end_x = v_lines[-1] + 25
    return x0, grid_top, grid_end_x


def detect_palette_tables(arr, grid_end_x):
    h, w, _ = arr.shape
    if grid_end_x >= w - 165:
        return []
    pal_rows = []
    for y in range(80, h - 10):
        sl = arr[y, grid_end_x:w, :3]
        bright = (sl[:, 0] > 210) & (sl[:, 1] > 210) & (sl[:, 2] > 210)
        if np.sum(bright) >= 165:
            fx = grid_end_x + int(np.argmax(bright))
            pal_rows.append((y, fx))
    tables = []
    used = set()
    for y, fx in pal_rows:
        if y in used:
            continue
        cnt = 1
        cur = y
        while any(py == cur + 11 for py, _ in pal_rows):
            cur += 11
            used.add(cur)
            cnt += 1
        if cnt >= 4:
            x_swatch = fx
            for tx in range(fx, min(w - 170, fx + 15)):
                c = arr[y + 5, tx, :3]
                if c[0] > 210 and c[1] > 210 and c[2] > 210:
                    x_swatch = tx
                    break
            nrows = cnt - 1
            rows_rgb = []
            for pr in range(nrows):
                py = y + pr * 11 + 5
                row_cols = []
                for pc in range(16):
                    px = x_swatch + pc * 11 + 5
                    if px < w and py < h:
                        rgb = tuple(int(v) for v in arr[py, px, :3])
                    else:
                        rgb = (0, 0, 0)
                    row_cols.append(rgb)
                rows_rgb.append(row_cols)
            tables.append(rows_rgb)
    return tables


def clean_tile(tile_np, strip_magenta=False):
    out = tile_np.copy()
    teal = (out[:, :, 0] == 0) & (out[:, :, 1] == 128) & (out[:, :, 2] == 128)
    out[teal] = [0, 0, 0, 0]
    if strip_magenta:
        mag = (out[:, :, 0] == 255) & (out[:, :, 1] == 0) & (out[:, :, 2] == 255)
        out[mag] = [0, 0, 0, 0]
    return out


def match_palette_table(tiles_dict, tables):
    if not tiles_dict or not tables:
        return None, []
    all_colors = set()
    for t in tiles_dict.values():
        vis = t[t[:, :, 3] > 0][:, :3]
        for row in vis:
            all_colors.add((int(row[0]), int(row[1]), int(row[2])))

    best_score = -1
    best_table = None
    best_varying = []
    for tbl in tables:
        nrows = len(tbl)
        varying = []
        for c in range(16):
            col_set = set(tbl[r][c] for r in range(nrows))
            if len(col_set) > 1:
                varying.append(c)
        if not varying:
            continue
        row0 = tbl[0]
        score = sum(1 for c in varying if row0[c] in all_colors)
        if score > best_score:
            best_score = score
            best_table = tbl
            best_varying = varying

    if best_score <= 0:
        return None, []
    return best_table, best_varying


def apply_palette_frame(tile_np, table, varying_cols, frame_idx):
    if table is None or not varying_cols or frame_idx == 0:
        return tile_np.copy()
    out = tile_np.copy()
    row0 = table[0]
    rowf = table[frame_idx]
    for c in varying_cols:
        src = row0[c]
        dst = rowf[c]
        if src != dst:
            mask = (tile_np[:, :, 3] > 0) & (tile_np[:, :, 0] == src[0]) & (tile_np[:, :, 1] == src[1]) & (tile_np[:, :, 2] == src[2])
            out[mask, 0] = dst[0]
            out[mask, 1] = dst[1]
            out[mask, 2] = dst[2]
    return out


def extract_single_tileset(cfg, tiles_dir, out_root):
    ts_id, filename, display_name, category, water_speed, sparkle_speed, group_names = cfg
    fp = os.path.join(tiles_dir, f"Game Boy Advance - Pokemon Mystery Dungeon_ Red Rescue Team - Dungeon Tiles - {filename}")
    arr = np.array(Image.open(fp).convert("RGBA"))
    x0, grid_top, grid_end_x = detect_grid(arr)
    tables = detect_palette_tables(arr, grid_end_x)

    CELL = 25
    TILE = 24
    NUM_ROWS = 24

    def sample_legend(xs, ys, bx, by):
        px = arr[ys + by * 8 + 4, xs + bx * 8 + 4]
        return 1 if (px[0] < 50 and px[1] < 50 and px[2] < 50) else 0

    slot_index_map = {}
    bitmask_to_idx = {}
    legend_slots = []

    for r in range(NUM_ROWS):
        ys = grid_top + r * CELL + 1
        for sc in range(3):
            xs = x0 + sc * CELL + 1
            c_px = arr[ys + 12, xs + 12]
            if c_px[0] > 150 and c_px[1] > 150 and c_px[2] > 150:
                nw = sample_legend(xs, ys, 0, 0)
                n  = sample_legend(xs, ys, 1, 0)
                ne = sample_legend(xs, ys, 2, 0)
                w  = sample_legend(xs, ys, 0, 1)
                e  = sample_legend(xs, ys, 2, 1)
                sw = sample_legend(xs, ys, 0, 2)
                s  = sample_legend(xs, ys, 1, 2)
                se = sample_legend(xs, ys, 2, 2)
                mask = (nw<<0)|(n<<1)|(ne<<2)|(w<<3)|(e<<4)|(sw<<5)|(s<<6)|(se<<7)
                idx = len(legend_slots)
                legend_slots.append({"idx": idx, "mask": mask})
                slot_index_map[(r, sc)] = idx
                bitmask_to_idx[mask] = idx

    assert len(legend_slots) == 47, f"{ts_id}: expected 47 legend tiles, got {len(legend_slots)}"

    lookup256 = [0] * 256
    for m in range(256):
        nw, n, ne, w, e, sw, s, se = [(m >> b) & 1 for b in range(8)]
        if not (n and w): nw = 0
        if not (n and e): ne = 0
        if not (s and w): sw = 0
        if not (s and e): se = 0
        canon = (nw<<0)|(n<<1)|(ne<<2)|(w<<3)|(e<<4)|(sw<<5)|(s<<6)|(se<<7)
        lookup256[m] = bitmask_to_idx.get(canon, 0)

    groups = {}
    for g_idx, g_name in enumerate(group_names):
        if g_name == "legend":
            continue
        col_start = g_idx * 3
        tiles = {}
        for r in range(NUM_ROWS):
            ys = grid_top + r * CELL + 1
            for sc_off in range(3):
                xs = x0 + (col_start + sc_off) * CELL + 1
                raw = arr[ys:ys+TILE, xs:xs+TILE]
                cleaned = clean_tile(raw, strip_magenta=True)
                if np.any(cleaned[:, :, 3] > 0):
                    t_idx = slot_index_map.get((r, sc_off))
                    if t_idx is not None:
                        tiles[t_idx] = cleaned
        groups[g_name] = tiles

    def composite_underlay(base_dict, under_dict):
        for k, under_np in under_dict.items():
            if k in base_dict:
                top = base_dict[k].copy()
                holes = top[:, :, 3] == 0
                top[holes] = under_np[holes]
                base_dict[k] = top
            else:
                base_dict[k] = under_np.copy()

    if "walls_b" in groups:
        composite_underlay(groups.setdefault("walls", {}), groups["walls_b"])
    if "wall_alt_1_b" in groups:
        composite_underlay(groups.setdefault("wall_alt_1", {}), groups["wall_alt_1_b"])
    if "wall_alt_2_b" in groups:
        composite_underlay(groups.setdefault("wall_alt_2", {}), groups["wall_alt_2_b"])
    if "ground_b" in groups:
        composite_underlay(groups.setdefault("ground", {}), groups["ground_b"])

    walls = groups.get("walls", {})
    wall_alt_1 = groups.get("wall_alt_1", {})
    wall_alt_2 = groups.get("wall_alt_2", {})
    ground = groups.get("ground", {})
    ground_alt_1 = groups.get("ground_alt_1", {})
    ground_alt_2 = groups.get("ground_alt_2", {})
    water = groups.get("water", {})
    water_sparkle = groups.get("water_sparkle", {})

    # Strip any ripper text/annotation glyphs from alt dicts
    for alt_dict in (wall_alt_1, wall_alt_2, ground_alt_1, ground_alt_2):
        bad_keys = []
        for k, cell in alt_dict.items():
            white = np.sum((cell[:, :, 0] > 245) & (cell[:, :, 1] > 245) & (cell[:, :, 2] > 245) & (cell[:, :, 3] > 0))
            black = np.sum((cell[:, :, 0] < 10) & (cell[:, :, 1] < 10) & (cell[:, :, 2] < 10) & (cell[:, :, 3] > 0))
            if white > 15 and black > 15:
                bad_keys.append(k)
        for k in bad_keys:
            del alt_dict[k]

    water_tbl, water_vars = match_palette_table(water, tables)
    sparkle_tbl, sparkle_vars = match_palette_table(water_sparkle, tables) if water_sparkle else (None, [])

    water_frames = len(water_tbl) if water_tbl else 1
    sparkle_frames = (len(sparkle_tbl) if sparkle_tbl else 1) if water_sparkle else 0

    def dominant_color(tile_np, fallback="#334155"):
        if tile_np is None:
            return fallback
        vis = tile_np[tile_np[:, :, 3] > 128][:, :3]
        if len(vis) == 0:
            return fallback
        med = np.median(vis, axis=0).astype(int)
        return f"#{med[0]:02x}{med[1]:02x}{med[2]:02x}"

    wall_color = dominant_color(walls[4] if 4 in walls else next(iter(walls.values()), None), "#475569")
    ground_color = dominant_color(ground[4] if 4 in ground else next(iter(ground.values()), None), "#3f6212")
    water_color = dominant_color(water[4] if 4 in water else next(iter(water.values()), None), "#0284c7")

    total_rows = 6 + water_frames + sparkle_frames
    atlas = np.zeros((total_rows * TILE, 47 * TILE, 4), dtype=np.uint8)

    def place_row(row_idx, tile_dict):
        y = row_idx * TILE
        for t_idx, t_np in tile_dict.items():
            x = t_idx * TILE
            atlas[y:y+TILE, x:x+TILE] = t_np

    place_row(0, walls)
    place_row(1, wall_alt_1)
    place_row(2, wall_alt_2)
    place_row(3, ground)
    place_row(4, ground_alt_1)
    place_row(5, ground_alt_2)

    for wf in range(water_frames):
        y = (6 + wf) * TILE
        for t_idx, t_np in water.items():
            x = t_idx * TILE
            atlas[y:y+TILE, x:x+TILE] = apply_palette_frame(t_np, water_tbl, water_vars, wf)

    for sf in range(sparkle_frames):
        y = (6 + water_frames + sf) * TILE
        for t_idx, t_np in water_sparkle.items():
            x = t_idx * TILE
            atlas[y:y+TILE, x:x+TILE] = apply_palette_frame(t_np, sparkle_tbl, sparkle_vars, sf)

    ts_out_dir = os.path.join(out_root, ts_id)
    os.makedirs(ts_out_dir, exist_ok=True)
    atlas_path = os.path.join(ts_out_dir, "atlas.png")
    Image.fromarray(atlas).save(atlas_path, optimize=True)

    meta = {
        "id": ts_id,
        "name": display_name,
        "category": category,
        "tileSize": TILE,
        "atlasUrl": f"/pmd_tilesets/{ts_id}/atlas.png",
        "waterFrames": water_frames,
        "sparkleFrames": sparkle_frames,
        "waterSpeedFrames": water_speed,
        "sparkleSpeedFrames": sparkle_speed,
        "wallAlt1Indices": sorted(wall_alt_1.keys()),
        "wallAlt2Indices": sorted(wall_alt_2.keys()),
        "groundAlt1Indices": sorted(ground_alt_1.keys()),
        "groundAlt2Indices": sorted(ground_alt_2.keys()),
        "sparkleIndices": sorted(water_sparkle.keys()),
        "colors": {
            "wall": wall_color,
            "ground": ground_color,
            "water": water_color,
        },
        "lookup256": lookup256,
    }
    print(f"OK {ts_id:20s} | w={len(walls)} g={len(ground)} wa={len(water)} sp={len(water_sparkle)} | wf={water_frames:2d} sf={sparkle_frames}")
    return meta


def main():
    tiles_dir = "Tiles"
    out_root = os.path.join("public", "pmd_tilesets")
    os.makedirs(out_root, exist_ok=True)

    manifest = {
        "tileSize": 24,
        "tilesets": {},
        "lookup256": None,
    }

    for cfg in TILESETS_CONFIG:
        meta = extract_single_tileset(cfg, tiles_dir, out_root)
        if manifest["lookup256"] is None:
            manifest["lookup256"] = meta["lookup256"]
        compact = {k: v for k, v in meta.items() if k != "lookup256"}
        manifest["tilesets"][meta["id"]] = compact

    manifest_path = os.path.join(out_root, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nSuccessfully extracted ALL {len(manifest['tilesets'])} PMD tilesets -> {manifest_path}")


if __name__ == "__main__":
    main()
