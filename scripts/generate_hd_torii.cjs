const fs = require('fs');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function encodePng(width, height, rgbaBuffer) {
  const stride = width * 4;
  const filtered = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    filtered[y * (stride + 1)] = 0; // Filter 0: None
    rgbaBuffer.copy(filtered, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const deflated = zlib.deflateSync(filtered, { level: 9 });
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const c = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(c, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// -------------------------------------------------------------
// PALETTE: Authentic 16-Bit Japanese Shinto Shrine Vermilion
// -------------------------------------------------------------
const P = {
  // Roof Lacquer / Dark Copper
  ROOF_BLACK: [15, 23, 42, 255],      // #0f172a
  ROOF_DARK: [30, 41, 59, 255],       // #1e293b
  ROOF_MID: [51, 65, 85, 255],        // #334155
  ROOF_LIGHT: [100, 116, 139, 255],   // #64748b
  ROOF_SPECULAR: [148, 163, 184, 255],// #94a3b8

  // Vermilion (Shu-iro / Japanese Lacquer Red)
  RED_OUTLINE: [92, 13, 17, 255],     // Deep shadow contour
  RED_DARKEST: [127, 29, 29, 255],    // #7f1d1d
  RED_SHADOW: [153, 27, 27, 255],     // #991b1b
  RED_CORE: [185, 28, 28, 255],       // #b91c1c
  RED_BASE: [220, 38, 38, 255],       // #dc2626
  RED_BRIGHT: [239, 68, 68, 255],     // #ef4444
  RED_HIGHLIGHT: [248, 113, 113, 255],// #f87171
  RED_SPECULAR: [254, 202, 202, 255], // #fecaca
  RED_GLINT: [255, 240, 240, 255],

  // Gold / Bronze Kanagu Fittings
  GOLD_DEEP: [113, 63, 18, 255],      // #713f12
  GOLD_DARK: [146, 64, 14, 255],      // #92400e
  GOLD_MID: [202, 138, 4, 255],       // #ca8a04
  GOLD_BRIGHT: [234, 179, 8, 255],    // #eab308
  GOLD_LIGHT: [250, 204, 21, 255],    // #facc15
  GOLD_SPECULAR: [254, 240, 138, 255],// #fef08a
  GOLD_WHITE: [255, 253, 230, 255],

  // Granite Stone Pedestals
  STONE_BLACK: [15, 23, 42, 255],
  STONE_DARK: [30, 41, 59, 255],
  STONE_MID: [71, 85, 105, 255],
  STONE_LIGHT: [148, 163, 184, 255],
  STONE_SPECULAR: [226, 232, 240, 255],

  // Rice Straw Shimenawa Rope
  STRAW_DEEP: [120, 53, 15, 255],
  STRAW_DARK: [180, 83, 9, 255],
  STRAW_MID: [217, 119, 6, 255],
  STRAW_LIGHT: [245, 158, 11, 255],
  STRAW_HIGHLIGHT: [253, 230, 138, 255],

  // Shide Folded Paper
  PAPER_DARK: [148, 163, 184, 255],
  PAPER_MID: [203, 213, 225, 255],
  PAPER_LIGHT: [241, 245, 249, 255],
  PAPER_WHITE: [255, 255, 255, 255],
};

const WIDTH = 192;
const HEIGHT = 180;
const buf = Buffer.alloc(WIDTH * HEIGHT * 4); // Initialized to 0 (transparent)

function setPx(x, y, [r, g, b, a]) {
  if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
    const idx = (y * WIDTH + x) * 4;
    buf[idx] = r;
    buf[idx + 1] = g;
    buf[idx + 2] = b;
    buf[idx + 3] = a;
  }
}

function setSym(x, y, color) {
  setPx(x, y, color);
  setPx(WIDTH - 1 - x, y, color);
}

// Draw horizontal line
function hLine(x1, x2, y, color) {
  for (let x = x1; x <= x2; x++) {
    setPx(x, y, color);
  }
}

// Draw filled rect
function fillRect(x, y, w, h, color) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPx(x + dx, y + dy, color);
    }
  }
}

