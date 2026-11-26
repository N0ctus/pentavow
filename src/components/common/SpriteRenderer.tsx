import React, { useState, useEffect } from 'react';
import { JobType, ElementType, Hairstyle, EyeStyle, MonsterSpriteType } from '../../types/game';

// -------------------------------------------------------------
// AUTHENTIC ANIME BOSS SPRITE DATA & ANIMATION CONTROLLER
// Source: FE caracters/Bosses (Senran no Samurai Kingdom)
// -------------------------------------------------------------
interface BossConfig {
  name: string;
  prefix: string;
  idleCount: number;
  attackCount: number;
  width: number;
  height: number;
  renderScale: number;
  auraColor: string;
  enragedAura: string;
  elementGlow: string;
  folderPath?: string;
}

const BOSS_CONFIGS: Record<string, BossConfig> = {
  boss_seiryu: {
    name: 'Guardian Deity Seiryu',
    prefix: 'seiryu',
    idleCount: 5,
    attackCount: 5,
    width: 195,
    height: 150,
    renderScale: 1.05,
    auraColor: '#38bdf8',
    enragedAura: '#ef4444',
    elementGlow: 'rgba(56, 189, 248, 0.65)'
  },
  boss_akazonae: {
    name: 'Scarlet Warlord Akazonae',
    prefix: 'akazonae',
    idleCount: 4,
    attackCount: 5,
    width: 116,
    height: 115,
    renderScale: 1.35,
    auraColor: '#f97316',
    enragedAura: '#ef4444',
    elementGlow: 'rgba(239, 68, 68, 0.7)'
  },
  boss_dark_horseman: {
    name: 'Dread Horseman',
    prefix: 'dark_horseman',
    idleCount: 4,
    attackCount: 5,
    width: 116,
    height: 115,
    renderScale: 1.35,
    auraColor: '#a855f7',
    enragedAura: '#dc2626',
    elementGlow: 'rgba(168, 85, 247, 0.7)'
  },
  boss_onmyoji: {
    name: 'Master Onmyoji',
    prefix: 'onmyoji',
    idleCount: 4,
    attackCount: 5,
    width: 116,
    height: 115,
    renderScale: 1.35,
    auraColor: '#6366f1',
    enragedAura: '#ec4899',
    elementGlow: 'rgba(99, 102, 241, 0.7)'
  },
  boss_stag: {
    name: 'Guardian Deity Seiryu',
    prefix: 'seiryu',
    idleCount: 5,
    attackCount: 5,
    width: 195,
    height: 150,
    renderScale: 1.05,
    auraColor: '#38bdf8',
    enragedAura: '#ef4444',
    elementGlow: 'rgba(56, 189, 248, 0.65)'
  },
  boss_hideyoshi: {
    name: 'Supreme Warlord Hideyoshi',
    prefix: 'hideyoshi',
    folderPath: '/enemies/hideyoshi',
    idleCount: 4,
    attackCount: 5,
    width: 128,
    height: 115,
    renderScale: 1.45,
    auraColor: '#facc15',
    enragedAura: '#f59e0b',
    elementGlow: 'rgba(250, 204, 21, 0.75)'
  },
  boss_dairokuten: {
    name: 'Sixth Demon King Dairokuten',
    prefix: 'dairokuten',
    folderPath: '/enemies/dairokuten',
    idleCount: 4,
    attackCount: 5,
    width: 116,
    height: 115,
    renderScale: 1.55,
    auraColor: '#a855f7',
    enragedAura: '#dc2626',
    elementGlow: 'rgba(168, 85, 247, 0.8)'
  },
  boss_nobunaga: {
    name: 'Demon King Nobunaga Oda',
    prefix: 'boss_nobunaga',
    folderPath: '/enemies/boss_nobunaga',
    idleCount: 4,
    attackCount: 5,
    width: 116,
    height: 124,
    renderScale: 1.45,
    auraColor: '#ef4444',
    enragedAura: '#f97316',
    elementGlow: 'rgba(239, 68, 68, 0.8)'
  },
  boss_tenzen: {
    name: 'Undying Warlord Tenzen',
    prefix: 'boss_tenzen',
    folderPath: '/enemies/boss_tenzen',
    idleCount: 4,
    attackCount: 5,
    width: 116,
    height: 116,
    renderScale: 1.42,
    auraColor: '#9333ea',
    enragedAura: '#dc2626',
    elementGlow: 'rgba(147, 51, 234, 0.8)'
  },
  boss_kenshin: {
    name: 'God of War Kenshin Uesugi',
    prefix: 'boss_kenshin',
    folderPath: '/enemies/boss_kenshin',
    idleCount: 4,
    attackCount: 5,
    width: 116,
    height: 115,
    renderScale: 1.45,
    auraColor: '#38bdf8',
    enragedAura: '#818cf8',
    elementGlow: 'rgba(56, 189, 248, 0.8)'
  },
  boss_taishogun: {
    name: 'Celestial Shogun Ashikaga',
    prefix: 'boss_taishogun',
    folderPath: '/enemies/boss_taishogun',
    idleCount: 4,
    attackCount: 5,
    width: 116,
    height: 116,
    renderScale: 1.45,
    auraColor: '#fbbf24',
    enragedAura: '#f59e0b',
    elementGlow: 'rgba(251, 191, 36, 0.85)'
  },
  boss_dairokuten_maou: {
    name: 'Eclipse Sovereign Dairokuten',
    prefix: 'boss_dairokuten_maou',
    folderPath: '/enemies/boss_dairokuten_maou',
    idleCount: 4,
    attackCount: 5,
    width: 118,
    height: 115,
    renderScale: 1.55,
    auraColor: '#6366f1',
    enragedAura: '#ec4899',
    elementGlow: 'rgba(99, 102, 241, 0.85)'
  },
  boss_ieyasu: {
    name: 'Sun-Fist Regent Ieyasu',
    prefix: 'boss_ieyasu',
    folderPath: '/enemies/boss_ieyasu',
    idleCount: 4,
    attackCount: 5,
    width: 116,
    height: 120,
    renderScale: 1.45,
    auraColor: '#eab308',
    enragedAura: '#f97316',
    elementGlow: 'rgba(234, 179, 8, 0.8)'
  },
  boss_estoque: {
    name: 'Verdant Colossus Estoque',
    prefix: 'boss_estoque',
    folderPath: '/enemies/boss_estoque',
    idleCount: 4,
    attackCount: 5,
    width: 120,
    height: 96,
    renderScale: 1.55,
    auraColor: '#22c55e',
    enragedAura: '#84cc16',
    elementGlow: 'rgba(34, 197, 94, 0.85)'
  },
  boss_redulse_a: {
    name: 'Silver-Fang Warlord Red Ulse',
    prefix: 'boss_redulse_a',
    folderPath: '/enemies/boss_redulse_a',
    idleCount: 4,
    attackCount: 8,
    width: 96,
    height: 99,
    renderScale: 1.6,
    auraColor: '#f8fafc',
    enragedAura: '#ef4444',
    elementGlow: 'rgba(248, 113, 113, 0.85)'
  },
  boss_redulse_b: {
    name: 'Blood-Moon Destroyer Red Ulse',
    prefix: 'boss_redulse_b',
    folderPath: '/enemies/boss_redulse_b',
    idleCount: 4,
    attackCount: 8,
    width: 96,
    height: 99,
    renderScale: 1.6,
    auraColor: '#ef4444',
    enragedAura: '#991b1b',
    elementGlow: 'rgba(239, 68, 68, 0.88)'
  }
};

