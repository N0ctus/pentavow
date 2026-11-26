import fs from 'fs';

const code = fs.readFileSync('src/components/map/OverworldMap.tsx', 'utf-8');
const lines = code.split('\n');

lines.forEach((l, i) => {
  if (l.includes('prop_lantern.png')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
    // Print 10 lines before and after
    const start = Math.max(0, i - 10);
    const end = Math.min(lines.length - 1, i + 10);
    console.log(`--- Context (lines ${start + 1}-${end + 1}) ---`);
    for (let j = start; j <= end; j++) {
      console.log(`${j + 1}: ${lines[j]}`);
    }
    console.log('--------------------------------------------------\n');
  }
});
