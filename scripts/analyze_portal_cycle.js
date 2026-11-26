import fs from 'fs';
import omggif from 'omggif';

const buf = fs.readFileSync('C:/Users/Noctus/Downloads/rMMKwa.gif');
const reader = new omggif.GifReader(buf);

const cropX = 15;
const cropY = 85;
const cropW = 130;
const cropH = 155;

// Let's decode frames and measure active pixel count per frame to identify exact phase boundaries
const canvas = Buffer.alloc(reader.width * reader.height * 4);
const phases = [];

for (let i = 0; i < reader.numFrames(); i++) {
  const info = reader.frameInfo(i);
  let backup = null;
  if (info.disposal === 3) backup = Buffer.from(canvas);
  reader.decodeAndBlitFrameRGBA(i, canvas);

  let energyCount = 0; // count pixels in top half (beam/teleport)
  let vortexCount = 0; // count pixels in bottom half (swirling portal)
  for (let y = cropY; y < cropY + cropH; y++) {
    for (let x = cropX; x < cropX + cropW; x++) {
      const idx = (y * reader.width + x) * 4;
      const r = canvas[idx], g = canvas[idx+1], b = canvas[idx+2];
      const dist = Math.abs(r - 62) + Math.abs(g - 48) + Math.abs(b - 108);
      if (dist > 35) {
        if (y < cropY + 75) {
          energyCount++;
        } else {
          vortexCount++;
        }
      }
    }
  }

  console.log(`f${i}: vortex=${vortexCount}, energy(beam)=${energyCount}`);
}
