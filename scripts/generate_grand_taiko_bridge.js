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

// 16-BIT GRAND RED ARCHED JAPANESE TAIKO-BASHI BRIDGE (208 x 104 px)
const w = 208;
const h = 104;
const cx = 104;

const P = {
  trans: [0, 0, 0, 0],
  // Lacquered vermilion handrails & balusters
  redOutline: [100, 14, 28, 255],     // Deepest outline shadow
  redShadow: [153, 27, 27, 255],      // #991b1b
  redBase: [220, 38, 38, 255],        // #dc2626 Vibrant Vermilion
  redMid: [239, 68, 68, 255],         // #ef4444
  redLight: [248, 113, 113, 255],     // #f87171 Handrail highlight
  redSpecular: [254, 202, 202, 255],  // #fecaca

  // Bridge deck timbers
  woodDark: [55, 19, 3, 255],         // #371303 Dark timber under arch
  woodShadow: [85, 35, 7, 255],       // #552307
  woodPlank: [130, 58, 15, 255],      // #823a0f Timber plank core
  woodMid: [160, 75, 12, 255],        // #a04b0c
  woodHl: [195, 95, 14, 255],         // #c35f0e Plank step highlight
  woodLight: [230, 130, 30, 255],     // #e6821e Edge sheen

  // Polished gold onion finials (Giboshi) & bronze brackets
  goldDark: [120, 53, 15, 255],       // #78350f
  goldMid: [217, 119, 6, 255],        // #d97706
  goldBase: [250, 204, 21, 255],      // #facc15
  goldLight: [254, 240, 138, 255],    // #fef08a
  goldSpecular: [255, 255, 255, 255], // Pure white glint

  // Granite stone foundation abutments
  stoneDark: [15, 23, 42, 255],       // #0f172a
  stoneShadow: [51, 65, 85, 255],     // #334155
  stoneMid: [71, 85, 105, 255],       // #475569
  stoneLight: [148, 163, 184, 255],   // #94a3b8

  // Water contact shadow
  waterShadow: [4, 24, 44, 180],
};

// Parabolic arch: deck top Y
// Apex at x = 104 is y = 38. Ends at x = 12, 196 -> y = 80.
// 80 = 38 + a * (92)^2 => a = 42 / 8464 ≈ 0.004962
function deckY(x) {
  const dx = x - cx;
  return 38 + 0.004962 * dx * dx;
}

// 7 Grand Posts (Balusters) along the span
const postXList = [18, 46, 75, 104, 133, 162, 190];

