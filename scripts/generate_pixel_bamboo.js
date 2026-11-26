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

if (!fs.existsSync('public/map')) {
  fs.mkdirSync('public/map', { recursive: true });
}

// 4px per chunky retro texel
const T = 4;

// =========================================================================
// 1. AUTHENTIC 16-BIT TALL BAMBOO STALK (48x128 px, 12x32 texels)
// Segmented culm with dark joints, sunlit vertical cylinder highlight,
// and natural tiered lanceolate leaf sprays (sasa) sprouting at nodes.
// =========================================================================
const BP = {
  trans:       [0, 0, 0, 0],
  darkOutline: [5, 46, 22, 255],     // Deep shadow outline #052e16
  jointDark:   [20, 83, 45, 255],    // Node joint crevice #14532d
  stemShadow:  [22, 101, 52, 255],   // Shaded stem side #166534
  stemMid:     [22, 163, 74, 255],   // Base vibrant bamboo green #16a34a
  stemLight:   [74, 222, 128, 255],  // Sunlit culm bevel #4ade80
  stemGlint:   [187, 247, 208, 255], // Glistening stem glint #bbf7d0
  leafDark:    [21, 128, 61, 255],   // Leaf underside #15803d
  leafMid:     [34, 197, 94, 255],   // Leaf blade #22c55e
  leafLight:   [134, 239, 172, 255], // Sunlit leaf tip #86efac
};

// 12 wide x 32 tall texels
// Stem occupies cols 4 to 7 (4 texels = 16px wide culm)
// Leaves branch out to left (cols 0-3) and right (cols 8-11)
const bambooGrid = Array.from({ length: 32 }, () => Array(12).fill(0));

// Build stem (cols 4, 5, 6, 7)
for (let y = 0; y < 32; y++) {
  const isJoint = (y % 8 === 0) || (y % 8 === 7);
  if (isJoint) {
    bambooGrid[y][3] = 1; // dark outline
    bambooGrid[y][4] = 2; // joint dark
    bambooGrid[y][5] = 2; // joint dark
    bambooGrid[y][6] = 4; // joint bevel
    bambooGrid[y][7] = 2; // joint dark
    bambooGrid[y][8] = 1; // dark outline
  } else {
    bambooGrid[y][4] = 3; // stemShadow
    bambooGrid[y][5] = 4; // stemMid
    bambooGrid[y][6] = 5; // stemLight
    bambooGrid[y][7] = 3; // stemShadow
  }
}

// Node 1 Leaf Spray (y: 6 to 10) -> Right branch
bambooGrid[6][8]  = 8; bambooGrid[6][9]  = 9;
bambooGrid[7][8]  = 7; bambooGrid[7][9]  = 8; bambooGrid[7][10] = 9;
bambooGrid[8][7]  = 8; bambooGrid[8][8]  = 8; bambooGrid[8][9]  = 9;
bambooGrid[9][8]  = 7; bambooGrid[9][9]  = 8;
// Left small shoot
bambooGrid[7][3]  = 8; bambooGrid[7][2]  = 9;
bambooGrid[8][3]  = 7; bambooGrid[8][2]  = 8; bambooGrid[8][1]  = 9;

// Node 2 Leaf Spray (y: 14 to 18) -> Left heavy branch
bambooGrid[14][3] = 8; bambooGrid[14][2] = 8; bambooGrid[14][1] = 9;
bambooGrid[15][4] = 7; bambooGrid[15][3] = 8; bambooGrid[15][2] = 8; bambooGrid[15][1] = 9; bambooGrid[15][0] = 9;
bambooGrid[16][3] = 7; bambooGrid[16][2] = 8; bambooGrid[16][1] = 9;
bambooGrid[17][3] = 8; bambooGrid[17][2] = 7;
// Right branch
bambooGrid[15][8] = 8; bambooGrid[15][9] = 9; bambooGrid[15][10]= 9;
bambooGrid[16][8] = 7; bambooGrid[16][9] = 8; bambooGrid[16][10]= 9;

// Node 3 Leaf Spray (y: 22 to 26) -> Right heavy branch
bambooGrid[22][8] = 8; bambooGrid[22][9] = 8; bambooGrid[22][10] = 9;
bambooGrid[23][7] = 7; bambooGrid[23][8] = 8; bambooGrid[23][9]  = 8; bambooGrid[23][10] = 9; bambooGrid[23][11] = 9;
bambooGrid[24][8] = 7; bambooGrid[24][9] = 8; bambooGrid[24][10] = 9;
bambooGrid[25][8] = 8; bambooGrid[25][9] = 7;
// Left branch
bambooGrid[23][3] = 8; bambooGrid[23][2] = 9;
bambooGrid[24][3] = 7; bambooGrid[24][2] = 8; bambooGrid[24][1] = 9;

