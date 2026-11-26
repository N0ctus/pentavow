import fs from 'fs';
import jpeg from 'jpeg-js';

const buf = fs.readFileSync('C:/Users/Noctus/.gemini/antigravity/brain/ed8f7e2a-2a4d-4d17-a916-4f80d28f7a70/feudal_japan_pixel_sprites_1795422046562.jpg');
const decoded = jpeg.decode(buf, { useTArray: true });
const { width, height, data } = decoded;

function getPx(x, y) {
  const idx = (y * width + x) * 4;
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
}

// Find columns or rows where green vs vermilion is concentrated
const greenCols = new Array(width).fill(0);
const redCols = new Array(width).fill(0);

for (let x = 750; x < 1300; x++) {
  for (let y = 0; y < height; y++) {
    const [r, g, b] = getPx(x, y);
    if (g > r + 20 && g > b) greenCols[x]++;
    if (r > 160 && g < 80 && b < 80) redCols[x]++;
  }
}

// Check vertical spans also
const greenRows = new Array(height).fill(0);
const redRows = new Array(height).fill(0);
for (let y = 0; y < height; y++) {
  for (let x = 750; x < 1300; x++) {
    const [r, g, b] = getPx(x, y);
    if (g > r + 20 && g > b) greenRows[y]++;
    if (r > 160 && g < 80 && b < 80) redRows[y]++;
  }
}

console.log('Green X span:', greenCols.findIndex(v => v > 5), 'to', greenCols.findLastIndex(v => v > 5));
console.log('Red X span:', redCols.findIndex(v => v > 5), 'to', redCols.findLastIndex(v => v > 5));
console.log('Green Y span:', greenRows.findIndex(v => v > 5), 'to', greenRows.findLastIndex(v => v > 5));
console.log('Red Y span:', redRows.findIndex(v => v > 5), 'to', redRows.findLastIndex(v => v > 5));
