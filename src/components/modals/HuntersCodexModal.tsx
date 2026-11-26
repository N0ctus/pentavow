import React, { useState } from 'react';
import { soundManager } from '../../utils/audioManager';
import {
  BookOpen,
  X,
  Compass,
  Swords,
  Shield,
  Zap,
  Flame,
  Award,
  Users,
  ChevronRight,
  Sparkles,
  Heart,
  Crosshair,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { ANIME_ELEMENTS } from '../../utils/combatUtils';

interface HuntersCodexModalProps {
  onClose: () => void;
  initialTab?: 'BASICS' | 'COMBAT' | 'BOSSES' | 'ELEMENTS' | 'CLASSES' | 'COOP';
}

type CodexTab = 'BASICS' | 'COMBAT' | 'BOSSES' | 'ELEMENTS' | 'CLASSES' | 'COOP';

export const HuntersCodexModal: React.FC<HuntersCodexModalProps> = ({ onClose, initialTab = 'BASICS' }) => {
  const [activeTab, setActiveTab] = useState<CodexTab>(initialTab);

  const switchTab = (tab: CodexTab) => {
    soundManager.playClick();
    setActiveTab(tab);
  };

  return (
    <div className="absolute inset-0 z-[70] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 select-none animate-fadeIn">
      <div className="w-full max-w-[410px] h-[92%] max-h-[760px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/70 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shadow-inner">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <span>Hunter&apos;s Codex</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30">
                  Guide
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">Tactical Primer &amp; Game Mechanics</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
            title="Close Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center overflow-x-auto no-scrollbar bg-slate-950/95 border-b border-slate-800 px-2 py-1.5 gap-1 shrink-0 text-[10px] font-bold">
          <button
            onClick={() => switchTab('BASICS')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shrink-0 ${
              activeTab === 'BASICS'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Basics</span>
          </button>

          <button
            onClick={() => switchTab('COMBAT')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shrink-0 ${
              activeTab === 'COMBAT'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-3 h-3" />
            <span>Combat</span>
          </button>

          <button
            onClick={() => switchTab('BOSSES')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shrink-0 ${
              activeTab === 'BOSSES'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Stagger</span>
          </button>

          <button
            onClick={() => switchTab('ELEMENTS')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shrink-0 ${
              activeTab === 'ELEMENTS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Elements</span>
          </button>

          <button
            onClick={() => switchTab('CLASSES')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shrink-0 ${
              activeTab === 'CLASSES'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3 h-3" />
            <span>Classes</span>
          </button>

          <button
            onClick={() => switchTab('COOP')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shrink-0 ${
              activeTab === 'COOP'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Co-op</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs text-slate-200 leading-relaxed">
          {/* TAB 1: BASICS */}
          {activeTab === 'BASICS' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <h3 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Overworld Movement &amp; Controls</span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  You can explore the expansive 120×120 world with full freedom:
                </p>
                <ul className="text-[11px] space-y-1.5 text-slate-300 list-disc list-inside">
                  <li>
                    <strong className="text-cyan-300">Tap / Click anywhere:</strong> Smart A* pathfinding calculates the quickest path around walls and water.
                  </li>
                  <li>
                    <strong className="text-cyan-300">WASD / Arrow Keys:</strong> On desktop or keyboards, hold keys for 60fps direct movement.
                  </li>
                  <li>
                    <strong className="text-cyan-300">Minimap Radar:</strong> Top-right corner radar shows your position, terrain walls, and nearby encounters.
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <h3 className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                  <Heart className="w-4 h-4 text-emerald-400" />
                  <span>Safe Haven Sanctuary</span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  The stone courtyard at the South of the realm is a protected sanctuary:
                </p>
                <ul className="text-[11px] space-y-1 text-slate-300 list-disc list-inside">
                  <li>Standing in sanctuary <strong className="text-emerald-300">automatically restores your HP to 100%</strong>.</li>
                  <li>Access the <strong className="text-amber-300">Astral Altar</strong> and <strong className="text-purple-300">Realm Portal</strong> here.</li>
                </ul>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <h3 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Currencies &amp; Progression</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-amber-500/30">
                    <span className="font-bold text-amber-300 block">🪙 Gold</span>
                    <span className="text-slate-400">Used for weapon forge refinements (+1 to +10).</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-cyan-500/30">
                    <span className="font-bold text-cyan-300 block">💎 Tessera Shards</span>
                    <span className="text-slate-400">Earned from bosses, used for weapon gacha summons.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-purple-500/30">
                    <span className="font-bold text-purple-300 block">🪶 Hero Feathers</span>
                    <span className="text-slate-400">Awarded for duplicate pulls, unlocks collectible skins.</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-emerald-500/30">
                    <span className="font-bold text-emerald-300 block">🧪 Materials</span>
                    <span className="text-slate-400">Slime essence &amp; fangs dropped to forge gear.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMBAT */}
          {activeTab === 'COMBAT' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <h3 className="font-bold text-rose-300 flex items-center gap-1.5 text-xs">
                  <Swords className="w-4 h-4 text-rose-400" />
                  <span>No-Mana 5-Weapon Hotbar</span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  Combat in Pentavow is inspired by <em>Logres</em>: there are no mana bars or cooldown potions!
                </p>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                    <strong className="text-amber-300">2.0s Auto-Attacks:</strong> Your hunter strikes continuously using your equipped Main Weapon slot (Slot 1).
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                    <strong className="text-cyan-300">Active Weapon Skills:</strong> Tap any weapon card to unleash its active ability. Each card has an independent cooldown (6s–15s).
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/50 border border-amber-500/40">
                    <strong className="text-amber-300">100% Ether Ultimates:</strong> Triggering skills grants <span className="text-amber-300 font-bold">+25% to +40% Ether</span>. When a card hits 100%, its border radiates gold—tap it to unleash its supreme Ultimate!
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <h3 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Weapon Synergies &amp; Loadout Rules</span>
                </h3>
                <ul className="text-[11px] space-y-1 text-slate-300 list-disc list-inside">
                  <li>Your active Class determines which weapon categories you can equip.</li>
                  <li>Slot 1 is your <strong className="text-amber-300">Main Weapon</strong>: its element sets your auto-attack damage type.</li>
                  <li>Slots 2–5 are <strong className="text-cyan-300">Sub-Weapons</strong>: equip a mix of heals, shields, and elemental burst skills for optimal rotations.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: BOSSES & STAGGER */}
          {activeTab === 'BOSSES' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <h3 className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Boss Stagger &amp; Break Phases</span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  Every strike and combo builds the enemy’s yellow <strong className="text-amber-300">Stagger Gauge</strong> (0 to 100):
                </p>
                <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/40 space-y-1 text-[11px]">
                  <p className="font-bold text-purple-200">💥 Stagger Break Window:</p>
                  <p className="text-slate-300">
                    When Stagger reaches 100, the boss collapses! During this vulnerable break phase, the boss is paralyzed, takes <strong className="text-amber-300">+50% bonus critical damage</strong>, and drops bonus gold.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <h3 className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                  <Crosshair className="w-4 h-4 text-cyan-400" />
                  <span>Active Reaction (Guard / Parry)</span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  When a boss begins casting a heavy skill (red cast bar), time your defense:
                </p>
                <ul className="text-[11px] space-y-1.5 text-slate-300 list-disc list-inside">
                  <li>
                    Tap <strong className="text-cyan-300">[GUARD]</strong> right before the blow lands to reduce damage by <strong className="text-cyan-300">80%</strong>.
                  </li>
                  <li>
                    A <strong className="text-amber-300">Perfect Parry</strong> negates all damage and reflects stagger shock back to the boss!
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: ELEMENTS */}
          {activeTab === 'ELEMENTS' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <h3 className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>The 5-Element Matrix</span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  Attacking an enemy’s elemental weakness deals <strong className="text-amber-300">1.5× Damage</strong>, while resisted elements deal <strong className="text-slate-400">0.75×</strong>:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-bold">🔥 Fire</span>
                    <span className="text-slate-500">→ beats →</span>
                    <span className="text-emerald-400 font-bold">🍃 Wind</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">🍃 Wind</span>
                    <span className="text-slate-500">→ beats →</span>
                    <span className="text-cyan-400 font-bold">💧 Water</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold">💧 Water</span>
                    <span className="text-slate-500">→ beats →</span>
                    <span className="text-rose-400 font-bold">🔥 Fire</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-amber-300 font-bold">☀️ Light</span>
                    <span className="text-slate-500">↔ mutual weakness ↔</span>
                    <span className="text-purple-400 font-bold">🌙 Dark</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <h3 className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Cross-Class Elemental Combos</span>
                </h3>
                <div className="space-y-1.5 text-[10px]">
                  <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/30">
                    <strong className="text-cyan-300 block">🧊 Chilled + Physical: Freeze Shatter</strong>
                    <span className="text-slate-300">Water spells chill the target; following with a physical strike shatters them for bonus burst damage.</span>
                  </div>
                  <div className="p-2 rounded bg-rose-950/30 border border-rose-500/30">
                    <strong className="text-rose-300 block">💥 Oiled + Fire: Combustion Blast</strong>
                    <span className="text-slate-300">Wind skills apply oil; following with Fire triggers a massive explosive blast.</span>
                  </div>
                  <div className="p-2 rounded bg-amber-950/30 border border-amber-500/30">
                    <strong className="text-amber-300 block">✨ Holy Cross: Radiant Leech</strong>
                    <span className="text-slate-300">Light attacks leave a holy seal; all ally attacks heal the attacker for 15% of damage dealt.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CLASSES */}
          {activeTab === 'CLASSES' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <h3 className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>17 Specialized Classes &amp; 3 Paths</span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  Every class levels independently and unlocks permanent cross-class stat boosts:
                </p>
                <div className="space-y-2 text-[10px]">
                  <div className="p-2 rounded bg-amber-950/20 border border-amber-500/30">
                    <strong className="text-amber-300 block">⚔️ Martial Path (Warrior Base)</strong>
                    <span className="text-slate-300">Evolves into Guardian (Tank), Berserker (Heavy 2H), Rogue (Stealth), Assassin (Crit), Hunter (Bow).</span>
                  </div>
                  <div className="p-2 rounded bg-cyan-950/20 border border-cyan-500/30">
                    <strong className="text-cyan-300 block">🔮 Arcane Path (Mage Base)</strong>
                    <span className="text-slate-300">Evolves into Archmage (3 Elements), Warlock (DoT), Death Knight (Necromancy), Demon Hunter (Agile).</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/30">
                    <strong className="text-emerald-300 block">✨ Divine Path (Priest Base)</strong>
                    <span className="text-slate-300">Evolves into Paladin (Holy Tank), Druid (Regen), Shaman (Totems), Monk (Fist/Qi), Evoker (Summons).</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/70 border border-amber-500/40 rounded-xl p-3 space-y-1.5">
                <h3 className="font-bold text-amber-300 flex items-center gap-1 text-xs">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Class Mastery Rule</span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  You must reach <strong className="text-amber-300">Level 10 (Mastery)</strong> in your current class before unlocking the ability to switch or advance to specialized classes. Farm field monsters and World Bosses to gain EXP rapidly!
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: CO-OP */}
          {activeTab === 'COOP' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <h3 className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Seamless Drop-In Battles</span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  Pentavow simulates a living MMO world right on your device:
                </p>
                <ul className="text-[11px] space-y-1.5 text-slate-300 list-disc list-inside">
                  <li>
                    <strong className="text-indigo-300">Crossed-Swords Markers:</strong> When AI Hunters or other players fight, an animated battle icon appears on the map.
                  </li>
                  <li>
                    <strong className="text-indigo-300">Drop In Mid-Battle:</strong> Tap any battle icon to jump directly into the ongoing encounter with the boss’s remaining HP intact!
                  </li>
                  <li>
                    <strong className="text-indigo-300">Allies Join You:</strong> When you challenge a World Boss, nearby AI Hunters will automatically pathfind to you and drop into your fight every few seconds.
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <h3 className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Real-Time P2P Co-op</span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  Share your Room Code with friends or open another browser tab: you will see each other walking the overworld in real-time and fighting side-by-side!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-400">
            Pentavow v1.0 • Hunter&apos;s Codex
          </span>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
