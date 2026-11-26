from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(r"c:\Users\Noctus\Documents\Tessera_legacy")
OUT = Path(r"C:\Users\Noctus\.gemini\antigravity\brain\ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70\scratch\caracters_candidates_preview.png")

CANDIDATES = [
    # 17 Class Skins (1 per class)
    ("SKIN WARRIOR", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Special Units - Musashi Miyamoto.png"),
    ("SKIN GUARDIAN", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Special Units - Tadakatsu Honda.png"),
    ("SKIN BERSERKER", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - The Ambition of Oda Nobuna - Katsuie Shibata.png"),
    ("SKIN ROGUE", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku BASARA Series - Sasuke Sarutobi.png"),
    ("SKIN ASSASSIN", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Basilisk - Gennosuke Kouga.png"),
    ("SKIN HUNTER", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku BASARA Series - Magoichi Saika.png"),
    ("SKIN MAGE", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Hyperdimension Neptunia - Neptune.png"),
    ("SKIN ARCHMAGE", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Hyperdimension Neptunia - Noire.png"),
    ("SKIN WARLOCK", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku BASARA 4 Sumeragi - Oichi.png"),
    ("SKIN DEATH_KNIGHT", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Color Change - Messhi Kurozonae.png"),
    ("SKIN DEMON_HUNTER", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku BASARA Series - Masamune Date.png"),
    ("SKIN PRIEST", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Hyperdimension Neptunia - Vert.png"),
    ("SKIN PALADIN", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Color Change - Yoshishige Satake - Heaven.png"),
    ("SKIN DRUID", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Special Units - Jiraiya.png"),
    ("SKIN SHAMAN", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Color Change - Jinrai Aozonae.png"),
    ("SKIN MONK", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Samurai Girls - Inshun Hozoin.png"),
    ("SKIN EVOKER", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Color Change - Masakage Yamagata - Seiryu.png"),
    # 10 New Field Enemies
    ("ENEMY hotarubi", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Basilisk - Hotarubi.png"),
    ("ENEMY akeginu", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Basilisk - Akeginu.png"),
    ("ENEMY jimushi", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Basilisk - Juubei Jimushi.png"),
    ("ENEMY kotaro", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Special Units - Kotaro Fuma.png"),
    ("ENEMY saizo", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Special Units - Saizo Kirigakure.png"),
    ("ENEMY dartagnan", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Samurai Girls - Charles d'Artagnan.png"),
    ("ENEMY mitsunari", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku BASARA Series - Mitsunari Ishida.png"),
    ("ENEMY goemon", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - The Ambition of Oda Nobuna - Goemon Hachisuka.png"),
    ("ENEMY momotaro", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Special Units - Momotaro.png"),
    ("ENEMY hanbei", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku BASARA 4 Sumeragi - Hanbei Takenaka.png"),
    # 6 New World/Dungeon Bosses
    ("BOSS nobunaga", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku Night Blood Koumei - Nobunaga Oda.png"),
    ("BOSS tenzen", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Basilisk - Tenzen Yakushiji.png"),
    ("BOSS kenshin", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku Night Blood Koumei - Kenshin Uesugi.png"),
    ("BOSS taishogun", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Special Units - Seii Taishogun.png"),
    ("BOSS dairokuten_alt", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Color Change - Dairokuten Maou Alt.png"),
    ("BOSS ieyasu", "Mobile - Senran no Samurai Kingdom (JPN) - Characters - Sengoku BASARA 4 Sumeragi - Ieyasu Tokugawa.png"),
]

def find_bands(proj, min_gap=10, min_len=12):
    # Find intervals of non-zero projection merged across small internal gaps (< min_gap)
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

canvas = Image.new("RGBA", (6 * 150, 6 * 145), (24, 24, 38, 255))
draw = ImageDraw.Draw(canvas)

for idx, (label, fname) in enumerate(CANDIDATES):
    p = ROOT / "caracters" / fname
    im = Image.open(p).convert("RGBA")
    w, h = im.size
    alpha = im.getchannel("A")
    # Row alpha sums
    ap = alpha.load()
    row_proj = [sum(1 for x in range(w) if ap[x, y] > 10) for y in range(h)]
    rows = find_bands(row_proj, min_gap=8, min_len=20)
    r_counts = []
    first_sprite = None
    for ry0, ry1 in rows[:3]:
        col_proj = [sum(1 for y in range(ry0, ry1) if ap[x, y] > 10) for x in range(w)]
        cols = find_bands(col_proj, min_gap=10, min_len=16)
        r_counts.append(len(cols))
        if first_sprite is None and cols:
            cx0, cx1 = cols[0]
            first_sprite = im.crop((cx0, ry0, cx1, ry1))
    print(f"{label:20s} size={w}x{h} rows={len(rows)} row_sprites={r_counts}")
    col_i = idx % 6
    row_i = idx // 6
    if first_sprite:
        # fit into 130x115 anchored bottom-center
        sw, sh = first_sprite.size
        if sw > 130 or sh > 115:
            scale = min(130 / sw, 115 / sh)
            first_sprite = first_sprite.resize((int(sw * scale), int(sh * scale)), Image.NEAREST)
            sw, sh = first_sprite.size
        ox = col_i * 150 + (150 - sw) // 2
        oy = row_i * 145 + 140 - sh
        canvas.paste(first_sprite, (ox, oy), first_sprite)
    draw.text((col_i * 150 + 4, row_i * 145 + 2), label[:21], fill=(255, 225, 110, 255))

canvas.save(OUT)
print("Saved preview:", OUT)
