import json
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(r"c:\Users\Noctus\Documents\Tessera_legacy")
SRC_DIR = ROOT / "caracters"
PUBLIC_CHARS = ROOT / "public" / "characters"
PUBLIC_ENEMIES = ROOT / "public" / "enemies"
PREVIEW_OUT = Path(r"C:\Users\Noctus\.gemini\antigravity\brain\ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70\scratch\caracters_extracted_check.png")

# Target extraction specs: (kind, target_folder, source_filename)
# kind: 'char' -> public/characters/<target_folder>
#       'enemy' -> public/enemies/<target_folder>
#       'boss' -> public/enemies/<target_folder>
EXTRACT_SPECS = [
    # --- 17 NEW CLASS HERO SKINS (1 per playable class) ---
    ("char", "warrior_musashi", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Special Units - Musashi Miyamoto.png"),
    ("char", "guardian_tadakatsu", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Special Units - Tadakatsu Honda.png"),
    ("char", "berserker_katsuie", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - The Ambition of Oda Nobuna - Katsuie Shibata.png"),
    ("char", "rogue_sarutobi", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku BASARA Series - Sasuke Sarutobi.png"),
    ("char", "assassin_gennosuke", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Basilisk - Gennosuke Kouga.png"),
    ("char", "hunter_saika", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku BASARA Series - Magoichi Saika.png"),
    ("char", "mage_neptune", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Hyperdimension Neptunia - Neptune.png"),
    ("char", "archmage_noire", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Hyperdimension Neptunia - Noire.png"),
    ("char", "warlock_oichi", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku BASARA 4 Sumeragi - Oichi.png"),
    ("char", "death_knight_kurozonae", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Color Change - Messhi Kurozonae.png"),
    ("char", "demon_hunter_masamune", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku BASARA Series - Masamune Date.png"),
    ("char", "priest_vert", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Hyperdimension Neptunia - Vert.png"),
    ("char", "paladin_satake", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Color Change - Yoshishige Satake - Heaven.png"),
    ("char", "druid_jiraiya", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Special Units - Jiraiya.png"),
    ("char", "shaman_jinrai", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Color Change - Jinrai Aozonae.png"),
    ("char", "monk_inshun", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Samurai Girls - Inshun Hozoin.png"),
    ("char", "evoker_seiryu", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Color Change - Masakage Yamagata - Seiryu.png"),

    # --- 10 NEW FIELD & CORNER ENEMIES ---
    ("enemy", "hotarubi", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Basilisk - Hotarubi.png"),
    ("enemy", "akeginu", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Basilisk - Akeginu.png"),
    ("enemy", "jimushi", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Basilisk - Juubei Jimushi.png"),
    ("enemy", "kotaro", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Special Units - Kotaro Fuma.png"),
    ("enemy", "saizo", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Special Units - Saizo Kirigakure.png"),
    ("enemy", "dartagnan", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Samurai Girls - Charles d'Artagnan.png"),
    ("enemy", "mitsunari", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku BASARA Series - Mitsunari Ishida.png"),
    ("enemy", "goemon", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - The Ambition of Oda Nobuna - Goemon Hachisuka.png"),
    ("enemy", "momotaro", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Special Units - Momotaro.png"),
    ("enemy", "hanbei", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku BASARA 4 Sumeragi - Hanbei Takenaka.png"),

    # --- 6 NEW WORLD / DUNGEON BOSSES ---
    ("boss", "boss_nobunaga", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku Night Blood Koumei - Nobunaga Oda.png"),
    ("boss", "boss_tenzen", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Basilisk - Tenzen Yakushiji.png"),
    ("boss", "boss_kenshin", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku Night Blood Koumei - Kenshin Uesugi.png"),
    ("boss", "boss_taishogun", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Special Units - Seii Taishogun.png"),
    ("boss", "boss_dairokuten_maou", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Color Change - Dairokuten Maou Alt.png"),
    ("boss", "boss_ieyasu", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku BASARA 4 Sumeragi - Ieyasu Tokugawa.png"),
]


def find_bands(proj, min_gap=8, min_len=14):
    bands = []
    in_band = False
    start = 0
    gap = 0
    for i, val in enumerate(proj):
        if val > 0:
            if not in_band:
                start = i
                in_band = True
            gap = 0
        else:
            if in_band:
                gap += 1
                if gap >= min_gap:
                    end = i - gap + 1
                    if end - start >= min_len:
                        bands.append((start, end))
                    in_band = False
                    gap = 0
    if in_band:
        end = len(proj) - gap
        if end - start >= min_len:
            bands.append((start, end))
    return bands


def slice_row_cells(im, ry0, ry1, ap):
    w, _ = im.size
    col_proj = [sum(1 for y in range(ry0, ry1) if ap[x, y] > 10) for x in range(w)]

    # 1. Try progressive gap tightening (8 -> 4 -> 2 -> 1 px blank columns)
    #    This cleanly separates frames whose horizontal margins come within 1-2 px without slicing any pixel!
    best_cols = find_bands(col_proj, min_gap=8, min_len=14)
    if len(best_cols) != 8 or any((x1 - x0) > 160 for x0, x1 in best_cols):
        for mg in (4, 2, 1):
            cand = find_bands(col_proj, min_gap=mg, min_len=14)
            # Prefer a split closer to 8 columns without over-splitting detached companions/wings (> 8)
            if len(cand) <= 8 and (len(cand) >= len(best_cols) or len(best_cols) > 8):
                best_cols = cand
            if len(best_cols) == 8 and all((x1 - x0) <= 160 for x0, x1 in best_cols):
                break

    # 2. ONLY split an anomalously wide merged band (> 165px) at the lowest vertical valley near expected cell splits
    cell_w = w / 8.0
    refined = []
    for x0, x1 in best_cols:
        span = x1 - x0
        if span > 165:
            # Estimate how many poses are merged (usually 2)
            parts = max(2, int(round(span / cell_w)))
            sub_cuts = [x0]
            for p in range(1, parts):
                est = int(round(x0 + p * (span / parts)))
                lo = max(x0 + 18, est - 24)
                hi = min(x1 - 18, est + 24)
                if lo < hi:
                    best_x = min(range(lo, hi + 1), key=lambda x: col_proj[x])
                    sub_cuts.append(best_x)
            sub_cuts.append(x1)
            for k in range(len(sub_cuts) - 1):
                if sub_cuts[k + 1] - sub_cuts[k] >= 16:
                    refined.append((sub_cuts[k], sub_cuts[k + 1]))
        else:
            refined.append((x0, x1))

    cells = []
    for cx0, cx1 in refined:
        crop = im.crop((cx0, ry0, cx1, ry1))
        bb = crop.getbbox()
        if bb:
            cells.append((crop.crop(bb), ry1 - (ry0 + bb[3])))  # (trimmed_img, dist_above_row_bottom)
    return cells


def place_on_canvas(trimmed_img, lift_px, canvas_w=120, canvas_h=118, margin_bottom=11):
    sw, sh = trimmed_img.size
    # Guard if giant fx sprite exceeds canvas width/height slightly
    if sw > canvas_w - 4 or sh > canvas_h - 4:
        # Preserve pixel crispness by scaling down gently only if oversized
        scale = min((canvas_w - 4) / sw, (canvas_h - 4) / sh)
        nw = max(1, int(round(sw * scale)))
        nh = max(1, int(round(sh * scale)))
        trimmed_img = trimmed_img.resize((nw, nh), Image.NEAREST)
        sw, sh = nw, nh

    out = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    px = (canvas_w - sw) // 2
    # Anchor sprite feet cleanly near bottom margin (preserving realistic jump height if lifted > 8px)
    effective_lift = min(lift_px, max(0, canvas_h - margin_bottom - sh))
    py = canvas_h - margin_bottom - sh - effective_lift
    py = max(2, min(canvas_h - sh - 2, py))
    out.paste(trimmed_img, (px, py), trimmed_img)
    return out


def extract_one(kind, folder, fname):
    src_path = SRC_DIR / fname
    im = Image.open(src_path).convert("RGBA")
    w, h = im.size
    ap = im.getchannel("A").load()

    row_proj = [sum(1 for x in range(w) if ap[x, y] > 10) for y in range(h)]
    rows = find_bands(row_proj, min_gap=8, min_len=20)
    if len(rows) < 3:
        rows = find_bands(row_proj, min_gap=4, min_len=16)

    row0 = slice_row_cells(im, rows[0][0], rows[0][1], ap) if len(rows) >= 1 else []
    row1 = slice_row_cells(im, rows[1][0], rows[1][1], ap) if len(rows) >= 2 else row0
    row2 = slice_row_cells(im, rows[2][0], rows[2][1], ap) if len(rows) >= 3 else row0

    # Baseline floor clearance for row 0 idle & row 2 run (so standing sprites touch shadow cleanly)
    r0_floor = min(c[1] for c in row0[:min(4, len(row0))]) if row0 else 0
    r1_floor = min(c[1] for c in row1[:min(3, len(row1))]) if row1 else 0
    r2_floor = min(c[1] for c in row2[:min(4, len(row2))]) if row2 else 0

    def norm(cell, floor_base):
        img, dist = cell
        return (img, max(0, dist - floor_base))

    # Pick idle_0..3 from row0[0..3]
    idle_frames = [norm(row0[i % len(row0)], r0_floor) for i in range(4)]

    # Pick run_0..3 evenly across row2
    if len(row2) >= 7:
        run_idxs = [0, 2, 4, 6]
    elif len(row2) >= 4:
        run_idxs = [0, 1, 2, 3]
    else:
        run_idxs = [i % len(row2) for i in range(4)]
    run_frames = [norm(row2[i], r2_floor) for i in run_idxs]

    # Pick attack_0..4: row0 windup/slash + row1 special aura bursts
    # Filter out tiny/sparse smoke-only vanish frames when picking frames
    def is_visible_body(c):
        im_c = c[0]
        if im_c.size[0] < 22 or im_c.size[1] < 28:
            return False
        opaque = sum(1 for a in im_c.getchannel("A").getdata() if a > 20)
        return opaque >= 260

    atk_list = []
    r0_a0 = row0[4] if len(row0) > 4 and is_visible_body(row0[4]) else row0[min(3, len(row0) - 1)]
    r0_a1 = row0[5] if len(row0) > 5 and is_visible_body(row0[5]) else (row1[0] if len(row1) > 0 and is_visible_body(row1[0]) else r0_a0)
    atk_list.extend([norm(r0_a0, r0_floor), norm(r0_a1, r0_floor)])

    for j in range(3):
        c = row1[j % len(row1)]
        if not is_visible_body(c) and len(row1) > 3:
            c = row1[min(len(row1) - 1, j + 1)]
        atk_list.append(norm(c, r1_floor))

    # Determine unified canvas size (default 116x115 for chars/enemies, 124x120 if wide slash/aura)
    all_imgs = idle_frames + run_frames + atk_list
    max_w = max(img.size[0] for img, _ in all_imgs)
    max_h = max(img.size[1] for img, _ in all_imgs)
    cw = max(116, min(140, max_w + 10))
    ch = max(115, min(136, max_h + 16))

    out_dir = (PUBLIC_CHARS if kind == "char" else PUBLIC_ENEMIES) / folder
    out_dir.mkdir(parents=True, exist_ok=True)

    saved_samples = {}
    for i, (img, lift) in enumerate(idle_frames):
        frame = place_on_canvas(img, lift, cw, ch)
        frame.save(out_dir / f"idle_{i}.png")
        if i == 0:
            saved_samples["idle_0"] = frame
    for i, (img, lift) in enumerate(run_frames):
        frame = place_on_canvas(img, lift, cw, ch)
        frame.save(out_dir / f"run_{i}.png")
        if i == 1:
            saved_samples["run_1"] = frame
    for i, (img, lift) in enumerate(atk_list):
        frame = place_on_canvas(img, lift, cw, ch)
        frame.save(out_dir / f"attack_{i}.png")
        if i == 1:
            saved_samples["attack_1"] = frame
        if i == 4:
            saved_samples["attack_4"] = frame

    return cw, ch, len(row0), len(row1), len(row2), saved_samples


def main():
    meta = []
    # Contact strip preview: each character shows 4 tiles (idle_0, run_1, attack_1, attack_4)
    cell_w, cell_h = 100, 96
    sheet = Image.new("RGBA", (4 * cell_w + 220, len(EXTRACT_SPECS) * cell_h), (20, 20, 32, 255))
    draw = ImageDraw.Draw(sheet)

    for idx, (kind, folder, fname) in enumerate(EXTRACT_SPECS):
        cw, ch, n0, n1, n2, samples = extract_one(kind, folder, fname)
        meta.append({"kind": kind, "folder": folder, "cw": cw, "ch": ch, "rows": [n0, n1, n2]})
        y = idx * cell_h
        draw.text((6, y + 36), f"[{kind.upper()}] {folder}", fill=(255, 220, 120, 255))
        draw.text((6, y + 52), f"{cw}x{ch} r=[{n0},{n1},{n2}]", fill=(160, 200, 240, 255))
        for k_i, key in enumerate(["idle_0", "run_1", "attack_1", "attack_4"]):
            im = samples[key].resize((cell_w - 8, cell_h - 8), Image.NEAREST)
            sheet.paste(im, (220 + k_i * cell_w + 4, y + 4), im)
        print(f"Extracted {kind:5s} -> {folder:22s} ({cw}x{ch}) rows=[{n0},{n1},{n2}]")

    PREVIEW_OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(PREVIEW_OUT)
    print(f"\nDone! Extracted {len(EXTRACT_SPECS)} characters. Preview saved at {PREVIEW_OUT}")


if __name__ == "__main__":
    main()
