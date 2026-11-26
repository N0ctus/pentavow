import json
import os
from PIL import Image
import numpy as np

SRC_DIR = r"C:\Users\Noctus\Documents\Tessera_legacy\weather"
OUT_DIR = r"C:\Users\Noctus\Documents\Tessera_legacy\public\pmd_weather"
os.makedirs(OUT_DIR, exist_ok=True)


def strip_solid_bg(arr: np.ndarray, bg_rgb=(90, 90, 120), tol=3) -> np.ndarray:
    """Convert exact solid sheet panel background color to full transparency."""
    out = arr.copy()
    diff = np.abs(out[:, :, :3].astype(np.int16) - np.array(bg_rgb, dtype=np.int16))
    bg_mask = np.all(diff <= tol, axis=2)
    out[bg_mask] = [0, 0, 0, 0]
    return out


def extract_rain(manifest: dict):
    path = os.path.join(SRC_DIR, "Game Boy Advance - Pokemon Mystery Dungeon_ Red Rescue Team - Weather - Rain (1).png")
    src = np.array(Image.open(path).convert("RGBA"))
    fw, fh = 240, 160
    cols, rows = 5, 13
    frames = 61  # 12 * 5 + 1

    sheet = np.zeros((rows * fh, cols * fw, 4), dtype=np.uint8)
    for idx in range(frames):
        r = idx // cols
        c = idx % cols
        sx = 8 + c * (fw + 8)
        sy = 8 + r * (fh + 8)
        cell = strip_solid_bg(src[sy:sy + fh, sx:sx + fw], (90, 90, 120))
        dx = c * fw
        dy = r * fh
        sheet[dy:dy + fh, dx:dx + fw] = cell

    out_path = os.path.join(OUT_DIR, "rain_frames.png")
    Image.fromarray(sheet, "RGBA").save(out_path, optimize=True)
    manifest["rain"] = {"file": "rain_frames.png", "fw": fw, "fh": fh, "cols": cols, "rows": rows, "frames": frames, "fps": 22}


def extract_sunny(manifest: dict):
    path = os.path.join(SRC_DIR, "Game Boy Advance - Pokemon Mystery Dungeon_ Red Rescue Team - Weather - Sunny (1).png")
    src = np.array(Image.open(path).convert("RGBA"))
    fw, fh = 240, 112
    cols, rows = 3, 5
    frames = 13  # 4 * 3 + 1

    sheet = np.zeros((rows * fh, cols * fw, 4), dtype=np.uint8)
    for idx in range(frames):
        r = idx // cols
        c = idx % cols
        sx = 8 + c * (fw + 8)
        sy = 8 + r * (fh + 8)
        cell = strip_solid_bg(src[sy:sy + fh, sx:sx + fw], (90, 90, 120))
        dx = c * fw
        dy = r * fh
        sheet[dy:dy + fh, dx:dx + fw] = cell

    out_path = os.path.join(OUT_DIR, "sunny_frames.png")
    Image.fromarray(sheet, "RGBA").save(out_path, optimize=True)
    manifest["sunny"] = {"file": "sunny_frames.png", "fw": fw, "fh": fh, "cols": cols, "rows": rows, "frames": frames, "fps": 10}


