import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, getPixel) {
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pxOffset = rowOffset + 1 + x * bytesPerPixel;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : (c >>> 1);
    }
    crcTable[n] = c >>> 0;
  }

  function makeChunk(type, chunkData) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(chunkData.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, chunkData]);
    let crc = 0xffffffff;
    for (let i = 0; i < combined.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ combined[i]) & 0xff];
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, chunkData, crcBuf]);
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
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// 16-Bit Color Palette Definitions
const C = {
  EMPTY: [0, 0, 0, 0],
  // Black lacquer & roof copper
  ROOF_BLACK: [15, 23, 42, 255],      // #0f172a
  ROOF_DARK: [30, 41, 59, 255],       // #1e293b
  ROOF_MID: [51, 65, 85, 255],        // #334155
  ROOF_LIGHT: [100, 116, 139, 255],   // #64748b
  ROOF_SPECULAR: [148, 163, 184, 255],// #94a3b8

  // Shinto Vermilion (Urushi Red)
  RED_OUTLINE: [100, 14, 28, 255],    // Deepest ambient shadow outline
  RED_SHADOW: [153, 27, 27, 255],     // #991b1b
  RED_BASE: [220, 38, 38, 255],       // #dc2626
  RED_MID: [239, 68, 68, 255],        // #ef4444
  RED_HIGHLIGHT: [248, 113, 113, 255],// #f87171
  RED_SPECULAR: [254, 202, 202, 255], // #fecaca

  // Gold Bronze Kanagu (Fittings)
  GOLD_DARK: [120, 53, 15, 255],      // #78350f
  GOLD_MID: [217, 119, 6, 255],       // #d97706
  GOLD_BRIGHT: [250, 204, 21, 255],   // #facc15
  GOLD_LIGHT: [254, 240, 138, 255],   // #fef08a

  // Granite Pedestal Stones
  STONE_DARK: [15, 23, 42, 255],      // #0f172a
  STONE_SHADOW: [51, 65, 85, 255],    // #334155
  STONE_MID: [71, 85, 105, 255],      // #475569
  STONE_LIGHT: [148, 163, 184, 255],  // #94a3b8
  STONE_SPECULAR: [203, 213, 225, 255],// #cbd5e1

  // Sacred Shimenawa & Shide (Straw rope & white paper)
  STRAW_DARK: [180, 83, 9, 255],      // #b45309
  STRAW_MID: [245, 158, 11, 255],     // #f59e0b
  STRAW_LIGHT: [253, 230, 138, 255],  // #fde68a

  PAPER_WHITE: [255, 255, 255, 255],  // Pure white
  PAPER_SHADE: [203, 213, 225, 255],  // #cbd5e1
  PAPER_DARK: [148, 163, 184, 255],   // #94a3b8
};

// Canvas Dimensions: 40 texels wide x 36 texels high
// With 4px texel size -> 160px x 144px
const W_TEX = 40;
const H_TEX = 36;
const TEX_SIZE = 4;

const grid = Array.from({ length: H_TEX }, () => Array(W_TEX).fill(C.EMPTY));

function setTexel(tx, ty, color) {
  if (tx >= 0 && tx < W_TEX && ty >= 0 && ty < H_TEX) {
    grid[ty][tx] = color;
  }
}

function setSymmetric(tx, ty, color) {
  setTexel(tx, ty, color);
  setTexel(W_TEX - 1 - tx, ty, color);
}

