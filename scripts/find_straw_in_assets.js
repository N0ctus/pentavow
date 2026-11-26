import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function readPNG(p) {
  try {
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
  } catch (e) {
    return null;
  }
}

const targetPath = 'C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/.user_uploaded/media_1795456953488_198ebd0b.png';
const target = readPNG(targetPath);

// Extract the straw sprite bounding box from target
// Looking at our earlier dump, the straw is roughly x=18..30, y=18..36
// Let's grab all pixels where alpha > 0 or where it belongs to the straw
const strawPixels = [];
for (let y = 18; y <= 36; y++) {
  for (let x = 16; x <= 32; x++) {
    const idx = (y * target.width + x) * 4;
    const r = target.pixels[idx], g = target.pixels[idx+1], b = target.pixels[idx+2];
    // If it's red or white/grey
    const isRed = (r > 160 && g < 100 && b < 100);
    const isWhite = (r > 140 && g > 140 && b > 140 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20);
    if (isRed || isWhite) {
      strawPixels.push({
        relX: x - 23,
        relY: y - 27,
        r, g, b,
        isRed
      });
    }
  }
}
console.log(`Straw model has ${strawPixels.length} pixels.`);

function scanPng(filePath) {
  const img = readPNG(filePath);
  if (!img) return;

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let matches = 0;
      for (const sp of strawPixels) {
        const sx = x + sp.relX;
        const sy = y + sp.relY;
        if (sx >= 0 && sx < img.width && sy >= 0 && sy < img.height) {
          const sIdx = (sy * img.width + sx) * 4;
          const a = img.pixels[sIdx+3];
          if (a > 50) {
            const r = img.pixels[sIdx];
            const g = img.pixels[sIdx+1];
            const b = img.pixels[sIdx+2];
            if (sp.isRed) {
              if (r > 150 && g < 110 && b < 110) matches++;
            } else {
              if (r > 130 && g > 130 && b > 130 && Math.abs(r - g) < 25) matches++;
            }
          }
        }
      }
      if (matches >= strawPixels.length * 0.75) {
        console.log(`FOUND STRAW IN ASSET: ${filePath} at (${x}, ${y})! Match: ${matches}/${strawPixels.length}`);
        return true;
      }
    }
  }
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    try {
      const s = fs.statSync(full);
      if (s.isDirectory()) {
        if (f !== 'node_modules' && f !== '.git') scanDir(full);
      } else if (f.endsWith('.png')) {
        scanPng(full);
      }
    } catch (e) {}
  }
}

console.log('Scanning public...');
scanDir('public');
console.log('Scanning dist...');
scanDir('dist');
console.log('Done scanning.');
