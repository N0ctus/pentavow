import React, { useRef, useEffect, useState, useMemo, Suspense, lazy } from 'react';
import { useGameStore, gameActions } from '../../state/useGameStore';
import { SpriteRenderer } from '../common/SpriteRenderer';
import { AstralSummonsAltar } from '../common/AstralSummonsAltar';
import { RealmPortal } from '../common/RealmPortal';
import { ClassIcon } from '../common/ClassIcon';
import { PmdTilemapCanvas } from './PmdTilemapCanvas';
import { PmdWeatherOverlay } from './PmdWeatherOverlay';
import { getRealmById } from '../../data/realms';
import { getBigMapForRealm, GeneratedBigMap, MapPropKind } from '../../data/bigMaps';
import { ENEMY_TEMPLATES } from '../../data/enemies';
import { soundManager } from '../../utils/audioManager';
import {
  findNearestWalkableTile,
  findTilePath,
  isBoxWalkable,
  MAP_GRID_COLS,
  MAP_GRID_ROWS,
  MAP_PIXEL_SIZE,
  MAP_TILE_SIZE,
  resolveEntityMove,
  TILE_BRIDGE,
  TILE_COURTYARD,
  TILE_ROAD,
  TILE_WALL,
  TILE_WATER,
} from '../../utils/pmdTileEngine';
import { Swords, Compass, Sparkles, Scroll, Castle, X, Hammer, Award, Heart, Lock, Map as MapIcon, Users } from 'lucide-react';
import { getElementBgClass } from '../../utils/combatUtils';
import { broadcastPresence, getCoopState, subscribeCoopState } from '../../services/coopMultiplayer';
import { getAccountState } from '../../services/googleSyncService';

// Lazy-load modal overlays
const QuestModal = lazy(() => import('../modals/QuestModal').then(m => ({ default: m.QuestModal })));
const DungeonModal = lazy(() => import('../modals/DungeonModal').then(m => ({ default: m.DungeonModal })));
const GachaModal = lazy(() => import('../modals/GachaModal').then(m => ({ default: m.GachaModal })));
const RealmTravelModal = lazy(() => import('../modals/RealmTravelModal').then(m => ({ default: m.RealmTravelModal })));
const CoopModal = lazy(() => import('../modals/CoopModal').then(m => ({ default: m.CoopModal })));
const AccountChoiceModal = lazy(() => import('../modals/AccountChoiceModal').then(m => ({ default: m.AccountChoiceModal })));
const HuntersCodexModal = lazy(() => import('../modals/HuntersCodexModal').then(m => ({ default: m.HuntersCodexModal })));
import { NoviceGuideTracker } from '../common/NoviceGuideTracker';

const PROP_IMAGE_MAP: Record<MapPropKind, string> = {
  TREE_OAK: '/map/stardew_tree_oak.png',
  TREE_OAK_ROUND: '/map/stardew_tree_round.png',
  TREE_PINE: '/map/stardew_tree_pine.png',
  TREE_DEAD: '/map/stardew_tree_dead.png',
  TREE_MAPLE: '/map/stardew_tree_maple.png',
  TREE_MYSTIC: '/map/stardew_tree_mystic.png',
  TREE_SUMMER_OAK: '/map/stardew_tree_summer_oak.png',
  TREE_SUMMER_MAPLE: '/map/stardew_tree_summer_maple.png',
  TREE_PALM: '/map/stardew_tree_palm.png',
  TREE_PALM_TALL: '/map/stardew_tree_palm_tall.png',
  TREE_AUTUMN_OAK: '/map/stardew_tree_autumn_oak.png',
  TREE_AUTUMN_PINE: '/map/stardew_tree_autumn_pine.png',
  TREE_AUTUMN_FERN: '/map/stardew_tree_autumn_fern.png',
  TREE_WINTER_OAK: '/map/stardew_tree_winter_oak.png',
  TREE_WINTER_PINE: '/map/stardew_tree_winter_pine.png',
  TREE_WINTER_DEAD: '/map/stardew_tree_winter_dead.png',
  TREE_WINTER_MAHOGANY: '/map/stardew_tree_winter_mahogany.png',
  TREE_WINTER_FERN: '/map/stardew_tree_winter_fern.png',
  TREE_SCORCHED: '/map/stardew_tree_scorched.png',
  TREE_MUSHROOM: '/map/stardew_tree_mushroom.png',
  TREE_MOSSY_MUSHROOM: '/map/stardew_tree_mossy_mushroom.png',
  TREE_MAHOGANY: '/map/stardew_tree_mahogany.png',
  TREE_AUTUMN_MAHOGANY: '/map/stardew_tree_autumn_mahogany.png',
  TREE_WINTER_MAPLE: '/map/stardew_tree_winter_maple.png',
  TREE_FERN: '/map/stardew_tree_fern.png',
  STUMP_OAK: '/map/stardew_stump_oak.png',
  STUMP_MOSSY: '/map/stardew_stump_mossy.png',
  STUMP_WINTER: '/map/stardew_stump_winter.png',
  STUMP_AUTUMN: '/map/stardew_stump_autumn.png',
  STUMP_PALM: '/map/stardew_stump_palm.png',
  PILLAR_MUSHROOM: '/map/stardew_pillar_mushroom.png',
  LOG_OAK: '/map/stardew_log_oak.png',
  LOG_AUTUMN: '/map/stardew_log_autumn.png',
  LOG_WINTER: '/map/stardew_log_winter.png',
  LOG_MYSTIC: '/map/stardew_log_mystic.png',
  LOG_FERN: '/map/stardew_log_fern.png',
  LOG_PALM: '/map/stardew_log_palm.png',
  LOG_MUSHROOM: '/map/stardew_log_mushroom.png',
  SAPLING_GREEN: '/map/stardew_sapling_green.png',
  SAPLING_SUMMER: '/map/stardew_sapling_summer.png',
  SAPLING_AUTUMN: '/map/stardew_sapling_autumn.png',
  SAPLING_WINTER: '/map/stardew_sapling_winter.png',
  SAPLING_MYSTIC: '/map/stardew_sapling_mystic.png',
  SAPLING_MUSHROOM: '/map/stardew_sapling_mushroom.png',
  SAPLING_PALM: '/map/stardew_sapling_palm.png',
  SPROUT_SPRING: '/map/stardew_sprout_spring.png',
  SPROUT_SUMMER: '/map/stardew_sprout_summer.png',
  SPROUT_AUTUMN: '/map/stardew_sprout_autumn.png',
  SPROUT_PINE: '/map/stardew_sprout_pine.png',
  SPROUT_WINTER: '/map/stardew_sprout_winter.png',
  SPROUT_FERN: '/map/stardew_sprout_fern.png',
  SPROUT_MYSTIC: '/map/stardew_sprout_mystic.png',
  SPROUT_MUSHROOM: '/map/stardew_sprout_mushroom.png',
  SPROUT_PALM: '/map/stardew_sprout_palm.png',
  BAMBOO_CLUSTER: '/map/prop_bamboo_cluster.png',
  LANTERN: '/map/prop_lantern.png',
  STREET_LAMP: '/map/prop_street_lamp.png',
  BRAZIER: '/map/prop_brazier_fire.png',
  SHRINE_PILLAR_CLEAN: '/map/shrine/pillar_clean.png',
  SHRINE_PILLAR_FLUTED: '/map/shrine/pillar_fluted.png',
  SHRINE_PILLAR_CRACKED: '/map/shrine/pillar_cracked.png',
  LOTUS: '/map/prop_lotus_flower.png',
  LILYPAD: '/map/prop_lilypad_cluster.png',
  REED: '/map/prop_reed_tuft.png',
};