console.log('Rendering High-Definition 16-Bit Pixel Art Torii Gate...');

const CX = Math.floor(WIDTH / 2); // 96
// Left Pillar center = 48, Right Pillar center = 143 (distance = 96px)
const P_LEFT = 48;
const P_RIGHT = WIDTH - 1 - P_LEFT; // 143
const P_WIDTH = 14; // Pillar diameter

// =============================================================
// 1. KASAGI (Top Swept Roof Lintel)
// Width: 184px (x: 4 to 187). Swept upward at the outer ends.
// =============================================================
const kasagiCurve = [];
for (let x = 4; x <= CX; x++) {
  // Normalized 0 at center, 1 at outer tip
  const t = (CX - x) / (CX - 4);
  // Elegant quadratic sweep: 0px offset at center, curves up by 14px at tips
  const sori = Math.round(14 * Math.pow(t, 2.2));
  kasagiCurve[x] = 18 - sori; // y-coordinate of kasagi top edge
}

// Render Kasagi Lintel
for (let x = 4; x <= CX; x++) {
  const topY = kasagiCurve[x];
  const isTip = x <= 14;

  // Layer 1: Black Lacquer Roof Crest (Copper ridge cap)
  setSym(x, topY, P.ROOF_BLACK);
  setSym(x, topY + 1, P.ROOF_LIGHT);
  setSym(x, topY + 2, P.ROOF_MID);
  setSym(x, topY + 3, P.ROOF_DARK);
  setSym(x, topY + 4, P.ROOF_BLACK);

  // Layer 2: Main Vermilion Kasagi Beam (7px thick)
  setSym(x, topY + 5, P.RED_HIGHLIGHT);
  setSym(x, topY + 6, P.RED_BRIGHT);
  setSym(x, topY + 7, P.RED_BASE);
  setSym(x, topY + 8, P.RED_CORE);
  setSym(x, topY + 9, P.RED_SHADOW);
  setSym(x, topY + 10, P.RED_DARKEST);
  setSym(x, topY + 11, P.RED_OUTLINE);

  // Gold bronze ornamental Kanagu caps on outer tips (x: 4..12)
  if (x <= 12) {
    setSym(x, topY + 1, P.GOLD_WHITE);
    setSym(x, topY + 2, P.GOLD_LIGHT);
    setSym(x, topY + 3, P.GOLD_BRIGHT);
    setSym(x, topY + 4, P.GOLD_MID);
    setSym(x, topY + 5, P.GOLD_LIGHT);
    setSym(x, topY + 6, P.GOLD_BRIGHT);
    setSym(x, topY + 7, P.GOLD_MID);
    setSym(x, topY + 8, P.GOLD_DARK);
    setSym(x, topY + 9, P.GOLD_DEEP);
    setSym(x, topY + 10, P.GOLD_DEEP);
  }
}

// =============================================================
// 2. SHIMAKI (Secondary Straight Horizontal Beam under Kasagi)
// Width: 164px (x: 14 to 177), Y: 28 to 36
// =============================================================
for (let x = 14; x <= CX; x++) {
  const isEnd = x <= 22;
  setSym(x, 28, isEnd ? P.GOLD_LIGHT : P.RED_HIGHLIGHT);
  setSym(x, 29, isEnd ? P.GOLD_BRIGHT : P.RED_BRIGHT);
  setSym(x, 30, isEnd ? P.GOLD_MID : P.RED_BASE);
  setSym(x, 31, isEnd ? P.GOLD_MID : P.RED_CORE);
  setSym(x, 32, isEnd ? P.GOLD_DARK : P.RED_SHADOW);
  setSym(x, 33, isEnd ? P.GOLD_DEEP : P.RED_DARKEST);
  setSym(x, 34, P.RED_OUTLINE);
}

