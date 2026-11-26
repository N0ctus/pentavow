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

function getAllPngs(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const s = fs.statSync(full);
    if (s.isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== '.system_generated') {
        getAllPngs(full, list);
      }
    } else if (f.toLowerCase().endsWith('.png')) {
      list.push(full);
    }
  }
  return list;
}

const pngs = getAllPngs('public');
console.log(`Checking ${pngs.length} pngs in public/...`);

for (const png of pngs) {
  const img = readPNG(png);
  if (!img) continue;
  
  // Count pixels with Red (r > 180, g < 100, b < 100) and White (r > 180, g > 180, b > 180) adjacent
  let redWhiteCount = 0;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const idx = (y * img.width + x) * 4;
      const r = img.pixels[idx], g = img.pixels[idx+1], b = img.pixels[idx+2], a = img.pixels[idx+3];
      if (a > 100 && r > 180 && g < 90 && b < 90) {
        // check adjacent
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < img.height && nx >= 0 && nx < img.width) {
              const nidx = (ny * img.width + nx) * 4;
              if (img.pixels[nidx+3] > 100 && img.pixels[nidx] > 180 && img.pixels[nidx+1] > 180 && img.pixels[nidx+2] > 180) {
                redWhiteCount++;
                break;
              }
            }
          }
        }
      }
    }
  }
  if (redWhiteCount > 10) {
    console.log(`Match in ${png} (${img.width}x${img.height}): ${redWhiteCount} red/white pixels`);
  }
}
