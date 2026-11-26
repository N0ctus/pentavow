import json
import os
from collections import deque
from PIL import Image
import numpy as np

SRC_DIR = r"C:\Users\Noctus\Documents\Tessera_legacy\swords"
OUT_DIR = r"C:\Users\Noctus\Documents\Tessera_legacy\public\swords"
CATALOG_PATH = os.path.join(OUT_DIR, "sword_catalog.json")
META_OUT_PATH = r"C:\Users\Noctus\Documents\Tessera_legacy\scripts\extracted_swords_meta.json"


def flood_fill_black_to_alpha(rgba: np.ndarray, black_tol: int = 8) -> np.ndarray:
    """Flood-fill outer-connected near-black background to transparent, preserving internal dark outlines."""
    h, w, _ = rgba.shape
    out = rgba.copy()
    is_dark = np.all(out[:, :, :3] <= black_tol, axis=2)

    visited = np.zeros((h, w), dtype=bool)
    q = deque()

    # Seed from all 4 outer edges (or pad implicitly)
    for x in range(w):
        if is_dark[0, x] and not visited[0, x]:
            visited[0, x] = True
            q.append((0, x))
        if is_dark[h - 1, x] and not visited[h - 1, x]:
            visited[h - 1, x] = True
            q.append((h - 1, x))
    for y in range(h):
        if is_dark[y, 0] and not visited[y, 0]:
            visited[y, 0] = True
            q.append((y, 0))
        if is_dark[y, w - 1] and not visited[y, w - 1]:
            visited[y, w - 1] = True
            q.append((y, w - 1))

    while q:
        cy, cx = q.popleft()
        out[cy, cx, 3] = 0
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_dark[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))

    return out


def format_as_32x32_icon(rgba_crop: np.ndarray, rotate_deg: float = -45.0) -> tuple[Image.Image, dict]:
    """
    Strip outer black, tighten crop, rotate diagonally up-left (-45 deg clockwise)
    just like existing sword_1..sword_150.png, and fit cleanly onto 32x32 RGBA canvas.
    """
    # Pad by 2px black border before flood-fill so edges are always connected
    h, w, _ = rgba_crop.shape
    padded = np.zeros((h + 4, w + 4, 4), dtype=np.uint8)
    padded[:, :, 3] = 255
    padded[2:h + 2, 2:w + 2] = rgba_crop
    cleaned = flood_fill_black_to_alpha(padded, black_tol=8)

    # Tighten non-transparent bbox
    ys, xs = np.where(cleaned[:, :, 3] > 0)
    if len(xs) == 0:
        return Image.new("RGBA", (32, 32), (0, 0, 0, 0)), {"r": 128, "g": 128, "b": 128}
    tight = cleaned[ys.min():ys.max() + 1, xs.min():xs.max() + 1]

    # Sample average vivid pixel color for elemental affinity heuristic
    rgb = tight[:, :, :3].astype(np.float32)
    a_mask = tight[:, :, 3] > 0
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    vivid = a_mask & (sat > 25) & (rgb.max(axis=2) > 55)
    if np.any(vivid):
        mean_rgb = rgb[vivid].mean(axis=0)
    else:
        mean_rgb = rgb[a_mask].mean(axis=0)

    pil_tight = Image.fromarray(tight, "RGBA")
    if rotate_deg != 0.0:
        # In Pillow rotate(-45) rotates 45 deg clockwise (left tip -> top-left!)
        pil_rot = pil_tight.rotate(rotate_deg, resample=Image.Resampling.NEAREST, expand=True)
    else:
        pil_rot = pil_tight

    rot_arr = np.array(pil_rot)
    rys, rxs = np.where(rot_arr[:, :, 3] > 0)
    if len(rxs) == 0:
        return Image.new("RGBA", (32, 32), (0, 0, 0, 0)), {"r": 128, "g": 128, "b": 128}
    pil_final_crop = Image.fromarray(rot_arr[rys.min():rys.max() + 1, rxs.min():rxs.max() + 1], "RGBA")

    cw, ch = pil_final_crop.size
    max_dim = 30
    scale = min(1.0, max_dim / max(cw, ch))
    nw = max(1, int(round(cw * scale)))
    nh = max(1, int(round(ch * scale)))
    if scale < 1.0:
        pil_resized = pil_final_crop.resize((nw, nh), Image.Resampling.NEAREST)
    else:
        pil_resized = pil_final_crop

    canvas = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    ox = (32 - nw) // 2
    oy = (32 - nh) // 2
    canvas.paste(pil_resized, (ox, oy), pil_resized)

    return canvas, {"r": int(mean_rgb[0]), "g": int(mean_rgb[1]), "b": int(mean_rgb[2])}


