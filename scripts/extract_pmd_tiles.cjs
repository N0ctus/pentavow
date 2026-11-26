const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function readPNG(p) {
  const buf = fs.readFileSync(p);
  let pos = 8;
  let width, height, idatBuffers = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === 'IDAT') {
      idatBuffers.push(data);
    }
    pos += 12 + len;
  }
  const inflated = zlib.inflateSync(Buffer.concat(idatBuffers));
  const rowSize = width * 4 + 1;
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const filter = inflated[y * rowSize];
    const rowOffset = y * rowSize + 1;
    for (let x = 0; x < width * 4; x++) {
      let val = inflated[rowOffset + x];
      const a = x >= 4 ? pixels[y * width * 4 + x - 4] : 0;
      const b = y > 0 ? pixels[(y - 1) * width * 4 + x] : 0;
      const c = (x >= 4 && y > 0) ? pixels[(y - 1) * width * 4 + x - 4] : 0;
      if (filter === 1) val = (val + a) & 0xff;
      else if (filter === 2) val = (val + b) & 0xff;
      else if (filter === 3) val = (val + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        val = (val + pr) & 0xff;
      }
      pixels[y * width * 4 + x] = val;
    }
  }
  return { width, height, pixels };
}

function writePNG(p, width, height, pixels) {
  const rowSize = width * 4 + 1;
  const uncompressed = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    uncompressed[y * rowSize] = 0;
    pixels.copy(uncompressed, y * rowSize + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(uncompressed);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    const crcVal = zlib.crc32(Buffer.concat([typeBuf, data]));
    crc.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }
  const out = Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
  fs.writeFileSync(p, out);
}

function toHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

const srcPath = 'Tiles/Game Boy Advance - Pokemon Mystery Dungeon_ Red Rescue Team - Dungeon Tiles - Buried Relic B21F - B50F.png';
const outDir = 'public/pmd_buried_relic';
const tilesBaseDir = path.join(outDir, 'tiles');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(tilesBaseDir)) fs.mkdirSync(tilesBaseDir, { recursive: true });

console.log('Loading source sheet:', srcPath);
const img = readPNG(srcPath);
console.log(`Loaded sheet: ${img.width}x${img.height} px`);

function getPixel(x, y) {
  if (x < 0 || x >= img.width || y < 0 || y >= img.height) return [0,0,0,0];
  const idx = (y * img.width + x) * 4;
  return [img.pixels[idx], img.pixels[idx+1], img.pixels[idx+2], img.pixels[idx+3]];
}

const GRID_LEFT = 8;
const GRID_TOP = 162;
const CELL_PITCH = 25;
const TILE_SIZE = 24;
const NUM_ROWS = 24;

const GROUPS = [
  ['legend', 0, 3],
  ['walls', 3, 6],
  ['wall_alt_1', 6, 9],
  ['wall_alt_2', 9, 12],
  ['ground', 12, 15],
  ['ground_alt_1', 15, 18],
  ['ground_alt_2', 18, 21],
  ['unused_ground', 21, 24],
  ['water', 24, 27],
  ['water_sparkle', 27, 30]
];

// Sample 8x8 block in legend
function sampleLegendBlock(startX, startY, bx, by) {
  const cx = startX + bx * 8 + 4;
  const cy = startY + by * 8 + 4;
  const [r, g, b] = getPixel(cx, cy);
  if (r < 50 && g < 50 && b < 50) return 1; // black = same type neighbor
  return 0; // teal / open
}

const legendSlots = [];
const slotIndexMap = {}; // "r,sc" -> tile_index
const bitmaskToTileIndex = {};

for (let r = 0; r < NUM_ROWS; r++) {
  const yStart = GRID_TOP + r * CELL_PITCH + 1;
  for (let sc = 0; sc < 3; sc++) {
    const xStart = GRID_LEFT + sc * CELL_PITCH + 1;
    const [cr, cg, cb] = getPixel(xStart + 12, yStart + 12);
    if (cr > 150 && cg > 150 && cb > 150) {
      const nw = sampleLegendBlock(xStart, yStart, 0, 0);
      const n  = sampleLegendBlock(xStart, yStart, 1, 0);
      const ne = sampleLegendBlock(xStart, yStart, 2, 0);
      const w  = sampleLegendBlock(xStart, yStart, 0, 1);
      const e  = sampleLegendBlock(xStart, yStart, 2, 1);
      const sw = sampleLegendBlock(xStart, yStart, 0, 2);
      const s  = sampleLegendBlock(xStart, yStart, 1, 2);
      const se = sampleLegendBlock(xStart, yStart, 2, 2);

      const mask = (nw << 0) | (n << 1) | (ne << 2) | (w << 3) | (e << 4) | (sw << 5) | (s << 6) | (se << 7);
      const tileIdx = legendSlots.length;
      legendSlots.push({
        tile_index: tileIdx,
        row: r,
        col: sc,
        mask,
        neighbors: { nw, n, ne, w, e, sw, s, se }
      });
      slotIndexMap[`${r},${sc}`] = tileIdx;
      bitmaskToTileIndex[mask] = tileIdx;
    }
  }
}
console.log(`Extracted ${legendSlots.length} autotile bitmasks from Legend column.`);

