import fs from 'fs';
import omggif from 'omggif';

const buf = fs.readFileSync('C:/Users/Noctus/Downloads/rMMKwa.gif');
const reader = new omggif.GifReader(buf);

const canvas = Buffer.alloc(reader.width * reader.height * 4);
for (let f = 0; f < reader.numFrames(); f++) {
  const info = reader.frameInfo(f);
  let backup = null;
  if (info.disposal === 3) backup = Buffer.from(canvas);
  reader.decodeAndBlitFrameRGBA(f, canvas);

  let minX = 9999, maxX = -1, minY = 9999, maxY = -1, activeCount = 0;
  for (let y = 30; y < 260; y++) {
    for (let x = 0; x < 160; x++) {
      const idx = (y * reader.width + x) * 4;
      const r = canvas[idx], g = canvas[idx+1], b = canvas[idx+2];
      const dist = Math.abs(r - 45) + Math.abs(g - 27) + Math.abs(b - 84);
      if (dist > 35 && (r > 60 || g > 60 || b > 100)) {
        activeCount++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (activeCount > 20) {
    console.log(`f${f}: count=${activeCount} x=[${minX},${maxX}] (w=${maxX-minX+1}) y=[${minY},${maxY}] (h=${maxY-minY+1})`);
  } else {
    console.log(`f${f}: empty or closed`);
  }

  if (info.disposal === 2) {
    for (let y = info.y; y < info.y + info.height; y++) {
      for (let x = info.x; x < info.x + info.width; x++) {
        const idx = (y * reader.width + x) * 4;
        canvas[idx] = 0; canvas[idx+1] = 0; canvas[idx+2] = 0; canvas[idx+3] = 0;
      }
    }
  } else if (info.disposal === 3 && backup) {
    backup.copy(canvas);
  }
}
