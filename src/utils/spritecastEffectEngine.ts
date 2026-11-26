import { ElementType } from '../types/game';

// -------------------------------------------------------------
// SPRITECAST PARTICLE & VFX SIMULATION ENGINE
// Learned from: https://github.com/Sunghwan0112/spritecast (effects.json & PVFX Foundry)
// -------------------------------------------------------------

export interface ParticleConfig {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number; // Downward (positive) or upward (negative for fire/smoke)
  drag: number;    // Air resistance deceleration factor
  life: number;    // Seconds remaining
  maxLife: number;
  size: number;
  color: string;
  secondaryColor?: string;
  shape: 'circle' | 'spark' | 'star' | 'leaf' | 'shard' | 'droplet';
  spin: number;
  spinSpeed: number;
  sway?: number;   // Horizontal oscillation
  stretch?: number; // Elongate along velocity vector
  alpha: number;
  blob?: boolean;  // Fluid droplet coalescence
}

export interface ImpactVfxEvent {
  id: string;
  type: 'CRIT_BURST' | 'HIT_SPARK' | 'BLOCK_GUARD' | 'GROUND_SLAM' | 'VOID_IMPLOSION' | 'WATER_SPLASH';
  x: number; // Percentage (0..100) or pixels
  y: number;
  element: ElementType;
  particles: ParticleConfig[];
  createdAt: number;
  durationMs: number;
  scale?: number;
}

export const ELEMENT_VFX_PALETTES: Record<
  ElementType,
  { primary: string; secondary: string; light: string; glow: string; dark: string }
> = {
  FIRE: {
    primary: '#ef4444',
    secondary: '#f97316',
    light: '#fef08a',
    glow: 'rgba(239, 68, 68, 0.75)',
    dark: '#7f1d1d'
  },
  WATER: {
    primary: '#06b6d4',
    secondary: '#3b82f6',
    light: '#e0f2fe',
    glow: 'rgba(6, 182, 212, 0.75)',
    dark: '#0c4a6e'
  },
  WIND: {
    primary: '#10b981',
    secondary: '#34d399',
    light: '#d1fae5',
    glow: 'rgba(16, 185, 129, 0.75)',
    dark: '#064e3b'
  },
  LIGHT: {
    primary: '#f59e0b',
    secondary: '#facc15',
    light: '#ffffff',
    glow: 'rgba(245, 158, 11, 0.75)',
    dark: '#78350f'
  },
  DARK: {
    primary: '#a855f7',
    secondary: '#c084fc',
    light: '#f3e8ff',
    glow: 'rgba(168, 85, 247, 0.75)',
    dark: '#3b0764'
  }
};

/**
 * Creates a burst of SpriteCast-inspired particles around an impact point
 */
export function createImpactParticles(
  type: ImpactVfxEvent['type'],
  x: number,
  y: number,
  element: ElementType,
  count = 14
): ParticleConfig[] {
  const pal = ELEMENT_VFX_PALETTES[element] || ELEMENT_VFX_PALETTES.FIRE;
  const particles: ParticleConfig[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const speed = 2.5 + Math.random() * 4.5;
    const maxLife = 0.4 + Math.random() * 0.5;

    let shape: ParticleConfig['shape'] = 'circle';
    let gravity = 1.2;
    let drag = 1.8;
    let sway = 0;
    let stretch = 0;

    switch (element) {
      case 'FIRE':
        // SpriteCast fire: negative gravity (rises), high drag, spark embers
        shape = Math.random() > 0.4 ? 'spark' : 'circle';
        gravity = -2.2;
        drag = 2.0;
        sway = 0.05;
        break;
      case 'WATER':
        // SpriteCast water: heavy gravity drops, speed stretch, splashes
        shape = 'droplet';
        gravity = 3.5;
        drag = 1.5;
        stretch = 0.25;
        break;
      case 'WIND':
        // SpriteCast wind: tumbling leaves/slivers with sway oscillation
        shape = Math.random() > 0.5 ? 'leaf' : 'shard';
        gravity = 0.4;
        drag = 2.4;
        sway = 0.08;
        break;
      case 'LIGHT':
        // SpriteCast holy: 4-point star glints, low gravity
        shape = 'star';
        gravity = -0.5;
        drag = 1.2;
        break;
      case 'DARK':
        // SpriteCast void: inward suction then spinning shards
        shape = 'shard';
        gravity = 0.8;
        drag = 2.2;
        break;
    }

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity,
      drag,
      life: maxLife,
      maxLife,
      size: 4 + Math.random() * 6,
      color: Math.random() > 0.5 ? pal.light : pal.primary,
      secondaryColor: pal.secondary,
      shape,
      spin: Math.random() * 360,
      spinSpeed: (Math.random() - 0.5) * 20,
      sway,
      stretch,
      alpha: 1
    });
  }

  return particles;
}

/**
 * Step particle physics simulation one frame forward (deltaSec)
 */
export function updateParticles(particles: ParticleConfig[], deltaSec: number): ParticleConfig[] {
  return particles
    .map(p => {
      // Drag velocity decay
      const decay = Math.max(0, 1 - p.drag * deltaSec);
      const vx = p.vx * decay + (p.sway ? Math.sin(p.life * 10) * p.sway * 10 : 0);
      const vy = p.vy * decay + p.gravity * 9.8 * deltaSec;

      return {
        ...p,
        x: p.x + vx,
        y: p.y + vy,
        vx,
        vy,
        life: p.life - deltaSec,
        spin: p.spin + p.spinSpeed,
        alpha: Math.max(0, p.life / p.maxLife)
      };
    })
    .filter(p => p.life > 0);
}