// Build canonical 256 -> 47 lookup
const lookup256 = new Array(256).fill(0);
for (let m = 0; m < 256; m++) {
  let nw = (m >> 0) & 1;
  let n  = (m >> 1) & 1;
  let ne = (m >> 2) & 1;
  let w  = (m >> 3) & 1;
  let e  = (m >> 4) & 1;
  let sw = (m >> 5) & 1;
  let s  = (m >> 6) & 1;
  let se = (m >> 7) & 1;

  if (!n || !w) nw = 0;
  if (!n || !e) ne = 0;
  if (!s || !w) sw = 0;
  if (!s || !e) se = 0;

  const canon = (nw << 0) | (n << 1) | (ne << 2) | (w << 3) | (e << 4) | (sw << 5) | (s << 6) | (se << 7);
  lookup256[m] = bitmaskToTileIndex[canon] ?? 0;
}

// Extract tiles
const extractedRegistry = {};

for (const [groupName, colStart, colEnd] of GROUPS) {
  const groupDir = path.join(tilesBaseDir, groupName);
  if (!fs.existsSync(groupDir)) fs.mkdirSync(groupDir, { recursive: true });
  extractedRegistry[groupName] = [];

  for (let r = 0; r < NUM_ROWS; r++) {
    const yStart = GRID_TOP + r * CELL_PITCH + 1;
    for (let sc = colStart; sc < colEnd; sc++) {
      const xStart = GRID_LEFT + sc * CELL_PITCH + 1;
      const tileBuf = Buffer.alloc(TILE_SIZE * TILE_SIZE * 4);
      let visiblePixels = 0;

      for (let y = 0; y < TILE_SIZE; y++) {
        for (let x = 0; x < TILE_SIZE; x++) {
          const [red, green, blue, alpha] = getPixel(xStart + x, yStart + y);
          const dIdx = (y * TILE_SIZE + x) * 4;

          // Teal check #008080
          const isTeal = (red === 0 && green === 128 && blue === 128);
          // Magenta check #FF00FF for water and water_sparkle
          const isMagenta = (groupName === 'water' || groupName === 'water_sparkle') && (red === 255 && green === 0 && blue === 255);

          if (isTeal || isMagenta) {
            tileBuf[dIdx] = 0;
            tileBuf[dIdx+1] = 0;
            tileBuf[dIdx+2] = 0;
            tileBuf[dIdx+3] = 0;
          } else {
            tileBuf[dIdx] = red;
            tileBuf[dIdx+1] = green;
            tileBuf[dIdx+2] = blue;
            tileBuf[dIdx+3] = alpha;
            visiblePixels++;
          }
        }
      }

      if (visiblePixels > 0) {
        const relCol = sc - colStart;
        const tileIdx = slotIndexMap[`${r},${relCol}`];
        const filename = tileIdx !== undefined ? `tile_${tileIdx}.png` : `tile_r${r}_c${sc}.png`;
        const filepath = path.join(groupDir, filename);

        writePNG(filepath, TILE_SIZE, TILE_SIZE, tileBuf);
        extractedRegistry[groupName].push({
          filename,
          tile_index: tileIdx ?? null,
          row: r,
          col: sc,
          rel_col: relCol
        });
      }
    }
  }
  console.log(`Extracted ${extractedRegistry[groupName].length} tiles for ${groupName}`);
}

// Extract palettes
console.log('Extracting animation palettes...');
const waterPalette = [];
for (let pr = 0; pr < 16; pr++) {
  const rowColors = [];
  const py = 167 + pr * 11 + 5;
  for (let pc = 0; pc < 16; pc++) {
    const px = 766 + pc * 11 + 5;
    const [r, g, b] = getPixel(px, py);
    rowColors.push(toHex(r, g, b));
  }
  waterPalette.push(rowColors);
}

const sparklePalette = [];
for (let pr = 0; pr < 4; pr++) {
  const rowColors = [];
  const py = 367 + pr * 11 + 5;
  for (let pc = 0; pc < 16; pc++) {
    const px = 766 + pc * 11 + 5;
    const [r, g, b] = getPixel(px, py);
    rowColors.push(toHex(r, g, b));
  }
  sparklePalette.push(rowColors);
}

