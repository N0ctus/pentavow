import fs from 'fs';
import zlib from 'zlib';
import omggif from 'omggif';

function savePNG(width, height, getPixel, outPath) {
  const rowSize = width * 4 + 1;
  const raw = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pxOffset = rowOffset + 1 + x * 4;
      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(raw);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : (c >>> 1);
    }
    crcTable[n] = c >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const chunkData = Buffer.concat([typeBuf, data]);
    let crc = 0xffffffff;
    for (let i = 0; i < chunkData.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ chunkData[i]) & 0xff];
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    crcBuf.writeUInt32BE(crc, 0);
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

  const png = Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0))
  ]);

  fs.writeFileSync(outPath, png);
}

if (!fs.existsSync('public/portals')) {
  fs.mkdirSync('public/portals', { recursive: true });
}

// Helper to extract a cropped region across all frames of a GIF into a horizontal sprite sheet
function extractSpriteSheet(gifPath, cropX, cropY, cropW, cropH, outPath, bgThreshold = 30) {
  const buf = fs.readFileSync(gifPath);
  const reader = new omggif.GifReader(buf);
  const numFrames = reader.numFrames();
  const sheetW = cropW * numFrames;
  const sheetH = cropH;

  // Pre-decode all frames into memory
  const frameBuffers = [];
  for (let f = 0; f < numFrames; f++) {
    const rgba = Buffer.alloc(reader.width * reader.height * 4);
    reader.decodeAndBlitFrameRGBA(f, rgba);
    frameBuffers.push(rgba);
  }

  savePNG(sheetW, sheetH, (x, y) => {
    const frameIdx = Math.floor(x / cropW);
    const fx = x % cropW;
    const srcX = cropX + fx;
    const srcY = cropY + y;

    if (srcX >= reader.width || srcY >= reader.height) return [0, 0, 0, 0];

    const rgba = frameBuffers[frameIdx];
    const idx = (srcY * reader.width + srcX) * 4;
    const r = rgba[idx];
    const g = rgba[idx + 1];
    const b = rgba[idx + 2];

    const maxC = Math.max(r, g, b);
    if (maxC <= bgThreshold) {
      return [0, 0, 0, 0];
    }

    // Alpha calculation with smooth edge falloff
    let alpha = 255;
    if (maxC < bgThreshold + 40) {
      alpha = Math.round(((maxC - bgThreshold) / 40) * 255);
    }

    return [r, g, b, alpha];
  }, outPath);

  console.log(`Saved sprite sheet: ${outPath} (${sheetW}x${sheetH}, ${numFrames} frames)`);
}

// 1. DOORWAY PORTAL ARCANE (Vertical swirl for Celestial Gate)
extractSpriteSheet(
  'C:/Users/Noctus/Downloads/jtob5w.gif',
  665, 130, 80, 120,
  'public/portals/doorway_portal_arcane.png',
  35
);

// 2. DOORWAY PORTAL VOID (Dark abyssal doorway swirl)
extractSpriteSheet(
  'C:/Users/Noctus/Downloads/jtob5w.gif',
  240, 325, 80, 120,
  'public/portals/doorway_portal_void.png',
  35
);

// 3. TELEPORT IN + OUT CYAN (Ground teleporter ring for battle drop-in & warp)
extractSpriteSheet(
  'C:/Users/Noctus/Downloads/jtob5w.gif',
  420, 395, 160, 90,
  'public/portals/teleport_ring_cyan.png',
  35
);

// 4. TELEPORT IN + OUT FIRE (Ground teleporter ring in flame gold)
extractSpriteSheet(
  'C:/Users/Noctus/Downloads/jtob5w.gif',
  630, 395, 160, 90,
  'public/portals/teleport_ring_fire.png',
  35
);

// 5. CELESTIAL BEAM-IN CYAN (Divine warp beam from sky from I6NntX.gif)
extractSpriteSheet(
  'C:/Users/Noctus/Downloads/I6NntX.gif',
  40, 155, 70, 330,
  'public/portals/teleport_beam_cyan.png',
  35
);