// -------------------------------------------------------------
// 1. KASAGI (Top Curved Lintel / Roof)
// Center (tx: 16..19) sits at ty: 2..4
// Mid (tx: 6..15) sits at ty: 1..3
// Ends (tx: 1..5) curve up to ty: 0..2 with flared tips
// -------------------------------------------------------------
// We define the top Y for each tx from 0 to 19 (mirrored to 39..20)
const kasagiTopY = [
  -1, // tx: 0 (outside)
   0, // tx: 1 (outer flared tip)
   0, // tx: 2
   1, // tx: 3
   1, // tx: 4
   1, // tx: 5
   2, // tx: 6
   2, // tx: 7
   2, // tx: 8 (above left pillar)
   2, // tx: 9 (above left pillar)
   2, // tx: 10
   2, // tx: 11
   3, // tx: 12
   3, // tx: 13
   3, // tx: 14
   3, // tx: 15
   3, // tx: 16
   3, // tx: 17
   3, // tx: 18
   3, // tx: 19 (center)
];

for (let tx = 1; tx <= 19; tx++) {
  const topY = kasagiTopY[tx];
  if (topY < 0) continue;

  // Kasagi has:
  // Row 0 of Kasagi: Black lacquer roof cap
  setSymmetric(tx, topY, C.ROOF_BLACK);
  // Highlight along top edge
  if (tx >= 3 && tx <= 18) {
    // Top inner edge has metallic highlight
    setSymmetric(tx, topY, C.ROOF_MID);
  }

  // Row 1 of Kasagi: Top vermilion highlight
  setSymmetric(tx, topY + 1, C.RED_HIGHLIGHT);

  // Row 2 of Kasagi: Core red
  setSymmetric(tx, topY + 2, C.RED_BASE);

  // Bottom outline of Kasagi
  setSymmetric(tx, topY + 3, C.RED_OUTLINE);
}

// Gold Kanagu Tips on the outer ends of the Kasagi (tx: 1, 2)
setSymmetric(1, kasagiTopY[1], C.GOLD_BRIGHT);
setSymmetric(1, kasagiTopY[1] + 1, C.GOLD_MID);
setSymmetric(1, kasagiTopY[1] + 2, C.GOLD_DARK);
setSymmetric(2, kasagiTopY[2], C.GOLD_LIGHT);

// -------------------------------------------------------------
// 2. SHIMAKI (Secondary Flat Horizontal Beam directly under Kasagi)
// tx: 3 to 19 (spans 34 texels total, slightly shorter than Kasagi)
// ty: 5..6
// -------------------------------------------------------------
for (let tx = 3; tx <= 19; tx++) {
  setSymmetric(tx, 5, C.RED_MID);
  setSymmetric(tx, 6, C.RED_OUTLINE);
}
// Gold kanagu trim on ends of Shimaki (tx: 3)
setSymmetric(3, 5, C.GOLD_BRIGHT);
setSymmetric(3, 6, C.GOLD_MID);

// -------------------------------------------------------------
// 3. GAKUZUKA (Center Black Lacquer Dedication Plaque)
// Centered between Shimaki and Nuki: tx: 18..21, ty: 7..9
// -------------------------------------------------------------
for (let ty = 7; ty <= 9; ty++) {
  for (let tx = 18; tx <= 19; tx++) {
    // Gold border on edges, dark lacquer in center
    if (ty === 7 || ty === 9 || tx === 18) {
      setSymmetric(tx, ty, C.GOLD_MID);
    } else {
      setSymmetric(tx, ty, C.ROOF_BLACK);
    }
  }
}
// Shinto Gold Emblem in center of plaque
setTexel(19, 8, C.GOLD_BRIGHT);
setTexel(20, 8, C.GOLD_BRIGHT);

// -------------------------------------------------------------
// 4. DAIWA / CAPITAL RINGS (Gold Bronze collars above each pillar)
// Left pillar sits at tx: 8..11, right at tx: 28..31
// Capital sits at ty: 7
// -------------------------------------------------------------
for (let tx = 8; tx <= 11; tx++) {
  setSymmetric(tx, 7, tx === 9 ? C.GOLD_LIGHT : (tx === 8 || tx === 11 ? C.GOLD_DARK : C.GOLD_BRIGHT));
}