// Build unified atlas containing all tiles and pre-rendered palette frames!
// For water: 16 palette animation frames
// For sparkle: 4 palette animation frames
console.log('Building animation palette variations for water and sparkle...');
const waterFrames = []; // [frame 0..15][tile 0..46] = Buffer(24*24*4)
const sparkleFrames = []; // [frame 0..3][tile 0..46] = Buffer(24*24*4)

// Map from base water color to index (0..15)
const baseWaterPalette = waterPalette[0];
const baseSparklePalette = sparklePalette[0];

function colorDistance(c1, c2) {
  return Math.abs(c1[0] - c2[0]) + Math.abs(c1[1] - c2[1]) + Math.abs(c1[2] - c2[2]);
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const baseWaterRgb = baseWaterPalette.map(hexToRgb);
const baseSparkleRgb = baseSparklePalette.map(hexToRgb);

// Pre-render water frames 0..15
for (let f = 0; f < 16; f++) {
  const frameTiles = [];
  const targetRgb = waterPalette[f].map(hexToRgb);
  const frameDir = path.join(tilesBaseDir, `water_f${f}`);
  if (!fs.existsSync(frameDir)) fs.mkdirSync(frameDir, { recursive: true });

  for (let t = 0; t < 47; t++) {
    const origPath = path.join(tilesBaseDir, 'water', `tile_${t}.png`);
    if (!fs.existsSync(origPath)) continue;
    const origTile = readPNG(origPath);
    const recolored = Buffer.alloc(TILE_SIZE * TILE_SIZE * 4);

    for (let i = 0; i < TILE_SIZE * TILE_SIZE; i++) {
      const idx = i * 4;
      const a = origTile.pixels[idx+3];
      if (a === 0) {
        recolored[idx] = 0; recolored[idx+1] = 0; recolored[idx+2] = 0; recolored[idx+3] = 0;
        continue;
      }
      const r = origTile.pixels[idx];
      const g = origTile.pixels[idx+1];
      const b = origTile.pixels[idx+2];

      // Find closest color in base water palette
      let bestIdx = 0;
      let bestDist = 999999;
      for (let ci = 0; ci < 16; ci++) {
        const d = colorDistance([r, g, b], baseWaterRgb[ci]);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = ci;
        }
      }

      // If matched one of the water colors (or any palette color), map to target frame color
      if (bestDist < 15) {
        const nr = targetRgb[bestIdx];
        recolored[idx] = nr[0];
        recolored[idx+1] = nr[1];
        recolored[idx+2] = nr[2];
        recolored[idx+3] = 255;
      } else {
        recolored[idx] = r;
        recolored[idx+1] = g;
        recolored[idx+2] = b;
        recolored[idx+3] = a;
      }
    }
    writePNG(path.join(frameDir, `tile_${t}.png`), TILE_SIZE, TILE_SIZE, recolored);
  }
}
console.log('Pre-rendered all 16 water animation frame sets!');

// Pre-render sparkle frames 0..3
for (let f = 0; f < 4; f++) {
  const targetRgb = sparklePalette[f].map(hexToRgb);
  const frameDir = path.join(tilesBaseDir, `sparkle_f${f}`);
  if (!fs.existsSync(frameDir)) fs.mkdirSync(frameDir, { recursive: true });

  for (let t = 0; t < 47; t++) {
    const origPath = path.join(tilesBaseDir, 'water_sparkle', `tile_${t}.png`);
    if (!fs.existsSync(origPath)) continue;
    const origTile = readPNG(origPath);
    const recolored = Buffer.alloc(TILE_SIZE * TILE_SIZE * 4);

    for (let i = 0; i < TILE_SIZE * TILE_SIZE; i++) {
      const idx = i * 4;
      const a = origTile.pixels[idx+3];
      if (a === 0) {
        recolored[idx] = 0; recolored[idx+1] = 0; recolored[idx+2] = 0; recolored[idx+3] = 0;
        continue;
      }
      const r = origTile.pixels[idx];
      const g = origTile.pixels[idx+1];
      const b = origTile.pixels[idx+2];

      let bestIdx = 0;
      let bestDist = 999999;
      for (let ci = 0; ci < 16; ci++) {
        const d = colorDistance([r, g, b], baseSparkleRgb[ci]);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = ci;
        }
      }

      if (bestDist < 15) {
        const nr = targetRgb[bestIdx];
        recolored[idx] = nr[0];
        recolored[idx+1] = nr[1];
        recolored[idx+2] = nr[2];
        recolored[idx+3] = 255;
      } else {
        recolored[idx] = r;
        recolored[idx+1] = g;
        recolored[idx+2] = b;
        recolored[idx+3] = a;
      }
    }
    writePNG(path.join(frameDir, `tile_${t}.png`), TILE_SIZE, TILE_SIZE, recolored);
  }
}
console.log('Pre-rendered all 4 sparkle animation frame sets!');