def extract_misc(manifest: dict):
    path = os.path.join(SRC_DIR, "Game Boy Advance - Pokemon Mystery Dungeon_ Red Rescue Team - Weather - Miscellaneous Weather Effects.png")
    src = np.array(Image.open(path).convert("RGBA"))

    # 1. Cloud shadows: (8, 16, 728, 424) -> 720x408
    clouds = strip_solid_bg(src[16:424, 8:728], (90, 90, 120))
    cloud_mask = clouds[:, :, 3] > 0
    clouds[cloud_mask] = [10, 18, 36, 95]  # cool slate shadow
    Image.fromarray(clouds, "RGBA").save(os.path.join(OUT_DIR, "cloud_shadows.png"), optimize=True)
    manifest["cloudShadows"] = {"file": "cloud_shadows.png", "fw": 720, "fh": 408}

    # 2. Snow: 4x4 grid of 64x32 tiles starting at (8, 440), x-stride 72, y-stride 40
    snow_sheet = np.zeros((4 * 32, 4 * 64, 4), dtype=np.uint8)
    for r in range(4):
        for c in range(4):
            sx, sy = 8 + c * 72, 440 + r * 40
            cell = strip_solid_bg(src[sy:sy + 32, sx:sx + 64], (90, 90, 120))
            snow_sheet[r * 32:(r + 1) * 32, c * 64:(c + 1) * 64] = cell
    Image.fromarray(snow_sheet, "RGBA").save(os.path.join(OUT_DIR, "snow_frames.png"), optimize=True)
    manifest["snow"] = {"file": "snow_frames.png", "fw": 64, "fh": 32, "cols": 4, "rows": 4, "frames": 16, "fps": 16}

    # 3. Blizzard: 4x4 grid of 32x32 tiles starting at (304, 440), x-stride 40, y-stride 40
    blizz_sheet = np.zeros((4 * 32, 4 * 32, 4), dtype=np.uint8)
    for r in range(4):
        for c in range(4):
            sx, sy = 304 + c * 40, 440 + r * 40
            cell = strip_solid_bg(src[sy:sy + 32, sx:sx + 32], (90, 90, 120))
            blizz_sheet[r * 32:(r + 1) * 32, c * 32:(c + 1) * 32] = cell
    Image.fromarray(blizz_sheet, "RGBA").save(os.path.join(OUT_DIR, "blizzard_frames.png"), optimize=True)
    manifest["blizzard"] = {"file": "blizzard_frames.png", "fw": 32, "fh": 32, "cols": 4, "rows": 4, "frames": 16, "fps": 22}

    # 4. Snow (Dungeon): 4x4 grid of 32x32 tiles starting at (472, 440), x-stride 40, y-stride 40
    dsnow_sheet = np.zeros((4 * 32, 4 * 32, 4), dtype=np.uint8)
    for r in range(4):
        for c in range(4):
            sx, sy = 472 + c * 40, 440 + r * 40
            cell = strip_solid_bg(src[sy:sy + 32, sx:sx + 32], (90, 90, 120))
            dsnow_sheet[r * 32:(r + 1) * 32, c * 32:(c + 1) * 32] = cell
    Image.fromarray(dsnow_sheet, "RGBA").save(os.path.join(OUT_DIR, "snow_dungeon_frames.png"), optimize=True)
    manifest["snowDungeon"] = {"file": "snow_dungeon_frames.png", "fw": 32, "fh": 32, "cols": 4, "rows": 4, "frames": 16, "fps": 14}

    # 5. Sandstorm Dark & Light: (8..128, 608..640) and (136..256, 608..640)
    s_dark = src[608:640, 8:128].copy()
    s_dark[:, :, 3] = 105
    Image.fromarray(s_dark, "RGBA").save(os.path.join(OUT_DIR, "sandstorm_dark.png"), optimize=True)

    s_light = src[608:640, 136:256].copy()
    s_light[:, :, 3] = 115
    Image.fromarray(s_light, "RGBA").save(os.path.join(OUT_DIR, "sandstorm_light.png"), optimize=True)
    manifest["sandstorm"] = {
        "darkFile": "sandstorm_dark.png",
        "lightFile": "sandstorm_light.png",
        "fw": 120,
        "fh": 32,
    }


def extract_fog(manifest: dict):
    path = os.path.join(SRC_DIR, "Game Boy Advance - Pokemon Mystery Dungeon_ Red Rescue Team - Weather - Fog.png")
    src = np.array(Image.open(path).convert("RGBA"))

    # Raw palette mist (dark bg -> black becomes alpha 0, bright wisps get clean translucent alpha)
    fog_raw = src[16:136, 8:344].copy()
    lum = fog_raw[:, :, :3].max(axis=2).astype(np.float32)
    alpha = np.clip((lum / 170.0) * 165.0, 0, 180).astype(np.uint8)
    fog_raw[:, :, 0] = np.clip(fog_raw[:, :, 0].astype(np.int16) + 55, 0, 255).astype(np.uint8)
    fog_raw[:, :, 1] = np.clip(fog_raw[:, :, 1].astype(np.int16) + 65, 0, 255).astype(np.uint8)
    fog_raw[:, :, 2] = np.clip(fog_raw[:, :, 2].astype(np.int16) + 75, 0, 255).astype(np.uint8)
    fog_raw[:, :, 3] = alpha
    Image.fromarray(fog_raw, "RGBA").save(os.path.join(OUT_DIR, "fog_dark.png"), optimize=True)

    # White mist (Ending cutscene palette: excess brightness above grey 189 -> crisp white clouds)
    fog_light = src[152:272, 8:344].copy()
    lum_l = fog_light[:, :, :3].mean(axis=2).astype(np.float32)
    alpha_l = np.clip(((lum_l - 189.0) / 64.0) * 185.0, 0, 195).astype(np.uint8)
    fog_light[:, :, 0] = 235
    fog_light[:, :, 1] = 245
    fog_light[:, :, 2] = 255
    fog_light[:, :, 3] = alpha_l
    Image.fromarray(fog_light, "RGBA").save(os.path.join(OUT_DIR, "fog_light.png"), optimize=True)
    manifest["fog"] = {"darkFile": "fog_dark.png", "lightFile": "fog_light.png", "fw": 336, "fh": 120}


