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
    filtered[y * (stride + 1)] = 0;
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

// =========================================================================
// PALETTES
// =========================================================================
const BAMBOO = {
  // Cane (Culm) Cylindrical Shading
  OUTLINE:    [12, 38, 20, 255],     // #0c2614
  DARKEST:    [18, 54, 28, 255],     // #12361c
  SHADOW:     [28, 78, 38, 255],     // #1c4e26
  MID_DARK:   [38, 105, 48, 255],    // #266930
  BASE:       [52, 138, 62, 255],    // #348a3e
  BRIGHT:     [74, 172, 85, 255],    // #4aac55
  HIGHLIGHT:  [106, 202, 116, 255],  // #6aca74
  SPECULAR:   [168, 236, 176, 255],  // #a8ecb0
  GLINT:      [222, 252, 226, 255],  // #defce2

  // Node Rings (Joints)
  NODE_DARK:  [22, 44, 26, 255],
  NODE_MID:   [88, 110, 56, 255],    // #586e38
  NODE_LIGHT: [156, 178, 102, 255],  // #9cb266
  NODE_PALE:  [210, 226, 160, 255],

  // Leaves (Sasa feathery sprays)
  LEAF_SHADOW:[16, 52, 26, 255],
  LEAF_DARK:  [24, 82, 40, 255],
  LEAF_MID:   [36, 122, 58, 255],
  LEAF_BRIGHT:[58, 170, 82, 255],
  LEAF_LIGHT: [102, 214, 126, 255],
  LEAF_TIP:   [168, 246, 186, 255],
};

const JIZO = {
  // Weathered Granite Stone
  SHADOW_DARK:[18, 24, 38, 255],     // #121826
  STONE_SHADOW:[38, 48, 66, 255],    // #263042
  STONE_DARK:  [58, 70, 92, 255],    // #3a465c
  STONE_MID:   [88, 102, 126, 255],  // #58667e
  STONE_BASE:  [118, 134, 158, 255], // #76869e
  STONE_LIGHT: [160, 175, 198, 255], // #a0afc6
  STONE_BRIGHT:[204, 216, 234, 255], // #ccd8ea
  STONE_SPEC:  [240, 246, 254, 255],

  // Moss Patina Accents
  MOSS_DARK:   [28, 46, 32, 255],
  MOSS_LIGHT:  [58, 92, 54, 255],

  // Red Sacred Bib (Yodarekake)
  RED_OUTLINE: [92, 13, 17, 255],
  RED_DARK:    [138, 22, 28, 255],
  RED_MID:     [185, 28, 36, 255],
  RED_BASE:    [225, 36, 46, 255],
  RED_BRIGHT:  [244, 68, 76, 255],
  RED_LIGHT:   [252, 138, 144, 255],
  RED_TIE:     [254, 205, 208, 255],
  WHITE_TIE:   [245, 245, 250, 255],

  // Sacred Wish-Granting Mani Jewel (Hōju)
  JEWEL_DARK:  [180, 83, 9, 255],
  JEWEL_MID:   [245, 158, 11, 255],
  JEWEL_LIGHT: [253, 224, 71, 255],
  JEWEL_SPEC:  [255, 254, 230, 255],
};

function createBuffer(w, h) {
  const b = Buffer.alloc(w * h * 4);
  return {
    w, h, data: b,
    set(x, y, [r, g, bCol, a]) {
      if (x >= 0 && x < w && y >= 0 && y < h) {
        const idx = (y * w + x) * 4;
        b[idx] = r;
        b[idx + 1] = g;
        b[idx + 2] = bCol;
        b[idx + 3] = a;
      }
    },
    get(x, y) {
      if (x >= 0 && x < w && y >= 0 && y < h) {
        const idx = (y * w + x) * 4;
        return [b[idx], b[idx + 1], b[idx + 2], b[idx + 3]];
      }
      return [0, 0, 0, 0];
    }
  };
}

