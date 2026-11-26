import React, { useEffect, useRef } from 'react';
import { WeatherEffect } from '../../data/battlegrounds';

interface WeatherManifestEntry {
  file?: string;
  darkFile?: string;
  lightFile?: string;
  fw: number;
  fh: number;
  cols?: number;
  rows?: number;
  frames?: number;
  fps?: number;
}

const WEATHER_SPECS: Record<string, WeatherManifestEntry> = {
  rain: { file: '/pmd_weather/rain_frames.png', fw: 240, fh: 160, cols: 5, rows: 13, frames: 61, fps: 22 },
  snow: { file: '/pmd_weather/snow_frames.png', fw: 64, fh: 32, cols: 4, rows: 4, frames: 16, fps: 16 },
  blizzard: { file: '/pmd_weather/blizzard_frames.png', fw: 32, fh: 32, cols: 4, rows: 4, frames: 16, fps: 22 },
  snowDungeon: { file: '/pmd_weather/snow_dungeon_frames.png', fw: 32, fh: 32, cols: 4, rows: 4, frames: 16, fps: 14 },
  hail: { file: '/pmd_weather/hail_frames.png', fw: 240, fh: 160, cols: 5, rows: 13, frames: 65, fps: 22 },
  embers: { file: '/pmd_weather/embers_frames.png', fw: 480, fh: 320, cols: 4, rows: 4, frames: 13, fps: 12 },
  cloudShadows: { file: '/pmd_weather/cloud_shadows.png', fw: 720, fh: 408 },
  sandstormDark: { file: '/pmd_weather/sandstorm_dark.png', fw: 120, fh: 32 },
  sandstormLight: { file: '/pmd_weather/sandstorm_light.png', fw: 120, fh: 32 },
  fogDark: { file: '/pmd_weather/fog_dark.png', fw: 336, fh: 120 },
  fogLight: { file: '/pmd_weather/fog_light.png', fw: 336, fh: 120 },
};

const imageCache: Record<string, HTMLImageElement> = {};

function loadWeatherImage(key: string): HTMLImageElement | null {
  const spec = WEATHER_SPECS[key];
  if (!spec?.file) return null;
  if (imageCache[key]) {
    return imageCache[key].complete && imageCache[key].naturalWidth > 0 ? imageCache[key] : null;
  }
  const img = new Image();
  img.src = spec.file;
  imageCache[key] = img;
  return null;
}

function tileImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  vw: number,
  vh: number,
  dw: number,
  dh: number,
  offsetX: number,
  offsetY: number
) {
  const startX = ((offsetX % dw) + dw) % dw - dw;
  const startY = ((offsetY % dh) + dh) % dh - dh;
  for (let y = startY; y < vh; y += dh) {
    for (let x = startX; x < vw; x += dw) {
      ctx.drawImage(img, 0, 0, img.width, img.height, Math.floor(x), Math.floor(y), dw, dh);
    }
  }
}

function tileSpriteSheetFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  spec: WeatherManifestEntry,
  frameIdx: number,
  vw: number,
  vh: number,
  scale: number,
  offsetX = 0,
  offsetY = 0,
  staggerStep = 0
) {
  const cols = spec.cols || 1;
  const totalFrames = spec.frames || 1;
  const dw = Math.round(spec.fw * scale);
  const dh = Math.round(spec.fh * scale);
  const startX = ((offsetX % dw) + dw) % dw - dw;
  const startY = ((offsetY % dh) + dh) % dh - dh;

  let tileIdx = 0;
  for (let y = startY; y < vh; y += dh) {
    for (let x = startX; x < vw; x += dw) {
      const f = (frameIdx + tileIdx * staggerStep) % totalFrames;
      const sx = (f % cols) * spec.fw;
      const sy = Math.floor(f / cols) * spec.fh;
      ctx.drawImage(img, sx, sy, spec.fw, spec.fh, Math.floor(x), Math.floor(y), dw, dh);
      tileIdx++;
    }
  }
}