const AnimatedBossSprite: React.FC<{
  bossType: string;
  scale?: number;
  isDead?: boolean;
  isAttacking?: boolean;
  isEnraged?: boolean;
  className?: string;
}> = ({ bossType, scale = 1, isDead = false, isAttacking = false, isEnraged = false, className = '' }) => {
  const config = BOSS_CONFIGS[bossType] || BOSS_CONFIGS.boss_seiryu;
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (isDead) return;
    const maxFrames = isAttacking ? config.attackCount : config.idleCount;
    const intervalMs = isAttacking ? 150 : isEnraged ? 130 : 190;

    const timer = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % maxFrames);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isAttacking, isEnraged, isDead, config]);

  const action = isAttacking ? 'attack' : 'idle';
  const currentFrame = frameIndex % (isAttacking ? config.attackCount : config.idleCount);
  const imageSrc = config.folderPath
    ? `${config.folderPath}/${action}_${currentFrame}.png`
    : `/bosses/${config.prefix}_${action}_${currentFrame}.png`;

  const glowColor = isEnraged ? config.enragedAura : config.auraColor;
  const renderWidth = Math.round(config.width * config.renderScale * scale);
  const renderHeight = Math.round(config.height * config.renderScale * scale);

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className} ${
        isDead ? 'opacity-30 grayscale filter' : ''
      }`}
    >
      {/* SpriteCast 3D Ground Contact Shadow (Grounded, stable) */}
      <div
        className={`absolute -bottom-1.5 pointer-events-none flex items-center justify-center ${
          isDead ? 'opacity-0' : 'opacity-85 scale-100'
        }`}
        style={{
          width: `${Math.round(renderWidth * 0.7)}px`,
          height: `${Math.round(renderHeight * 0.22)}px`
        }}
      >
        {/* Outer diffused projected shadow */}
        <div
          className="absolute inset-0 rounded-[50%] bg-slate-950/60"
          style={{ filter: isAttacking ? 'blur(6px)' : 'blur(3px)' }}
        />
        {/* Inner intense contact occlusion shadow directly under feet */}
        <div
          className="w-[60%] h-[55%] rounded-[50%] bg-black/85"
          style={{ filter: 'blur(1px)' }}
        />
      </div>

      {/* Enraged Soul Embers on Phase 2 (HP < 50%) */}
      {isEnraged && (
        <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
          <div className="w-full h-full relative">
            <span className="absolute top-1 left-2 w-2.5 h-2.5 rounded-full bg-red-400 animate-ping opacity-80" />
            <span className="absolute top-4 right-3 w-3 h-3 rounded-full bg-amber-400 animate-ping opacity-75" />
            <span className="absolute bottom-4 left-6 w-2.5 h-2.5 rounded-full bg-orange-500 animate-bounce opacity-85" />
          </div>
        </div>
      )}

      {/* Authentic Pixel Sprite Frame (Grounded on contact shadow, no vertical jump) */}
      <img
        src={imageSrc}
        alt={config.name}
        width={renderWidth}
        height={renderHeight}
        className={`object-contain object-bottom ${
          isAttacking ? 'filter brightness-115' : ''
        }`}
        style={{
          imageRendering: 'pixelated',
          filter: isEnraged
            ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.7))'
            : 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.65))'
        }}
        onError={(e) => {
          const fallback = `/bosses/seiryu_idle_0.png`;
          if (e.currentTarget.src !== fallback) {
            e.currentTarget.src = fallback;
          }
        }}
      />
    </div>
  );
};

// -------------------------------------------------------------
// AUTHENTIC ANIME SIMPLE ENEMY SPRITE CONFIGS & COMPONENT
// Source: FE Ennemies (Senran no Samurai Kingdom)
// -------------------------------------------------------------
interface EnemyConfig {
  name: string;
  folder: string;
  idleCount: number;
  attackCount: number;
  runCount: number;
  width: number;
  height: number;
  renderScale: number;
  auraColor: string;
}

const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  enemy_sasquatch: {
    name: 'Frost Yeti Sasquatch',
    folder: 'sasquatch',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 1.0,
    auraColor: '#38bdf8'
  },
  enemy_felicia: {
    name: 'Shadowclaw Felicia',
    folder: 'felicia',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 0.95,
    auraColor: '#a855f7'
  },
  enemy_keroro: {
    name: 'Frog Shinobi Keroro',
    folder: 'keroro',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 0.85,
    auraColor: '#10b981'
  },
  enemy_giroro: {
    name: 'Crimson Gunner Giroro',
    folder: 'giroro',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 0.85,
    auraColor: '#ef4444'
  },
  enemy_dororo: {
    name: 'Azure Shinobi Dororo',
    folder: 'dororo',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 0.85,
    auraColor: '#06b6d4'
  },
  enemy_tamama: {
    name: 'Chi Striker Tamama',
    folder: 'tamama',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 0.85,
    auraColor: '#eab308'
  },
  enemy_kululu: {
    name: 'Karakuri Tech Kululu',
    folder: 'kululu',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 0.85,
    auraColor: '#f59e0b'
  },
  enemy_keiji: {
    name: 'Wild Spearman Keiji',
    folder: 'keiji',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 0.95,
    auraColor: '#f97316'
  },
  enemy_hideyoshi: {
    name: 'Golden Warlord Hideyoshi',
    folder: 'hideyoshi',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 128,
    height: 115,
    renderScale: 0.95,
    auraColor: '#facc15'
  },
  enemy_dairokuten: {
    name: 'Demon Warlord Dairokuten',
    folder: 'dairokuten',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 1.05,
    auraColor: '#dc2626'
  },
  enemy_accelerator: {
    name: 'Vector Mage Accelerator',
    folder: 'accelerator',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 0.95,
    auraColor: '#6366f1'
  },
  enemy_mika: {
    name: 'Shrine Maiden Mika',
    folder: 'mika',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 0.95,
    auraColor: '#ec4899'
  },
  enemy_hotarubi: {
    name: 'Illusionist Hotarubi',
    folder: 'hotarubi',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 0.95,
    auraColor: '#34d399'
  },
  enemy_akeginu: {
    name: 'Blood-Mist Akeginu',
    folder: 'akeginu',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 119,
    renderScale: 0.95,
    auraColor: '#ef4444'
  },
  enemy_jimushi: {
    name: 'Shadow Fang Jimushi',
    folder: 'jimushi',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 121,
    renderScale: 0.95,
    auraColor: '#9333ea'
  },
  enemy_kotaro: {
    name: 'Chaos Ninja Kotaro Fuma',
    folder: 'kotaro',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 1.0,
    auraColor: '#a855f7'
  },
  enemy_saizo: {
    name: 'Mist-Spear Saizo',
    folder: 'saizo',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 0.95,
    auraColor: '#38bdf8'
  },
  enemy_dartagnan: {
    name: "Gilded Chevalier D'Artagnan",
    folder: 'dartagnan',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 120,
    height: 115,
    renderScale: 0.98,
    auraColor: '#fbbf24'
  },
  enemy_mitsunari: {
    name: 'Vengeful Blade Mitsunari',
    folder: 'mitsunari',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 117,
    renderScale: 0.98,
    auraColor: '#c084fc'
  },
  enemy_goemon: {
    name: 'Shadow Thief Goemon',
    folder: 'goemon',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 130,
    height: 115,
    renderScale: 0.92,
    auraColor: '#10b981'
  },
  enemy_momotaro: {
    name: 'Peach Champion Momotaro',
    folder: 'momotaro',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 1.0,
    auraColor: '#f59e0b'
  },
  enemy_hanbei: {
    name: 'Clockwork Tactician Hanbei',
    folder: 'hanbei',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 134,
    renderScale: 0.96,
    auraColor: '#2dd4bf'
  },
  slime: {
    name: 'Frog Shinobi Keroro',
    folder: 'keroro',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 0.85,
    auraColor: '#10b981'
  },
  wolf: {
    name: 'Shadowclaw Felicia',
    folder: 'felicia',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 0.95,
    auraColor: '#a855f7'
  },
  hawk: {
    name: 'Frost Yeti Sasquatch',
    folder: 'sasquatch',
    idleCount: 4,
    attackCount: 5,
    runCount: 4,
    width: 116,
    height: 115,
    renderScale: 1.0,
    auraColor: '#38bdf8'
  },
  enemy_bird_knight: {
    name: 'Crimson Bird Knight',
    folder: 'bird_knight',
    idleCount: 5,
    attackCount: 5,
    runCount: 5,
    width: 96,
    height: 96,
    renderScale: 1.05,
    auraColor: '#ef4444'
  },
  enemy_black_tiger: {
    name: 'Obsidian Fang Tiger',
    folder: 'black_tiger',
    idleCount: 4,
    attackCount: 3,
    runCount: 4,
    width: 96,
    height: 96,
    renderScale: 1.02,
    auraColor: '#6366f1'
  },
  enemy_blade_bull: {
    name: 'Frosthorn Blade Bull',
    folder: 'blade_bull',
    idleCount: 4,
    attackCount: 4,
    runCount: 4,
    width: 108,
    height: 108,
    renderScale: 1.04,
    auraColor: '#38bdf8'
  },
  enemy_bonbon: {
    name: 'Cobalt Puff Bonbon',
    folder: 'bonbon',
    idleCount: 6,
    attackCount: 6,
    runCount: 6,
    width: 96,
    height: 96,
    renderScale: 0.92,
    auraColor: '#3b82f6'
  },
  enemy_crow_tengu: {
    name: 'Midnight Crow Tengu',
    folder: 'crow_tengu',
    idleCount: 5,
    attackCount: 7,
    runCount: 5,
    width: 98,
    height: 96,
    renderScale: 1.04,
    auraColor: '#475569'
  },
  enemy_crystal_shield: {
    name: 'Amethyst Crystal Shield',
    folder: 'crystal_shield',
    idleCount: 4,
    attackCount: 3,
    runCount: 4,
    width: 96,
    height: 96,
    renderScale: 0.98,
    auraColor: '#c084fc'
  },
  enemy_demon_dog: {
    name: 'Cinderflame Demon Hound',
    folder: 'demon_dog',
    idleCount: 5,
    attackCount: 3,
    runCount: 5,
    width: 96,
    height: 96,
    renderScale: 1.0,
    auraColor: '#f97316'
  },
  enemy_eagle_man: {
    name: 'Sunwing Eagle Vanguard',
    folder: 'eagle_man',
    idleCount: 5,
    attackCount: 5,
    runCount: 5,
    width: 96,
    height: 96,
    renderScale: 1.05,
    auraColor: '#f59e0b'
  },
  enemy_eau_mouton: {
    name: 'Glacier Cloud Mouton',
    folder: 'eau_mouton',
    idleCount: 4,
    attackCount: 4,
    runCount: 4,
    width: 96,
    height: 96,
    renderScale: 0.95,
    auraColor: '#67e8f9'
  },
  enemy_electric_snail: {
    name: 'Volt-Shell Snail',
    folder: 'electric_snail',
    idleCount: 6,
    attackCount: 4,
    runCount: 6,
    width: 96,
    height: 96,
    renderScale: 0.98,
    auraColor: '#facc15'
  },
  enemy_furfur: {
    name: 'Golden Furfur',
    folder: 'furfur',
    idleCount: 5,
    attackCount: 6,
    runCount: 5,
    width: 96,
    height: 96,
    renderScale: 0.92,
    auraColor: '#fde047'
  },
  enemy_gray_ulse: {
    name: 'Mossmane Lycan Ulse',
    folder: 'gray_ulse',
    idleCount: 4,
    attackCount: 8,
    runCount: 4,
    width: 96,
    height: 99,
    renderScale: 1.08,
    auraColor: '#4ade80'
  },
  enemy_grizzly_bear: {
    name: 'Highland Grizzly',
    folder: 'grizzly_bear',
    idleCount: 12,
    attackCount: 6,
    runCount: 12,
    width: 96,
    height: 103,
    renderScale: 1.08,
    auraColor: '#b45309'
  },
  enemy_keraunos: {
    name: 'Thunderhorn Keraunos',
    folder: 'keraunos',
    idleCount: 4,
    attackCount: 4,
    runCount: 4,
    width: 113,
    height: 118,
    renderScale: 1.04,
    auraColor: '#eab308'
  },
  enemy_lava_snail: {
    name: 'Magma-Shell Snail',
    folder: 'lava_snail',
    idleCount: 6,
    attackCount: 4,
    runCount: 6,
    width: 96,
    height: 96,
    renderScale: 0.98,
    auraColor: '#f97316'
  },
  enemy_nightmare: {
    name: 'Ember-Forge Nightmare',
    folder: 'nightmare',
    idleCount: 4,
    attackCount: 6,
    runCount: 4,
    width: 96,
    height: 96,
    renderScale: 1.04,
    auraColor: '#ef4444'
  },
  enemy_phantom: {
    name: 'Cobalt Dread Phantom',
    folder: 'phantom',
    idleCount: 4,
    attackCount: 6,
    runCount: 4,
    width: 96,
    height: 96,
    renderScale: 1.04,
    auraColor: '#60a5fa'
  },
  enemy_poison_spider: {
    name: 'Venomweaver Spider',
    folder: 'poison_spider',
    idleCount: 3,
    attackCount: 4,
    runCount: 3,
    width: 96,
    height: 96,
    renderScale: 0.98,
    auraColor: '#a855f7'
  },
  enemy_roar_wolf: {
    name: 'Suncrest Roar Wolf',
    folder: 'roar_wolf',
    idleCount: 5,
    attackCount: 3,
    runCount: 5,
    width: 96,
    height: 96,
    renderScale: 1.0,
    auraColor: '#fbbf24'
  },
  enemy_roc: {
    name: 'Amber Sky Roc',
    folder: 'roc',
    idleCount: 5,
    attackCount: 7,
    runCount: 5,
    width: 98,
    height: 96,
    renderScale: 1.05,
    auraColor: '#f59e0b'
  },
  enemy_shadow_dog: {
    name: 'Dusk-Tail Shadow Dog',
    folder: 'shadow_dog',
    idleCount: 5,
    attackCount: 3,
    runCount: 5,
    width: 96,
    height: 96,
    renderScale: 1.0,
    auraColor: '#818cf8'
  },
  enemy_slime_snail: {
    name: 'Tide-Shell Slime Snail',
    folder: 'slime_snail',
    idleCount: 6,
    attackCount: 4,
    runCount: 6,
    width: 96,
    height: 96,
    renderScale: 0.98,
    auraColor: '#06b6d4'
  },
  enemy_white_tiger: {
    name: 'Glacier White Tiger',
    folder: 'white_tiger',
    idleCount: 4,
    attackCount: 3,
    runCount: 4,
    width: 96,
    height: 96,
    renderScale: 1.02,
    auraColor: '#e2e8f0'
  },
  enemy_wind_tiger: {
    name: 'Emerald Gale Tiger',
    folder: 'wind_tiger',
    idleCount: 4,
    attackCount: 3,
    runCount: 4,
    width: 96,
    height: 96,
    renderScale: 1.02,
    auraColor: '#22c55e'
  },
  enemy_wolf: {
    name: 'Timberfang Wolf',
    folder: 'wolf',
    idleCount: 4,
    attackCount: 3,
    runCount: 4,
    width: 96,
    height: 96,
    renderScale: 0.98,
    auraColor: '#d97706'
  }
};

const AnimatedEnemySprite: React.FC<{
  enemyType: string;
  scale?: number;
  isDead?: boolean;
  isAttacking?: boolean;
  isWalking?: boolean;
  mirrored?: boolean;
  className?: string;
}> = ({
  enemyType,
  scale = 1,
  isDead = false,
  isAttacking = false,
  isWalking = false,
  mirrored = false,
  className = ''
}) => {
  const config = ENEMY_CONFIGS[enemyType] || ENEMY_CONFIGS.enemy_sasquatch;
  const [frameIndex, setFrameIndex] = useState(0);

  const action = isAttacking ? 'attack' : isWalking ? 'run' : 'idle';
  const maxFrames = isAttacking ? config.attackCount : isWalking ? config.runCount : config.idleCount;
  const intervalMs = isAttacking ? 120 : isWalking ? 140 : 200;

  useEffect(() => {
    setFrameIndex(0);
  }, [action]);

  useEffect(() => {
    if (isDead) return;
    const timer = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % maxFrames);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [action, maxFrames, intervalMs, isDead]);

  const currentFrame = frameIndex % maxFrames;
  const imageSrc = `/enemies/${config.folder}/${action}_${currentFrame}.png`;
  const renderWidth = Math.round(config.width * config.renderScale * scale);
  const renderHeight = Math.round(config.height * config.renderScale * scale);

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className} ${
        isDead ? 'opacity-30 grayscale filter' : ''
      }`}
    >
      {/* SpriteCast 3D Ground Contact Shadow */}
      <div
        className={`absolute -bottom-1 pointer-events-none flex items-center justify-center transition-all duration-150 ${
          isDead ? 'opacity-0' : isAttacking ? 'opacity-40 scale-80' : 'opacity-85 scale-100'
        }`}
        style={{
          width: `${Math.round(renderWidth * 0.6)}px`,
          height: `${Math.round(renderHeight * 0.2)}px`
        }}
      >
        <div
          className="absolute inset-0 rounded-[50%] bg-slate-950/60"
          style={{ filter: isAttacking ? 'blur(5px)' : 'blur(2px)' }}
        />
        <div
          className="w-[60%] h-[50%] rounded-[50%] bg-black/85"
          style={{ filter: 'blur(1px)' }}
        />
      </div>

      {/* Authentic Pixel Enemy Frame with vertical attack leap */}
      <img
        src={imageSrc}
        alt={config.name}
        width={renderWidth}
        height={renderHeight}
        className={`object-contain ${
          isAttacking ? 'scale-110 filter brightness-115 -translate-y-1.5' : !isDead ? 'animate-enemy-bob' : ''
        }`}
        style={{
          imageRendering: 'pixelated',
          transform: mirrored ? 'scaleX(-1)' : undefined,
          filter: `drop-shadow(0 0 6px ${config.auraColor})`
        }}
      />
    </div>
  );
};