// Draw realistic cylindrical bamboo cane with nodes
function drawBambooCane(buf, cx, startY, endY, radius, nodeInterval = 28) {
  for (let y = startY; y <= endY; y++) {
    // Check node joint proximity
    const nodeDist = Math.abs((y % nodeInterval) - Math.floor(nodeInterval / 2));
    const isNode = nodeDist <= 1;
    const isNodeRim = nodeDist === 2;
    const rCurrent = isNode ? radius + 1 : (isNodeRim ? radius + 0.5 : radius);

    const left = Math.round(cx - rCurrent);
    const right = Math.round(cx + rCurrent);

    for (let x = left; x <= right; x++) {
      const u = (x - left) / (right - left); // 0 (left) to 1 (right)
      let col = BAMBOO.BASE;

      if (isNode) {
        if (x === left || x === right) col = BAMBOO.NODE_DARK;
        else if (u < 0.25) col = BAMBOO.NODE_MID;
        else if (u < 0.55) col = BAMBOO.NODE_LIGHT;
        else if (u < 0.75) col = BAMBOO.NODE_PALE;
        else col = BAMBOO.NODE_MID;
      } else {
        // Cylindrical light from top-left
        if (x === left || x === right) col = BAMBOO.OUTLINE;
        else if (u < 0.15) col = BAMBOO.DARKEST;
        else if (u < 0.3) col = BAMBOO.SHADOW;
        else if (u < 0.45) col = BAMBOO.MID_DARK;
        else if (u < 0.6) col = BAMBOO.BRIGHT;
        else if (u < 0.72) col = BAMBOO.HIGHLIGHT;
        else if (u < 0.82) col = BAMBOO.SPECULAR; // Bright highlight line
        else if (u < 0.9) col = BAMBOO.BRIGHT;
        else col = BAMBOO.SHADOW;
      }

      buf.set(x, y, col);
    }
  }
}

// Draw feathery lanceolate bamboo leaf spray radiating from a node
function drawLeafSpray(buf, originX, originY, direction, numLeaves = 4, scale = 1.0) {
  // Leaf angles based on direction (-1 for left, 1 for right)
  const baseAngles = direction === -1 
    ? [140, 160, 185, 215] 
    : [40, 20, -5, -35];

  baseAngles.slice(0, numLeaves).forEach((deg, li) => {
    const rad = (deg * Math.PI) / 180;
    const length = Math.round((14 + (li % 3) * 4) * scale);
    const leafWidth = Math.round((2.5 + (li % 2)) * scale);

    for (let d = 0; d < length; d++) {
      const progress = d / length;
      // Slight downward droop as leaf extends
      const droop = Math.pow(progress, 1.8) * 4 * scale;
      const lx = Math.round(originX + Math.cos(rad) * d);
      const ly = Math.round(originY + Math.sin(rad) * d + droop);

      // Width profile: tapered at base, widest at 35%, sharp point at tip
      const wProfile = progress < 0.35 
        ? (progress / 0.35) 
        : Math.pow(1 - (progress - 0.35) / 0.65, 0.8);
      const currentHalfW = Math.max(0.5, leafWidth * wProfile);

      const normAngle = rad + Math.PI / 2;
      const nx = Math.cos(normAngle);
      const ny = Math.sin(normAngle);

      for (let w = -currentHalfW; w <= currentHalfW; w += 0.8) {
        const px = Math.round(lx + nx * w);
        const py = Math.round(ly + ny * w);

        let col = BAMBOO.LEAF_MID;
        if (progress > 0.88) {
          col = BAMBOO.LEAF_TIP;
        } else if (w < -0.4) {
          col = BAMBOO.LEAF_SHADOW;
        } else if (w < 0.2) {
          col = BAMBOO.LEAF_MID;
        } else if (w < currentHalfW - 0.4) {
          col = BAMBOO.LEAF_BRIGHT;
        } else {
          col = BAMBOO.LEAF_LIGHT;
        }

        buf.set(px, py, col);
      }
    }
  });
}