interface PetalOrSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  color: string;
}

function buildParticles(count: number, w: number, h: number, kind: 'SAKURA' | 'FIREFLIES' | 'VOID_STARS'): PetalOrSpark[] {
  const items: PetalOrSpark[] = [];
  for (let i = 0; i < count; i++) {
    const s = Math.sin(i * 127.1 + 31.7) * 43758.5453;
    const r1 = s - Math.floor(s);
    const r2 = (s * 1.7) - Math.floor(s * 1.7);
    const r3 = (s * 2.3) - Math.floor(s * 2.3);
    if (kind === 'SAKURA') {
      items.push({
        x: r1 * w,
        y: r2 * h,
        vx: 16 + r3 * 22,
        vy: 24 + r1 * 20,
        size: r3 > 0.5 ? 4 : 3,
        phase: r2 * Math.PI * 2,
        color: r1 > 0.5 ? '#f9a8d4' : '#fbcfe8',
      });
    } else if (kind === 'FIREFLIES') {
      items.push({
        x: r1 * w,
        y: r2 * h,
        vx: (r3 - 0.5) * 14,
        vy: -8 - r1 * 12,
        size: r3 > 0.6 ? 3 : 2,
        phase: r2 * Math.PI * 2,
        color: r1 > 0.45 ? '#6ee7b7' : '#fde047',
      });
    } else {
      items.push({
        x: r1 * w,
        y: r2 * h,
        vx: (r3 - 0.5) * 4,
        vy: -4 - r1 * 6,
        size: r3 > 0.65 ? 3 : 2,
        phase: r2 * Math.PI * 2,
        color: r1 > 0.5 ? '#c084fc' : '#67e8f9',
      });
    }
  }
  return items;
}

interface PmdWeatherOverlayProps {
  weatherEffect: WeatherEffect;
  width: number;
  height: number;
  camX?: number;
  camY?: number;
  variant?: 'overworld' | 'battle';
}