// =============================================================
// 3. GAKUZUKA (Center Black Dedication Tablet)
// x: CX - 8 to CX + 8 (17px wide), Y: 35 to 55
// =============================================================
for (let y = 35; y <= 55; y++) {
  for (let x = CX - 8; x <= CX + 8; x++) {
    const isBorder = (x === CX - 8 || x === CX + 8 || y === 35 || y === 55 ||
                      x === CX - 7 || x === CX + 7 || y === 36 || y === 54);
    if (isBorder) {
      setPx(x, y, (x === CX - 7 && y === 36) ? P.GOLD_LIGHT : P.GOLD_MID);
    } else {
      setPx(x, y, P.ROOF_BLACK);
    }
  }
}
// Gold Crest / Inscription in center
setPx(CX, 41, P.GOLD_WHITE);
setPx(CX - 1, 42, P.GOLD_LIGHT);
setPx(CX, 42, P.GOLD_BRIGHT);
setPx(CX + 1, 42, P.GOLD_LIGHT);
setPx(CX, 43, P.GOLD_WHITE);
setPx(CX, 46, P.GOLD_LIGHT);
setPx(CX, 47, P.GOLD_BRIGHT);
setPx(CX - 2, 48, P.GOLD_MID);
setPx(CX - 1, 48, P.GOLD_LIGHT);
setPx(CX, 48, P.GOLD_WHITE);
setPx(CX + 1, 48, P.GOLD_LIGHT);
setPx(CX + 2, 48, P.GOLD_MID);
setPx(CX, 49, P.GOLD_MID);

// =============================================================
// 4. DAIWA / CAPITAL RINGS (Gold Bronze Rings atop each Pillar)
// Y: 35 to 40, Width: 18px (centered on pillars P_LEFT and P_RIGHT)
// =============================================================
[-1, 1].forEach(side => {
  const pc = side === -1 ? P_LEFT : P_RIGHT;
  for (let x = pc - 9; x <= pc + 9; x++) {
    const dx = x - pc;
    let col = P.GOLD_MID;
    if (dx < -6) col = P.GOLD_DEEP;
    else if (dx < -3) col = P.GOLD_DARK;
    else if (dx <= 0) col = P.GOLD_LIGHT;
    else if (dx === 1) col = P.GOLD_WHITE;
    else if (dx < 5) col = P.GOLD_BRIGHT;
    else col = P.GOLD_DARK;

    setPx(x, 35, P.RED_OUTLINE);
    setPx(x, 36, col);
    setPx(x, 37, col);
    setPx(x, 38, col);
    setPx(x, 39, P.GOLD_DEEP);
  }
});

// =============================================================
// 5. NUKI (Lower Crossbeam penetrating Pillars)
// Width: 156px (x: 18 to 173), Y: 53 to 63
// =============================================================
for (let x = 18; x <= CX; x++) {
  const isEnd = x <= 26; // Protruding ends have Gold Kanagu
  setSym(x, 53, isEnd ? P.GOLD_LIGHT : P.RED_HIGHLIGHT);
  setSym(x, 54, isEnd ? P.GOLD_BRIGHT : P.RED_BRIGHT);
  setSym(x, 55, isEnd ? P.GOLD_BRIGHT : P.RED_BASE);
  setSym(x, 56, isEnd ? P.GOLD_MID : P.RED_BASE);
  setSym(x, 57, isEnd ? P.GOLD_MID : P.RED_CORE);
  setSym(x, 58, isEnd ? P.GOLD_DARK : P.RED_SHADOW);
  setSym(x, 59, isEnd ? P.GOLD_DEEP : P.RED_DARKEST);
  setSym(x, 60, P.RED_OUTLINE);
}
// Wedges (Kusabi) holding Nuki against pillars
[-1, 1].forEach(side => {
  const pc = side === -1 ? P_LEFT : P_RIGHT;
  setPx(pc - 8, 51, P.GOLD_DARK);
  setPx(pc - 8, 52, P.GOLD_MID);
  setPx(pc + 8, 51, P.GOLD_DARK);
  setPx(pc + 8, 52, P.GOLD_MID);
  setPx(pc - 8, 61, P.GOLD_MID);
  setPx(pc - 8, 62, P.GOLD_DARK);
  setPx(pc + 8, 61, P.GOLD_MID);
  setPx(pc + 8, 62, P.GOLD_DARK);
});

