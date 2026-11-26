#!/usr/bin/env python3
"""
Pokemon Mystery Dungeon: Red Rescue Team (Buried Relic B21F-B50F)
Tileset Extraction, Cleaning, Palette & Autotile Bitmask Generation Pipeline.

Features:
- Extracts 24x24 tiles from Legend, Walls, Wall Alts, Ground, Ground Alts, Unused, Water, Water Sparkle.
- Strips 1px grid borders and converts #008080 (teal) and #FF00FF (magenta) to RGBA(0, 0, 0, 0).
- Reads the 16x16 Water palette and 4x16 Water Sparkle palette into JSON.
- Parses 47-tile blob autotiling bitmasks from the Legend column and builds a 256-to-47 lookup table.
- Generates transparent PNG tiles and a combined tileset_data.json.
"""

import os
import sys
import json
import numpy as np
from PIL import Image

def extract_pmd_tiles(
    image_path: str = "Tiles/Game Boy Advance - Pokemon Mystery Dungeon_ Red Rescue Team - Dungeon Tiles - Buried Relic B21F - B50F.png",
    output_dir: str = "public/pmd_buried_relic"
):
    print(f"Loading reference sheet: {image_path}")
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Source tileset sheet not found at: {image_path}")

    # Load as RGBA NumPy array
    sheet_img = Image.open(image_path).convert("RGBA")
    sheet = np.array(sheet_img)
    height, width, _ = sheet.shape
    print(f"Loaded sheet: {width}x{height} px")

    os.makedirs(output_dir, exist_ok=True)
    tiles_base_dir = os.path.join(output_dir, "tiles")
    os.makedirs(tiles_base_dir, exist_ok=True)

    # -------------------------------------------------------------
    # 1. Grid Metrics & Column Definitions
    # -------------------------------------------------------------
    GRID_LEFT = 8
    GRID_TOP = 162
    CELL_PITCH = 25  # 1px border + 24px tile
    TILE_SIZE = 24
    NUM_ROWS = 24

    GROUPS = [
        ("legend", 0, 3),
        ("walls", 3, 6),
        ("wall_alt_1", 6, 9),
        ("wall_alt_2", 9, 12),
        ("ground", 12, 15),
        ("ground_alt_1", 15, 18),
        ("ground_alt_2", 18, 21),
        ("unused_ground", 21, 24),
        ("water", 24, 27),
        ("water_sparkle", 27, 30),
    ]

    # -------------------------------------------------------------
    # 2. Parse Legend Column & Compute 47 Canonical Bitmasks
    # -------------------------------------------------------------
    # In Legend:
    # 3x3 blocks of 8x8 pixels per 24x24 tile.
    # Center (1, 1) is White [R>150, G>150, B>150].
    # Neighbor (bx, by) is Black [R<50, G<50, B<50] if connected (same type),
    # or Teal [R=0, G=128, B=128] if open / different type.
    print("Parsing Legend column for 47-tile autotiling bitmasks...")

    def sample_legend_block(x_start, y_start, bx, by):
        cx = x_start + bx * 8 + 4
        cy = y_start + by * 8 + 4
        px = sheet[cy, cx]
        r, g, b = px[0], px[1], px[2]
        if r < 50 and g < 50 and b < 50:
            return 1  # Black = same tile type connected
        return 0  # Teal or other = disconnected / border

    legend_slots = []
    slot_index_map = {}  # (row, sub_col) -> tile_index (0..46)
    bitmask_to_tile_index = {}

    for r in range(NUM_ROWS):
        y_start = GRID_TOP + r * CELL_PITCH + 1
        for sc in range(3):
            x_start = GRID_LEFT + sc * CELL_PITCH + 1
            # Check center block
            cx = x_start + 12
            cy = y_start + 12
            c_px = sheet[cy, cx]
            if c_px[0] > 150 and c_px[1] > 150 and c_px[2] > 150:
                # Valid legend tile
                nw = sample_legend_block(x_start, y_start, 0, 0)
                n  = sample_legend_block(x_start, y_start, 1, 0)
                ne = sample_legend_block(x_start, y_start, 2, 0)
                w  = sample_legend_block(x_start, y_start, 0, 1)
                e  = sample_legend_block(x_start, y_start, 2, 1)
                sw = sample_legend_block(x_start, y_start, 0, 2)
                s  = sample_legend_block(x_start, y_start, 1, 2)
                se = sample_legend_block(x_start, y_start, 2, 2)

                mask = (nw << 0) | (n << 1) | (ne << 2) | (w << 3) | (e << 4) | (sw << 5) | (s << 6) | (se << 7)
                tile_idx = len(legend_slots)
                slot_info = {
                    "tile_index": tile_idx,
                    "row": r,
                    "col": sc,
                    "mask": mask,
                    "neighbors": {
                        "nw": nw, "n": n, "ne": ne,
                        "w": w, "e": e,
                        "sw": sw, "s": s, "se": se
                    }
                }
                legend_slots.append(slot_info)
                slot_index_map[(r, sc)] = tile_idx
                bitmask_to_tile_index[mask] = tile_idx

    print(f"Extracted {len(legend_slots)} autotile bitmasks from Legend column.")

    # Build canonical collapse table for all 256 possible 8-neighbor bitmasks
    # Rule: corner bits only connect if both adjacent cardinals are connected.
    lookup_256_to_47 = [0] * 256
    for m in range(256):
        nw = (m >> 0) & 1
        n  = (m >> 1) & 1
        ne = (m >> 2) & 1
        w  = (m >> 3) & 1
        e  = (m >> 4) & 1
        sw = (m >> 5) & 1
        s  = (m >> 6) & 1
        se = (m >> 7) & 1

        if not (n and w): nw = 0
        if not (n and e): ne = 0
        if not (s and w): sw = 0
        if not (s and e): se = 0

        canon_mask = (nw << 0) | (n << 1) | (ne << 2) | (w << 3) | (e << 4) | (sw << 5) | (s << 6) | (se << 7)
        lookup_256_to_47[m] = bitmask_to_tile_index.get(canon_mask, 0)

    # -------------------------------------------------------------
    # 3. Extract, Clean & Save Transparent PNG Tiles
    # -------------------------------------------------------------
    extracted_tiles_registry = {}

    for group_name, col_start, col_end in GROUPS:
        group_dir = os.path.join(tiles_base_dir, group_name)
        os.makedirs(group_dir, exist_ok=True)
        extracted_tiles_registry[group_name] = []

        for r in range(NUM_ROWS):
            y_start = GRID_TOP + r * CELL_PITCH + 1
            for sc_offset, sc in enumerate(range(col_start, col_end)):
                x_start = GRID_LEFT + sc * CELL_PITCH + 1
                tile_np = sheet[y_start : y_start + TILE_SIZE, x_start : x_start + TILE_SIZE].copy()

                # Clean transparency:
                # 1. Convert #008080 (teal) to RGBA(0, 0, 0, 0)
                teal_mask = (tile_np[:, :, 0] == 0) & (tile_np[:, :, 1] == 128) & (tile_np[:, :, 2] == 128)
                tile_np[teal_mask] = [0, 0, 0, 0]

                # 2. Convert #FF00FF (magenta) to RGBA(0, 0, 0, 0) for water and water_sparkle
                if group_name in ("water", "water_sparkle"):
                    magenta_mask = (tile_np[:, :, 0] == 255) & (tile_np[:, :, 1] == 0) & (tile_np[:, :, 2] == 255)
                    tile_np[magenta_mask] = [0, 0, 0, 0]

                # Check if tile has any visible pixels
                if np.any(tile_np[:, :, 3] > 0):
                    rel_col = sc_offset
                    tile_idx = slot_index_map.get((r, rel_col), None)
                    filename = f"tile_{tile_idx}.png" if tile_idx is not None else f"tile_r{r}_c{sc}.png"
                    filepath = os.path.join(group_dir, filename)

                    Image.fromarray(tile_np).save(filepath)
                    extracted_tiles_registry[group_name].append({
                        "filename": filename,
                        "tile_index": tile_idx,
                        "row": r,
                        "col": sc,
                        "rel_col": rel_col
                    })

        print(f"Extracted {len(extracted_tiles_registry[group_name])} tiles for {group_name}")

    # -------------------------------------------------------------
    # 4. Extract Palette Swatches
    # -------------------------------------------------------------
    print("Extracting Water & Water Sparkle animation palettes...")

    def to_hex(r, g, b):
        return f"#{r:02x}{g:02x}{b:02x}"

    # Water palette: 16 rows x 16 cols
    water_palette = []
    for pr in range(16):
        row_colors = []
        py = 167 + pr * 11 + 5
        for pc in range(16):
            px = 766 + pc * 11 + 5
            color = sheet[py, px]
            row_colors.append(to_hex(color[0], color[1], color[2]))
        water_palette.append(row_colors)

    # Water Sparkle palette: 4 rows x 16 cols
    sparkle_palette = []
    for pr in range(4):
        row_colors = []
        py = 367 + pr * 11 + 5
        for pc in range(16):
            px = 766 + pc * 11 + 5
            color = sheet[py, px]
            row_colors.append(to_hex(color[0], color[1], color[2]))
        sparkle_palette.append(row_colors)

    # -------------------------------------------------------------
    # 5. Export Tileset Data JSON
    # -------------------------------------------------------------
    metadata = {
        "name": "Pokemon Mystery Dungeon: Red Rescue Team - Buried Relic B21F-B50F",
        "tileSize": 24,
        "speeds": {
            "water_frames": 12,
            "sparkle_frames": 8
        },
        "palettes": {
            "water": water_palette,
            "sparkle": sparkle_palette
        },
        "lookup256": lookup_256_to_47,
        "legend": legend_slots,
        "extracted_tiles": extracted_tiles_registry
    }

    json_path = os.path.join(output_dir, "tileset_data.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"Successfully saved tileset data to: {json_path}")
    print("Pipeline completed successfully!")
    return metadata

if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else "Tiles/Game Boy Advance - Pokemon Mystery Dungeon_ Red Rescue Team - Dungeon Tiles - Buried Relic B21F - B50F.png"
    out = sys.argv[2] if len(sys.argv) > 2 else "public/pmd_buried_relic"
    extract_pmd_tiles(src, out)
