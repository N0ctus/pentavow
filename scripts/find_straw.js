import fs from 'fs';
import zlib from 'zlib';

function readPNG(path) {
  const buf = fs.readFileSync(path);
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

const targetPath = 'C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/.user_uploaded/media_1795456953488_198ebd0b.png';
const target = readPNG(targetPath);
console.log('Target template size:', target.width, 'x', target.height);

function matchInImage(screenPath) {
  if (!fs.existsSync(screenPath)) return;
  const screen = readPNG(screenPath);
  let bestScore = Infinity;
  let bestPos = { x: 0, y: 0 };

  // Sample points from target that are distinctive (the red/white stripe area)
  // Let find center of target
  const samplePoints = [];
  for (let ty = 10; ty < target.height - 10; ty += 2) {
    for (let tx = 10; tx < target.width - 10; tx += 2) {
      const idx = (ty * target.width + tx) * 4;
      samplePoints.push({
        x: tx,
        y: ty,
        r: target.pixels[idx],
        g: target.pixels[idx+1],
        b: target.pixels[idx+2]
      });
    }
  }

  for (let sy = 0; sy <= screen.height - target.height; sy += 2) {
    for (let sx = 0; sx <= screen.width - target.width; sx += 2) {
      let sad = 0;
      for (let i = 0; i < samplePoints.length; i++) {
        const sp = samplePoints[i];
        const sIdx = ((sy + sp.y) * screen.width + (sx + sp.x)) * 4;
        sad += Math.abs(sp.r - screen.pixels[sIdx]) +
               Math.abs(sp.g - screen.pixels[sIdx+1]) +
               Math.abs(sp.b - screen.pixels[sIdx+2]);
        if (sad > bestScore) break; // early exit
      }
      if (sad < bestScore) {
        bestScore = sad;
        bestPos = { x: sx, y: sy };
      }
    }
  }
  const avgDiffPerPixel = bestScore / (samplePoints.length * 3);
  console.log(`Image: ${screenPath}`);
  console.log(`  Best match at (${bestPos.x}, ${bestPos.y}), avg diff per channel: ${avgDiffPerPixel.toFixed(2)}`);
  return { bestPos, avgDiffPerPixel };
}

matchInImage('C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/clean_terrain_verified.png');
matchInImage('C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/pure_trees_verified.png');
matchInImage('C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/browser_evidence/4ce08257-01d6-46c3-9082-ea258099554c/final_step_2164.png');
matchInImage('C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/browser_evidence/4ce08257-01d6-46c3-9082-ea258099554c/final_step_2148.png');
