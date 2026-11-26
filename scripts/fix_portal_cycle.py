from pathlib import Path
import math
from PIL import Image

ROOT = Path(r"c:\Users\Noctus\Documents\Tessera_legacy")
PORTALS_DIR = ROOT / "public" / "portals"
PREVIEW = Path(r"C:\Users\Noctus\.gemini\antigravity\brain\ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70\scratch\portal_cycle_fixed_samples.png")
TORII_COMP = Path(r"C:\Users\Noctus\.gemini\antigravity\brain\ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70\scratch\torii_portal_composite.png")


def fix_portal_sheet(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    fw, fh = im.width // 26, im.height  # 146 x 140
    # Already padded if fh >= 156
    orig_h = min(fh, 140)
    new_h = 156
    out = Image.new("RGBA", (fw * 26, new_h), (0, 0, 0, 0))

    for f in range(26):
        cell = im.crop((f * fw, 0, (f + 1) * fw, orig_h)).copy()
        px = cell.load()

        # Scrub stray neighbor-column border flecks on far right/left of frame (> 3px detached)
        for y in range(orig_h):
            for x in range(fw - 12, fw):
                r, g, b, a = px[x, y]
                if a > 0 and all(px[x - d, y][3] == 0 for d in (3, 4, 5)):
                    px[x, y] = (0, 0, 0, 0)
                if "arcane" in path.name and r > g + 40 and b < 90 and x > 110:
                    px[x, y] = (0, 0, 0, 0)

        nf = Image.new("RGBA", (fw, new_h), (0, 0, 0, 0))
        nf.paste(cell, (0, 0))
        npx = nf.load()

        # Find bounding width at y = orig_h - 1 (row 139) where vortex gets clipped
        bot_xs = [x for x in range(12, fw - 12) if px[x, orig_h - 1][3] > 20]
        if len(bot_xs) >= 12:
            # Find core vortex midpoint in y=116..132
            row_xs = [x for x in range(18, fw - 18) if px[x, 122][3] > 40]
            mid_x = (min(row_xs) + max(row_xs)) / 2.0 if row_xs else (min(bot_xs) + max(bot_xs)) / 2.0
            left_b, right_b = min(bot_xs), max(bot_xs)
            half_w = max(24.0, (right_b - left_b) / 2.0)
            eye_y = 122.0
            max_dy = 27.5  # extends ~10px smoothly below row 139

            for y in range(orig_h, new_h):
                dy = y - eye_y
                if dy > max_dy:
                    continue
                row_ratio = math.sqrt(max(0.0, 1.0 - (dy / max_dy) ** 2))
                row_half_w = half_w * row_ratio
                edge_fade = max(0.0, min(1.0, (max_dy - dy) / 5.5))
                src_y = int(round(2 * eye_y - y))
                if not (98 <= src_y < orig_h):
                    continue
                for x in range(fw):
                    dx = x - mid_x
                    if abs(dx) > row_half_w:
                        continue
                    src_x = int(round(2 * mid_x - x))
                    if 0 <= src_x < fw:
                        r, g, b, a = px[src_x, src_y]
                        if a > 15:
                            horiz_fade = max(0.0, min(1.0, (row_half_w - abs(dx)) / 5.0))
                            na = int(round(a * edge_fade * horiz_fade))
                            if na > 10:
                                npx[x, y] = (r, g, b, na)

        out.paste(nf, (f * fw, 0))

    out.save(path)
    return out


for sheet_path in sorted(PORTALS_DIR.glob("portal_cycle_*.png")):
    res = fix_portal_sheet(sheet_path)
    print(f"Updated {sheet_path.name}: {res.size}")
    if sheet_path.name == "portal_cycle_arcane.png":
        fw = res.width // 26
        samples = Image.new("RGBA", (5 * fw, 156), (20, 25, 35, 255))
        for idx, fi in enumerate([0, 5, 10, 15, 20]):
            samples.paste(res.crop((fi * fw, 0, (fi + 1) * fw, 156)), (idx * fw, 0))
        samples.save(PREVIEW)

        torii = Image.open(ROOT / "public" / "map" / "prop_torii.png").convert("RGBA")
        f15 = res.crop((15 * fw, 0, 16 * fw, 156)).resize((104, 111), Image.NEAREST)
        comp = Image.new("RGBA", (220, 190), (88, 62, 105, 255))
        comp.paste(f15, ((220 - 104) // 2, 190 - 7 - 111), f15)
        comp.paste(torii, ((220 - 192) // 2, 190 - 6 - 180), torii)
        comp.resize((440, 380), Image.NEAREST).save(TORII_COMP)