// -------------------------------------------------------------
// 5. NUKI (Lower Horizontal Crossbeam)
// tx: 5 to 19 (30 texels total, protrudes past the pillars which are at 8..11)
// ty: 9..10
// -------------------------------------------------------------
for (let tx = 5; tx <= 19; tx++) {
  // Upper row of Nuki
  setSymmetric(tx, 9, C.RED_MID);
  // Lower row of Nuki
  setSymmetric(tx, 10, C.RED_OUTLINE);
}
// Highlight on top edge of Nuki
for (let tx = 12; tx <= 19; tx++) {
  setSymmetric(tx, 9, C.RED_HIGHLIGHT);
}
// Protruding ends of Nuki with Gold Kanagu caps (tx: 5, 6)
setSymmetric(5, 9, C.GOLD_LIGHT);
setSymmetric(5, 10, C.GOLD_MID);
setSymmetric(6, 9, C.GOLD_BRIGHT);
setSymmetric(6, 10, C.GOLD_DARK);

// -------------------------------------------------------------
// 6. HASHIRA (The Two Main Pillars)
// Left: tx: 8..11 (4 texels wide)
// Right: tx: 28..31 (mirrored)
// ty: 8 to 29 (22 texels high!)
// Cylindrical 4-texel Shading:
// tx: 8 -> Ambient Outline Shadow (RED_OUTLINE)
// tx: 9 -> Rounded Specular Highlight (RED_HIGHLIGHT / RED_SPECULAR)
// tx: 10 -> Core Rich Vermilion (RED_BASE)
// tx: 11 -> Shadow / Ambient Occlusion (RED_SHADOW)
// -------------------------------------------------------------
for (let ty = 8; ty <= 29; ty++) {
  // Skip intersection with Nuki (ty 9, 10) so Nuki's beam passes cleanly in front
  if (ty === 9 || ty === 10) continue;

  setSymmetric(8, ty, C.RED_OUTLINE);
  setSymmetric(9, ty, ty % 6 === 0 ? C.RED_SPECULAR : C.RED_HIGHLIGHT);
  setSymmetric(10, ty, C.RED_BASE);
  setSymmetric(11, ty, C.RED_SHADOW);
}

// Pillar Gold Fitting Ring right under Nuki (ty: 11)
setSymmetric(8, 11, C.GOLD_DARK);
setSymmetric(9, 11, C.GOLD_LIGHT);
setSymmetric(10, 11, C.GOLD_BRIGHT);
setSymmetric(11, 11, C.GOLD_DARK);

// -------------------------------------------------------------
// 7. SACRED SHIMENAWA (Braided Straw Rope) & SHIDE (White Paper Streamers)
// Hung just beneath Nuki crossbeam at ty: 12
// -------------------------------------------------------------
// Scalloped straw rope between pillars (tx: 12 to 27)
const ropeY = [
  12, 12, 12, 13, 13, 13, 13, 12 // Scallop 1: tx 12..19
];
for (let i = 0; i < 8; i++) {
  const tx = 12 + i;
  const ry = ropeY[i];
  setSymmetric(tx, ry, (tx % 2 === 0) ? C.STRAW_LIGHT : C.STRAW_MID);
  // Rope underside shadow
  setSymmetric(tx, ry + 1, C.STRAW_DARK);
}

// Hanging Shide (White zig-zag lightning paper streamers)
// Streamer 1: Left (tx: 14..15, ty: 14..18)
// Streamer 2: Center (tx: 19..20, ty: 13..18)
// Streamer 3: Right (tx: 24..25, ty: 14..18) (mirrored by tx 14..15)

// Streamer 1 (Left & Right via symmetry)
setSymmetric(14, 14, C.PAPER_WHITE);
setSymmetric(15, 14, C.PAPER_SHADE);
setSymmetric(15, 15, C.PAPER_WHITE);
setSymmetric(16, 15, C.PAPER_SHADE);
setSymmetric(14, 16, C.PAPER_SHADE);
setSymmetric(15, 16, C.PAPER_WHITE);
setSymmetric(15, 17, C.PAPER_SHADE);
setSymmetric(15, 18, C.PAPER_DARK);

