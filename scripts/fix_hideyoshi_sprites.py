from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(r"c:\Users\Noctus\Documents\Tessera_legacy")
SRC = ROOT / "FE Ennemies" / "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Special Units - Hideyoshi Toyotomi.png"
OUT = ROOT / "public" / "enemies" / "hideyoshi"
PREVIEW = Path(r"C:\Users\Noctus\.gemini\antigravity\brain\ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70\scratch\hideyoshi_fixed_all.png")

src = Image.open(SRC).convert("RGBA")
w, h = src.size
ap = src.getchannel("A").load()


def find_bands(proj, min_gap=6, min_len=14):
    bands, in_b, s, gap = [], False, 0, 0
    for i, v in enumerate(proj):
        if v > 0:
            if not in_b:
                s, in_b = i, True
            gap = 0
        elif in_b:
            gap += 1
            if gap >= min_gap:
                if i - gap + 1 - s >= min_len:
                    bands.append((s, i - gap + 1))
                in_b = False
    if in_b and len(proj) - gap - s >= min_len:
        bands.append((s, len(proj) - gap))
    return bands


rows = find_bands([sum(1 for x in range(w) if ap[x, y] > 10) for y in range(h)], 8, 20)
cells = []
for ry0, ry1 in rows:
    cb = find_bands([sum(1 for y in range(ry0, ry1) if ap[x, y] > 10) for x in range(w)], 6, 14)
    cells.append((ry0, ry1, cb))

CW, CH = 128, 115
MARGIN_BOTTOM = 12

row_bottoms = []
for ry0, ry1, cb in cells:
    bots = []
    for cx0, cx1 in cb[:4]:
        bb = src.crop((cx0, ry0, cx1, ry1)).getbbox()
        if bb:
            bots.append(ry0 + bb[3])
    row_bottoms.append(max(bots))


def place_cell(ri, ci):
    ry0, ry1, cb = cells[ri]
    cx0, cx1 = cb[ci]
    sub = src.crop((cx0, ry0, cx1, ry1))
    bb = sub.getbbox()
    trimmed = sub.crop(bb)
    sw, sh = trimmed.size
    abs_bot = ry0 + bb[3]
    lift = max(0, row_bottoms[ri] - abs_bot)

    cy0 = max(ry0, abs_bot - 18)
    cx_pts = [x for x in range(cx0, cx1) if any(ap[x, y] > 40 for y in range(cy0, abs_bot))]
    cloud_mid_in_trimmed = ((min(cx_pts) + max(cx_pts)) / 2 - (cx0 + bb[0])) if cx_pts else sw / 2
    px = int(round(CW / 2 - cloud_mid_in_trimmed))
    px = max(2, min(CW - sw - 2, px))
    py = max(2, min(CH - sh - 2, CH - MARGIN_BOTTOM - sh - lift))

    out = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    out.paste(trimmed, (px, py), trimmed)
    return out


frames = {
    "idle_0.png": place_cell(0, 0),
    "idle_1.png": place_cell(0, 1),
    "idle_2.png": place_cell(0, 2),
    "idle_3.png": place_cell(0, 3),
    "attack_0.png": place_cell(0, 4),
    "attack_1.png": place_cell(1, 1),
    "attack_2.png": place_cell(1, 2),
    "attack_3.png": place_cell(1, 3),
    "attack_4.png": place_cell(1, 4),
    "run_0.png": place_cell(2, 0),
    "run_1.png": place_cell(2, 1),
    "run_2.png": place_cell(2, 2),
    "run_3.png": place_cell(2, 3),
}

sheet = Image.new("RGBA", (len(frames) * 134, 145), (30, 35, 45, 255))
draw = ImageDraw.Draw(sheet)
for i, (name, im) in enumerate(sorted(frames.items())):
    im.save(OUT / name)
    sheet.paste(im, (i * 134, 22), im)
    draw.text((i * 134 + 4, 4), name.replace(".png", ""), fill=(255, 235, 130, 255))
    draw.rectangle([i * 134, 22, i * 134 + CW - 1, 22 + CH - 1], outline=(80, 110, 150, 255))
sheet.save(PREVIEW)
print("Saved 13 Hideyoshi frames at", CW, "x", CH)