// =========================================================================
// 1. GENERATE HIGH-DEFINITION BAMBOO STALK (64x160 px)
// =========================================================================
console.log('Rendering High-Definition Bamboo Stalk (64x160 px)...');
const stalkBuf = createBuffer(64, 160);

// Main slender culm in center
drawBambooCane(stalkBuf, 32, 8, 158, 3.8, 28);

// Leaf sprays at nodes (nodes are at y = 14, 42, 70, 98, 126)
drawLeafSpray(stalkBuf, 29, 22, -1, 4, 1.1);
drawLeafSpray(stalkBuf, 35, 34, 1, 4, 1.05);
drawLeafSpray(stalkBuf, 29, 50, -1, 4, 1.15);
drawLeafSpray(stalkBuf, 35, 62, 1, 4, 1.1);
drawLeafSpray(stalkBuf, 29, 78, -1, 4, 1.0);
drawLeafSpray(stalkBuf, 35, 92, 1, 4, 1.15);
drawLeafSpray(stalkBuf, 29, 108, -1, 3, 0.95);
drawLeafSpray(stalkBuf, 35, 122, 1, 3, 0.9);

fs.writeFileSync('public/map/prop_bamboo_stalk.png', encodePng(64, 160, stalkBuf.data));
console.log('Saved public/map/prop_bamboo_stalk.png (64x160)');

// =========================================================================
// 2. GENERATE HIGH-DEFINITION BAMBOO CLUSTER (110x160 px)
// Multiple overlapping bamboo culms with natural forest depth
// =========================================================================
console.log('Rendering High-Definition Bamboo Cluster (110x160 px)...');
const clusterBuf = createBuffer(110, 160);

// Background canes (slightly darker, thinner)
drawBambooCane(clusterBuf, 32, 14, 158, 3.2, 26);
drawBambooCane(clusterBuf, 78, 10, 158, 3.0, 27);
drawBambooCane(clusterBuf, 56, 18, 158, 2.8, 25);

// Midground leaf sprays
drawLeafSpray(clusterBuf, 29, 28, -1, 3, 0.9);
drawLeafSpray(clusterBuf, 81, 24, 1, 3, 0.95);
drawLeafSpray(clusterBuf, 53, 44, -1, 3, 0.85);

// Foreground main canes (larger, vivid, front layer)
drawBambooCane(clusterBuf, 22, 6, 158, 4.2, 30);
drawBambooCane(clusterBuf, 68, 4, 158, 4.4, 29);
drawBambooCane(clusterBuf, 92, 12, 158, 3.6, 28);

// Foreground lush cascading leaf sprays
drawLeafSpray(clusterBuf, 18, 18, -1, 4, 1.2);
drawLeafSpray(clusterBuf, 26, 32, 1, 4, 1.1);
drawLeafSpray(clusterBuf, 18, 48, -1, 4, 1.15);
drawLeafSpray(clusterBuf, 26, 64, 1, 4, 1.25);
drawLeafSpray(clusterBuf, 18, 80, -1, 3, 1.0);

drawLeafSpray(clusterBuf, 64, 16, -1, 4, 1.15);
drawLeafSpray(clusterBuf, 72, 30, 1, 4, 1.2);
drawLeafSpray(clusterBuf, 64, 46, -1, 4, 1.1);
drawLeafSpray(clusterBuf, 72, 62, 1, 4, 1.2);
drawLeafSpray(clusterBuf, 64, 78, -1, 3, 0.95);

drawLeafSpray(clusterBuf, 96, 24, 1, 4, 1.1);
drawLeafSpray(clusterBuf, 88, 42, -1, 3, 1.0);
drawLeafSpray(clusterBuf, 96, 58, 1, 4, 1.15);
drawLeafSpray(clusterBuf, 88, 76, -1, 3, 0.9);
drawLeafSpray(clusterBuf, 96, 94, 1, 3, 0.85);