// Top Crown (y: 0 to 4)
bambooGrid[0][4] = 8; bambooGrid[0][5] = 9; bambooGrid[0][6] = 9;
bambooGrid[1][3] = 8; bambooGrid[1][4] = 8; bambooGrid[1][5] = 9; bambooGrid[1][6] = 9; bambooGrid[1][7] = 8;
bambooGrid[2][2] = 8; bambooGrid[2][3] = 8; bambooGrid[2][4] = 5; bambooGrid[2][5] = 6; bambooGrid[2][6] = 5; bambooGrid[2][7] = 8; bambooGrid[2][8] = 9;
bambooGrid[3][3] = 7; bambooGrid[3][4] = 4; bambooGrid[3][5] = 5; bambooGrid[3][6] = 4; bambooGrid[3][7] = 7;

const bambooLookup = [
  BP.trans, BP.darkOutline, BP.jointDark, BP.stemShadow, BP.stemMid,
  BP.stemLight, BP.stemGlint, BP.leafDark, BP.leafMid, BP.leafLight
];

const bambooPNG = createPNG(48, 128, (x, y) => {
  const gx = Math.min(11, Math.floor(x / T));
  const gy = Math.min(31, Math.floor(y / T));
  const val = bambooGrid[gy][gx];
  return bambooLookup[val];
});
fs.writeFileSync('public/map/prop_bamboo_stalk.png', bambooPNG);
console.log('Saved 16-bit public/map/prop_bamboo_stalk.png (48x128, 4px texels)');

// =========================================================================
// 2. AUTHENTIC 16-BIT BAMBOO CLUSTER (DENSE GROVE) (72x136 px, 18x34 texels)
// Staggered multi-culm grove with tiered canopies for natural depth
// =========================================================================
const clusterGrid = Array.from({ length: 34 }, () => Array(18).fill(0));

// Stalk A (left culm, cols 3-5, y: 4 to 33)
for (let y = 4; y < 34; y++) {
  const isJoint = ((y - 4) % 7 === 0);
  if (isJoint) {
    clusterGrid[y][2] = 1; clusterGrid[y][3] = 2; clusterGrid[y][4] = 4; clusterGrid[y][5] = 2; clusterGrid[y][6] = 1;
  } else {
    clusterGrid[y][3] = 3; clusterGrid[y][4] = 5; clusterGrid[y][5] = 3;
  }
}

// Stalk B (right culm, cols 12-14, y: 2 to 33)
for (let y = 2; y < 34; y++) {
  const isJoint = ((y - 2) % 7 === 0);
  if (isJoint) {
    clusterGrid[y][11] = 1; clusterGrid[y][12] = 2; clusterGrid[y][13] = 4; clusterGrid[y][14] = 2; clusterGrid[y][15] = 1;
  } else {
    clusterGrid[y][12] = 3; clusterGrid[y][13] = 5; clusterGrid[y][14] = 3;
  }
}

// Stalk C (center-rear culm, cols 8-9, y: 0 to 33)
for (let y = 0; y < 34; y++) {
  if (clusterGrid[y][8] === 0) clusterGrid[y][8] = 3;
  if (clusterGrid[y][9] === 0) clusterGrid[y][9] = 4;
}

// Leaf sprays across canopy
const clusterLeaves = [
  // Top canopy
  [0, 7], [0, 8], [0, 9], [0, 10], [1, 6], [1, 7], [1, 8], [1, 9], [1, 10], [1, 11],
  [2, 5], [2, 6], [2, 7], [2, 8], [2, 9], [2, 10], [2, 11], [2, 12],
  [3, 1], [3, 2], [3, 7], [3, 8], [3, 13], [3, 14],
  [4, 0], [4, 1], [4, 2], [4, 14], [4, 15], [4, 16],
  // Mid canopy sprays
  [10, 0], [10, 1], [10, 2], [10, 6], [10, 7], [10, 15], [10, 16], [10, 17],
  [11, 1], [11, 2], [11, 6], [11, 7], [11, 8], [11, 14], [11, 15],
  [12, 2], [12, 7], [12, 8], [12, 13], [12, 14],
  [18, 0], [18, 1], [18, 6], [18, 7], [18, 10], [18, 11], [18, 16],
  [19, 1], [19, 2], [19, 7], [19, 8], [19, 10], [19, 11], [19, 15],
  [20, 2], [20, 7], [20, 11],
];

clusterLeaves.forEach(([cy, cx]) => {
  if (clusterGrid[cy] && clusterGrid[cy][cx] !== undefined) {
    const isTip = cx === 0 || cx === 17 || cy === 0;
    clusterGrid[cy][cx] = isTip ? 9 : 8;
  }
});

const clusterPNG = createPNG(72, 136, (x, y) => {
  const gx = Math.min(17, Math.floor(x / T));
  const gy = Math.min(33, Math.floor(y / T));
  const val = clusterGrid[gy][gx];
  return bambooLookup[val];
});
fs.writeFileSync('public/map/prop_bamboo_cluster.png', clusterPNG);
console.log('Saved 16-bit public/map/prop_bamboo_cluster.png (72x136, 4px texels)');

