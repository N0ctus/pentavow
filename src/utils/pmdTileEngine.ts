import { PmdTilesetId } from '../data/battlegrounds';

export const MAP_TILE_SIZE = 24;
export const MAP_GRID_COLS = 120;
export const MAP_GRID_ROWS = 120;
export const MAP_PIXEL_SIZE = MAP_GRID_COLS * MAP_TILE_SIZE; // 2880 x 2880 px

// Tile semantic values
export const TILE_WALL = 0;
export const TILE_GROUND = 1;
export const TILE_WATER = 2;
export const TILE_BRIDGE = 3;    // Walkable bridge planks over water
export const TILE_ROAD = 4;      // Cobblestone road over ground
export const TILE_COURTYARD = 5; // Sanctuary / Shrine tiled floor

export interface PmdTilesetMeta {
  id: PmdTilesetId;
  name: string;
  category: string;
  tileSize: number;
  atlasUrl: string;
  waterFrames: number;
  sparkleFrames: number;
  waterSpeedFrames: number;
  sparkleSpeedFrames: number;
  wallAlt1Indices: number[];
  wallAlt2Indices: number[];
  groundAlt1Indices: number[];
  groundAlt2Indices: number[];
  sparkleIndices: number[];
  colors: {
    wall: string;
    ground: string;
    water: string;
  };
}

export interface PmdManifest {
  tileSize: number;
  lookup256: number[];
  tilesets: Record<string, PmdTilesetMeta>;
}

let manifestCache: PmdManifest | null = null;
let manifestPromise: Promise<PmdManifest> | null = null;
const imageCache = new Map<string, HTMLImageElement>();

export async function loadPmdManifest(): Promise<PmdManifest> {
  if (manifestCache) return manifestCache;
  if (!manifestPromise) {
    manifestPromise = fetch('/pmd_tilesets/manifest.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load PMD tileset manifest');
        return res.json();
      })
      .then((data: PmdManifest) => {
        manifestCache = data;
        return data;
      });
  }
  return manifestPromise;
}

export function loadImageCached(url: string): Promise<HTMLImageElement> {
  const existing = imageCache.get(url);
  if (existing && existing.complete && existing.naturalWidth > 0) {
    return Promise.resolve(existing);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = err => reject(err);
    img.src = url;
  });
}

const NEIGHBOR_OFFSETS = [
  [-1, -1], // 0: NW
  [0, -1],  // 1: N
  [1, -1],  // 2: NE
  [-1, 0],  // 3: W
  [1, 0],   // 4: E
  [-1, 1],  // 5: SW
  [0, 1],   // 6: S
  [1, 1],   // 7: SE
];

export interface AutotiledCell {
  wallIdx: number;
  groundIdx: number;
  waterIdx: number;
  roadIdx: number;
  altRoll: number; // deterministic 0..999
}

export function isWalkableTile(tile: number): boolean {
  return tile !== TILE_WALL;
}

export function isWaterTile(tile: number): boolean {
  return tile === TILE_WATER;
}

/**
 * Computes 47-tile blob indices for every tile in the 67x67 grid.
 * Implements the official PMD Ground + Water rule:
 * when evaluating Ground neighbor bitmasks, adjacent Water & Bridge tiles
 * count as Ground so shorelines transition cleanly beneath water tiles.
 */
export function computeAutotileGrid(
  grid: Uint8Array,
  cols: number,
  rows: number,
  lookup256: number[],
  seed: number
): AutotiledCell[] {
  const result = new Array<AutotiledCell>(cols * rows);

  const getTile = (x: number, y: number): number => {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return TILE_WALL;
    return grid[y * cols + x];
  };

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let wallMask = 0;
      let groundMask = 0;
      let waterMask = 0;
      let roadMask = 0;

      for (let b = 0; b < 8; b++) {
        const nx = x + NEIGHBOR_OFFSETS[b][0];
        const ny = y + NEIGHBOR_OFFSETS[b][1];
        const nt = getTile(nx, ny);

        // Wall connects to walls
        if (nt === TILE_WALL) wallMask |= 1 << b;

        // Ground + Water rule: any non-wall tile connects as ground!
        if (nt !== TILE_WALL) groundMask |= 1 << b;

        // Water connects to water and bridges (water runs beneath bridge planks)
        if (nt === TILE_WATER || nt === TILE_BRIDGE) waterMask |= 1 << b;

        // Road & Sanctum route tiles connect cleanly to roads, courtyards, and bridges
        if (nt === TILE_ROAD || nt === TILE_COURTYARD || nt === TILE_BRIDGE) roadMask |= 1 << b;
      }

      // Deterministic pseudo-random roll per tile
      const h = ((x * 73856093) ^ (y * 19349663) ^ (seed * 83492791)) >>> 0;

      result[y * cols + x] = {
        wallIdx: lookup256[wallMask] ?? 0,
        groundIdx: lookup256[groundMask] ?? 0,
        waterIdx: lookup256[waterMask] ?? 0,
        roadIdx: lookup256[roadMask] ?? 0,
        altRoll: h % 1000,
      };
    }
  }

  return result;
}