// =============================================================
// 6. HASHIRA (The Two Main Cylindrical Pillars)
// Left Pillar center = P_LEFT (48), Right = P_RIGHT (143)
// Y: 40 down to 160 (120px tall)
// 3D cylindrical lighting with smooth curvature gradient
// =============================================================
[-1, 1].forEach(side => {
  const pc = side === -1 ? P_LEFT : P_RIGHT;
  const pw = 7; // Half-width (14px diameter)

  for (let y = 40; y <= 162; y++) {
    // Skip where Gakuzuka or beams solidly cover
    if (y >= 53 && y <= 60) continue; // Behind Nuki

    for (let dx = -pw; dx <= pw; dx++) {
      const x = pc + dx;
      let col = P.RED_BASE;

      if (dx === -pw) {
        col = P.RED_OUTLINE; // Dark left contour
      } else if (dx === -pw + 1) {
        col = P.RED_DARKEST;
      } else if (dx === -pw + 2) {
        col = P.RED_CORE;
      } else if (dx === -pw + 3) {
        col = P.RED_BRIGHT;
      } else if (dx === -pw + 4) {
        col = P.RED_HIGHLIGHT; // Strong specular cylinder highlight
      } else if (dx === -pw + 5) {
        col = P.RED_SPECULAR; // Specular glint line
      } else if (dx === -pw + 6) {
        col = P.RED_HIGHLIGHT;
      } else if (dx <= 1) {
        col = P.RED_BRIGHT;
      } else if (dx <= 3) {
        col = P.RED_BASE;
      } else if (dx <= 5) {
        col = P.RED_SHADOW;
      } else if (dx === pw - 1) {
        col = P.RED_DARKEST;
      } else if (dx === pw) {
        col = P.RED_OUTLINE; // Dark right contour
      }

      setPx(x, y, col);
    }
  }
});

// =============================================================
// 7. NEMAKI (Black Lacquer Sleeves with Gold Trim at Base)
// Y: 148 to 164
// =============================================================
[-1, 1].forEach(side => {
  const pc = side === -1 ? P_LEFT : P_RIGHT;
  for (let y = 148; y <= 164; y++) {
    for (let dx = -8; dx <= 8; dx++) {
      const x = pc + dx;
      if (y === 148 || y === 149) {
        // Gold trim ring
        setPx(x, y, dx === -2 ? P.GOLD_WHITE : dx < 2 ? P.GOLD_LIGHT : P.GOLD_MID);
      } else {
        // Glossy black lacquer cylinder
        let col = P.ROOF_BLACK;
        if (dx === -4) col = P.ROOF_LIGHT;
        else if (dx === -3) col = P.ROOF_SPECULAR;
        else if (dx === -2) col = P.ROOF_MID;
        else if (dx < 3) col = P.ROOF_DARK;
        setPx(x, y, col);
      }
    }
  }

  // 8. KAMEBARA (Granite Base Pedestal Stones)
  // Y: 164 to 176, Width: 22px
  for (let y = 164; y <= 176; y++) {
    const bevel = (y <= 166) ? (166 - y) : 0;
    for (let dx = -11 + bevel; dx <= 11 - bevel; dx++) {
      const x = pc + dx;
      let col = P.STONE_MID;
      if (y === 164 || y === 165) {
        col = dx < 0 ? P.STONE_SPECULAR : P.STONE_LIGHT;
      } else if (dx === -11 + bevel) {
        col = P.STONE_BLACK;
      } else if (dx === 11 - bevel) {
        col = P.STONE_BLACK;
      } else if (dx < -3) {
        col = P.STONE_LIGHT;
      } else if (dx > 3) {
        col = P.STONE_DARK;
      }
      setPx(x, y, col);
    }
  }
});

