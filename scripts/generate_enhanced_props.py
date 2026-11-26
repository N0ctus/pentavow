#!/usr/bin/env python3
"""
Generates and enhances crisp 16-bit pixel-art map props in public/map/
matching the 24px PMD Red Rescue Team tile scale and GBA pixel art style.
"""

import os
import numpy as np
from PIL import Image, ImageDraw

OUT_DIR = os.path.join("public", "map")
SHRINE_DIR = os.path.join(OUT_DIR, "shrine")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(SHRINE_DIR, exist_ok=True)


def make_canvas(w, h):
    return np.zeros((h, w, 4), dtype=np.uint8)


def px(arr, x, y, rgba):
    h, w, _ = arr.shape
    if 0 <= x < w and 0 <= y < h:
        arr[y, x] = rgba


def rect(arr, x0, y0, w, h, rgba):
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w):
            px(arr, x, y, rgba)


def save_pixel_art(arr, path):
    Image.fromarray(arr).save(path, optimize=True)


def gen_jizo_statue():
    # 24x32 mossy stone Jizo statue with red bib
    a = make_canvas(24, 32)
    O = (24, 28, 36, 255)      # Dark outline
    S1 = (110, 122, 134, 255)  # Dark stone
    S2 = (148, 160, 172, 255)  # Mid stone
    S3 = (192, 204, 214, 255)  # Highlight stone
    M1 = (64, 128, 56, 255)    # Moss
    R1 = (180, 32, 42, 255)    # Dark red bib
    R2 = (232, 62, 68, 255)    # Bright red bib

    # Pedestal
    rect(a, 4, 26, 16, 5, O)
    rect(a, 5, 27, 14, 3, S1)
    rect(a, 5, 27, 14, 1, S2)
    # Torso
    rect(a, 6, 15, 12, 11, O)
    rect(a, 7, 16, 10, 9, S2)
    rect(a, 7, 16, 3, 9, S3)
    rect(a, 14, 16, 3, 9, S1)
    # Red bib
    rect(a, 7, 15, 10, 5, R1)
    rect(a, 8, 15, 8, 3, R2)
    rect(a, 9, 19, 6, 2, R1)
    # Head
    rect(a, 6, 4, 12, 11, O)
    rect(a, 7, 5, 10, 9, S2)
    rect(a, 8, 5, 6, 3, S3)
    rect(a, 7, 3, 10, 2, O)
    rect(a, 8, 4, 8, 2, S3)
    # Peaceful eyes & smile
    px(a, 9, 9, O); px(a, 10, 9, O)
    px(a, 13, 9, O); px(a, 14, 9, O)
    px(a, 11, 12, S1); px(a, 12, 12, S1)
    # Moss spots
    px(a, 7, 5, M1); px(a, 8, 5, M1); px(a, 5, 27, M1); px(a, 17, 28, M1)
    save_pixel_art(a, os.path.join(OUT_DIR, "prop_jizo_statue.png"))


def gen_fox_statue():
    # 24x32 Kitsune fox guardian statue for Kopan Ruins
    a = make_canvas(24, 32)
    O = (24, 30, 28, 255)
    S1 = (98, 112, 108, 255)
    S2 = (142, 158, 152, 255)
    S3 = (188, 206, 198, 255)
    M1 = (68, 148, 64, 255)
    R2 = (224, 54, 62, 255)

    # Pedestal
    rect(a, 4, 26, 16, 5, O)
    rect(a, 5, 27, 14, 3, S1)
    rect(a, 6, 27, 12, 1, S3)
    # Seated body + curled tail
    rect(a, 7, 15, 10, 11, O)
    rect(a, 8, 16, 8, 9, S2)
    rect(a, 8, 16, 3, 9, S3)
    rect(a, 16, 17, 4, 8, O)
    rect(a, 17, 18, 2, 6, S2)
    # Scarf
    rect(a, 8, 15, 8, 3, R2)
    # Pointed ears & snout
    rect(a, 7, 3, 3, 5, O); rect(a, 8, 4, 1, 4, S2)
    rect(a, 14, 3, 3, 5, O); rect(a, 15, 4, 1, 4, S2)
    rect(a, 7, 7, 10, 8, O)
    rect(a, 8, 8, 8, 6, S2)
    rect(a, 9, 8, 5, 2, S3)
    px(a, 10, 11, O); px(a, 13, 11, O)
    px(a, 11, 13, O); px(a, 12, 13, O)
    # Moss
    px(a, 5, 27, M1); px(a, 6, 28, M1); px(a, 8, 17, M1); px(a, 17, 19, M1)
    save_pixel_art(a, os.path.join(OUT_DIR, "prop_fox_statue.png"))