/**
 * Picks which Atlas row & column to draw for a Wall or Ground cell,
 * honoring available alt1/alt2 slot sets in the tileset manifest.
 */
export function pickWallRow(cell: AutotiledCell, ts: PmdTilesetMeta): number {
  const idx = cell.wallIdx;
  if (cell.altRoll < 65 && ts.wallAlt1Indices.includes(idx)) return 1;
  if (cell.altRoll >= 65 && cell.altRoll < 115 && ts.wallAlt2Indices.includes(idx)) return 2;
  return 0;
}

export function pickGroundRow(cell: AutotiledCell, ts: PmdTilesetMeta): number {
  const idx = cell.groundIdx;
  if (cell.altRoll < 85 && ts.groundAlt1Indices.includes(idx)) return 4;
  if (cell.altRoll >= 85 && cell.altRoll < 120 && ts.groundAlt2Indices.includes(idx)) return 5;
  return 3;
}

// ============================================================================
// COLLISION HITBOXES & A* TILE PATHFINDING (Prevents Player/Bots passing walls)
// ============================================================================

export function isBoxWalkable(
  worldX: number,
  worldY: number,
  halfW: number,
  halfH: number,
  grid: Uint8Array,
  cols = MAP_GRID_COLS,
  rows = MAP_GRID_ROWS
): boolean {
  const maxPxW = cols * MAP_TILE_SIZE;
  const maxPxH = rows * MAP_TILE_SIZE;
  if (
    worldX - halfW < 24 ||
    worldX + halfW > maxPxW - 24 ||
    worldY - halfH < 24 ||
    worldY + halfH > maxPxH - 24
  ) {
    return false;
  }

  const minTx = Math.floor((worldX - halfW) / MAP_TILE_SIZE);
  const maxTx = Math.floor((worldX + halfW) / MAP_TILE_SIZE);
  const minTy = Math.floor((worldY - halfH) / MAP_TILE_SIZE);
  const maxTy = Math.floor((worldY + halfH) / MAP_TILE_SIZE);

  for (let ty = minTy; ty <= maxTy; ty++) {
    for (let tx = minTx; tx <= maxTx; tx++) {
      if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) return false;
      if (grid[ty * cols + tx] === TILE_WALL) return false;
    }
  }
  return true;
}

export function resolveEntityMove(
  curX: number,
  curY: number,
  nextX: number,
  nextY: number,
  grid: Uint8Array,
  cols = MAP_GRID_COLS,
  rows = MAP_GRID_ROWS,
  halfExtent = 7
): { x: number; y: number } {
  const maxPxW = cols * MAP_TILE_SIZE;
  const maxPxH = rows * MAP_TILE_SIZE;
  const cx = Math.max(32, Math.min(maxPxW - 32, nextX));
  const cy = Math.max(32, Math.min(maxPxH - 32, nextY));

  const currentlyValid = isBoxWalkable(curX, curY, halfExtent, halfExtent, grid, cols, rows);

  // If entity starts trapped inside or clipping a wall, only allow moving if destination is cleaner or closer to nearest open tile
  if (!currentlyValid) {
    if (isBoxWalkable(cx, cy, halfExtent, halfExtent, grid, cols, rows)) {
      return { x: cx, y: cy };
    }
    const tx = Math.max(0, Math.min(cols - 1, Math.floor(cx / MAP_TILE_SIZE)));
    const ty = Math.max(0, Math.min(rows - 1, Math.floor(cy / MAP_TILE_SIZE)));
    if (grid[ty * cols + tx] !== TILE_WALL) {
      return { x: cx, y: cy };
    }
    const snap = findNearestWalkableTile(tx, ty, grid, cols, rows, 8);
    const sx = snap.tx * MAP_TILE_SIZE + 12;
    const sy = snap.ty * MAP_TILE_SIZE + 12;
    const dx = sx - curX;
    const dy = sy - curY;
    const d = Math.hypot(dx, dy) || 1;
    const step = Math.min(d, Math.hypot(cx - curX, cy - curY) || 4);
    return { x: curX + (dx / d) * step, y: curY + (dy / d) * step };
  }

  if (isBoxWalkable(cx, cy, halfExtent, halfExtent, grid, cols, rows)) {
    return { x: cx, y: cy };
  }
  if (isBoxWalkable(cx, curY, halfExtent, halfExtent, grid, cols, rows)) {
    return { x: cx, y: curY };
  }
  if (isBoxWalkable(curX, cy, halfExtent, halfExtent, grid, cols, rows)) {
    return { x: curX, y: cy };
  }
  return { x: curX, y: curY };
}

