from collections import deque
from pathlib import Path
import json
from PIL import Image, ImageDraw

ROOT = Path(r"c:\Users\Noctus\Documents\Tessera_legacy")
MONSTERS_DIR = ROOT / "Monsters"
OUT_DIR = ROOT / "public" / "enemies"
PREVIEW = Path(r"C:\Users\Noctus\.gemini\antigravity\brain\ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70\scratch\monsters_cleaned_all.png")

SPECS = [
    # --- 3 WORLD BOSSES ---
    ("boss_estoque",       "Mobile - Suikoden STAR LEAP - Bosses - Estoque",            True),
    ("boss_redulse_a",     "Mobile - Suikoden STAR LEAP - Bosses - Red Ulse A",         True),
    ("boss_redulse_b",     "Mobile - Suikoden STAR LEAP - Bosses - Red Ulse B",         True),
    # --- 25 FIELD MONSTERS ---
    ("bird_knight",        "Mobile - Suikoden STAR LEAP - Enemies - Bird Knight",       False),
    ("black_tiger",        "Mobile - Suikoden STAR LEAP - Enemies - Black Tiger",       False),
    ("blade_bull",         "Mobile - Suikoden STAR LEAP - Enemies - Blade Bull",        False),
    ("bonbon",             "Mobile - Suikoden STAR LEAP - Enemies - Bonbon",            False),
    ("crow_tengu",         "Mobile - Suikoden STAR LEAP - Enemies - Crow Tengu",        False),
    ("crystal_shield",     "Mobile - Suikoden STAR LEAP - Enemies - Crystal Shield",    False),
    ("demon_dog",          "Mobile - Suikoden STAR LEAP - Enemies - Demon Dog",         False),
    ("eagle_man",          "Mobile - Suikoden STAR LEAP - Enemies - Eagle Man",         False),
    ("eau_mouton",         "Mobile - Suikoden STAR LEAP - Enemies - Eau Mouton",        False),
    ("electric_snail",     "Mobile - Suikoden STAR LEAP - Enemies - Electric Snail",    False),
    ("furfur",             "Mobile - Suikoden STAR LEAP - Enemies - Furfur",            False),
    ("gray_ulse",          "Mobile - Suikoden STAR LEAP - Enemies - Gray Ulse",         False),
    ("grizzly_bear",       "Mobile - Suikoden STAR LEAP - Enemies - Grizzly Bear",      False),
    ("keraunos",           "Mobile - Suikoden STAR LEAP - Enemies - Keraunos",          False),
    ("lava_snail",         "Mobile - Suikoden STAR LEAP - Enemies - Lava Snail",        False),
    ("nightmare",          "Mobile - Suikoden STAR LEAP - Enemies - Nightmare",         False),
    ("phantom",            "Mobile - Suikoden STAR LEAP - Enemies - Phantom",           False),
    ("poison_spider",      "Mobile - Suikoden STAR LEAP - Enemies - Poison Spider",     False),
    ("roar_wolf",          "Mobile - Suikoden STAR LEAP - Enemies - Roar Wolf",         False),
    ("roc",                "Mobile - Suikoden STAR LEAP - Enemies - Roc",               False),
    ("shadow_dog",         "Mobile - Suikoden STAR LEAP - Enemies - Shadow Dog",        False),
    ("slime_snail",        "Mobile - Suikoden STAR LEAP - Enemies - Slime Snail",       False),
    ("white_tiger",        "Mobile - Suikoden STAR LEAP - Enemies - White Tiger",       False),
    ("wind_tiger",         "Mobile - Suikoden STAR LEAP - Enemies - Wind Tiger",        False),
    ("wolf",               "Mobile - Suikoden STAR LEAP - Enemies - Wolf",              False),
]