def gen_crater_boulder():
    a = make_canvas(24, 24)
    O = (20, 12, 16, 255)
    B1 = (62, 44, 48, 255)
    B2 = (98, 72, 74, 255)
    B3 = (138, 108, 104, 255)
    E1 = (244, 112, 32, 255)
    E2 = (255, 198, 74, 255)

    rect(a, 4, 7, 16, 13, O)
    rect(a, 6, 5, 12, 16, O)
    rect(a, 5, 8, 14, 11, B1)
    rect(a, 7, 6, 10, 13, B2)
    rect(a, 7, 7, 6, 5, B3)
    # Ember veins
    px(a, 10, 11, E1); px(a, 11, 12, E2); px(a, 12, 13, E1); px(a, 13, 14, E1)
    px(a, 8, 15, E1); px(a, 9, 15, E2)
    save_pixel_art(a, os.path.join(OUT_DIR, "prop_crater_boulder.png"))


def gen_shrine_pillars():
    variants = [
        ("pillar_clean.png", (184, 176, 152, 255), (144, 136, 114, 255), (92, 86, 72, 255), False, False),
        ("pillar_fluted.png", (176, 172, 150, 255), (132, 130, 112, 255), (84, 84, 72, 255), True, False),
        ("pillar_cracked.png", (166, 158, 138, 255), (122, 116, 98, 255), (78, 74, 62, 255), False, True),
    ]
    O = (28, 30, 26, 255)
    M1 = (68, 142, 62, 255)
    M2 = (96, 176, 78, 255)
    F1 = (255, 180, 56, 255)
    F2 = (255, 240, 150, 255)

    for fname, hi, mid, dark, fluted, cracked in variants:
        a = make_canvas(24, 48)
        # Base plinth
        rect(a, 3, 39, 18, 7, O)
        rect(a, 4, 40, 16, 5, mid)
        rect(a, 4, 40, 16, 1, hi)
        rect(a, 4, 44, 16, 1, dark)
        # Shaft
        rect(a, 5, 12, 14, 28, O)
        rect(a, 6, 13, 12, 26, mid)
        rect(a, 6, 13, 4, 26, hi)
        rect(a, 15, 13, 3, 26, dark)
        if fluted:
            for y in range(14, 38):
                px(a, 9, y, dark)
                px(a, 13, y, dark)
        if cracked:
            for k in range(6):
                px(a, 10 + k//2, 20 + k, O)
            px(a, 12, 26, O); px(a, 11, 27, O)
            # Extra moss
            rect(a, 6, 33, 5, 5, M1)
            px(a, 7, 34, M2); px(a, 8, 35, M2)
        # Capital + Torch Bowl
        rect(a, 4, 9, 16, 4, O)
        rect(a, 5, 10, 14, 2, hi)
        # Moss accent
        px(a, 5, 40, M1); px(a, 6, 41, M2); px(a, 16, 42, M1)
        # Torch flame on top
        rect(a, 9, 4, 6, 5, F1)
        rect(a, 10, 5, 4, 3, F2)
        px(a, 11, 2, F1); px(a, 12, 3, F2)
        save_pixel_art(a, os.path.join(SHRINE_DIR, fname))


def gen_ice_crystal():
    a = make_canvas(24, 36)
    O = (16, 36, 72, 255)
    C1 = (48, 138, 218, 255)
    C2 = (108, 202, 248, 255)
    C3 = (212, 248, 255, 255)

    # Central spire
    for i in range(26):
        y = 4 + i
        half_w = min(6, 1 + i // 3) if i < 20 else max(3, 6 - (i - 20) // 2)
        rect(a, 12 - half_w - 1, y, half_w * 2 + 2, 1, O)
        rect(a, 12 - half_w, y, half_w * 2, 1, C1)
        rect(a, 12 - half_w, y, max(1, half_w), 1, C2)
        if i < 16:
            px(a, 12 - half_w + 1, y, C3)
    # Left & right side shards
    for i in range(12):
        y = 18 + i
        rect(a, 3, y, 4, 1, O); rect(a, 4, y, 2, 1, C2)
        rect(a, 17, y, 4, 1, O); rect(a, 18, y, 2, 1, C1)
    save_pixel_art(a, os.path.join(OUT_DIR, "prop_ice_crystal.png"))


def gen_street_lamp():
    # Downtown Mysidia glowing emerald-cyan streetlamp
    a = make_canvas(24, 48)
    O = (16, 20, 28, 255)
    I1 = (44, 54, 72, 255)
    I2 = (82, 98, 124, 255)
    G1 = (16, 185, 129, 255)
    G2 = (110, 248, 212, 255)
    G3 = (230, 255, 245, 255)

    rect(a, 8, 41, 8, 6, O); rect(a, 9, 42, 6, 4, I1); rect(a, 10, 42, 2, 4, I2)
    rect(a, 10, 14, 4, 28, O); rect(a, 11, 14, 2, 28, I2)
    # Lamp head
    rect(a, 6, 5, 12, 10, O)
    rect(a, 7, 6, 10, 8, G1)
    rect(a, 8, 7, 8, 6, G2)
    rect(a, 10, 8, 4, 4, G3)
    rect(a, 7, 3, 10, 3, O); rect(a, 8, 4, 8, 1, I2)
    save_pixel_art(a, os.path.join(OUT_DIR, "prop_street_lamp.png"))


def gen_brazier_fire():
    a = make_canvas(24, 32)
    O = (24, 18, 20, 255)
    I1 = (64, 58, 64, 255)
    I2 = (114, 108, 118, 255)
    F1 = (224, 62, 24, 255)
    F2 = (252, 152, 34, 255)
    F3 = (255, 238, 120, 255)

    rect(a, 6, 24, 12, 6, O); rect(a, 7, 25, 10, 4, I1)
    rect(a, 4, 15, 16, 10, O); rect(a, 5, 16, 14, 8, I1); rect(a, 6, 16, 12, 2, I2)
    # Flames
    rect(a, 6, 8, 12, 8, F1)
    rect(a, 8, 6, 8, 9, F2)
    rect(a, 10, 9, 4, 6, F3)
    px(a, 9, 4, F1); px(a, 12, 3, F2); px(a, 14, 5, F1)
    save_pixel_art(a, os.path.join(OUT_DIR, "prop_brazier_fire.png"))


def gen_desert_pillar():
    a = make_canvas(24, 42)
    O = (52, 34, 22, 255)
    D1 = (168, 122, 74, 255)
    D2 = (212, 168, 106, 255)
    D3 = (242, 210, 148, 255)

    rect(a, 4, 35, 16, 6, O); rect(a, 5, 36, 14, 4, D1); rect(a, 5, 36, 14, 1, D3)
    rect(a, 6, 10, 12, 26, O); rect(a, 7, 11, 10, 24, D2); rect(a, 7, 11, 3, 24, D3); rect(a, 14, 11, 3, 24, D1)
    # Broken slanted top
    rect(a, 6, 6, 7, 5, O); rect(a, 7, 7, 5, 4, D3)
    # Carved runes
    px(a, 10, 16, D1); px(a, 11, 17, D1); px(a, 10, 22, D1); px(a, 11, 23, D1)
    save_pixel_art(a, os.path.join(OUT_DIR, "prop_desert_pillar.png"))


def gen_cactus():
    a = make_canvas(24, 32)
    O = (18, 42, 22, 255)
    G1 = (42, 112, 48, 255)
    G2 = (74, 164, 68, 255)
    G3 = (128, 212, 104, 255)

    rect(a, 9, 5, 6, 25, O); rect(a, 10, 6, 4, 23, G2); rect(a, 10, 6, 2, 23, G3); rect(a, 13, 6, 1, 23, G1)
    rect(a, 4, 12, 5, 9, O); rect(a, 5, 13, 4, 7, G2); rect(a, 5, 17, 5, 3, G1)
    rect(a, 15, 10, 5, 9, O); rect(a, 15, 11, 4, 7, G2); rect(a, 14, 15, 5, 3, G1)
    save_pixel_art(a, os.path.join(OUT_DIR, "prop_cactus.png"))


def gen_mushroom_glow():
    a = make_canvas(24, 24)
    O = (24, 18, 48, 255)
    S1 = (196, 214, 232, 255)
    C1 = (46, 132, 224, 255)
    C2 = (108, 228, 255, 255)
    C3 = (224, 255, 255, 255)

    # Big mushroom
    rect(a, 9, 13, 5, 8, O); rect(a, 10, 14, 3, 6, S1)
    rect(a, 5, 6, 13, 8, O); rect(a, 6, 7, 11, 6, C1); rect(a, 7, 7, 9, 4, C2)
    px(a, 9, 8, C3); px(a, 13, 9, C3); px(a, 8, 10, C3)
    # Little mushroom
    rect(a, 17, 16, 3, 5, O); rect(a, 18, 17, 1, 3, S1)
    rect(a, 15, 13, 7, 4, O); rect(a, 16, 14, 5, 2, C2); px(a, 18, 14, C3)
    save_pixel_art(a, os.path.join(OUT_DIR, "prop_mushroom_glow.png"))


def gen_snow_pine():
    a = make_canvas(48, 72)
    O = (22, 36, 48, 255)
    T1 = (84, 54, 34, 255)
    T2 = (118, 78, 48, 255)
    P1 = (32, 74, 62, 255)
    P2 = (52, 114, 88, 255)
    S1 = (196, 224, 240, 255)
    S2 = (244, 252, 255, 255)

    # Trunk
    rect(a, 20, 52, 8, 17, O); rect(a, 21, 53, 6, 15, T1); rect(a, 21, 53, 3, 15, T2)
    # 3 pine tiers with snow caps
    tiers = [(24, 6, 18), (24, 20, 24), (24, 36, 30)]
    for cx, top_y, height in tiers:
        for row in range(height):
            w = max(2, int((row / height) * 18) + 2)
            y = top_y + row
            rect(a, cx - w - 1, y, w*2 + 2, 1, O)
            col = S2 if row < 5 else (S1 if row < 9 else (P2 if row < height - 3 else P1))
            rect(a, cx - w, y, w*2, 1, col)
            if row >= 9 and row % 2 == 0:
                rect(a, cx - w, y, w, 1, P2)
    save_pixel_art(a, os.path.join(OUT_DIR, "prop_tree_snow_pine.png"))


def gen_palm_tree():
    a = make_canvas(48, 64)
    O = (38, 28, 18, 255)
    T1 = (132, 86, 48, 255)
    T2 = (176, 122, 68, 255)
    L1 = (44, 116, 38, 255)
    L2 = (88, 172, 56, 255)
    L3 = (136, 212, 82, 255)

    # Curved trunk
    for i in range(36):
        y = 24 + i
        x = 22 - int(np.sin(i / 14.0) * 3)
        rect(a, x - 1, y, 6, 1, O)
        rect(a, x, y, 4, 1, T2 if i % 4 < 2 else T1)
    # Canopy fronds (acacia / palm style)
    fronds = [
        (-16, 16, 16, 6), (2, 14, 18, 6), (-12, 22, 14, 5), (4, 22, 14, 5), (-8, 10, 16, 6)
    ]
    for dx, ry, fw, fh in fronds:
        x0 = 22 + dx
        rect(a, x0-1, ry-1, fw+2, fh+2, O)
        rect(a, x0, ry, fw, fh, L1)
        rect(a, x0+1, ry, fw-2, max(1, fh-2), L2)
        rect(a, x0+2, ry, max(1, fw//2), 2, L3)
    save_pixel_art(a, os.path.join(OUT_DIR, "prop_tree_palm.png"))


def gen_dead_tree():
    a = make_canvas(48, 64)
    O = (24, 20, 26, 255)
    B1 = (72, 62, 68, 255)
    B2 = (108, 94, 98, 255)

    for i in range(38):
        y = 22 + i
        rect(a, 20, y, 8, 1, O); rect(a, 21, y, 6, 1, B1); rect(a, 21, y, 2, 1, B2)
    # Gnarled branches
    for k in range(14):
        rect(a, 20 - k, 24 - k, 4, 3, O); rect(a, 21 - k, 24 - k, 2, 2, B2)
        rect(a, 25 + k, 26 - k, 4, 3, O); rect(a, 26 + k, 26 - k, 2, 2, B1)
        if k < 10:
            rect(a, 22 - k//2, 20 - k, 3, 2, O); rect(a, 22 - k//2, 20 - k, 2, 1, B2)
    save_pixel_art(a, os.path.join(OUT_DIR, "prop_tree_dead.png"))


def gen_tiles_24():
    # Crisp 24x24 pixel wooden bridge plank, red veranda bridge, & cobble road tile
    # 1. Wooden plank bridge
    w = make_canvas(24, 24)
    O = (42, 24, 14, 255)
    W1 = (118, 72, 38, 255)
    W2 = (158, 102, 54, 255)
    W3 = (194, 134, 74, 255)
    for col_x in range(0, 24, 6):
        rect(w, col_x, 0, 6, 24, W2)
        rect(w, col_x, 0, 1, 24, O)
        rect(w, col_x+1, 1, 2, 22, W3)
        rect(w, col_x+5, 0, 1, 24, W1)
    # Horizontal top/bottom rail trim
    rect(w, 0, 0, 24, 2, O); rect(w, 0, 1, 24, 1, W3)
    rect(w, 0, 22, 24, 2, O); rect(w, 0, 22, 24, 1, W1)
    save_pixel_art(w, os.path.join(OUT_DIR, "prop_wooden_plank.png"))

    # 2. Red-lacquered temple bridge
    rb = make_canvas(24, 24)
    RO = (48, 10, 14, 255)
    R1 = (142, 26, 32, 255)
    R2 = (192, 46, 48, 255)
    R3 = (228, 92, 72, 255)
    G1 = (232, 186, 62, 255)
    for col_x in range(0, 24, 6):
        rect(rb, col_x, 0, 6, 24, R2)
        rect(rb, col_x, 0, 1, 24, RO)
        rect(rb, col_x+1, 2, 2, 20, R3)
    rect(rb, 0, 0, 24, 3, RO); rect(rb, 0, 1, 24, 2, G1)
    rect(rb, 0, 21, 24, 3, RO); rect(rb, 0, 21, 24, 2, R1)
    save_pixel_art(rb, os.path.join(OUT_DIR, "prop_red_bridge_tile.png"))

    # 3. Crisp 24x24 PMD cobblestone road tile
    cb = make_canvas(24, 24)
    CO = (38, 44, 56, 255)
    C1 = (88, 98, 114, 255)
    C2 = (128, 140, 158, 255)
    C3 = (172, 184, 202, 255)
    rect(cb, 0, 0, 24, 24, CO)
    stones = [(1, 1, 10, 10), (12, 1, 11, 10), (1, 12, 6, 11), (8, 12, 15, 11)]
    for sx, sy, sw, sh in stones:
        rect(cb, sx, sy, sw, sh, C2)
        rect(cb, sx, sy, sw, 2, C3)
        rect(cb, sx, sy, 2, sh, C3)
        rect(cb, sx, sy+sh-2, sw, 2, C1)
    save_pixel_art(cb, os.path.join(OUT_DIR, "prop_cobble_pmd.png"))


def sharpen_void_props():
    # Crisp pixel-snap prop_void_magic_circle*.png by snapping to 48x48 nearest grid
    for fname in ("prop_void_magic_circle.png", "prop_void_magic_circle_white.png"):
        p = os.path.join(OUT_DIR, fname)
        if os.path.exists(p):
            im = Image.open(p).convert("RGBA")
            small = im.resize((48, 48), Image.Resampling.NEAREST)
            # Clean semi-transparent blur edges
            arr = np.array(small)
            arr[arr[:, :, 3] < 128] = [0, 0, 0, 0]
            arr[arr[:, :, 3] >= 128, 3] = 255
            Image.fromarray(arr).resize((96, 96), Image.Resampling.NEAREST).save(p, optimize=True)


def main():
    gen_jizo_statue()
    gen_fox_statue()
    gen_crater_boulder()
    gen_shrine_pillars()
    gen_ice_crystal()
    gen_street_lamp()
    gen_brazier_fire()
    gen_desert_pillar()
    gen_cactus()
    gen_mushroom_glow()
    gen_snow_pine()
    gen_palm_tree()
    gen_dead_tree()
    gen_tiles_24()
    sharpen_void_props()
    print("Successfully generated and enhanced all 16-bit pixel props in public/map/!")


if __name__ == "__main__":
    main()