export function findNearestWalkableTile(
  startTx: number,
  startTy: number,
  grid: Uint8Array,
  cols = MAP_GRID_COLS,
  rows = MAP_GRID_ROWS,
  maxRadius = 12,
  preferDry = false
): { tx: number; ty: number } {
  const clampedX = Math.max(0, Math.min(cols - 1, startTx));
  const clampedY = Math.max(0, Math.min(rows - 1, startTy));
  const isAcceptable = (t: number) => (preferDry ? t !== TILE_WALL && t !== TILE_WATER : t !== TILE_WALL);

  if (isAcceptable(grid[clampedY * cols + clampedX])) {
    return { tx: clampedX, ty: clampedY };
  }

  let bestTx = -1;
  let bestTy = -1;
  let bestDist = Infinity;
  for (let r = 1; r <= maxRadius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const nx = clampedX + dx;
        const ny = clampedY + dy;
        if (nx < 1 || ny < 1 || nx >= cols - 1 || ny >= rows - 1) continue;
        if (isAcceptable(grid[ny * cols + nx])) {
          const dist = dx * dx + dy * dy;
          if (dist < bestDist) {
            bestDist = dist;
            bestTx = nx;
            bestTy = ny;
          }
        }
      }
    }
    if (bestTx >= 0) return { tx: bestTx, ty: bestTy };
  }
  if (preferDry) {
    return findNearestWalkableTile(startTx, startTy, grid, cols, rows, maxRadius, false);
  }
  return { tx: Math.floor(cols / 2), ty: Math.min(rows - 10, 54) };
}

/**
 * 8-directional A* Pathfinding with diagonal corner-cutting protection.
 * Prefers Road / Bridge / Courtyard over Water so entities walk across bridges cleanly.
 */
