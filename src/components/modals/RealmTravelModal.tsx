import React, { useState, useMemo } from 'react';
import { useGameStore, gameActions } from '../../state/useGameStore';
import { REALMS, RealmDefinition } from '../../data/realms';
import { ALL_BATTLEGROUNDS, BattlegroundDefinition } from '../../data/battlegrounds';
import { ENEMY_TEMPLATES } from '../../data/enemies';
import { SpriteRenderer } from '../common/SpriteRenderer';
import { RealmPortal } from '../common/RealmPortal';
import { soundManager } from '../../utils/audioManager';
import { X, Skull, MapPin, Navigation, Search, Map as MapIcon, Sparkles, ArrowUp, ArrowDown } from 'lucide-react';
import { getElementBgClass } from '../../utils/combatUtils';

interface RealmTravelModalProps {
  onClose: () => void;
}

const CATEGORIES: Array<'ALL' | BattlegroundDefinition['category']> = [
  'ALL', 'PLAINS', 'FOREST', 'WATER', 'MOUNTAIN', 'VOLCANO', 'DESERT', 'SACRED', 'FORTRESS', 'COSMIC'
];

export const RealmTravelModal: React.FC<RealmTravelModalProps> = ({ onClose }) => {
  const store = useGameStore();
  const currentRealmId = store.currentRealmId;
  const [activeTab, setActiveTab] = useState<'REALMS' | 'ATLAS72'>('REALMS');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | BattlegroundDefinition['category']>('ALL');
  const [levelSort, setLevelSort] = useState<'DEFAULT' | 'ASC' | 'DESC'>('DEFAULT');

  const handleTravel = (targetId: string) => {
    if (targetId === currentRealmId) return;
    soundManager.playUltimate();
    gameActions.changeRealm(targetId);
    onClose();
  };

  const toggleLevelSort = (dir: 'ASC' | 'DESC') => {
    soundManager.playClick();
    setLevelSort(prev => (prev === dir ? 'DEFAULT' : dir));
  };

  const sortedRealms = useMemo(() => {
    if (levelSort === 'DEFAULT') return REALMS;
    return [...REALMS].sort((a, b) =>
      levelSort === 'ASC' ? a.recommendedLevel - b.recommendedLevel : b.recommendedLevel - a.recommendedLevel
    );
  }, [levelSort]);

  const filteredBattlegrounds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = ALL_BATTLEGROUNDS.filter(bg => {
      if (categoryFilter !== 'ALL' && bg.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        bg.name.toLowerCase().includes(q) ||
        bg.description.toLowerCase().includes(q) ||
        bg.category.toLowerCase().includes(q) ||
        bg.element.toLowerCase().includes(q)
      );
    });
    if (levelSort === 'DEFAULT') return list;
    return [...list].sort((a, b) => {
      const diff = levelSort === 'ASC' ? a.recommendedLevel - b.recommendedLevel : b.recommendedLevel - a.recommendedLevel;
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });
  }, [searchQuery, categoryFilter, levelSort]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="relative px-4 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <RealmPortal size={36} interactive={false} showRiftAura={false} showRealmOrbs={false} showParticles={false} />
            <div>
              <h2 className="text-sm font-black text-amber-300 tracking-wider uppercase">
                World Atlas & Battleground Maps
              </h2>
              <span className="text-[10px] text-slate-400">
                Explore 6 Story Realms & 72 Battleground Worlds
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="px-3 pt-2.5 pb-2 bg-slate-950/60 border-b border-slate-800 flex gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('REALMS');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 border transition-all ${
              activeTab === 'REALMS'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>6 Story Realms</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('ATLAS72');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 border transition-all ${
              activeTab === 'ATLAS72'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>72 Battleground Maps</span>
          </button>
        </div>

        {activeTab === 'ATLAS72' && (
          <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search 72 worlds, biomes, or elements..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="button"
                onClick={() => toggleLevelSort('ASC')}
                title="Sort lowest to highest level"
                className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-0.5 border shrink-0 transition-colors ${
                  levelSort === 'ASC'
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.35)]'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-amber-400/60'
                }`}
              >
                <span>Lv</span>
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => toggleLevelSort('DESC')}
                title="Sort highest to lowest level"
                className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-0.5 border shrink-0 transition-colors ${
                  levelSort === 'DESC'
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.35)]'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-amber-400/60'
                }`}
              >
                <span>Lv</span>
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 border transition-colors ${
                    categoryFilter === cat
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-amber-500/30">
          {activeTab === 'REALMS' ? (
            sortedRealms.map((realm: RealmDefinition) => {
              const isCurrent = realm.id === currentRealmId;
              const bossTemplate = ENEMY_TEMPLATES[realm.bossTemplateId];

              return (
                <div
                  key={realm.id}
                  className={`relative rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                    isCurrent
                      ? 'border-amber-400 bg-slate-800/90 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="relative h-28 w-full overflow-hidden">
                    <img
                      src={realm.battleground}
                      alt={realm.name}
                      className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                    <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md ${getElementBgClass(realm.element)}`}>
                        {realm.element}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-700 text-amber-300">
                        Rec. Lv.{realm.recommendedLevel}+
                      </span>
                    </div>

                    {isCurrent && (
                      <div className="absolute top-2 right-2 flex items-center space-x-1 bg-amber-500/90 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                        <MapPin className="w-3 h-3" />
                        <span>Current Realm</span>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                      <div>
                        <h3 className="text-base font-black text-white tracking-wide drop-shadow-md">
                          {realm.name}
                        </h3>
                        <p className="text-[10px] text-amber-300/90 font-medium">{realm.title}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-2.5">
                    <p className="text-[10px] text-slate-300 leading-relaxed">{realm.description}</p>

                    {bossTemplate && (
                      <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-2 flex items-center space-x-3">
                        <div className="w-14 h-14 bg-slate-900/90 rounded-md border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          <SpriteRenderer spriteType={bossTemplate.spriteType} scale={0.45} isAttacking={false} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <Skull className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span className="text-xs font-bold text-red-300 truncate">{bossTemplate.name}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                            <span>HP: <strong className="text-red-400">{bossTemplate.maxHp.toLocaleString()}</strong></span>
                            <span>•</span>
                            <span>ATK: <strong className="text-amber-300">{bossTemplate.atk}</strong></span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-1">
                      {isCurrent ? (
                        <div className="w-full py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold text-center flex items-center justify-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>You are currently in this realm</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleTravel(realm.id)}
                          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                        >
                          <Navigation className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Fast Travel to {realm.name}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            filteredBattlegrounds.map((bg, idx) => {
              const isCurrent = bg.id === currentRealmId;
              return (
                <div
                  key={bg.id}
                  className={`rounded-xl border overflow-hidden transition-all ${
                    isCurrent
                      ? 'border-cyan-400 bg-slate-800/90 shadow-[0_0_16px_rgba(34,211,238,0.25)]'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-600'
                  }`}
                >
                  <div className="relative h-24 w-full overflow-hidden">
                    <img
                      src={`/battlegrounds/${bg.filename}`}
                      alt={bg.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
                    <div className="absolute top-1.5 left-2 flex items-center gap-1">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${getElementBgClass(bg.element)}`}>
                        {bg.element}
                      </span>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-slate-950/85 border border-slate-700 text-amber-300">
                        Rec. Lv.{bg.recommendedLevel}+
                      </span>
                    </div>
                    <div className="absolute bottom-1.5 left-2.5 right-2.5 flex items-end justify-between">
                      <h3 className="text-sm font-black text-white drop-shadow">{bg.name}</h3>
                    </div>
                  </div>

                  <div className="p-2.5 space-y-1.5">
                    <p className="text-[10px] text-slate-300 leading-snug">
                      <strong className="text-slate-100">Scene:</strong> {bg.description}
                    </p>
                    <button
                      onClick={() => handleTravel(bg.id)}
                      disabled={isCurrent}
                      className={`w-full mt-1 py-1.5 px-3 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                        isCurrent
                          ? 'bg-cyan-500/15 border border-cyan-400/50 text-cyan-300 cursor-default'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 active:scale-95'
                      }`}
                    >
                      <Navigation className="w-3 h-3" />
                      <span>{isCurrent ? 'Current Realm' : `Enter ${bg.name}`}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