def extract_embers(manifest: dict):
    folder = os.path.join(SRC_DIR, "Game Boy Advance - Pokemon Mystery Dungeon_ Red Rescue Team - Weather - Embers")
    # Crop 480x320 out of 488x328 and dilate 1px sparks slightly with warm orange glow so they pop visibly
    fw, fh = 480, 320
    cols, rows = 4, 4
    frames = 13  # Embers 1..13 (14 is empty fadeout)
    sheet = np.zeros((rows * fh, cols * fw, 4), dtype=np.uint8)

    for idx in range(frames):
        p = os.path.join(folder, f"Embers {idx + 1}.png")
        src = np.array(Image.open(p).convert("RGBA"))[4:4 + fh, 4:4 + fw]
        canvas = np.zeros((fh, fw, 4), dtype=np.uint8)
        ys, xs = np.where(src[:, :, 3] > 0)
        for y, x in zip(ys, xs):
            # Subtle 1px warm ember glow cross
            for dy, dx, col in [
                (-1, 0, (249, 115, 22, 130)),
                (1, 0, (249, 115, 22, 130)),
                (0, -1, (249, 115, 22, 130)),
                (0, 1, (249, 115, 22, 130)),
                (1, 1, (251, 146, 60, 175)),
            ]:
                ny, nx = y + dy, x + dx
                if 0 <= ny < fh and 0 <= nx < fw and canvas[ny, nx, 3] == 0:
                    canvas[ny, nx] = col
            canvas[y, x] = src[y, x]

        r = idx // cols
        c = idx % cols
        sheet[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw] = canvas

    Image.fromarray(sheet, "RGBA").save(os.path.join(OUT_DIR, "embers_frames.png"), optimize=True)
    manifest["embers"] = {"file": "embers_frames.png", "fw": fw, "fh": fh, "cols": cols, "rows": rows, "frames": frames, "fps": 12}


def extract_hail(manifest: dict):
    folder = os.path.join(SRC_DIR, "Game Boy Advance - Pokemon Mystery Dungeon_ Red Rescue Team - Weather - Hail", "Hail")
    fw, fh = 240, 160
    cols, rows = 5, 13
    frames = 65
    sheet = np.zeros((rows * fh, cols * fw, 4), dtype=np.uint8)

    for idx in range(frames):
        p = os.path.join(folder, f"Hail{idx + 1:02d}.png")
        cell = np.array(Image.open(p).convert("RGBA"))
        r = idx // cols
        c = idx % cols
        sheet[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw] = cell

    Image.fromarray(sheet, "RGBA").save(os.path.join(OUT_DIR, "hail_frames.png"), optimize=True)
    manifest["hail"] = {"file": "hail_frames.png", "fw": fw, "fh": fh, "cols": cols, "rows": rows, "frames": frames, "fps": 22}


def main():
    manifest = {}
    extract_rain(manifest)
    extract_sunny(manifest)
    extract_misc(manifest)
    extract_fog(manifest)
    extract_embers(manifest)
    extract_hail(manifest)

    manifest_path = os.path.join(OUT_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Successfully extracted PMD weather sheets -> {manifest_path}")
    for k, v in manifest.items():
        print(" ", k, v)


if __name__ == "__main__":
    main()