export function findTilePath(
  startWorldX: number,
  startWorldY: number,
  goalWorldX: number,
  goalWorldY: number,
  grid: Uint8Array,
  cols = MAP_GRID_COLS,
  rows = MAP_GRID_ROWS
): Array<{ x: number; y: number }> {
  const s0 = findNearestWalkableTile(
    Math.floor(startWorldX / MAP_TILE_SIZE),
    Math.floor(startWorldY / MAP_TILE_SIZE),
    grid,
    cols,
    rows,
    6
  );
  const g0 = findNearestWalkableTile(
    Math.floor(goalWorldX / MAP_TILE_SIZE),
    Math.floor(goalWorldY / MAP_TILE_SIZE),
    grid,
    cols,
    rows,
    10
  );

  const startIdx = s0.ty * cols + s0.tx;
  const goalIdx = g0.ty * cols + g0.tx;
  const total = cols * rows;

  if (startIdx === goalIdx) {
    if (isBoxWalkable(goalWorldX, goalWorldY, 7, 7, grid, cols, rows)) {
      return [{ x: goalWorldX, y: goalWorldY }];
    }
    return [{ x: g0.tx * MAP_TILE_SIZE + 12, y: g0.ty * MAP_TILE_SIZE + 12 }];
  }

  const gScore = new Float32Array(total).fill(Infinity);
  const fScore = new Float32Array(total).fill(Infinity);
  const cameFrom = new Int32Array(total).fill(-1);
  const closed = new Uint8Array(total);
  const inOpen = new Uint8Array(total);

  gScore[startIdx] = 0;
  fScore[startIdx] = Math.hypot(g0.tx - s0.tx, g0.ty - s0.ty);

  // Lightweight binary min-heap on tile indices
  const heap: number[] = [startIdx];
  inOpen[startIdx] = 1;

  const pushHeap = (idx: number) => {
    heap.push(idx);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (fScore[heap[p]] <= fScore[heap[i]]) break;
      const tmp = heap[p];
      heap[p] = heap[i];
      heap[i] = tmp;
      i = p;
    }
  };

  const popHeap = (): number => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;
      const n = heap.length;
      while (true) {
        let smallest = i;
        const l = i * 2 + 1;
        const r = i * 2 + 2;
        if (l < n && fScore[heap[l]] < fScore[heap[smallest]]) smallest = l;
        if (r < n && fScore[heap[r]] < fScore[heap[smallest]]) smallest = r;
        if (smallest === i) break;
        const tmp = heap[i];
        heap[i] = heap[smallest];
        heap[smallest] = tmp;
        i = smallest;
      }
    }
    return top;
  };

  const DIRS = [
    [0, -1, 1.0],
    [1, 0, 1.0],
    [0, 1, 1.0],
    [-1, 0, 1.0],
    [1, -1, 1.414],
    [1, 1, 1.414],
    [-1, 1, 1.414],
    [-1, -1, 1.414],
  ];

  let found = false;
  let iterations = 0;
  while (heap.length > 0 && iterations < 22000) {
    iterations++;
    const cur = popHeap();
    inOpen[cur] = 0;
    if (cur === goalIdx) {
      found = true;
      break;
    }
    closed[cur] = 1;

    const cx = cur % cols;
    const cy = Math.floor(cur / cols);

    for (let d = 0; d < 8; d++) {
      const dx = DIRS[d][0];
      const dy = DIRS[d][1];
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 1 || ny < 1 || nx >= cols - 1 || ny >= rows - 1) continue;

      const nIdx = ny * cols + nx;
      if (closed[nIdx]) continue;
      const nt = grid[nIdx];
      if (nt === TILE_WALL) continue;

      // Prevent diagonal corner-cutting against adjacent walls
      if (dx !== 0 && dy !== 0) {
        if (grid[cy * cols + nx] === TILE_WALL || grid[ny * cols + cx] === TILE_WALL) {
          continue;
        }
      }

      const terrainMult = nt === TILE_WATER ? 2.8 : nt === TILE_ROAD || nt === TILE_BRIDGE || nt === TILE_COURTYARD ? 0.95 : 1.05;
      const tentativeG = gScore[cur] + DIRS[d][2] * terrainMult;

      if (tentativeG < gScore[nIdx]) {
        cameFrom[nIdx] = cur;
        gScore[nIdx] = tentativeG;
        fScore[nIdx] = tentativeG + Math.hypot(g0.tx - nx, g0.ty - ny);
        if (!inOpen[nIdx]) {
          pushHeap(nIdx);
          inOpen[nIdx] = 1;
        }
      }
    }
  }

  if (!found) return [];

  const rev: Array<{ x: number; y: number }> = [];
  let trace = goalIdx;
  while (trace !== -1 && trace !== startIdx) {
    const tx = trace % cols;
    const ty = Math.floor(trace / cols);
    rev.push({ x: tx * MAP_TILE_SIZE + 12, y: ty * MAP_TILE_SIZE + 12 });
    trace = cameFrom[trace];
  }
  rev.reverse();

  // Refine final point to exact clicked coordinate if safely walkable
  if (rev.length > 0 && isBoxWalkable(goalWorldX, goalWorldY, 7, 7, grid, cols, rows)) {
    rev[rev.length - 1] = { x: goalWorldX, y: goalWorldY };
  }
  return rev;
}

export function pickRandomWalkableTarget(
  curX: number,
  curY: number,
  grid: Uint8Array,
  cols = MAP_GRID_COLS,
  rows = MAP_GRID_ROWS
): { x: number; y: number } {
  const curTx = Math.floor(curX / MAP_TILE_SIZE);
  const curTy = Math.floor(curY / MAP_TILE_SIZE);

  for (let attempt = 0; attempt < 24; attempt++) {
    const rx = Math.max(5, Math.min(cols - 6, curTx + Math.round((Math.random() - 0.5) * 26)));
    const ry = Math.max(6, Math.min(rows - 8, curTy + Math.round((Math.random() - 0.5) * 26)));
    const t = grid[ry * cols + rx];
    if (t !== TILE_WALL && t !== TILE_WATER) {
      return { x: rx * MAP_TILE_SIZE + 12, y: ry * MAP_TILE_SIZE + 12 };
    }
  }
  const snap = findNearestWalkableTile(curTx, curTy, grid, cols, rows, 10, true);
  return { x: snap.tx * MAP_TILE_SIZE + 12, y: snap.ty * MAP_TILE_SIZE + 12 };
}