// -------------------------------------------------------------
// AUTHENTIC ANIME CLASS CHARACTER SPRITE COMPONENT
// Source: FE caracters (Senran no Samurai Kingdom / Hakuoki)
// -------------------------------------------------------------
const normalizeJobKey = (job?: JobType | string): string => {
  if (!job) return 'warrior';
  const j = job.toLowerCase();
  if (j === 'vanguard') return 'warrior';
  if (j === 'spellweaver') return 'mage';
  if (j === 'lightbearer') return 'priest';
  if (j === 'shadowblade' || j === 'shinobi') return 'rogue';
  return j;
};

const AnimatedCharacterSprite: React.FC<{
  job?: JobType | string;
  skin?: string;
  scale?: number;
  isPlayer?: boolean;
  isDead?: boolean;
  isAttacking?: boolean;
  isWalking?: boolean;
  mirrored?: boolean;
  className?: string;
  name?: string;
}> = ({
  job = 'WARRIOR',
  skin,
  scale = 1,
  isPlayer = false,
  isDead = false,
  isAttacking = false,
  isWalking = false,
  mirrored = false,
  className = '',
  name
}) => {
  const skinFolder = skin ? skin.toLowerCase() : normalizeJobKey(job);
  const [frameIndex, setFrameIndex] = useState(0);

  const action = isAttacking ? 'attack' : isWalking ? 'run' : 'idle';
  const isIdle = action === 'idle';
  const maxFrames = isAttacking ? 5 : isWalking ? 4 : 1;
  const intervalMs = isAttacking ? 110 : isWalking ? 110 : 200;

  // Preload walk frames smoothly so stride swaps never flicker
  useEffect(() => {
    for (let i = 0; i < 4; i++) {
      const preload = new Image();
      preload.src = `/characters/${skinFolder}/run_${i}.png`;
    }
  }, [skinFolder]);

  // Reset frame when switching actions (e.g. run -> idle, attack -> idle)
  useEffect(() => {
    setFrameIndex(0);
  }, [action]);

  useEffect(() => {
    if (isDead || isIdle) return;
    const timer = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % maxFrames);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [action, maxFrames, intervalMs, isDead, isIdle]);

  const currentFrame = isIdle ? 0 : (frameIndex % maxFrames);
  const imageSrc = `/characters/${skinFolder}/${action}_${currentFrame}.png`;

  const baseW = 116;
  const baseH = 115;
  const renderW = Math.round(baseW * 0.85 * scale);
  const renderH = Math.round(baseH * 0.85 * scale);

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className} ${
        isDead ? 'opacity-30 grayscale filter' : ''
      }`}
    >
      {/* SpriteCast 3D Ground Contact Shadow */}
      <div
        className={`absolute -bottom-1 pointer-events-none flex items-center justify-center transition-all duration-150 ${
          isDead ? 'opacity-0' : isAttacking ? 'opacity-40 scale-80' : 'opacity-85 scale-100'
        } ${isIdle && !isDead ? 'animate-shadow-breathe' : ''}`}
        style={{
          width: `${Math.round(renderW * 0.6)}px`,
          height: `${Math.round(renderH * 0.2)}px`
        }}
      >
        <div
          className="absolute inset-0 rounded-[50%] bg-slate-950/60"
          style={{ filter: isAttacking ? 'blur(4px)' : 'blur(2px)' }}
        />
        <div
          className="w-[60%] h-[50%] rounded-[50%] bg-black/85"
          style={{ filter: 'blur(1px)' }}
        />
      </div>

      {/* Authentic Character Sprite Frame with Organic Idle Breathe, Stride Bounce & Horizontal Flip */}
      <div
        className={`${isIdle && !isDead ? 'animate-idle-breathe' : isWalking && !isDead ? 'animate-walk-stride' : ''}`}
        style={{ transformOrigin: 'bottom center' }}
      >
        <img
          src={imageSrc}
          alt={name || String(job)}
          width={renderW}
          height={renderH}
          className={`object-contain ${
            isAttacking ? 'scale-110 filter brightness-115 -translate-y-1.5' : 'translate-y-0'
          }`}
          style={{
            imageRendering: 'pixelated',
            transform: mirrored ? 'scaleX(-1)' : undefined
          }}
          onError={(e) => {
            const fallback = `/characters/${normalizeJobKey(job)}/idle_0.png`;
            if (e.currentTarget.src !== fallback) {
              e.currentTarget.src = fallback;
            }
          }}
        />
      </div>
    </div>
  );
};

interface SpriteProps {
  job?: JobType;
  skin?: string;
  spriteType?: MonsterSpriteType;
  element?: ElementType;
  isPlayer?: boolean;
  isDead?: boolean;
  isAttacking?: boolean;
  mirrored?: boolean;
  scale?: number;
  className?: string;
  name?: string;
  // Anime Modular Customization props
  hairstyle?: Hairstyle | string;
  hairColor?: string;
  skinTone?: string;
  eyeStyle?: EyeStyle | string;
  eyeColor?: string;
  outfit?: string;
  cape?: string;
  accessory?: string;
  aura?: string;
  isWalking?: boolean;
  isEnraged?: boolean; // For Boss Phase 2 Enrage
}

export const SpriteRenderer: React.FC<SpriteProps> = ({
  job = 'VANGUARD',
  skin,
  spriteType,
  element = 'DARK',
  isPlayer = false,
  isDead = false,
  isAttacking = false,
  mirrored = false,
  scale = 1,
  className = '',
  name,
  hairstyle = 'spiky',
  hairColor = '#ef4444',
  skinTone = '#fed7aa',
  eyeStyle = 'determined',
  eyeColor = '#3b82f6',
  outfit = 'outfit_novice',
  cape = 'none',
  accessory = 'none',
  aura = 'none',
  isWalking = false,
  isEnraged = false,
}) => {
  // -------------------------------------------------------------
  // 1. ANIME MONSTER RENDERING
  // -------------------------------------------------------------
  if (spriteType) {
    // 1.1 WORLD & DUNGEON BOSSES (Senran no Samurai Kingdom authentic animated sprites)
    if (spriteType in BOSS_CONFIGS) {
      return (
        <AnimatedBossSprite
          bossType={spriteType}
          scale={scale}
          isDead={isDead}
          isAttacking={isAttacking}
          isEnraged={isEnraged}
          className={className}
        />
      );
    }

    // 1.2 SIMPLE FIELD & DUNGEON ENEMIES (Senran no Samurai Kingdom authentic animated sprites)
    return (
      <AnimatedEnemySprite
        enemyType={spriteType}
        scale={scale}
        isDead={isDead}
        isAttacking={isAttacking}
        isWalking={isWalking}
        mirrored={mirrored}
        className={className}
      />
    );
  }

  // -------------------------------------------------------------
  // 2. AUTHENTIC ANIME CLASS CHARACTER SPRITE RENDERING
  // Source: FE caracters (Senran no Samurai Kingdom / Hakuoki)
  // -------------------------------------------------------------
  return (
    <AnimatedCharacterSprite
      job={job}
      skin={skin}
      scale={scale}
      isPlayer={isPlayer}
      isDead={isDead}
      isAttacking={isAttacking}
      isWalking={isWalking}
      mirrored={mirrored}
      className={className}
      name={name}
    />
  );
};
