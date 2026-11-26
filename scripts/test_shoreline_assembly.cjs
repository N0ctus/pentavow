const fs = require('fs');
const zlib = require('zlib');

// Load decoder & encoder from process_map_assets.cjs
const content = fs.readFileSync('scripts/process_map_assets.cjs', 'utf8');
eval(content.slice(0, content.indexOf('// 1. EXTRACT')));

function assemblePool(sourcePngPath, targetW, targetH, outPath) {
  const src = decodePng(sourcePngPath);
  console.log(`Assembling pool from ${sourcePngPath} (${src.width}x${src.height}) to ${targetW}x${targetH}...`);

  const out = Buffer.alloc(targetW * targetH * 4);

  // In 144x96 source:
  // Tile size is 48x48
  // Top-Left: (0, 0) 48x48
  // Top-Mid: (48, 0) 48x48
  // Top-Right: (96, 0) 48x48
  // Bot-Left: (0, 48) 48x48
  // Bot-Mid: (48, 48) 48x48
  // Bot-Right: (96, 48) 48x48

  // We want to create an authentic pond border where the interior water is transparent (alpha = 0)
  // or contains the authentic shoreline edge with alpha feathering so water underneath shows through!

  // Let's sample the background ground color from corners (0,0), (143, 0), etc.
  const cornerR = src.data[0], cornerG = src.data[1], cornerB = src.data[2];
  console.log(`Source corner ground RGB: ${cornerR}, ${cornerG}, ${cornerB}`);

  // Let's inspect the center water color: (72, 48)
  const centerIdx = (48 * src.width + 72) * 4;
  const waterR = src.data[centerIdx], waterG = src.data[centerIdx+1], waterB = src.data[centerIdx+2];
  console.log(`Source center water RGB: ${waterR}, ${waterG}, ${waterB}`);

  // Copy with seamless 9-slice tiling
  const T = 48; // Tile width
  const cornerW = 44;
  const cornerH = 44;

  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      let sx = 0, sy = 0;

      // Determine source X
      if (x < cornerW) {
        sx = x; // Left corner
      } else if (x >= targetW - cornerW) {
        sx = 144 - (targetW - x); // Right corner
      } else {
        // Repeated mid edge
        const midOffset = (x - cornerW) % T;
        sx = 48 + midOffset;
      }

      // Determine source Y
      if (y < cornerH) {
        sy = y; // Top corner
      } else if (y >= targetH - cornerH) {
        sy = 96 - (targetH - y); // Bottom corner
      } else {
        // Vertical mid section
        // Sample vertical bank: if near left, sample (sx, 40..56)
        if (x < cornerW) {
          const vMid = 36 + ((y - cornerH) % 24);
          sy = vMid;
        } else if (x >= targetW - cornerW) {
          const vMid = 36 + ((y - cornerH) % 24);
          sy = vMid;
        } else {
          // Interior water! Keep as transparent so pixel_water_tile shows cleanly,
          // or sample center water
          sy = 48;
        }
      }

      const sIdx = (sy * src.width + sx) * 4;
      const dIdx = (y * targetW + x) * 4;

      const r = src.data[sIdx];
      const g = src.data[sIdx + 1];
      const b = src.data[sIdx + 2];

      // If it's deep inside the pool (away from edges by > 28px), make it transparent
      // so the caustic water, koi, and lotus lily pads render underneath!
      const distFromEdgeX = Math.min(x, targetW - 1 - x);
      const distFromEdgeY = Math.min(y, targetH - 1 - y);
      const isInnerWater = (distFromEdgeX > 26 && distFromEdgeY > 26);

      if (isInnerWater) {
        out[dIdx] = 0;
        out[dIdx + 1] = 0;
        out[dIdx + 2] = 0;
        out[dIdx + 3] = 0; // Fully transparent center
      } else {
        out[dIdx] = r;
        out[dIdx + 1] = g;
        out[dIdx + 2] = b;
        out[dIdx + 3] = 255;
      }
    }
  }

  fs.writeFileSync(outPath, encodePng(targetW, targetH, out));
  console.log(`Successfully assembled: ${outPath} (${targetW}x${targetH})`);
}

// 1. Assemble Grass Shoreline Frame for Biwa Lotus Pond (296 x 216 px)
assemblePool('public/map/tileset_crops/grass_pool_full.png', 296, 216, 'public/map/prop_pond_shoreline_grass.png');

// 2. Assemble Sand/Cobble Shoreline Frame (the user's exact reference!) (296 x 216 px)
assemblePool('public/map/tileset_crops/sand_pool_full.png', 296, 216, 'public/map/prop_pond_shoreline_sand.png');

// 3. Assemble Volcanic Basalt/Lava Shoreline Frame for Caldera Reservoir (296 x 216 px)
assemblePool('public/map/tileset_crops/lava_pool_full.png', 296, 216, 'public/map/prop_caldera_shoreline_lava.png');
