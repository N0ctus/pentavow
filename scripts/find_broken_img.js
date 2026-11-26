const fs = require('fs');
const content = fs.readFileSync('src/components/map/OverworldMap.tsx', 'utf8');

// Find all src or href attributes in OverworldMap.tsx
const regex = /(src|href)="([^"]+)"/g;
let match;
const notFound = [];
while ((match = regex.exec(content)) !== null) {
  const url = match[2];
  if (url.startsWith('/')) {
    const localPath = 'public' + url;
    if (!fs.existsSync(localPath)) {
      notFound.push({ attr: match[1], url, path: localPath });
    }
  }
}
console.log('Missing assets referenced in OverworldMap.tsx:');
console.log(notFound);
