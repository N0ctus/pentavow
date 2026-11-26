import React, { useEffect, useRef, useState } from 'react';
import { GeneratedBigMap } from '../../data/bigMaps';
import {
  AutotiledCell,
  computeAutotileGrid,
  loadImageCached,
  loadPmdManifest,
  MAP_TILE_SIZE,
  pickGroundRow,
  pickWallRow,
  PmdTilesetMeta,
  TILE_BRIDGE,
  TILE_COURTYARD,
  TILE_ROAD,
  TILE_WALL,
  TILE_WATER,
} from '../../utils/pmdTileEngine';

interface PmdTilemapCanvasProps {
  bigMap: GeneratedBigMap;
  onTilesetColors?: (colors: { wall: string; ground: string; water: string }) => void;
}

export const PmdTilemapCanvas: React.FC<PmdTilemapCanvasProps> = ({ bigMap, onTilesetColors }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [readyVersion, setReadyVersion] = useState(0);

  const stateRef = useRef<{
    atlasImg: HTMLImageElement | null;
    tileset: PmdTilesetMeta | null;
    autoCells: AutotiledCell[];
    animatedCoords: Array<{ x: number; y: number; cell: AutotiledCell; isBridge: boolean }>;
  }>({
    atlasImg: null,
    tileset: null,
    autoCells: [],
    animatedCoords: [],
  });

  // Load manifest, native Tiles/ atlas, and pre-compute 47-tile autotile grid
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const manifest = await loadPmdManifest();
      const ts = manifest.tilesets[bigMap.tilesetId] || Object.values(manifest.tilesets)[0];
      if (!ts || cancelled) return;

      onTilesetColors?.(ts.colors);

      const atlasImg = await loadImageCached(ts.atlasUrl);
      if (cancelled) return;

      const autoCells = computeAutotileGrid(
        bigMap.grid,
        bigMap.cols,
        bigMap.rows,
        manifest.lookup256,
        bigMap.seed
      );

      const animatedCoords: Array<{ x: number; y: number; cell: AutotiledCell; isBridge: boolean }> = [];
      for (let y = 0; y < bigMap.rows; y++) {
        for (let x = 0; x < bigMap.cols; x++) {
          const t = bigMap.grid[y * bigMap.cols + x];
          if (t === TILE_WATER || t === TILE_BRIDGE) {
            animatedCoords.push({
              x,
              y,
              cell: autoCells[y * bigMap.cols + x],
              isBridge: t === TILE_BRIDGE,
            });
          }
        }
      }

      stateRef.current = {
        atlasImg,
        tileset: ts,
        autoCells,
        animatedCoords,
      };

      // Draw full initial static pass using ONLY this map's native Tiles/ atlas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          const T = MAP_TILE_SIZE;

          for (let y = 0; y < bigMap.rows; y++) {
            for (let x = 0; x < bigMap.cols; x++) {
              const idx = y * bigMap.cols + x;
              const t = bigMap.grid[idx];
              const cell = autoCells[idx];
              const dx = x * T;
              const dy = y * T;

              if (t === TILE_WALL) {
                const row = pickWallRow(cell, ts);
                ctx.drawImage(atlasImg, cell.wallIdx * T, row * T, T, T, dx, dy, T, T);
              } else {
                // Ground layer always drawn underneath (PMD Ground + Water rule)
                const grow = pickGroundRow(cell, ts);
                ctx.drawImage(atlasImg, cell.groundIdx * T, grow * T, T, T, dx, dy, T, T);

                if (t === TILE_ROAD || t === TILE_COURTYARD) {
                  // Boss Route & Sanctuary floor uses this map's own native Tiles/ Ground & Alt patterns autotiled by roadIdx
                  let rRow = 3;
                  const alt1 = ts.groundAlt1Indices?.includes(cell.roadIdx);
                  const alt2 = ts.groundAlt2Indices?.includes(cell.roadIdx);
                  if (t === TILE_COURTYARD) {
                    if (cell.altRoll < 260 && alt1) rRow = 4;
                    else if (cell.altRoll >= 260 && cell.altRoll < 420 && alt2) rRow = 5;
                  } else if (cell.altRoll < 140 && alt1) {
                    rRow = 4;
                  }
                  ctx.drawImage(atlasImg, cell.roadIdx * T, rRow * T, T, T, dx, dy, T, T);
                }
              }
            }
          }
        }
      }

      setReadyVersion(v => v + 1);
    }

    init().catch(err => console.error('PmdTilemapCanvas init failed:', err));
    return () => {
      cancelled = true;
    };
  }, [bigMap]);

  // Dual-speed palette cycling loop for animated Water / Lava / Sparkles + Native Ground Causeways
  useEffect(() => {
    const s = stateRef.current;
    if (!s.atlasImg || !s.tileset) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const ts = s.tileset;
    const T = MAP_TILE_SIZE;
    const startTime = performance.now();
    let lastWaterFrame = -1;
    let lastSparkleFrame = -1;
    let rafId = 0;

    const drawAnimatedCells = (wf: number, sf: number) => {
      const waterRow = 6 + wf;
      const sparkleRow = 6 + ts.waterFrames + sf;
      const hasSparkle = ts.sparkleFrames > 0;

      for (let i = 0; i < s.animatedCoords.length; i++) {
        const { x, y, cell, isBridge } = s.animatedCoords[i];
        const dx = x * T;
        const dy = y * T;

        // 1. Repaint Ground underneath so transparent water edges blend cleanly
        const grow = pickGroundRow(cell, ts);
        ctx.drawImage(s.atlasImg!, cell.groundIdx * T, grow * T, T, T, dx, dy, T, T);

        // 2. Draw animated Water / Lava frame
        ctx.drawImage(s.atlasImg!, cell.waterIdx * T, waterRow * T, T, T, dx, dy, T, T);

        // 3. Overlay animated Water Sparkle frame if applicable
        if (hasSparkle && ts.sparkleIndices.includes(cell.waterIdx)) {
          ctx.drawImage(s.atlasImg!, cell.waterIdx * T, sparkleRow * T, T, T, dx, dy, T, T);
        }

        // 4. Overlay map's own Tiles/ Ground causeway tile if Bridge over animated water
        if (isBridge) {
          const bRow =
            cell.roadIdx === 4 && ts.groundAlt1Indices?.includes(4) && cell.altRoll < 200 ? 4 : 3;
          ctx.drawImage(s.atlasImg!, cell.roadIdx * T, bRow * T, T, T, dx, dy, T, T);
        }
      }
    };

    const loop = (now: number) => {
      // Exact 60 FPS GBA frame clock (16.6667 ms per frame) regardless of display Hz
      const gbaFrames = Math.floor((now - startTime) / (1000 / 60));
      const wf = Math.floor(gbaFrames / ts.waterSpeedFrames) % Math.max(1, ts.waterFrames);
      const sf = ts.sparkleFrames > 0 ? Math.floor(gbaFrames / ts.sparkleSpeedFrames) % ts.sparkleFrames : 0;

      if (wf !== lastWaterFrame || sf !== lastSparkleFrame) {
        lastWaterFrame = wf;
        lastSparkleFrame = sf;
        drawAnimatedCells(wf, sf);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [readyVersion, bigMap]);

  return (
    <canvas
      ref={canvasRef}
      width={bigMap.cols * bigMap.tileSize}
      height={bigMap.rows * bigMap.tileSize}
      className="absolute inset-0 pointer-events-none"
      style={{
        width: `${bigMap.cols * bigMap.tileSize}px`,
        height: `${bigMap.rows * bigMap.tileSize}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
};
