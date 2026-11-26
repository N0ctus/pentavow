import fs from 'fs';
import omggif from 'omggif';
import zlib from 'zlib';

function savePNG(width, height, getPixel, outPath) {
  const rowSize = width * 4 + 1;
  const raw = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pxOffset = rowOffset + 1 + x * 4;
      raw[pxOffset] = r; raw[pxOffset+1] = g; raw[pxOffset+2] = b; raw[pxOffset+3] = a;
    }
  }
  const deflated = zlib.deflateSync(raw);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : (c >>> 1);
    crcTable[n] = c >>> 0;
  }
  function makeChunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const chunkData = Buffer.concat([typeBuf, data]);
    let crc = 0xffffffff;
    for (let i = 0; i < chunkData.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ chunkData[i]) & 0xff];
    crc = (crc ^ 0xffffffff) >>> 0;
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const png = Buffer.concat([signature, makeChunk('IHDR', ihdr), makeChunk('IDAT', deflated), makeChunk('IEND', Buffer.alloc(0))]);
  fs.writeFileSync(outPath, png);
}

function decodeSequential(gifPath) {
  const buf = fs.readFileSync(gifPath);
  const reader = new omggif.GifReader(buf);
  const canvas = Buffer.alloc(reader.width * reader.height * 4);
  const frames = [];

  for (let i = 0; i < reader.numFrames(); i++) {
    const info = reader.frameInfo(i);
    // backup canvas if disposal == 3 (restore previous)
    let backup = null;
    if (info.disposal === 3) {
      backup = Buffer.from(canvas);
    }
    
    reader.decodeAndBlitFrameRGBA(i, canvas);
    frames.push(Buffer.from(canvas));

    if (info.disposal === 2) {
      // restore to background / transparent inside info bounds
      for (let y = info.y; y < info.y + info.height; y++) {
        for (let x = info.x; x < info.x + info.width; x++) {
          const idx = (y * reader.width + x) * 4;
          canvas[idx] = 0;
          canvas[idx+1] = 0;
          canvas[idx+2] = 0;
          canvas[idx+3] = 0;
        }
      }
    } else if (info.disposal === 3 && backup) {
      backup.copy(canvas);
    }
  }

  return { reader, frames };
}

const { reader, frames } = decodeSequential('C:/Users/Noctus/Downloads/rMMKwa.gif');

// Let's dump frames 0, 10, 20, 30, 40, 50, 59
for (const f of [0, 10, 20, 30, 40, 50, 59]) {
  const frameBuf = frames[f];
  savePNG(reader.width, reader.height, (x, y) => {
    const idx = (y * reader.width + x) * 4;
    return [frameBuf[idx], frameBuf[idx+1], frameBuf[idx+2], frameBuf[idx+3]];
  }, `C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/rMMKwa_seq_f${f}.png`);
}

console.log('Saved sequential frames');