function getTileAtWorld(x: number, y: number, bigMap: GeneratedBigMap): number {
  const tx = Math.floor(x / MAP_TILE_SIZE);
  const ty = Math.floor(y / MAP_TILE_SIZE);
  if (tx < 0 || ty < 0 || tx >= bigMap.cols || ty >= bigMap.rows) return TILE_WALL;
  return bigMap.grid[ty * bigMap.cols + tx];
}

export const isPointOnBridge = (x: number, y: number, bigMap?: GeneratedBigMap): boolean => {
  if (!bigMap) return x >= 960 && x <= 1360 && y >= 618 && y <= 774;
  return getTileAtWorld(x, y, bigMap) === TILE_BRIDGE;
};

export const isPointInWater = (x: number, y: number, bigMap?: GeneratedBigMap): boolean => {
  if (!bigMap) return false;
  return getTileAtWorld(x, y, bigMap) === TILE_WATER;
};

function resolveWalkableMove(
  curX: number,
  curY: number,
  nextX: number,
  nextY: number,
  bigMap: GeneratedBigMap
): { x: number; y: number } {
  return resolveEntityMove(curX, curY, nextX, nextY, bigMap.grid, bigMap.cols, bigMap.rows, 7);
}

interface FootstepFx {
  id: number;
  x: number;
  y: number;
  kind: 'DUST' | 'WATER' | 'LAVA';
}