export const PmdWeatherOverlay: React.FC<PmdWeatherOverlayProps> = ({
  weatherEffect,
  width,
  height,
  camX = 0,
  camY = 0,
  variant = 'overworld',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const camRef = useRef({ x: camX, y: camY });
  camRef.current = { x: camX, y: camY };

  useEffect(() => {
    if (weatherEffect === 'NONE') return;

    // Trigger preload for needed assets immediately
    const preloadKeys: string[] = [];
    if (weatherEffect === 'RAIN') preloadKeys.push('rain');
    if (weatherEffect === 'SNOW') preloadKeys.push('snow', 'snowDungeon');
    if (weatherEffect === 'BLIZZARD') preloadKeys.push('blizzard', 'fogLight');
    if (weatherEffect === 'HAIL') preloadKeys.push('hail');
    if (weatherEffect === 'EMBERS') preloadKeys.push('embers');
    if (weatherEffect === 'SANDSTORM') preloadKeys.push('sandstormDark', 'sandstormLight');
    if (weatherEffect === 'MIST') preloadKeys.push('fogLight', 'fogDark');
    if (weatherEffect === 'CLOUD_SHADOWS') preloadKeys.push('cloudShadows');
    if (weatherEffect === 'VOID_STARS') preloadKeys.push('fogDark');
    if (weatherEffect === 'FIREFLIES') preloadKeys.push('cloudShadows');
    preloadKeys.forEach(loadWeatherImage);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = Math.max(120, Math.floor(width));
    const h = Math.max(120, Math.floor(height));
    const startTime = performance.now();
    let rafId = 0;

    const particles =
      weatherEffect === 'SAKURA' || weatherEffect === 'FIREFLIES' || weatherEffect === 'VOID_STARS'
        ? buildParticles(variant === 'battle' ? 18 : 28, w, h, weatherEffect)
        : [];

    const render = (now: number) => {
      const elapsedSec = (now - startTime) / 1000;
      const cx = camRef.current.x;
      const cy = camRef.current.y;

      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = false;
      ctx.save();

      if (weatherEffect === 'RAIN') {
        // Subtle cool storm atmosphere
        ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
        ctx.fillRect(0, 0, w, h);

        const img = loadWeatherImage('rain');
        if (img) {
          const spec = WEATHER_SPECS.rain;
          const f = Math.floor(elapsedSec * (spec.fps || 22)) % (spec.frames || 61);
          ctx.globalAlpha = 0.88;
          tileSpriteSheetFrame(ctx, img, spec, f, w, h, 2, -cx * 0.25, -cy * 0.25, 11);
        }
      } else if (weatherEffect === 'SNOW') {
        ctx.fillStyle = 'rgba(186, 230, 253, 0.08)';
        ctx.fillRect(0, 0, w, h);

        const img = loadWeatherImage('snow');
        if (img) {
          const spec = WEATHER_SPECS.snow;
          const f = Math.floor(elapsedSec * (spec.fps || 16)) % (spec.frames || 16);
          ctx.globalAlpha = 0.92;
          tileSpriteSheetFrame(ctx, img, spec, f, w, h, 2, -cx * 0.35, -cy * 0.35, 3);
        }
      } else if (weatherEffect === 'BLIZZARD') {
        ctx.fillStyle = 'rgba(224, 242, 254, 0.16)';
        ctx.fillRect(0, 0, w, h);

        const fogImg = loadWeatherImage('fogLight');
        if (fogImg) {
          ctx.globalAlpha = 0.42;
          tileImage(ctx, fogImg, w, h, 672, 240, elapsedSec * 96 - cx * 0.3, elapsedSec * 28 - cy * 0.3);
        }

        const img = loadWeatherImage('blizzard');
        if (img) {
          const spec = WEATHER_SPECS.blizzard;
          const f = Math.floor(elapsedSec * (spec.fps || 22)) % (spec.frames || 16);
          ctx.globalAlpha = 0.95;
          tileSpriteSheetFrame(ctx, img, spec, f, w, h, 2.25, -cx * 0.4, -cy * 0.4, 2);
        }
      } else if (weatherEffect === 'HAIL') {
        ctx.fillStyle = 'rgba(14, 116, 144, 0.12)';
        ctx.fillRect(0, 0, w, h);

        const img = loadWeatherImage('hail');
        if (img) {
          const spec = WEATHER_SPECS.hail;
          const f = Math.floor(elapsedSec * (spec.fps || 22)) % (spec.frames || 65);
          ctx.globalAlpha = 0.94;
          tileSpriteSheetFrame(ctx, img, spec, f, w, h, 2, -cx * 0.3, -cy * 0.3, 9);
        }
      } else if (weatherEffect === 'EMBERS') {
        ctx.fillStyle = 'rgba(124, 45, 18, 0.13)';
        ctx.fillRect(0, 0, w, h);

        const img = loadWeatherImage('embers');
        if (img) {
          const spec = WEATHER_SPECS.embers;
          const f = Math.floor(elapsedSec * (spec.fps || 12)) % (spec.frames || 13);
          ctx.globalAlpha = 0.95;
          tileSpriteSheetFrame(
            ctx,
            img,
            spec,
            f,
            w,
            h,
            1,
            -cx * 0.35 + Math.sin(elapsedSec * 1.4) * 8,
            -cy * 0.35 - elapsedSec * 18,
            3
          );
        }
      } else if (weatherEffect === 'SANDSTORM') {
        ctx.fillStyle = 'rgba(180, 120, 60, 0.2)';
        ctx.fillRect(0, 0, w, h);

        const darkImg = loadWeatherImage('sandstormDark');
        const lightImg = loadWeatherImage('sandstormLight');
        if (darkImg) {
          ctx.globalAlpha = 0.52;
          tileImage(ctx, darkImg, w, h, 300, 80, elapsedSec * 230 - cx * 0.35, elapsedSec * 42 - cy * 0.2);
        }
        if (lightImg) {
          ctx.globalAlpha = 0.46;
          tileImage(ctx, lightImg, w, h, 360, 96, elapsedSec * 310 - cx * 0.45, elapsedSec * 58 - cy * 0.25);
        }
      } else if (weatherEffect === 'MIST') {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.1)';
        ctx.fillRect(0, 0, w, h);

        const fogLight = loadWeatherImage('fogLight');
        const fogDark = loadWeatherImage('fogDark');
        if (fogDark) {
          ctx.globalAlpha = 0.5;
          tileImage(ctx, fogDark, w, h, 672, 240, elapsedSec * 24 - cx * 0.35, elapsedSec * 6 - cy * 0.35);
        }
        if (fogLight) {
          ctx.globalAlpha = 0.56;
          tileImage(ctx, fogLight, w, h, 672, 240, -elapsedSec * 18 - cx * 0.45, elapsedSec * 10 - cy * 0.45);
        }
      } else if (weatherEffect === 'CLOUD_SHADOWS') {
        const img = loadWeatherImage('cloudShadows');
        if (img) {
          ctx.globalAlpha = 0.78;
          tileImage(ctx, img, w, h, 1080, 612, -elapsedSec * 22 - cx * 0.5, elapsedSec * 10 - cy * 0.5);
        }
      } else if (weatherEffect === 'VOID_STARS') {
        const fogDark = loadWeatherImage('fogDark');
        if (fogDark) {
          ctx.globalAlpha = 0.38;
          tileImage(ctx, fogDark, w, h, 672, 240, elapsedSec * 16 - cx * 0.3, -elapsedSec * 8 - cy * 0.3);
        }
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const px = ((p.x + elapsedSec * p.vx) % w + w) % w;
          const py = ((p.y + elapsedSec * p.vy) % h + h) % h;
          const pulse = 0.45 + 0.55 * Math.sin(elapsedSec * 3.2 + p.phase);
          ctx.globalAlpha = pulse;
          ctx.fillStyle = p.color;
          ctx.fillRect(Math.floor(px), Math.floor(py), p.size, p.size);
        }
      } else if (weatherEffect === 'FIREFLIES') {
        const clouds = loadWeatherImage('cloudShadows');
        if (clouds) {
          ctx.globalAlpha = 0.38;
          tileImage(ctx, clouds, w, h, 1080, 612, -elapsedSec * 15 - cx * 0.4, elapsedSec * 7 - cy * 0.4);
        }
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const px = ((p.x + elapsedSec * p.vx + Math.sin(elapsedSec * 1.6 + p.phase) * 14) % w + w) % w;
          const py = ((p.y + elapsedSec * p.vy) % h + h) % h;
          const pulse = 0.35 + 0.65 * Math.abs(Math.sin(elapsedSec * 2.5 + p.phase));
          ctx.globalAlpha = pulse;
          ctx.fillStyle = p.color;
          ctx.fillRect(Math.floor(px), Math.floor(py), p.size, p.size);
          ctx.globalAlpha = pulse * 0.35;
          ctx.fillRect(Math.floor(px) - 1, Math.floor(py) - 1, p.size + 2, p.size + 2);
        }
      } else if (weatherEffect === 'SAKURA') {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const px = ((p.x + elapsedSec * p.vx + Math.sin(elapsedSec * 2.1 + p.phase) * 18) % w + w) % w;
          const py = ((p.y + elapsedSec * p.vy) % h + h) % h;
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = p.color;
          ctx.fillRect(Math.floor(px), Math.floor(py), p.size, p.size - 1);
          ctx.fillRect(Math.floor(px) + 1, Math.floor(py) + 1, p.size - 1, p.size - 1);
        }
      }

      ctx.restore();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [weatherEffect, width, height, variant]);

  if (weatherEffect === 'NONE') return null;

  return (
    <canvas
      ref={canvasRef}
      width={Math.max(120, Math.floor(width))}
      height={Math.max(120, Math.floor(height))}
      data-weather={weatherEffect}
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