fs.writeFileSync('public/map/prop_bamboo_cluster.png', encodePng(110, 160, clusterBuf.data));
console.log('Saved public/map/prop_bamboo_cluster.png (110x160)');

// =========================================================================
// 3. GENERATE HIGH-DEFINITION JIZO STATUE (48x64 px)
// Ancient Shinto / Buddhist Stone Monk with Sacred Red Bib & Lotus Pedestal
// =========================================================================
console.log('Rendering High-Definition Jizo Statue (48x64 px)...');
const jizoBuf = createBuffer(48, 64);
const JX = 24; // Center X

// 1. Lotus Pedestal Base (Y: 52 to 62)
for (let y = 52; y <= 62; y++) {
  const dy = y - 52;
  const halfW = 12 + Math.round(dy * 0.8);
  for (let dx = -halfW; dx <= halfW; dx++) {
    const x = JX + dx;
    let col = JIZO.STONE_DARK;
    if (y === 52 || y === 53) {
      col = dx < 0 ? JIZO.STONE_LIGHT : JIZO.STONE_BASE;
    } else if (dx === -halfW || dx === halfW || y === 62) {
      col = JIZO.SHADOW_DARK;
    } else if (dx < -4) {
      col = JIZO.STONE_BASE;
    } else if (dx <= 4) {
      col = JIZO.STONE_MID;
    } else {
      col = JIZO.STONE_SHADOW;
    }
    // Moss speckles at bottom base
    if (y >= 58 && (x + y * 3) % 5 === 0) col = JIZO.MOSS_LIGHT;
    jizoBuf.set(x, y, col);
  }
}

// 2. Monk Robe Body (Y: 26 to 52)
for (let y = 26; y <= 52; y++) {
  const dy = y - 26;
  const halfW = 8 + Math.round(dy * 0.28);
  for (let dx = -halfW; dx <= halfW; dx++) {
    const x = JX + dx;
    let col = JIZO.STONE_BASE;
    if (dx === -halfW || dx === halfW) col = JIZO.SHADOW_DARK;
    else if (dx < -3) col = JIZO.STONE_LIGHT;
    else if (dx <= 2) col = JIZO.STONE_BASE;
    else col = JIZO.STONE_SHADOW;

    // Robe sleeve fold crease lines
    if ((dx === -3 || dx === 3) && y >= 36) col = JIZO.STONE_DARK;
    jizoBuf.set(x, y, col);
  }
}

// 3. Rounded Monk Head (Y: 8 to 25)
const headCenterY = 16;
const headRadius = 8;
for (let y = 8; y <= 25; y++) {
  for (let x = JX - 9; x <= JX + 9; x++) {
    const dx = x - JX;
    const dy = y - headCenterY;
    const distSq = dx * dx + dy * dy;
    if (distSq <= headRadius * headRadius) {
      let col = JIZO.STONE_BASE;
      if (distSq >= (headRadius - 1) * (headRadius - 1)) {
        col = JIZO.SHADOW_DARK; // Head silhouette contour
      } else if (dx < -2 && dy < 0) {
        col = JIZO.STONE_BRIGHT; // Sunlit skull brow highlight
      } else if (dx < 0) {
        col = JIZO.STONE_LIGHT;
      } else if (dx > 3) {
        col = JIZO.STONE_SHADOW;
      } else {
        col = JIZO.STONE_BASE;
      }

      // Facial Features (Serene downcast eyes, gentle smile)
      if (y === 16 && (dx === -3 || dx === -4 || dx === 3 || dx === 4)) {
        col = JIZO.SHADOW_DARK; // Peaceful downcast closed eyelids
      }
      if (y === 17 && (dx === -3 || dx === 3)) {
        col = JIZO.STONE_DARK;
      }
      if (y === 18 && (dx === 0 || dx === -1)) {
        col = JIZO.STONE_DARK; // Soft sculpted nose tip
      }
      if (y === 20 && (dx >= -2 && dx <= 1)) {
        col = JIZO.STONE_SHADOW; // Gentle compassionate smile
      }

      jizoBuf.set(x, y, col);
    }
  }
}

