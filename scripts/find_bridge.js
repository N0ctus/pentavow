import fs from 'fs';

const code = fs.readFileSync('src/components/map/OverworldMap.tsx', 'utf-8');
const lines = code.split('\n');

lines.forEach((l, i) => {
  if (l.includes('taikoBridge') || l.includes('prop_taiko_bridge.png')) {
    console.log(`L${i+1}: ${l.trim()}`);
    for (let j = Math.max(0, i - 5); j <= Math.min(lines.length - 1, i + 15); j++) {
      console.log(`${j+1}: ${lines[j]}`);
    }
  }
});