def infer_element(rgb: dict) -> str:
    r, g, b = rgb["r"], rgb["g"], rgb["b"]
    mx, mn = max(r, g, b), min(r, g, b)
    if mx - mn < 22:
        # Neutral steel/silver/gold/ivory -> LIGHT or WIND
        return "LIGHT" if mx > 175 else "WIND"
    if r >= g + 35 and r >= b + 35:
        return "FIRE"
    if g >= r + 15 and g >= b + 10:
        return "WIND"
    if b >= r + 25 and b >= g + 15:
        return "WATER"
    if r >= 130 and b >= 130 and g < 110:
        return "DARK"
    if r >= 175 and g >= 145 and b < 115:
        return "LIGHT"
    if r > 120 and g > 70 and b < 90:
        return "FIRE"
    return "DARK"


def extract_sn2_sheet(fname: str, family: str) -> list[dict]:
    path = os.path.join(SRC_DIR, fname)
    arr = np.array(Image.open(path).convert("RGBA"))
    items = []
    # 8 rows x 6 cols of 64x64 cells (y: 0..512, x: 0..384); skip row 6 duplicate crystal glow frames
    # Also for SN2 SWORD skip (2,5) and (3,0) duplicate mechanical chainsaw frames (keep canonical (2,4))
    for r in range(8):
        if r == 6:
            continue
        for c in range(6):
            if family == "SWORD" and (r, c) in ((2, 5), (3, 0)):
                continue
            cell = arr[r * 64:(r + 1) * 64, c * 64:(c + 1) * 64]
            if not np.any(cell[:, :, :3] > 10):
                continue
            items.append({
                "crop": cell,
                "source": f"SN2_{family}",
                "game": "SN2",
                "family": family,
                "row": r,
                "col": c,
                "rotate": -45.0,
            })
    return items


def find_y_bands(col_mask: np.ndarray, merge_gap: int = 0) -> list[tuple[int, int]]:
    row_has = col_mask.any(axis=1)
    bands = []
    in_b = False
    y0 = 0
    for y, v in enumerate(row_has):
        if v and not in_b:
            in_b = True
            y0 = y
        elif not v and in_b:
            in_b = False
            bands.append((y0, y))
    if in_b:
        bands.append((y0, len(row_has)))

    if merge_gap > 0 and len(bands) > 1:
        merged = [bands[0]]
        for y0, y1 in bands[1:]:
            py0, py1 = merged[-1]
            if y0 - py1 <= merge_gap:
                merged[-1] = (py0, y1)
            else:
                merged.append((y0, y1))
        bands = merged
    return bands


def extract_sn3_swords() -> list[dict]:
    fname = "Game Boy Advance - Summon Night_ Swordcraft Story 3 - Weapons - Swords.png"
    arr = np.array(Image.open(os.path.join(SRC_DIR, fname)).convert("RGBA"))
    # Remove white rectangle borders & credit plaque
    clean_arr = arr.copy()
    mask = np.any(arr[:, :, :3] > 8, axis=2)
    mask[282:, :170] = False

    # Strip white border box around emerald mechanical sword (x 189..259, y 180..262)
    # Keep only 1st blade (y 185..209, x 194..252)
    items = []
    cols = [(8, 55), (64, 121), (126, 182), (190, 257), (267, 322)]
    for ci, (x0, x1) in enumerate(cols):
        if ci == 3:
            ybands = find_y_bands(mask[:, x0:x1])
            for ri, (y0, y1) in enumerate(ybands):
                if y1 - y0 > 45:
                    # This is the 3-frame white box -> slice only first blade cleanly inside frame
                    sub = clean_arr[187:210, 195:252]
                    items.append({"crop": sub, "source": "SN3_SWORD", "game": "SN3", "family": "SWORD", "row": ri, "col": ci, "rotate": -45.0})
                else:
                    items.append({"crop": clean_arr[y0:y1, x0:x1], "source": "SN3_SWORD", "game": "SN3", "family": "SWORD", "row": ri, "col": ci, "rotate": -45.0})
        else:
            for ri, (y0, y1) in enumerate(find_y_bands(mask[:, x0:x1])):
                items.append({"crop": clean_arr[y0:y1, x0:x1], "source": "SN3_SWORD", "game": "SN3", "family": "SWORD", "row": ri, "col": ci, "rotate": -45.0})
    return items


def extract_sn3_axes() -> list[dict]:
    fname = "Game Boy Advance - Summon Night_ Swordcraft Story 3 - Weapons - Axes (1).png"
    arr = np.array(Image.open(os.path.join(SRC_DIR, fname)).convert("RGBA"))
    mask = np.any(arr[:, :, :3] > 8, axis=2)
    mask[410:, :170] = False
    items = []
    cols = [(9, 57), (76, 127), (141, 197), (205, 267)]
    for ci, (x0, x1) in enumerate(cols):
        for ri, (y0, y1) in enumerate(find_y_bands(mask[:, x0:x1])):
            items.append({"crop": arr[y0:y1, x0:x1], "source": "SN3_AXE", "game": "SN3", "family": "AXE", "row": ri, "col": ci, "rotate": -45.0})
    return items