export const OverworldMap: React.FC = () => {
  const store = useGameStore();
  const player = store.player;
  const containerRef = useRef<HTMLDivElement>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);

  const [viewportSize, setViewportSize] = useState<{ w: number; h: number }>({ w: 430, h: 626 });
  const [isKeyboardMoving, setIsKeyboardMoving] = useState(false);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const [pathWaypoints, setPathWaypoints] = useState<Array<{ x: number; y: number }>>([]);
  const pathRef = useRef<Array<{ x: number; y: number }>>([]);
  const [footstepFx, setFootstepFx] = useState<FootstepFx[]>([]);
  const lastStepFxTimeRef = useRef<number>(0);
  const [playerFacingLeft, setPlayerFacingLeft] = useState(false);
  const lastFootstepRef = useRef<number>(0);
  const playerPosRef = useRef<{ x: number; y: number }>({ x: player.x, y: player.y });
  playerPosRef.current = { x: player.x, y: player.y };
  const lastCoopPushRef = useRef<number>(0);
  const [coopState, setCoopState] = useState(getCoopState);
  const [showCoopModal, setShowCoopModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  useEffect(() => {
    return subscribeCoopState(() => setCoopState(getCoopState()));
  }, []);

  const [tilesetColors, setTilesetColors] = useState<{ wall: string; ground: string; water: string }>({
    wall: '#334155',
    ground: '#4d7c0f',
    water: '#0284c7',
  });

  const currentRealm = getRealmById(store.currentRealmId);
  const bigMap = useMemo(() => getBigMapForRealm(store.currentRealmId), [store.currentRealmId]);
  const bossTemplate = ENEMY_TEMPLATES[currentRealm.bossTemplateId];

  // Clear click path whenever switching maps
  useEffect(() => {
    pathRef.current = [];
    setPathWaypoints([]);
  }, [bigMap.id]);

  // Measure actual rendered container dimensions so clicks & camera match 1:1
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const w = el.clientWidth || 430;
      const h = el.clientHeight || 626;
      setViewportSize(prev => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mapSize = MAP_PIXEL_SIZE; // 2880 (120x120 tiles)
  const camX = Math.max(0, Math.min(Math.max(0, mapSize - viewportSize.w), player.x - viewportSize.w / 2));
  const camY = Math.max(0, Math.min(Math.max(0, mapSize - viewportSize.h), player.y - 28 - viewportSize.h / 2));

  const isPlayerInWater = isPointInWater(player.x, player.y, bigMap);
  const isPlayerOnBridge = isPointOnBridge(player.x, player.y, bigMap);
  const targetPos = pathWaypoints.length > 0 ? pathWaypoints[pathWaypoints.length - 1] : null;

  const playFootstep = (inWater = false) => {
    const now = Date.now();
    const interval = inWater ? 480 : 330;
    if (now - lastFootstepRef.current > interval) {
      lastFootstepRef.current = now;
      if (inWater) {
        soundManager.playWaterFootstep();
      } else {
        soundManager.playFootstep();
      }
    }
  };

  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showDungeonModal, setShowDungeonModal] = useState(false);
  const [showGachaModal, setShowGachaModal] = useState(false);
  const [showRealmModal, setShowRealmModal] = useState(false);
  const [showCodexModal, setShowCodexModal] = useState(false);
  const [showSanctuaryQuickMenu, setShowSanctuaryQuickMenu] = useState(false);
  const [sanctuaryNotice, setSanctuaryNotice] = useState<string | null>(null);
  const [revealedBossId, setRevealedBossId] = useState<string | null>(null);
  const [bossEncounterBanner, setBossEncounterBanner] = useState<{
    id: string;
    name: string;
    element: string;
    accentColor: string;
  } | null>(null);
  const bossInProximityRef = useRef<Set<string>>(new Set());
  const bossRevealTimerRef = useRef<number | null>(null);

  const triggerNotice = (msg: string) => {
    setSanctuaryNotice(msg);
    setTimeout(() => {
      setSanctuaryNotice(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  // Reset boss proximity reveal when changing realm/map
  useEffect(() => {
    bossInProximityRef.current.clear();
    setRevealedBossId(null);
    setBossEncounterBanner(null);
    if (bossRevealTimerRef.current) {
      window.clearTimeout(bossRevealTimerRef.current);
      bossRevealTimerRef.current = null;
    }
  }, [store.currentRealmId]);

  // Reveal living World Boss name for exactly 2 seconds when reaching them (<= 340px), then hide
  useEffect(() => {
    const boss = store.enemies.find(e => e.isBoss && e.currentHp > 0);
    if (!boss) return;

    const dist = Math.hypot(player.x - boss.x, player.y - boss.y);
    if (dist <= 340 && !bossInProximityRef.current.has(boss.id)) {
      bossInProximityRef.current.add(boss.id);
      setRevealedBossId(boss.id);
      setBossEncounterBanner({
        id: boss.id,
        name: boss.name,
        element: boss.element,
        accentColor: bigMap.accentColor,
      });
      if (bossRevealTimerRef.current) {
        window.clearTimeout(bossRevealTimerRef.current);
      }
      bossRevealTimerRef.current = window.setTimeout(() => {
        setRevealedBossId(prev => (prev === boss.id ? null : prev));
        setBossEncounterBanner(prev => (prev?.id === boss.id ? null : prev));
        bossRevealTimerRef.current = null;
      }, 2000);
    } else if (dist > 600 && bossInProximityRef.current.has(boss.id)) {
      bossInProximityRef.current.delete(boss.id);
    }
  }, [player.x, player.y, store.enemies, bigMap.accentColor]);

  // Novice Guide Step 1: Detect walking beyond the Haven Sanctuary (y < 2400)
  useEffect(() => {
    if (player.y < 2400 && (!player.noviceGuide || !player.noviceGuide.completedSteps.includes(1))) {
      gameActions.completeNoviceStep(1);
    }
  }, [player.y, player.noviceGuide]);

  const isBossDefeatedForRealm = Boolean(
    player.defeatedRealmBosses?.[store.currentRealmId] ||
    (store.enemies.find(e => e.isBoss && e.id === `mob-boss-${store.currentRealmId}`)?.currentHp ?? 1) <= 0
  );

  // Render pixel-accurate minimap radar directly from bigMap.grid
  useEffect(() => {
    const cvs = radarCanvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    for (let y = 0; y < MAP_GRID_ROWS; y++) {
      for (let x = 0; x < MAP_GRID_COLS; x++) {
        const t = bigMap.grid[y * MAP_GRID_COLS + x];
        if (t === TILE_WALL) ctx.fillStyle = tilesetColors.wall;
        else if (t === TILE_WATER) ctx.fillStyle = tilesetColors.water;
        else if (t === TILE_BRIDGE) ctx.fillStyle = '#f59e0b';
        else {
          ctx.fillStyle = tilesetColors.ground;
          ctx.fillRect(x, y, 1, 1);
          if (t === TILE_ROAD || t === TILE_COURTYARD) {
            ctx.fillStyle = t === TILE_COURTYARD ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.16)';
          } else {
            continue;
          }
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [bigMap, tilesetColors]);

  // Tap-to-move / click on map with A* obstacle-avoiding pathfinding
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickScreenX = e.clientX - rect.left;
    const clickScreenY = e.clientY - rect.top;

    const rawWorldX = Math.max(36, Math.min(mapSize - 36, clickScreenX + camX));
    const rawWorldY = Math.max(36, Math.min(mapSize - 36, clickScreenY + camY));

    // Snap clicked wall tile to nearest reachable walkable tile if needed
    const clickedTx = Math.floor(rawWorldX / MAP_TILE_SIZE);
    const clickedTy = Math.floor(rawWorldY / MAP_TILE_SIZE);
    let destX = rawWorldX;
    let destY = rawWorldY;

    if (!isBoxWalkable(destX, destY, 7, 7, bigMap.grid, bigMap.cols, bigMap.rows)) {
      const snapped = findNearestWalkableTile(clickedTx, clickedTy, bigMap.grid, bigMap.cols, bigMap.rows, 8);
      destX = snapped.tx * MAP_TILE_SIZE + 12;
      destY = snapped.ty * MAP_TILE_SIZE + 12;
    }

    const waypoints = findTilePath(playerPosRef.current.x, playerPosRef.current.y, destX, destY, bigMap.grid, bigMap.cols, bigMap.rows);
    if (waypoints.length > 0) {
      pathRef.current = waypoints;
      setPathWaypoints([...waypoints]);
      setIsKeyboardMoving(false);
      soundManager.playClick();
    } else {
      soundManager.playDebuff();
    }
  };

  // Track held keyboard keys cleanly (WASD / Arrows) for smooth 60fps movement
  useEffect(() => {
    const moveKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D']);
    const onKeyDown = (e: KeyboardEvent) => {
      if (moveKeys.has(e.key)) {
        pressedKeysRef.current.add(e.key.toLowerCase());
        pathRef.current = [];
        setPathWaypoints([]);
        setIsKeyboardMoving(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (moveKeys.has(e.key)) {
        pressedKeysRef.current.delete(e.key.toLowerCase());
        if (pressedKeysRef.current.size === 0) {
          setIsKeyboardMoving(false);
        }
      }
    };
    const onBlur = () => {
      pressedKeysRef.current.clear();
      setIsKeyboardMoving(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  // Unified 60 FPS delta-timed movement loop (Keyboard + A* Click Pathfinding)
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const spawnFootstepParticle = (x: number, y: number, inWater: boolean) => {
      const now = performance.now();
      const gap = inWater ? 240 : 180;
      if (now - lastStepFxTimeRef.current < gap) return;
      lastStepFxTimeRef.current = now;
      const isLava = bigMap.tilesetId.includes('magma') || bigMap.tilesetId === 'mt-blaze';
      const kind: FootstepFx['kind'] = inWater ? (isLava ? 'LAVA' : 'WATER') : 'DUST';
      const id = Math.round(now * 100 + Math.random() * 99);
      setFootstepFx(prev => [...prev.slice(-7), { id, x: x - 5, y: y - 4, kind }]);
      setTimeout(() => {
        setFootstepFx(prev => prev.filter(f => f.id !== id));
      }, 420);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const cur = playerPosRef.current;
      const inWater = isPointInWater(cur.x, cur.y, bigMap);
      const baseSpeed = inWater ? 74 : 185; // px/sec

      let vx = 0;
      let vy = 0;
      const keys = pressedKeysRef.current;
      if (keys.has('arrowup') || keys.has('w')) vy -= 1;
      if (keys.has('arrowdown') || keys.has('s')) vy += 1;
      if (keys.has('arrowleft') || keys.has('a')) vx -= 1;
      if (keys.has('arrowright') || keys.has('d')) vx += 1;

      if (vx !== 0 || vy !== 0) {
        const len = Math.hypot(vx, vy);
        const stepDist = baseSpeed * dt;
        const nx = cur.x + (vx / len) * stepDist;
        const ny = cur.y + (vy / len) * stepDist;
        if (vx < 0) setPlayerFacingLeft(true);
        else if (vx > 0) setPlayerFacingLeft(false);

        const next = resolveWalkableMove(cur.x, cur.y, nx, ny, bigMap);
        if (next.x !== cur.x || next.y !== cur.y) {
          gameActions.setPlayerPosition(next.x, next.y);
          playFootstep(inWater);
          spawnFootstepParticle(next.x, next.y, inWater);
        }
      } else if (pathRef.current.length > 0) {
        const queue = pathRef.current;
        while (queue.length > 1 && Math.hypot(queue[0].x - cur.x, queue[0].y - cur.y) < 8) {
          queue.shift();
        }
        const wp = queue[0];
        const dx = wp.x - cur.x;
        const dy = wp.y - cur.y;
        const dist = Math.hypot(dx, dy);
        const stepDist = baseSpeed * dt;

        if (dist <= stepDist || dist < 2.5) {
          const next = resolveWalkableMove(cur.x, cur.y, wp.x, wp.y, bigMap);
          gameActions.setPlayerPosition(next.x, next.y);
          queue.shift();
          setPathWaypoints([...queue]);
        } else {
          if (dx < -1.5) setPlayerFacingLeft(true);
          else if (dx > 1.5) setPlayerFacingLeft(false);

          const next = resolveWalkableMove(cur.x, cur.y, cur.x + (dx / dist) * stepDist, cur.y + (dy / dist) * stepDist, bigMap);
          if (Math.hypot(next.x - cur.x, next.y - cur.y) < 0.15) {
            queue.length = 0;
            setPathWaypoints([]);
          } else {
            gameActions.setPlayerPosition(next.x, next.y);
            playFootstep(inWater);
            spawnFootstepParticle(next.x, next.y, inWater);

            const nowMs = performance.now();
            if (nowMs - lastCoopPushRef.current >= 120) {
              lastCoopPushRef.current = nowMs;
              const s = gameActions.getState();
              broadcastPresence({
                name: s.player.name,
                title: s.player.customization?.title || 'Novice Hunter',
                job: s.player.currentJob,
                skin: s.player.equippedSkins?.[s.player.currentJob],
                level: s.player.jobs[s.player.currentJob]?.level || 1,
                realmId: s.currentRealmId,
                x: next.x,
                y: next.y,
                isWalking: true,
                facingLeft: dx < -1.5,
                authMode: getAccountState().mode,
                activeEnemyId: null,
                hp: s.currentHp,
                maxHp: s.maxHp,
              });
            }
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [bigMap]);

  // Tick AI states
  useEffect(() => {
    const interval = setInterval(() => {
      gameActions.updateAIStates(0.06);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  const isVolcanic = bigMap.tilesetId.includes('magma') || bigMap.tilesetId === 'mt-blaze';

  return (
    <div
      ref={containerRef}
      onClick={handleMapClick}
      className="relative flex-1 w-full h-full overflow-hidden bg-slate-950 select-none"
    >
      {/* Scrollable 2880x2880 PMD Tile World Map Container (Pixel-Locked Camera, Zero Lag) */}
      <div
        className="absolute z-10"
        style={{
          width: `${mapSize}px`,
          height: `${mapSize}px`,
          transform: `translate3d(${-camX}px, ${-camY}px, 0)`,
          willChange: 'transform',
        }}
      >
        {/* ============================================================== */}
        {/* LAYER 1: LIVE 47-TILE AUTOTILED PMD CANVAS (120x120 = 2880px)  */}
        {/* ============================================================== */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ backgroundColor: tilesetColors.wall }}
        >
          <PmdTilemapCanvas bigMap={bigMap} onTilesetColors={setTilesetColors} />

          {/* Subtle Atmospheric Tint Matching Active Battleground */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 42%, transparent 45%, ${bigMap.accentColor}15 100%)`,
            }}
          />

          {/* ============================================================== */}
          {/* LAYER 2: MATCHING 16-BIT PIXEL PROPS (Trees, Crystals, Lamps)   */}
          {/* ============================================================== */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 12 }}>
            {bigMap.props.map((p, idx) => {
              const src = PROP_IMAGE_MAP[p.kind];
              const isLit =
                p.kind === 'LANTERN' ||
                p.kind === 'STREET_LAMP' ||
                p.kind === 'BRAZIER';
              const glowColor =
                p.kind === 'STREET_LAMP'
                  ? '#10b981'
                  : '#f59e0b';

              return (
                <div
                  key={`map-prop-${bigMap.id}-${idx}`}
                  className="absolute pointer-events-none"
                  style={{ left: `${p.x}px`, top: `${p.y}px`, width: `${p.w}px`, height: `${p.h}px` }}
                >
                  {/* Soft ground contact shadow */}
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/50"
                    style={{ width: `${Math.round(p.w * 0.72)}px`, height: '8px' }}
                  />
                  {isLit && (
                    <div
                      className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse"
                      style={{
                        width: `${p.w + 14}px`,
                        height: `${p.w + 14}px`,
                        background: `radial-gradient(circle, ${glowColor}55 0%, transparent 70%)`,
                      }}
                    />
                  )}
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-contain relative z-10"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              );
            })}
          </div>

          {/* ============================================================== */}
          {/* LAYER 3: NORTH BOSS SANCTUM ZONE MARKER (Name Hidden Until Near) */}
          {/* ============================================================== */}
          <div className="absolute left-[1248px] top-[280px] w-[408px] h-[280px] flex items-center justify-center select-none pointer-events-none z-15">
            <div className="absolute bottom-2 text-center pointer-events-none">
              <span
                className="text-[10px] font-black tracking-widest text-slate-300/90 uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] bg-slate-950/80 px-3 py-0.5 rounded-full flex items-center gap-1.5"
                style={{
                  border: `1px solid ${bigMap.accentColor}88`,
                  boxShadow: `0 0 12px ${bigMap.accentColor}33`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-ping inline-block" style={{ backgroundColor: bigMap.accentColor }} />
                {bigMap.name} • NORTH SANCTUM
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* LAYER 4: SAFE HAVEN SANCTUARY COURTYARD (South End, 1128x480)  */}
          {/* ============================================================== */}
          <div
            className="absolute left-[888px] top-[2328px] w-[1128px] h-[480px] rounded-lg select-none flex flex-col justify-between p-4 pointer-events-none"
            style={{
              border: '3px solid rgba(52, 211, 153, 0.35)',
              background: 'linear-gradient(180deg, rgba(15,23,42,0.32) 0%, rgba(15,23,42,0.52) 100%)',
              boxShadow: 'inset 0 0 36px rgba(0,0,0,0.6)',
            }}
          >
            {/* Festival Nobori & Bunting Flags Banner */}
            <div className="w-full flex justify-around items-center px-8 pt-0.5">
              {['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#eab308'].map((c, i) => (
                <div
                  key={i}
                  className="w-4 h-5 shadow"
                  style={{
                    backgroundColor: c,
                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  }}
                />
              ))}
            </div>

            <div className="flex justify-center -mt-1">
              <div className="bg-emerald-950/90 border border-emerald-400/80 px-3.5 py-0.5 rounded-full text-emerald-200 font-black text-[10px] shadow flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-spin" />
                <span>KAMIGAWA SANCTUARY</span>
              </div>
            </div>

            <p className="text-[10px] text-emerald-200/90 font-semibold text-center pb-1 drop-shadow">
              Safe Haven - Heal, Refine Blades, Train Jobs & Travel Across 72 Realms
            </p>
          </div>

          {/* Grand Shinto Torii Gate at Haven North Threshold */}
          <div
            className="absolute pointer-events-none"
            style={{ left: '1356px', top: '2136px', width: '192px', height: '180px', zIndex: 15 }}
          >
            <img
              src="/map/prop_torii.png"
              alt="Sanctuary Torii"
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.6))' }}
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* LANDMARK 1: CELESTIAL TORII DUNGEON GATEWAY (North: x: 1452)   */}
        {/* ============================================================== */}
        {isBossDefeatedForRealm ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playSample('map_7.wav', { volume: 0.5 });
              setShowDungeonModal(true);
            }}
            className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
            style={{ left: '1452px', top: '156px' }}
          >
            <div className="mb-1 flex items-center space-x-1.5 bg-gradient-to-r from-red-950 via-purple-950 to-indigo-950 border-2 border-amber-400 text-amber-200 px-3.5 py-0.5 rounded-full text-[10px] font-black shadow-[0_0_20px_rgba(245,158,11,0.85)] group-hover:scale-105 transition-transform animate-pulse z-30">
              <Castle className="w-3.5 h-3.5 text-amber-300" />
              <span>⚔️ CELESTIAL TORII DUNGEON (3 Waves)</span>
              <span className="text-[8px] bg-red-500/30 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-400/50">ENTER</span>
            </div>

            <div className="relative w-[220px] h-[190px] flex items-center justify-center">
              <div className="absolute bottom-8 left-4 flex flex-col items-center pointer-events-none">
                <div className="absolute top-2 w-8 h-8 rounded-full bg-amber-500/30 blur-sm pointer-events-none animate-pulse" />
                <img src="/map/prop_lantern.png" alt="Lantern" className="w-[22px] h-[38px] object-contain" style={{ imageRendering: 'pixelated' }} />
              </div>
              <div className="absolute bottom-8 right-4 flex flex-col items-center pointer-events-none">
                <div className="absolute top-2 w-8 h-8 rounded-full bg-amber-500/30 blur-sm pointer-events-none animate-pulse" />
                <img src="/map/prop_lantern.png" alt="Lantern" className="w-[22px] h-[38px] object-contain" style={{ imageRendering: 'pixelated' }} />
              </div>
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-[8px] w-[96px] h-[112px] rounded-t-[44px] pointer-events-none z-0"
                style={{
                  background: 'radial-gradient(ellipse at bottom center, rgba(147, 51, 234, 0.45) 0%, rgba(15, 23, 42, 0.85) 65%, transparent 100%)',
                  boxShadow: '0 0 25px rgba(168, 85, 247, 0.65)',
                }}
              />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[7px] w-[104px] h-[111px] pointer-events-none z-0 flex items-end justify-center">
                <div
                  className="w-full h-full animate-portal-cycle group-hover:animate-portal-cycle-fast"
                  style={{
                    backgroundImage: `url(/portals/portal_cycle_${isVolcanic ? 'fire' : 'arcane'}.png)`,
                    backgroundSize: '2600% 100%',
                    imageRendering: 'pixelated',
                    filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.7))',
                  }}
                />
              </div>
              <img
                src="/map/prop_torii.png"
                alt="Celestial Torii Gate"
                className="absolute left-1/2 -translate-x-1/2 bottom-[6px] w-[192px] h-[180px] pointer-events-none group-hover:brightness-110 transition-all z-10"
                style={{
                  imageRendering: 'pixelated',
                  filter: 'drop-shadow(0 0 16px rgba(239,68,68,0.75)) drop-shadow(0 6px 12px rgba(0,0,0,0.5))',
                }}
              />
            </div>
          </div>
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playDebuff();
              triggerNotice(`🔒 CELESTIAL DUNGEON SEALED: Slay the North End World Boss to unlock!`);
            }}
            className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20 opacity-85 hover:opacity-100 transition-opacity"
            style={{ left: '1452px', top: '156px' }}
          >
            <div className="mb-1 flex items-center space-x-1.5 bg-slate-950/95 border-2 border-red-900 text-red-300 px-3 py-0.5 rounded-full text-[9px] font-bold shadow-[0_0_15px_rgba(239,68,68,0.5)] z-30">
              <Lock className="w-3 h-3 text-red-400" />
              <span>🔒 CELESTIAL DUNGEON SEALED (Slay Map Boss)</span>
            </div>

            <div className="relative w-[220px] h-[190px] flex items-center justify-center">
              <div className="absolute bottom-8 left-4 flex flex-col items-center pointer-events-none opacity-60">
                <img src="/map/prop_lantern.png" alt="Lantern" className="w-[22px] h-[38px] object-contain grayscale" style={{ imageRendering: 'pixelated' }} />
              </div>
              <div className="absolute bottom-8 right-4 flex flex-col items-center pointer-events-none opacity-60">
                <img src="/map/prop_lantern.png" alt="Lantern" className="w-[22px] h-[38px] object-contain grayscale" style={{ imageRendering: 'pixelated' }} />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[14px] w-[80px] h-[108px] overflow-hidden rounded-t-[36px] bg-slate-950 border border-red-950 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] z-0">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-red-950/90 border-2 border-red-600 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.8)]">
                    <Lock className="w-4 h-4 text-red-400 animate-pulse" />
                  </div>
                  <span className="text-[7.5px] font-black text-red-400 tracking-widest mt-1 bg-black/85 px-1.5 py-0.5 rounded border border-red-900/60">SEALED</span>
                </div>
              </div>
              <img
                src="/map/prop_torii.png"
                alt="Celestial Torii Gate Sealed"
                className="absolute left-1/2 -translate-x-1/2 bottom-[6px] w-[192px] h-[180px] pointer-events-none z-10 opacity-75 grayscale"
                style={{ imageRendering: 'pixelated', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))' }}
              />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SAFE HAVEN STATIONS & LANDMARKS (Spaced Far Apart in 1128x480) */}
        {/* ============================================================== */}
        {/* STATION 1: SANCTUARY MIKO (Center) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            gameActions.healPlayerFull();
            soundManager.playHeal();
            triggerNotice('🌸 SANCTUARY BLESSING: Full HP & MP Restored! You feel revitalized.');
          }}
          className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
          style={{ left: '1452px', top: '2545px' }}
        >
          <div className="mb-1 flex items-center space-x-1.5 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 border-2 border-emerald-400 text-emerald-200 px-3 py-0.5 rounded-full text-[10px] font-black shadow-[0_0_18px_rgba(16,185,129,0.85)] group-hover:scale-105 transition-transform animate-pulse">
            <Heart className="w-3.5 h-3.5 text-pink-300 fill-pink-400" />
            <span>🌸 SANCTUARY MIKO</span>
            <span className="text-[8px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-400/40">Full Heal</span>
          </div>
          <div className="relative flex flex-col items-center justify-center group-hover:scale-110 transition-transform">
            <div style={{ filter: 'drop-shadow(0 0 14px rgba(52, 211, 153, 0.9))' }}>
              <SpriteRenderer job="PRIEST" skin="archmage_miko" scale={1.05} />
            </div>
          </div>
        </div>

        {/* STATION 2: TRAIN BUSHIDO (Far West Wing) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playLevelUp();
            triggerNotice('⚔️ BUSHIDO DOJO: Enter martial training to master your skills!');
            setTimeout(() => gameActions.setActiveTab('JOBS'), 350);
          }}
          className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
          style={{ left: '1030px', top: '2475px' }}
        >
          <div className="mb-1 flex items-center space-x-1.5 bg-gradient-to-r from-red-950 via-amber-950 to-slate-900 border-2 border-amber-400 text-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-[0_0_16px_rgba(245,158,11,0.8)] group-hover:scale-105 transition-transform">
            <Swords className="w-3.5 h-3.5 text-amber-300" />
            <span>⚔️ TRAIN BUSHIDO</span>
            <span className="text-[8px] bg-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-400/40">Dojo</span>
          </div>
          <div className="relative flex flex-col items-center justify-center group-hover:scale-110 transition-transform">
            <div style={{ filter: 'drop-shadow(0 0 14px rgba(245, 158, 11, 0.9))' }}>
              <SpriteRenderer job="WARRIOR" skin="warrior_saito" scale={1.02} />
            </div>
          </div>
        </div>

        {/* STATION 3: MURAMASA FORGE (Far East Wing) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playShield();
            triggerNotice('🔨 MURAMASA FORGE: Refine blades & awaken Milestone Perks!');
            setTimeout(() => gameActions.setActiveTab('EQUIP', 'FORGE'), 350);
          }}
          className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
          style={{ left: '1874px', top: '2475px' }}
        >
          <div className="mb-1 flex items-center space-x-1.5 bg-gradient-to-r from-orange-950 via-amber-950 to-slate-900 border-2 border-orange-400 text-orange-200 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-[0_0_16px_rgba(249,115,22,0.8)] group-hover:scale-105 transition-transform">
            <Hammer className="w-3.5 h-3.5 text-orange-400" />
            <span>🔨 REFINE KATANAS</span>
            <span className="text-[8px] bg-orange-500/30 text-orange-300 px-1.5 py-0.2 rounded-full border border-orange-400/40">Forge</span>
          </div>
          <div className="relative flex flex-col items-center justify-center group-hover:scale-110 transition-transform">
            <div style={{ filter: 'drop-shadow(0 0 14px rgba(249, 115, 22, 0.9))' }}>
              <SpriteRenderer job="WARRIOR" skin="warrior_swordsmith" scale={1.02} />
            </div>
          </div>
        </div>

        {/* STATION 4: MASTER CLASSES (North Haven Plaza) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playUltimate();
            triggerNotice('👑 GRANDMASTER SENSEI: Unlock 12 Advanced Feudal Class Specializations!');
            setTimeout(() => gameActions.setActiveTab('JOBS'), 350);
          }}
          className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
          style={{ left: '1452px', top: '2395px' }}
        >
          <div className="mb-1 flex items-center space-x-1.5 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-2 border-purple-400 text-purple-200 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-[0_0_16px_rgba(168,85,247,0.8)] group-hover:scale-105 transition-transform">
            <Award className="w-3.5 h-3.5 text-purple-300" />
            <span>👑 MASTER CLASSES</span>
            <span className="text-[8px] bg-purple-500/30 text-purple-300 px-1.5 py-0.2 rounded-full border border-purple-400/40">Evolution</span>
          </div>
          <div className="relative flex flex-col items-center justify-center group-hover:scale-110 transition-transform">
            <div style={{ filter: 'drop-shadow(0 0 14px rgba(168, 85, 247, 0.9))' }}>
              <SpriteRenderer job="MONK" skin="monk_combosaint" scale={1.02} />
            </div>
          </div>
        </div>

        {/* LANDMARK 2: BOUNTIES (South-West Haven Wing) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playQuestOpen();
            setShowQuestModal(true);
          }}
          className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
          style={{ left: '1030px', top: '2725px' }}
        >
          <div className="mb-1 flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-yellow-400 border border-amber-200 text-slate-950 px-2.5 py-0.5 rounded-full text-[9px] font-black shadow-[0_0_15px_rgba(245,158,11,0.9)] animate-bounce">
            <Scroll className="w-3 h-3 text-slate-950" />
            <span>BOUNTIES (!)</span>
          </div>
          <div className="relative flex flex-col items-center justify-center group-hover:scale-110 transition-transform">
            <div style={{ filter: 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.85))' }}>
              <SpriteRenderer job="PRIEST" skin="priest_missionary" scale={0.92} />
            </div>
          </div>
        </div>

        {/* LANDMARK 4: ASTRAL SUMMONING ALTAR (South-Center Haven) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playSample('summon_stone_flash.wav', { volume: 0.5 });
            setShowGachaModal(true);
          }}
          className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
          style={{ left: '1452px', top: '2745px' }}
        >
          <div className="mb-1 flex items-center space-x-1 bg-gradient-to-r from-red-600 via-amber-500 to-purple-600 border border-amber-300 text-white px-3 py-0.5 rounded-full text-[9px] font-black shadow-[0_0_16px_rgba(245,158,11,0.9)] animate-bounce group-hover:scale-105 transition-transform">
            <Sparkles className="w-3 h-3 text-amber-200" />
            <span>ASTRAL SUMMON ALTAR</span>
          </div>
          <AstralSummonsAltar size={96} interactive={true} showRiftAura={true} showParticles={true} />
        </div>

        {/* LANDMARK 5: REALM DIMENSIONAL PORTAL (South-East Haven Wing) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playSample('map_2.wav', { volume: 0.5 });
            setShowRealmModal(true);
          }}
          className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
          style={{ left: '1874px', top: '2725px' }}
        >
          <div className="mb-1 flex items-center space-x-1 bg-gradient-to-r from-purple-900 via-indigo-900 to-amber-900 border-2 border-purple-400 text-amber-200 px-3 py-0.5 rounded-full text-[10px] font-black shadow-[0_0_18px_rgba(168,85,247,0.9)] group-hover:scale-105 transition-transform animate-pulse">
            <Compass className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '10s' }} />
            <span>REALM PORTAL (Travel)</span>
          </div>
          <RealmPortal size="sm" interactive={true} showRiftAura={true} showParticles={true} showRealmOrbs={true} />
          <span className="text-[8px] font-black tracking-wider text-amber-300 uppercase bg-slate-950/90 border border-purple-400/80 px-2 py-0.2 rounded-full mt-1 shadow-lg z-10 group-hover:border-amber-400 transition-colors">
            6 Realms • 72 Maps
          </span>
        </div>

        {/* ============================================================== */}
        {/* OVERWORLD ROAMING MONSTERS                                     */}
        {/* ============================================================== */}
        {store.enemies.map(enemy => {
          if (enemy.currentHp <= 0) {
            return (
              <div
                key={enemy.id}
                className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[18]"
                style={{ left: `${enemy.x}px`, top: `${enemy.y}px` }}
              >
                <div className="px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-[10px] text-slate-400 font-mono shadow">
                  Respawning in {Math.ceil(enemy.respawnTimer || 0)}s
                </div>
              </div>
            );
          }

          const hasBattle = enemy.battleInstanceId && store.battles[enemy.battleInstanceId];

          return (
            <div
              key={enemy.id}
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                if (hasBattle) {
                  gameActions.playerJoinBattle(enemy.battleInstanceId!);
                } else {
                  gameActions.startPlayerBattle(enemy.id);
                }
              }}
              className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-[18]"
              style={{ left: `${enemy.x}px`, top: `${enemy.y}px` }}
            >
              {hasBattle ? (
                <div className="mb-1 h-5 flex items-center space-x-1 bg-red-600 border-2 border-amber-300 text-white px-2.5 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.9)] z-20">
                  <Swords className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                  <span className="text-[10px] font-black tracking-wider">
                    JOIN ({store.battles[enemy.battleInstanceId!].participants.length}/5)
                  </span>
                </div>
              ) : enemy.isBoss ? (
                revealedBossId === enemy.id ? (
                  <div className="mb-1 h-6 flex items-center space-x-1.5 bg-slate-950/95 border-2 border-amber-400 px-3 rounded-full text-[11px] shadow-[0_0_20px_rgba(245,158,11,0.9)] z-20 animate-fadeIn">
                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${getElementBgClass(enemy.element)}`}>
                      {enemy.element}
                    </span>
                    <span className="font-black text-amber-200 tracking-wide uppercase">{enemy.name}</span>
                  </div>
                ) : (
                  <div className="mb-1 h-6 pointer-events-none" />
                )
              ) : (
                <div
                  className={`mb-1 h-5 flex items-center space-x-1 px-2 rounded-full text-[10px] shadow z-10 ${
                    enemy.isCornerGuardian
                      ? 'bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.75)]'
                      : enemy.name.startsWith('Elite ')
                      ? 'bg-purple-950/95 border border-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.35)]'
                      : 'bg-slate-900/90 border border-slate-700/80'
                  }`}
                >
                  <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${getElementBgClass(enemy.element)}`}>
                    {enemy.element}
                  </span>
                  <span
                    className={`font-bold ${
                      enemy.isCornerGuardian
                        ? 'text-amber-300 font-black'
                        : enemy.name.startsWith('Elite ')
                        ? 'text-amber-200'
                        : 'text-slate-100'
                    }`}
                  >
                    {enemy.isCornerGuardian ? `👑 ${enemy.name}` : enemy.name}
                  </span>
                </div>
              )}

              <SpriteRenderer
                spriteType={enemy.spriteType}
                element={enemy.element}
                scale={enemy.isBoss ? 1.2 : enemy.isCornerGuardian ? 1.12 : enemy.name.startsWith('Elite ') ? 1.02 : 0.95}
                className="group-hover:brightness-115 transition-all"
              />

              {!enemy.isBoss && (
                <div className="w-16 h-1.5 bg-slate-950 rounded-full border border-slate-700 overflow-hidden mt-1 shadow">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-300"
                    style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* ============================================================== */}
        {/* REMOTE CO-OP HUNTERS (P2P / MULTI-TAB REALTIME)                */}
        {/* ============================================================== */}
        {Object.values(coopState.peers)
          .filter(peer => peer.realmId === store.currentRealmId)
          .map(peer => (
            <div
              key={`coop-${peer.peerId}`}
              className="absolute flex flex-col items-center z-20"
              style={{
                left: `${peer.x}px`,
                top: `${peer.y}px`,
                transform: 'translate(-50%, calc(-100% + 10px))',
                transition: 'left 110ms linear, top 110ms linear',
                pointerEvents: peer.activeEnemyId ? 'auto' : 'none',
              }}
            >
              {peer.activeEnemyId && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    soundManager.playClick();
                    gameActions.startPlayerBattle(peer.activeEnemyId!);
                  }}
                  className="mb-1 bg-rose-600/95 hover:bg-rose-500 border border-amber-300 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-lg flex items-center gap-1 animate-pulse cursor-pointer"
                >
                  <Swords className="w-2.5 h-2.5" />
                  <span>Join Co-op Fight</span>
                </button>
              )}
              <div className="mb-1 flex items-center space-x-1 bg-sky-950/95 border border-sky-400/70 px-2 py-0.5 rounded-full text-[9px] shadow">
                <ClassIcon job={peer.job} size="xs" showTooltip={false} />
                <span className="text-[7px] font-black text-emerald-300 uppercase">CO-OP</span>
                <span className="text-sky-200 font-bold">{peer.name}</span>
                <span className="text-slate-400 text-[8px]">Lv.{peer.level}</span>
              </div>
              <SpriteRenderer
                job={peer.job}
                skin={peer.skin}
                scale={0.85}
                name={peer.name}
                isWalking={peer.isWalking}
                mirrored={peer.facingLeft}
              />
            </div>
          ))}

        {/* ============================================================== */}
        {/* AUTONOMOUS AI ALLIES ROAMING                                   */}
        {/* ============================================================== */}
        {store.aiHunters.map(ai => {
          if (ai.state === 'IN_BATTLE') return null;
          const distToTarget = Math.hypot(ai.targetX - ai.x, ai.targetY - ai.y);
          const isWalking = Boolean(ai.isWalking ?? distToTarget > 15);
          const mirrored = Boolean(ai.facingLeft ?? ai.targetX < ai.x);

          return (
            <div
              key={ai.id}
              className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${ai.x}px`,
                top: `${ai.y}px`,
                transition: 'left 60ms linear, top 60ms linear',
              }}
            >
              <div className="mb-1 flex items-center space-x-1 bg-slate-900/90 border border-cyan-500/50 px-2 py-0.5 rounded-full text-[9px] shadow">
                <ClassIcon job={ai.job} size="xs" showTooltip={false} />
                <span className="text-cyan-300 font-bold">{ai.name}</span>
                <span className="text-slate-400 text-[8px]">Lv.{ai.level}</span>
              </div>
              <SpriteRenderer
                job={ai.job}
                scale={0.85}
                name={ai.name}
                isWalking={isWalking}
                mirrored={mirrored}
              />
            </div>
          );
        })}

        {/* FOOTSTEP DUST / WATER RIPPLE / LAVA SPARK PARTICLES */}
        {footstepFx.map(fx => (
          <div
            key={fx.id}
            className="absolute pointer-events-none z-15 animate-footstep-dust rounded-full"
            style={{
              left: `${fx.x}px`,
              top: `${fx.y}px`,
              width: fx.kind === 'WATER' ? '18px' : '10px',
              height: fx.kind === 'WATER' ? '8px' : '10px',
              border: fx.kind === 'WATER' ? '1.5px solid rgba(103, 232, 249, 0.85)' : undefined,
              backgroundColor:
                fx.kind === 'LAVA'
                  ? 'rgba(251, 146, 60, 0.7)'
                  : fx.kind === 'WATER'
                  ? 'rgba(56, 189, 248, 0.25)'
                  : 'rgba(226, 232, 240, 0.45)',
            }}
          />
        ))}

        {/* ============================================================== */}
        {/* PLAYER CHARACTER (Anchored at feet / ground contact point)     */}
        {/* ============================================================== */}
        <div
          className="absolute flex flex-col items-center z-20 pointer-events-none"
          style={{ left: `${player.x}px`, top: `${player.y}px`, transform: 'translate(-50%, calc(-100% + 10px))' }}
        >
          {isPlayerInWater && (
            <div className="mb-0.5 bg-blue-950/95 border border-cyan-400 text-cyan-200 px-2 py-0.2 rounded-full text-[8px] font-black tracking-wider flex items-center space-x-1 shadow-[0_0_12px_rgba(6,182,212,0.9)] animate-pulse">
              <span>{isVolcanic ? '🔥 LAVA WADE' : '🌊 WADING'}</span>
              <span className="text-amber-300">-60% SPD</span>
            </div>
          )}
          {isPlayerOnBridge && (
            <div className="mb-0.5 bg-red-950/95 border border-amber-400 text-amber-200 px-2 py-0.2 rounded-full text-[8px] font-black tracking-wider flex items-center space-x-1 shadow-[0_0_12px_rgba(245,158,11,0.9)]">
              <span>⛩️ CAUSEWAY BRIDGE</span>
              <span className="text-emerald-300">FAST WAY</span>
            </div>
          )}

          {player.customization?.title && (
            <span className="text-[8px] font-black text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mb-0.5 tracking-wider bg-slate-950/70 border border-amber-500/40 px-2 py-0.2 rounded-full">
              [ {player.customization.title} ]
            </span>
          )}
          <div className="mb-1 flex items-center space-x-1.5 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-400 px-2.5 py-0.5 rounded-full text-[10px] shadow-[0_0_12px_rgba(245,158,11,0.7)]">
            <ClassIcon job={player.currentJob} size="xs" showTooltip={false} />
            <span className="font-black text-amber-300">{player.name}</span>
            <span className="text-[8px] font-black text-slate-950 bg-amber-400 px-1.5 rounded-full">YOU</span>
          </div>

          {isPlayerInWater && (
            <div className="absolute bottom-1 flex items-center justify-center pointer-events-none">
              <span className="w-10 h-3 rounded-full bg-cyan-400/40 border border-cyan-300/80 animate-ping absolute" />
              <span className="w-8 h-2.5 rounded-full bg-cyan-500/50" />
            </div>
          )}

          <SpriteRenderer
            job={player.currentJob}
            skin={player.equippedSkins?.[player.currentJob]}
            scale={1.05}
            isPlayer={true}
            name={player.name}
            isWalking={isKeyboardMoving || Boolean(targetPos)}
            mirrored={playerFacingLeft}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* AUTHENTIC PMD WEATHER & BIOME PARTICLE CANVAS OVERLAY          */}
      {/* ============================================================== */}
      <PmdWeatherOverlay
        weatherEffect={bigMap.weatherEffect}
        width={viewportSize.w}
        height={viewportSize.h}
        camX={camX}
        camY={camY}
        variant="overworld"
      />

      {/* Compact Non-Blocking Boss Encounter Banner (bottom pill, never blocks Boss/UI/Minimap) */}
      {bossEncounterBanner && (
        <div
          className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 max-w-[90%] bg-slate-950/90 border px-3 py-1 rounded-full shadow-[0_0_14px_rgba(0,0,0,0.75)] flex items-center space-x-2 pointer-events-none animate-fadeIn whitespace-nowrap"
          style={{ borderColor: bossEncounterBanner.accentColor }}
        >
          <span
            className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full shrink-0 ${getElementBgClass(
              bossEncounterBanner.element as any
            )}`}
          >
            {bossEncounterBanner.element}
          </span>
          <span className="text-[9px] font-bold tracking-wider text-red-400 uppercase shrink-0">
            Boss:
          </span>
          <span className="text-[11px] font-black tracking-wide text-amber-200 truncate">
            {bossEncounterBanner.name}
          </span>
        </div>
      )}

      {/* Floating Sanctuary Notification Banner */}
      {sanctuaryNotice && (
        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 z-30 max-w-[92%] bg-slate-950/95 border-2 border-emerald-400 text-emerald-200 px-4 py-2 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.85)] text-xs font-black animate-bounce flex items-center space-x-2 pointer-events-none">
          <Sparkles className="w-4 h-4 text-emerald-300 animate-spin flex-shrink-0" />
          <span>{sanctuaryNotice}</span>
        </div>
      )}

      {/* Quick Action Pills */}
      <div className="absolute top-3 left-3 flex flex-col items-start space-y-1.5 z-20 max-w-[calc(100%-152px)]">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playClick();
              setShowQuestModal(true);
            }}
            className="bg-slate-900/90 border border-amber-500/70 text-amber-300 text-[10px] font-bold px-3 py-1 rounded-full shadow-[0_2px_8px_rgba(245,158,11,0.3)] flex items-center space-x-1.5 hover:brightness-110 active:scale-95 transition-all"
          >
            <Scroll className="w-3.5 h-3.5 text-amber-400" />
            <span>Quests</span>
          </button>

          {isBossDefeatedForRealm && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                setShowDungeonModal(true);
              }}
              className="bg-slate-900/90 border border-purple-500/70 text-purple-300 text-[10px] font-bold px-3 py-1 rounded-full shadow-[0_2px_8px_rgba(168,85,247,0.3)] flex items-center space-x-1.5 hover:brightness-110 active:scale-95 transition-all animate-fadeIn"
            >
              <Castle className="w-3.5 h-3.5 text-purple-400" />
              <span>Dungeons</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playClick();
              setShowSanctuaryQuickMenu(prev => !prev);
            }}
            className="bg-slate-900/90 border border-emerald-500/70 text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full shadow-[0_2px_8px_rgba(16,185,129,0.3)] flex items-center space-x-1.5 hover:brightness-110 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sanctuary</span>
          </button>
        </div>

        {showSanctuaryQuickMenu && (
          <div className="bg-slate-950/95 border border-emerald-500/60 rounded-xl p-2 shadow-2xl backdrop-blur-md flex flex-col space-y-1 animate-fadeIn select-none">
            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider px-1">Quick Travel & Hub</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playHeal();
                setShowSanctuaryQuickMenu(false);
                gameActions.setPlayerPosition(1452, 2628);
                triggerNotice('🌸 Returned to Kamigawa Haven Sanctuary!');
              }}
              className="flex items-center space-x-1.5 px-2 py-1 rounded-lg text-[9px] font-bold text-slate-200 hover:bg-emerald-950/60 hover:text-emerald-300 transition-all text-left"
            >
              <Heart className="w-3 h-3 text-pink-400" />
              <span>Recall to Haven</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                gameActions.setActiveTab('EQUIP', 'FORGE');
                setShowSanctuaryQuickMenu(false);
              }}
              className="flex items-center space-x-1.5 px-2 py-1 rounded-lg text-[9px] font-bold text-slate-200 hover:bg-orange-950/60 hover:text-orange-300 transition-all text-left"
            >
              <Hammer className="w-3 h-3 text-orange-400" />
              <span>Muramasa Forge (Refine)</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                gameActions.setActiveTab('JOBS');
                setShowSanctuaryQuickMenu(false);
              }}
              className="flex items-center space-x-1.5 px-2 py-1 rounded-lg text-[9px] font-bold text-slate-200 hover:bg-amber-950/60 hover:text-amber-300 transition-all text-left"
            >
              <Award className="w-3 h-3 text-amber-400" />
              <span>Bushido Dojo (Master Jobs)</span>
            </button>
          </div>
        )}
      </div>

      {/* Live Pixel Tilemap Radar Minimap */}
      <div className="absolute top-3 right-3 w-32 bg-slate-950/95 backdrop-blur-md border-2 border-amber-500/60 rounded-2xl p-1.5 shadow-2xl z-20 flex flex-col items-center select-none pointer-events-none">
        <div className="w-full flex items-center justify-between text-[8px] text-amber-300 px-0.5 mb-0.5 font-bold">
          <div className="flex items-center space-x-1">
            <Compass className="w-2.5 h-2.5 text-amber-400" />
            <span className="font-mono text-[7px] text-amber-200">
              {Math.round(player.x)},{Math.round(player.y)}
            </span>
          </div>
        </div>

        <div className="relative w-full h-24 bg-slate-950 rounded-xl border border-emerald-900/80 overflow-hidden shadow-inner">
          <canvas
            ref={radarCanvasRef}
            width={MAP_GRID_COLS}
            height={MAP_GRID_ROWS}
            className="w-full h-full object-fill"
            style={{ imageRendering: 'pixelated' }}
          />

          {store.enemies.map(e => (
            <div
              key={`radar-${e.id}`}
              className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                e.isBoss
                  ? 'w-3 h-3 bg-purple-500 border border-amber-300 animate-ping'
                  : e.isCornerGuardian
                  ? 'w-2.5 h-2.5 bg-amber-400 border border-yellow-100 shadow-[0_0_6px_#fbbf24]'
                  : 'w-1.5 h-1.5 bg-rose-500'
              }`}
              style={{ left: `${(e.x / mapSize) * 100}%`, top: `${(e.y / mapSize) * 100}%` }}
            />
          ))}

          {store.aiHunters.map(ai => (
            <div
              key={`radar-ai-${ai.id}`}
              className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(ai.x / mapSize) * 100}%`, top: `${(ai.y / mapSize) * 100}%` }}
            />
          ))}

          {Object.values(coopState.peers)
            .filter(peer => peer.realmId === store.currentRealmId)
            .map(peer => (
              <div
                key={`radar-coop-${peer.peerId}`}
                className="absolute w-2 h-2 rounded-full bg-sky-300 border border-white transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_6px_#38bdf8]"
                style={{ left: `${(peer.x / mapSize) * 100}%`, top: `${(peer.y / mapSize) * 100}%` }}
              />
            ))}

          <div
            className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 border border-white transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_#facc15] animate-pulse"
            style={{ left: `${(player.x / mapSize) * 100}%`, top: `${(player.y / mapSize) * 100}%` }}
          />
        </div>
      </div>

      {/* Floating Realm & 72-Map World Atlas Travel Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          soundManager.playClick();
          setShowRealmModal(true);
        }}
        className="absolute top-[138px] right-3 z-20 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-amber-400/80 text-amber-300 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:bg-slate-800 active:scale-95 transition-all backdrop-blur-sm"
        title="Open 6 Realms & 72 Battleground Maps"
      >
        <MapIcon className="w-3.5 h-3.5 text-amber-400" />
        <span className="max-w-[140px] truncate">{currentRealm.name}</span>
      </button>

      {/* Floating Zero-Cost Co-op Party Room Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          soundManager.playClick();
          setShowCoopModal(true);
        }}
        className="absolute top-[174px] right-3 z-20 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-cyan-400/75 text-cyan-200 font-bold text-[11px] shadow-[0_0_12px_rgba(34,211,238,0.3)] hover:bg-slate-800 active:scale-95 transition-all backdrop-blur-sm"
        title="Open Co-op Multiplayer Room"
      >
        <Users className="w-3 h-3 text-cyan-300" />
        <span>Co-op ({Object.keys(coopState.peers).length + 1})</span>
      </button>

      {/* Novice Hunter's Guide Objective Tracker */}
      <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none">
        <NoviceGuideTracker onOpenCodex={() => setShowCodexModal(true)} />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-vignette opacity-45 pointer-events-none mix-blend-multiply z-20" />

      {/* Modals */}
      <Suspense fallback={null}>
        {showQuestModal && <QuestModal onClose={() => setShowQuestModal(false)} />}
        {showDungeonModal && <DungeonModal onClose={() => setShowDungeonModal(false)} />}
        {showRealmModal && <RealmTravelModal onClose={() => setShowRealmModal(false)} />}
        {showCodexModal && <HuntersCodexModal onClose={() => setShowCodexModal(false)} />}
        {showCoopModal && (
          <CoopModal
            onClose={() => setShowCoopModal(false)}
            onOpenAccount={() => setShowAccountModal(true)}
          />
        )}
        {showAccountModal && (
          <AccountChoiceModal forceOpen={true} onClose={() => setShowAccountModal(false)} />
        )}
        {showGachaModal && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col p-2 animate-fadeIn">
            <div className="flex justify-end p-1">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowGachaModal(false);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <GachaModal />
          </div>
        )}
      </Suspense>
    </div>
  );
};