// Streamer 2 (Center)
setTexel(19, 14, C.PAPER_WHITE);
setTexel(20, 14, C.PAPER_SHADE);
setTexel(18, 15, C.PAPER_SHADE);
setTexel(19, 15, C.PAPER_WHITE);
setTexel(19, 16, C.PAPER_WHITE);
setTexel(20, 16, C.PAPER_SHADE);
setTexel(20, 17, C.PAPER_WHITE);
setTexel(19, 18, C.PAPER_SHADE);
setTexel(20, 18, C.PAPER_DARK);

// -------------------------------------------------------------
// 8. NEMAKI (Black Protective Pillar Base Sleeves)
// ty: 30..31, tx: 8..11 (and mirrored)
// -------------------------------------------------------------
for (let ty = 30; ty <= 31; ty++) {
  setSymmetric(8, ty, C.ROOF_BLACK);
  setSymmetric(9, ty, ty === 30 ? C.ROOF_SPECULAR : C.ROOF_MID);
  setSymmetric(10, ty, C.ROOF_DARK);
  setSymmetric(11, ty, C.ROOF_BLACK);
}
// Gold band separating red wood from black sleeve (ty: 30 top edge)
setSymmetric(8, 30, C.GOLD_DARK);
setSymmetric(9, 30, C.GOLD_LIGHT);
setSymmetric(10, 30, C.GOLD_BRIGHT);
setSymmetric(11, 30, C.GOLD_MID);

// -------------------------------------------------------------
// 9. KAMEBARA (Weathered Granite Stone Pedestal Plinths)
// ty: 32..35
// Top step (ty: 32): width 5 texels (tx: 7..11)
// Bottom base (ty: 33..35): width 6 texels (tx: 7..12)
// -------------------------------------------------------------
// Top step (ty: 32)
for (let tx = 7; tx <= 11; tx++) {
  setSymmetric(tx, 32, tx === 8 ? C.STONE_SPECULAR : (tx === 7 || tx === 11 ? C.STONE_DARK : C.STONE_LIGHT));
}

// Bottom main pedestal (ty: 33..35)
for (let ty = 33; ty <= 35; ty++) {
  for (let tx = 7; tx <= 12; tx++) {
    if (tx === 7) {
      setSymmetric(tx, ty, C.STONE_DARK);
    } else if (tx === 8) {
      setSymmetric(tx, ty, ty === 33 ? C.STONE_SPECULAR : C.STONE_LIGHT);
    } else if (tx >= 9 && tx <= 11) {
      setSymmetric(tx, ty, C.STONE_MID);
    } else if (tx === 12) {
      setSymmetric(tx, ty, C.STONE_DARK);
    }
  }
}
// Base contact shadow underneath the plinths (ty: 35 bottom edge)
setSymmetric(7, 35, C.STONE_DARK);
setSymmetric(12, 35, C.STONE_DARK);

// -------------------------------------------------------------
// Write the Output PNG: 160 x 144 px (40 texels x 36 texels x 4px)
// -------------------------------------------------------------
const finalW = W_TEX * TEX_SIZE; // 160
const finalH = H_TEX * TEX_SIZE; // 144

const pngBuffer = createPNG(finalW, finalH, (x, y) => {
  const tx = Math.floor(x / TEX_SIZE);
  const ty = Math.floor(y / TEX_SIZE);
  return grid[ty][tx];
});

const outPath = 'c:/Users/Noctus/Documents/Tessera_legacy/public/map/prop_torii.png';
fs.writeFileSync(outPath, pngBuffer);
console.log(`Successfully generated 16-bit pixel Torii gate at ${outPath} (${finalW}x${finalH} px)!`);