// =============================================================
// 9. SHIMENAWA (Sacred Woven Rice-Straw Rope)
// Suspended between the pillars beneath Nuki: x: 48 to 143, y: 64 to 82
// Woven thick rope catenary sag
// =============================================================
const span = P_RIGHT - P_LEFT; // 95
for (let x = P_LEFT; x <= P_RIGHT; x++) {
  const normX = (x - P_LEFT) / span; // 0 to 1
  // Catenary sag curve: reaches maximum depth at center
  const sag = Math.round(14 * Math.sin(normX * Math.PI));
  const ropeY = 64 + sag;

  // 5px thick woven rope
  for (let dy = 0; dy < 5; dy++) {
    const y = ropeY + dy;
    // Braid pattern alternates diagonally
    const braid = (x + dy * 2) % 6;
    let col = P.STRAW_MID;
    if (dy === 0) col = (braid < 3) ? P.STRAW_HIGHLIGHT : P.STRAW_LIGHT;
    else if (dy === 1) col = (braid < 3) ? P.STRAW_LIGHT : P.STRAW_MID;
    else if (dy === 2) col = (braid < 3) ? P.STRAW_MID : P.STRAW_DARK;
    else if (dy === 3) col = (braid < 3) ? P.STRAW_DARK : P.STRAW_DEEP;
    else col = P.RED_OUTLINE;

    setPx(x, y, col);
  }
}

// =============================================================
// 10. SHIDE (Sacred White Paper Streamers / Zigzags)
// Hanging at 3 positions: left quarter, center, right quarter
// Positions: P_LEFT + 24, CX, P_RIGHT - 24
// =============================================================
[P_LEFT + 24, CX, P_RIGHT - 24].forEach((shideX, idx) => {
  const normX = (shideX - P_LEFT) / span;
  const startY = 68 + Math.round(14 * Math.sin(normX * Math.PI));

  // Fold 1: Top anchor tab
  fillRect(shideX - 3, startY, 6, 4, P.PAPER_WHITE);
  setPx(shideX + 3, startY + 1, P.PAPER_MID);
  setPx(shideX + 3, startY + 2, P.PAPER_DARK);

  // Fold 2: Step right
  fillRect(shideX, startY + 4, 6, 5, P.PAPER_LIGHT);
  fillRect(shideX + 1, startY + 4, 4, 4, P.PAPER_WHITE);
  setPx(shideX + 6, startY + 5, P.PAPER_MID);
  setPx(shideX + 6, startY + 6, P.PAPER_DARK);

  // Fold 3: Step left
  fillRect(shideX - 4, startY + 9, 6, 6, P.PAPER_LIGHT);
  fillRect(shideX - 3, startY + 9, 4, 5, P.PAPER_WHITE);
  setPx(shideX + 2, startY + 10, P.PAPER_MID);
  setPx(shideX + 2, startY + 11, P.PAPER_DARK);

  // Fold 4: Step right
  fillRect(shideX - 1, startY + 15, 6, 7, P.PAPER_LIGHT);
  fillRect(shideX, startY + 15, 4, 6, P.PAPER_WHITE);
  setPx(shideX + 5, startY + 16, P.PAPER_MID);
  setPx(shideX + 5, startY + 17, P.PAPER_DARK);

  // Fold 5: Pointed bottom tail
  fillRect(shideX - 2, startY + 22, 4, 4, P.PAPER_LIGHT);
  setPx(shideX - 1, startY + 22, P.PAPER_WHITE);
  setPx(shideX, startY + 22, P.PAPER_WHITE);
  fillRect(shideX - 1, startY + 26, 2, 3, P.PAPER_WHITE);
  setPx(shideX, startY + 29, P.PAPER_LIGHT);
});

// Write to public/map/prop_torii.png
const pngData = encodePng(WIDTH, HEIGHT, buf);
fs.writeFileSync('public/map/prop_torii.png', pngData);
console.log('Successfully generated high-definition 16-bit pixel art Torii Gate (192x180 px)!');