// Elongated compassionate earlobes
jizoBuf.set(JX - 8, 15, JIZO.STONE_LIGHT);
jizoBuf.set(JX - 8, 16, JIZO.STONE_BASE);
jizoBuf.set(JX - 8, 17, JIZO.STONE_DARK);
jizoBuf.set(JX + 8, 15, JIZO.STONE_BASE);
jizoBuf.set(JX + 8, 16, JIZO.STONE_SHADOW);
jizoBuf.set(JX + 8, 17, JIZO.SHADOW_DARK);

// 4. Sacred Red Cloth Bib (Yodarekake) (Y: 22 to 36)
// Drapes from neck down over chest with fabric folds and white neck ribbon
// Ribbon around neck
for (let x = JX - 6; x <= JX + 6; x++) {
  jizoBuf.set(x, 22, JIZO.WHITE_TIE);
  jizoBuf.set(x, 23, JIZO.RED_OUTLINE);
}
// Bib cloth trapezoid
for (let y = 23; y <= 35; y++) {
  const dy = y - 23;
  const bibHalfW = Math.round(5 + dy * 0.45);
  for (let dx = -bibHalfW; dx <= bibHalfW; dx++) {
    const x = JX + dx;
    let col = JIZO.RED_BASE;
    if (dx === -bibHalfW || dx === bibHalfW || y === 35) {
      col = JIZO.RED_OUTLINE; // Hem border
    } else if (dx < -2) {
      col = JIZO.RED_BRIGHT;  // Sunlit cloth highlight
    } else if (dx === -1 && dy < 8) {
      col = JIZO.RED_LIGHT;   // Center crease highlight
    } else if (dx > 2) {
      col = JIZO.RED_DARK;    // Fabric shadow
    } else {
      col = JIZO.RED_BASE;
    }
    jizoBuf.set(x, y, col);
  }
}
// White ribbon bow ties at neck
jizoBuf.set(JX - 7, 21, JIZO.WHITE_TIE);
jizoBuf.set(JX - 8, 22, JIZO.WHITE_TIE);
jizoBuf.set(JX + 7, 21, JIZO.WHITE_TIE);
jizoBuf.set(JX + 8, 22, JIZO.WHITE_TIE);

// 5. Clasped Hands holding Sacred Wish-Granting Mani Jewel (Hōju) (Y: 37 to 44)
// Stone hands holding golden jewel at center
for (let dy = 0; dy <= 5; dy++) {
  const jw = dy <= 2 ? dy + 1 : 5 - dy;
  for (let dx = -jw; dx <= jw; dx++) {
    const x = JX + dx;
    const y = 37 + dy;
    let col = JIZO.JEWEL_MID;
    if (dx === -jw && dy <= 2) col = JIZO.JEWEL_SPEC;
    else if (dx <= 0) col = JIZO.JEWEL_LIGHT;
    else if (dx === jw) col = JIZO.JEWEL_DARK;
    jizoBuf.set(x, y, col);
  }
}
// Stone thumbs and fingers cupping the jewel
jizoBuf.set(JX - 4, 39, JIZO.STONE_LIGHT);
jizoBuf.set(JX - 4, 40, JIZO.STONE_BASE);
jizoBuf.set(JX - 3, 41, JIZO.STONE_BASE);
jizoBuf.set(JX + 4, 39, JIZO.STONE_BASE);
jizoBuf.set(JX + 4, 40, JIZO.STONE_SHADOW);
jizoBuf.set(JX + 3, 41, JIZO.STONE_SHADOW);

fs.writeFileSync('public/map/prop_jizo_statue.png', encodePng(48, 64, jizoBuf.data));
console.log('Saved public/map/prop_jizo_statue.png (48x64)');

console.log('ALL BAMBOO AND JIZO ASSETS ENHANCED SUCCESSFULLY!');