def clean_frame(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()

    # Detect sheet chroma background color from corners
    corners = [px[0, 0][:3], px[w - 1, 0][:3], px[0, h - 1][:3], px[w - 1, h - 1][:3]]
    bg = max(set(corners), key=corners.count)
    r0, g0, b0 = bg

    def is_bg_outer(r, g, b):
        return abs(r - r0) + abs(g - g0) + abs(b - b0) <= 32

    def is_bg_pocket(r, g, b):
        # Strict match for enclosed holes between legs/wings so green fur is never pierced
        return max(abs(r - r0), abs(g - g0), abs(b - b0)) <= 4

    visited = [[False] * h for _ in range(w)]
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            r, g, b, a = px[x, y]
            if a > 0 and is_bg_outer(r, g, b):
                visited[x][y] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not visited[x][y]:
                r, g, b, a = px[x, y]
                if a > 0 and is_bg_outer(r, g, b):
                    visited[x][y] = True
                    q.append((x, y))

    while q:
        cx, cy = q.popleft()
        px[cx, cy] = (0, 0, 0, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                r, g, b, a = px[nx, ny]
                if a > 0 and is_bg_outer(r, g, b):
                    visited[nx][ny] = True
                    q.append((nx, ny))

    # Clear strict interior background pockets (e.g. gaps between legs or arms)
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            r, g, b, a = px[x, y]
            if a > 0 and is_bg_pocket(r, g, b):
                # Only clear if bordered by >= 2 transparent/background neighbors or part of a >= 6px pocket
                px[x, y] = (0, 0, 0, 0)

    # Remove tiny isolated magenta/pink alignment marker dots (<= 4 pixels, disconnected from body)
    def is_pink_marker(r, g, b):
        return r >= 170 and b >= 160 and g <= 95

    seen_p = set()
    for y in range(h):
        for x in range(w):
            if (x, y) in seen_p:
                continue
            r, g, b, a = px[x, y]
            if a > 0 and is_pink_marker(r, g, b):
                comp = []
                pq = deque([(x, y)])
                seen_p.add((x, y))
                touches_non_pink = False
                while pq:
                    cx, cy = pq.popleft()
                    comp.append((cx, cy))
                    for dx in (-1, 0, 1):
                        for dy in (-1, 0, 1):
                            if dx == 0 and dy == 0:
                                continue
                            nx, ny = cx + dx, cy + dy
                            if 0 <= nx < w and 0 <= ny < h:
                                nr, ng, nb, na = px[nx, ny]
                                if na > 0:
                                    if is_pink_marker(nr, ng, nb):
                                        if (nx, ny) not in seen_p:
                                            seen_p.add((nx, ny))
                                            pq.append((nx, ny))
                                    else:
                                        touches_non_pink = True
                if not touches_non_pink and len(comp) <= 6:
                    for cx, cy in comp:
                        px[cx, cy] = (0, 0, 0, 0)

    return im


def get_sorted_anim_frames(mdir: Path, anim_name: str):
    hits = sorted(mdir.rglob(f"{anim_name}/*.png"), key=lambda p: p.name)
    return [clean_frame(p) for p in hits]


def measure_fg_rgb(im: Image.Image):
    pxs = [c[:3] for c in im.getdata() if c[3] > 180 and (c[0] + c[1] + c[2]) > 75]
    if not pxs:
        return (160, 160, 160)
    return tuple(round(sum(c[i] for c in pxs) / len(pxs)) for i in range(3))


def pack_monster(folder_key: str, src_name: str, is_boss: bool):
    mdir = MONSTERS_DIR / src_name
    idle_raw = get_sorted_anim_frames(mdir, "ready")
    if not idle_raw:
        idle_raw = get_sorted_anim_frames(mdir, "idle")

    run_raw = get_sorted_anim_frames(mdir, "run")
    if not run_raw:
        # Respect native animation: loop ready frames cleanly when wandering
        run_raw = list(idle_raw)

    norm_atk = get_sorted_anim_frames(mdir, "normal_attack")
    heavy_atk = get_sorted_anim_frames(mdir, "heavy_attack")
    if is_boss and len(heavy_atk) >= 4:
        # Combine normal/heavy cleanly if boss, or prefer the richer sequence
        atk_raw = heavy_atk if len(heavy_atk) >= len(norm_atk) else norm_atk
    elif len(norm_atk) >= 3:
        atk_raw = norm_atk
    elif len(norm_atk) > 0:
        # Snails (2f extended lunge): coil from crouching/ready -> lunge -> recoil
        crouch = get_sorted_anim_frames(mdir, "crouching")
        coil = crouch[0] if crouch else idle_raw[-1]
        atk_raw = [idle_raw[0], coil] + norm_atk
    else:
        atk_raw = list(idle_raw)

    all_frames = idle_raw + run_raw + atk_raw
    bboxes = [im.getbbox() or (0, 0, im.width, im.height) for im in all_frames]
    max_w = max(b[2] - b[0] for b in bboxes)
    max_h = max(b[3] - b[1] for b in bboxes)

    # Ensure generous canvas with zero edge clipping
    cw = max(96, max_w + 16)
    ch = max(96, max_h + 16)

    # Consistent baseline using ready frames' bottom coordinate relative to original image bottom
    ready_lifts = []
    for im in idle_raw:
        bb = im.getbbox() or (0, 0, im.width, im.height)
        ready_lifts.append(im.height - bb[3])
    base_floor_dist = min(ready_lifts)

    out_dir = OUT_DIR / folder_key
    out_dir.mkdir(parents=True, exist_ok=True)
    # Remove any stale files if re-running
    for old in out_dir.glob("*.png"):
        old.unlink()

    margin_bottom = 8

    def save_seq(seq, prefix):
        saved = []
        for idx, im in enumerate(seq):
            bb = im.getbbox() or (0, 0, im.width, im.height)
            trimmed = im.crop(bb)
            sw, sh = trimmed.size
            lift = max(0, (im.height - bb[3]) - base_floor_dist)
            px = (cw - sw) // 2
            py = max(4, min(ch - sh - 2, ch - margin_bottom - sh - lift))
            canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
            canvas.paste(trimmed, (px, py), trimmed)
            out_path = out_dir / f"{prefix}_{idx}.png"
            canvas.save(out_path)
            saved.append(canvas)
        return saved

    saved_idle = save_seq(idle_raw, "idle")
    save_seq(run_raw, "run")
    saved_atk = save_seq(atk_raw, "attack")

    dom_rgb = measure_fg_rgb(saved_idle[0])
    return {
        "key": folder_key,
        "isBoss": is_boss,
        "width": cw,
        "height": ch,
        "idleCount": len(idle_raw),
        "runCount": len(run_raw),
        "attackCount": len(atk_raw),
        "domRGB": dom_rgb,
        "sampleIdle": saved_idle[0],
        "sampleAtk": saved_atk[min(len(saved_atk) - 1, len(saved_atk) // 2)],
    }


results = []
for key, src_name, is_boss in SPECS:
    res = pack_monster(key, src_name, is_boss)
    results.append(res)
    print(f"{key:18s} | {res['width']:3d}x{res['height']:3d} | idle={res['idleCount']:2d} run={res['runCount']:2d} atk={res['attackCount']:2d} | fgRGB={res['domRGB']}")

# Visual verification sheet showing cleaned idle + attack for all 28 monsters
cols = 4
rows = (len(results) + cols - 1) // cols
preview = Image.new("RGBA", (cols * 280, rows * 150), (26, 30, 42, 255))
draw = ImageDraw.Draw(preview)
for i, r in enumerate(results):
    cx = (i % cols) * 280
    cy = (i // cols) * 150
    s1 = r["sampleIdle"]
    s2 = r["sampleAtk"]
    scale = min(115 / max(1, s1.width), 115 / max(1, s1.height), 1.0)
    w1, h1 = round(s1.width * scale), round(s1.height * scale)
    p1 = s1.resize((w1, h1), Image.NEAREST)
    p2 = s2.resize((w1, h1), Image.NEAREST)
    preview.paste(p1, (cx + 10, cy + 144 - h1), p1)
    preview.paste(p2, (cx + 140, cy + 144 - h1), p2)
    draw.text((cx + 6, cy + 4), f"{r['key']} ({r['idleCount']}/{r['runCount']}/{r['attackCount']})", fill=(255, 232, 130, 255))

preview.save(PREVIEW)
with open(PREVIEW.with_suffix(".json"), "w") as f:
    json.dump([{k: v for k, v in r.items() if k not in ("sampleIdle", "sampleAtk")} for r in results], f, indent=2)
print("Saved preview:", PREVIEW)