// Build a Master Sprite Atlas PNG for ultra-fast single-image loading in Canvas!
// Layout:
// Row 0: Walls (47 tiles)
// Row 1: Wall Alt 1 (47 slots, empty where no alt)
// Row 2: Wall Alt 2
// Row 3: Ground (47 tiles)
// Row 4: Ground Alt 1
// Row 5: Ground Alt 2
// Row 6..21: Water Frames 0..15 (47 tiles each)
// Row 22..25: Sparkle Frames 0..3 (47 tiles each)
const ATLAS_COLS = 47;
const ATLAS_ROWS = 26; // 6 (walls/ground) + 16 (water) + 4 (sparkle)
const ATLAS_WIDTH = ATLAS_COLS * TILE_SIZE;  // 47 * 24 = 1128 px
const ATLAS_HEIGHT = ATLAS_ROWS * TILE_SIZE; // 26 * 24 = 624 px
const atlasBuf = Buffer.alloc(ATLAS_WIDTH * ATLAS_HEIGHT * 4);

function blitTileToAtlas(srcBuf, atlasRow, atlasCol) {
  for (let y = 0; y < TILE_SIZE; y++) {
    const srcOffset = y * TILE_SIZE * 4;
    const destY = atlasRow * TILE_SIZE + y;
    const destX = atlasCol * TILE_SIZE;
    const destOffset = (destY * ATLAS_WIDTH + destX) * 4;
    srcBuf.copy(atlasBuf, destOffset, srcOffset, srcOffset + TILE_SIZE * 4);
  }
}

// Blit standard groups
const groupAtlasRows = {
  walls: 0,
  wall_alt_1: 1,
  wall_alt_2: 2,
  ground: 3,
  ground_alt_1: 4,
  ground_alt_2: 5
};

for (const [grp, aRow] of Object.entries(groupAtlasRows)) {
  for (let t = 0; t < 47; t++) {
    const p = path.join(tilesBaseDir, grp, `tile_${t}.png`);
    if (fs.existsSync(p)) {
      const tile = readPNG(p);
      blitTileToAtlas(tile.pixels, aRow, t);
    }
  }
}

// Blit Water frames (rows 6..21)
for (let f = 0; f < 16; f++) {
  for (let t = 0; t < 47; t++) {
    const p = path.join(tilesBaseDir, `water_f${f}`, `tile_${t}.png`);
    if (fs.existsSync(p)) {
      const tile = readPNG(p);
      blitTileToAtlas(tile.pixels, 6 + f, t);
    }
  }
}

// Blit Sparkle frames (rows 22..25)
for (let f = 0; f < 4; f++) {
  for (let t = 0; t < 47; t++) {
    const p = path.join(tilesBaseDir, `sparkle_f${f}`, `tile_${t}.png`);
    if (fs.existsSync(p)) {
      const tile = readPNG(p);
      blitTileToAtlas(tile.pixels, 22 + f, t);
    }
  }
}

const atlasPath = path.join(outDir, 'atlas.png');
writePNG(atlasPath, ATLAS_WIDTH, ATLAS_HEIGHT, atlasBuf);
console.log(`Saved master texture atlas: ${atlasPath} (${ATLAS_WIDTH}x${ATLAS_HEIGHT})`);

// Metadata JSON
const metadata = {
  name: 'Pokemon Mystery Dungeon: Red Rescue Team - Buried Relic B21F-B50F',
  tileSize: 24,
  speeds: {
    water_frames: 12,
    sparkle_frames: 8
  },
  atlas: {
    cols: ATLAS_COLS,
    rows: ATLAS_ROWS,
    tileWidth: 24,
    tileHeight: 24,
    rowMap: {
      walls: 0,
      wall_alt_1: 1,
      wall_alt_2: 2,
      ground: 3,
      ground_alt_1: 4,
      ground_alt_2: 5,
      water_f0: 6,
      sparkle_f0: 22
    }
  },
  palettes: {
    water: waterPalette,
    sparkle: sparklePalette
  },
  lookup256: lookup256,
  legend: legendSlots,
  extracted_tiles: extractedRegistry
};

const jsonPath = path.join(outDir, 'tileset_data.json');
fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));
console.log(`Saved tileset data to: ${jsonPath}`);
console.log('Complete pipeline finished successfully!');