def extract_sn3_spears() -> list[dict]:
    fname = "Game Boy Advance - Summon Night_ Swordcraft Story 3 - Weapons - Spears.png"
    arr = np.array(Image.open(os.path.join(SRC_DIR, fname)).convert("RGBA"))
    mask = np.any(arr[:, :, :3] > 8, axis=2)
    mask[270:, :140] = False
    items = []
    cols = [(8, 67), (81, 142), (156, 215), (224, 295), (297, 376)]
    for ci, (x0, x1) in enumerate(cols):
        ybands = find_y_bands(mask[:, x0:x1])
        for ri, (y0, y1) in enumerate(ybands):
            if y1 - y0 > 55:
                # White box with 4 identical pink key-spears -> keep only 1 copy in col 3, skip col 4 duplicate box
                if ci == 3:
                    sub = arr[187:214, 232:286]
                    items.append({"crop": sub, "source": "SN3_SPEAR", "game": "SN3", "family": "SPEAR", "row": ri, "col": ci, "rotate": -45.0})
                continue
            items.append({"crop": arr[y0:y1, x0:x1], "source": "SN3_SPEAR", "game": "SN3", "family": "SPEAR", "row": ri, "col": ci, "rotate": -45.0})
    return items


def extract_sn3_bows() -> list[dict]:
    fname = "Game Boy Advance - Summon Night_ Swordcraft Story 3 - Weapons - Bows (1).png"
    arr = np.array(Image.open(os.path.join(SRC_DIR, fname)).convert("RGBA"))
    mask = np.any(arr[:, :, :3] > 8, axis=2)
    mask[376:, :165] = False
    items = []
    cols = [(8, 69), (74, 136), (143, 206), (214, 278)]
    for ci, (x0, x1) in enumerate(cols):
        # Raw sub-bands (bows + arrows); pair consecutive bands ONLY while combined height <= 33px
        raw_bands = find_y_bands(mask[:, x0:x1], merge_gap=1)
        merged = []
        for y0, y1 in raw_bands:
            if merged and (y1 - merged[-1][0]) <= 33:
                merged[-1] = (merged[-1][0], y1)
            else:
                merged.append((y0, y1))
        for ri, (y0, y1) in enumerate(merged):
            items.append({"crop": arr[y0:y1, x0:x1], "source": "SN3_BOW", "game": "SN3", "family": "BOW", "row": ri, "col": ci, "rotate": -45.0})
    return items


def main():
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    # Keep only original 1..150 entries if re-run
    catalog = [e for e in catalog if int(e["id"].split("_")[1]) <= 150]
    next_id = 151

    raw_items = []
    raw_items.extend(extract_sn2_sheet("Game Boy Advance - Summon Night_ Swordcraft Story 2 - Weapons - Sword Weapons.png", "SWORD"))
    raw_items.extend(extract_sn2_sheet("Game Boy Advance - Summon Night_ Swordcraft Story 2 - Weapons - Axe Weapons.png", "AXE"))
    raw_items.extend(extract_sn2_sheet("Game Boy Advance - Summon Night_ Swordcraft Story 2 - Weapons - Spear Weapons.png", "SPEAR"))
    raw_items.extend(extract_sn3_swords())
    raw_items.extend(extract_sn3_axes())
    raw_items.extend(extract_sn3_spears())

    meta_list = []
    counts = {}
    for item in raw_items:
        icon_img, mean_rgb = format_as_32x32_icon(item["crop"], rotate_deg=item["rotate"])
        # Remove tiny false-positive dust specks
        arr = np.array(icon_img)
        if np.sum(arr[:, :, 3] > 0) < 18:
            continue

        sid = f"sword_{next_id}"
        fname = f"{sid}.png"
        icon_img.save(os.path.join(OUT_DIR, fname), optimize=True)

        catalog.append({
            "id": sid,
            "file": f"/swords/{fname}",
            "source": item["source"],
            "row": item["row"],
            "col": item["col"],
        })
        meta_list.append({
            "num": next_id,
            "id": sid,
            "file": f"/swords/{fname}",
            "source": item["source"],
            "game": item["game"],
            "family": item["family"],
            "element": infer_element(mean_rgb),
            "row": item["row"],
            "col": item["col"],
        })
        counts[item["source"]] = counts.get(item["source"], 0) + 1
        next_id += 1

    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2)
    with open(META_OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(meta_list, f, indent=2)

    print(f"Extracted {len(meta_list)} new 32x32 weapon icons (sword_151..sword_{next_id - 1})")
    print("Breakdown by sheet:", counts)


if __name__ == "__main__":
    main()