const bridgePNG = createPNG(w, h, (x, y) => {
  // Span from x: 10 to 198
  if (x < 10 || x > 198) return P.trans;

  const dy = deckY(x); // Walking surface top

  // -------------------------------------------------------------
  // 1. UNDER-ARCH STRUCTURE & RIVER PYLONS (y > dy + 10)
  // -------------------------------------------------------------
  if (y > dy + 10 && y < 98) {
    // Arch underside curve: apex at y = 50
    const underArchY = 50 + 0.0058 * (x - cx) * (x - cx);
    if (y < underArchY) {
      // Solid dark timber arch rib structure
      if (y >= underArchY - 2) return P.redOutline; // Crimson bottom trim
      if ((x + y) % 4 === 0) return P.woodShadow;
      return P.woodDark;
    }

    // River Pier Pylons (3 sets of twin pilings driving into riverbed)
    // Centered at x = 60, x = 104, x = 148
    const pylonCenters = [60, 104, 148];
    for (const pc of pylonCenters) {
      const pdist = Math.abs(x - pc);
      if (pdist <= 3) {
        if (y >= underArchY) {
          if (pdist === 3) return P.redOutline; // Outer pillar outline
          if (pdist === 2) return P.woodDark;
          if (pdist === 1) return P.woodPlank;
          return (y % 4 === 0) ? P.woodHl : P.woodMid; // Center highlight
        }
      }
      // Pylon cross-brace bracket at underArch junction
      if (pdist <= 5 && y >= underArchY && y <= underArchY + 3) {
        return P.goldDark;
      }
    }

    // Water contact shadow at the waterline (y >= 88 && y <= 98)
    if (y >= 88 && y <= 96 && Math.abs(x - cx) <= 78) {
      return P.waterShadow;
    }
  }

  // -------------------------------------------------------------
  // 2. GRANITE ABUTMENT PIERS (Bank Footings at ends: x <= 22 or x >= 186)
  // -------------------------------------------------------------
  if (x <= 22 || x >= 186) {
    if (y >= dy + 6 && y <= 96) {
      if (x === 10 || x === 198 || y === 96) return P.stoneDark;
      if (y === dy + 6) return P.stoneLight;
      if ((x + y) % 6 === 0) return P.stoneShadow;
      return P.stoneMid;
    }
  }

  // -------------------------------------------------------------
  // 3. WOODEN BRIDGE DECK (Thickness: 10 pixels, from dy to dy + 10)
  // -------------------------------------------------------------
  if (y >= dy && y <= dy + 10) {
    // Bottom crimson fascia trim
    if (y >= dy + 9) return P.redOutline;
    if (y >= dy + 7) return P.redShadow;

    // Deck walking surface top highlight
    if (y <= dy + 1) return P.woodLight;
    if (y <= dy + 2) return P.woodHl;

    // Transverse timber planks (every 4 pixels along the curve)
    if (x % 4 === 0) return P.woodDark;
    if (x % 4 === 1) return P.woodShadow;
    return P.woodPlank;
  }

  // -------------------------------------------------------------
  // 4. VERMILION LACQUERED BALUSTRADE & HANDRAIL (y: dy - 22 to dy)
  // -------------------------------------------------------------
  const railTopY = dy - 22;
  const railMidY = dy - 11;

  // Identify if near a vertical baluster post
  let nearPost = false;
  let isPostCenter = false;
  let postDist = 999;
  for (const px of postXList) {
    const d = Math.abs(x - px);
    if (d <= 2) {
      nearPost = true;
      if (d === 0) isPostCenter = true;
      postDist = Math.min(postDist, d);
    }
  }

  // A. GIBOSHI (Gold Onion-head Finials atop each post: y: railTopY - 7 to railTopY)
  if (nearPost && y >= railTopY - 7 && y <= railTopY) {
    const fy = y - (railTopY - 7); // 0 (tip) to 7 (base)
    if (fy === 0 && isPostCenter) return P.goldSpecular; // Glint tip
    if (fy === 1) return isPostCenter ? P.goldLight : P.goldBase;
    if (fy >= 2 && fy <= 4) {
      if (postDist === 2) return P.goldDark;
      return isPostCenter ? P.goldLight : P.goldBase;
    }
    if (fy >= 5) {
      // Bronze collar base ring
      return (postDist === 2) ? P.goldDark : P.goldMid;
    }
  }

  // B. TOP HANDRAIL (Curved Vermilion Kasagi: 4px thickness)
  if (y >= railTopY && y <= railTopY + 3) {
    if (y === railTopY) return P.redLight;        // Sunlit upper highlight
    if (y === railTopY + 1) return P.redMid;      // Warm vermilion
    if (y === railTopY + 2) return P.redBase;     // Core vermilion
    if (y === railTopY + 3) return P.redOutline;  // Underside shadow
  }

  // C. MID RAIL (Horizontal vermilion crossbeam: 2px thickness)
  if (y >= railMidY && y <= railMidY + 2) {
    if (y === railMidY) return P.redLight;
    if (y === railMidY + 1) return P.redBase;
    return P.redOutline;
  }

  // D. VERTICAL POST SHAFTS (Connecting Railings to Deck)
  if (nearPost && y > railTopY + 3 && y < dy) {
    if (postDist === 2) return P.redOutline;
    if (postDist === 1) return P.redBase;
    return P.redLight; // Center specular highlight
  }

  return P.trans;
});

const outPath = 'c:/Users/Noctus/Documents/Tessera_legacy/public/map/prop_taiko_bridge.png';
fs.writeFileSync(outPath, bridgePNG);
console.log(`Created Grand Taiko Bridge at ${outPath} (${w}x${h} px)!`);