// =========================================================================
// 3. AUTHENTIC 16-BIT SHINTO JIZO STONE STATUE (32x40 px, 8x10 texels)
// Ancient mossy stone Buddhist guardian statue with red bib (Maekake)
// =========================================================================
const JP = {
  trans:       [0, 0, 0, 0],
  outline:     [15, 23, 42, 255],    // Dark stone border #0f172a
  stoneShadow: [51, 65, 85, 255],    // Shadow stone #334155
  stoneMid:    [100, 116, 139, 255], // Base weathered granite #64748b
  stoneLight:  [148, 163, 184, 255], // Sunlit stone crest #94a3b8
  stoneGlint:  [226, 232, 240, 255], // Highlight glint #e2e8f0
  bibRed:      [220, 38, 38, 255],   // Sacred red cloth bib #dc2626
  bibLight:    [248, 113, 113, 255], // Sunlit red bib #f87171
  mossGreen:   [34, 197, 94, 255],   // Moss patina #22c55e
};

// 8x10 texels Jizo Statue Grid
// 0: trans, 1: outline, 2: shadow, 3: mid, 4: light, 5: glint, 6: bibRed, 7: bibLight, 8: mossGreen
const jizoGrid = [
  // Head halo / stone top
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 4, 5, 4, 3, 1, 0],
  // Head face (serene peaceful expression)
  [1, 4, 3, 1, 1, 3, 2, 1],
  [1, 4, 3, 3, 3, 2, 2, 1],
  // Red sacred cloth bib (Maekake)
  [0, 1, 6, 7, 7, 6, 1, 0],
  [1, 6, 7, 6, 6, 6, 6, 1],
  // Stone body & folded hands in prayer (Anjali mudra)
  [1, 4, 3, 5, 4, 2, 2, 1],
  [1, 8, 3, 4, 3, 8, 2, 1],
  // Lotus pedestal base
  [1, 4, 4, 3, 3, 2, 2, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
];

const jizoLookup = [
  JP.trans, JP.outline, JP.stoneShadow, JP.stoneMid, JP.stoneLight,
  JP.stoneGlint, JP.bibRed, JP.bibLight, JP.mossGreen
];

const jizoPNG = createPNG(32, 40, (x, y) => {
  const gx = Math.min(7, Math.floor(x / T));
  const gy = Math.min(9, Math.floor(y / T));
  const val = jizoGrid[gy][gx];
  return jizoLookup[val];
});
fs.writeFileSync('public/map/prop_jizo_statue.png', jizoPNG);
console.log('Saved 16-bit public/map/prop_jizo_statue.png (32x40, 4px texels)');

// =========================================================================
// 4. AUTHENTIC 16-BIT FAIRY MUSHROOM CLUSTER (28x28 px, 7x7 texels)
// Replaces vector triangle paths with authentic chunky pixel mushrooms!
// =========================================================================
const MP = {
  trans:    [0, 0, 0, 0],
  outline:  [80, 7, 36, 255],     // Dark mushroom edge #500724
  capDark:  [190, 24, 93, 255],   // Shadow fuchsia cap #be185d
  capMid:   [236, 72, 153, 255],  // Glowing pink cap #ec4899
  capLight: [244, 114, 182, 255], // Sunlit cap highlight #f472b6
  spotWhite:[255, 255, 255, 255], // White fairy spots
  stemDark: [156, 163, 175, 255], // Stem shadow #9ca3af
  stemLight:[243, 244, 246, 255], // Stem body #f3f4f6
};

// 7x7 Mushroom Grid
// 0: trans, 1: outline, 2: capDark, 3: capMid, 4: capLight, 5: spotWhite, 6: stemDark, 7: stemLight
const shroomGrid = [
  [0, 0, 1, 1, 1, 0, 0],
  [0, 1, 4, 5, 4, 1, 0],
  [1, 3, 5, 3, 5, 3, 1],
  [1, 2, 2, 2, 2, 2, 1],
  [0, 0, 1, 7, 6, 1, 0],
  [0, 0, 1, 7, 6, 1, 0],
  [0, 1, 1, 7, 6, 1, 1],
];

const shroomLookup = [
  MP.trans, MP.outline, MP.capDark, MP.capMid, MP.capLight,
  MP.spotWhite, MP.stemDark, MP.stemLight
];

const shroomPNG = createPNG(28, 28, (x, y) => {
  const gx = Math.min(6, Math.floor(x / T));
  const gy = Math.min(6, Math.floor(y / T));
  const val = shroomGrid[gy][gx];
  return shroomLookup[val];
});
fs.writeFileSync('public/map/prop_pixel_mushroom.png', shroomPNG);
console.log('Saved 16-bit public/map/prop_pixel_mushroom.png (28x28, 4px texels)');
