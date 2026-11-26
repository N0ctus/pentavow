import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useGameStore } from './state/useGameStore';
import { TopHud } from './components/layout/TopHud';
import { BottomDock } from './components/layout/BottomDock';
import { OverworldMap } from './components/map/OverworldMap';
import { BattleErrorBoundary } from './components/battle/BattleErrorBoundary';
import { broadcastPresence } from './services/coopMultiplayer';
import { getAccountState, subscribeAccountState } from './services/googleSyncService';

// Code-split heavy view branches and modal screens
const BattleArena = lazy(() =>
  import('./components/battle/BattleArena').then(m => ({ default: m.BattleArena }))
);
const LoadoutModal = lazy(() =>
  import('./components/modals/LoadoutModal').then(m => ({ default: m.LoadoutModal }))
);
const JobModal = lazy(() =>
  import('./components/modals/JobModal').then(m => ({ default: m.JobModal }))
);
const GachaModal = lazy(() =>
  import('./components/modals/GachaModal').then(m => ({ default: m.GachaModal }))
);
const AccountChoiceModal = lazy(() =>
  import('./components/modals/AccountChoiceModal').then(m => ({ default: m.AccountChoiceModal }))
);
const HeroOnboardingModal = lazy(() =>
  import('./components/modals/HeroOnboardingModal').then(m => ({ default: m.HeroOnboardingModal }))
);

const ViewLoadingFallback: React.FC = () => (
  <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 select-none animate-fadeIn">
    <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mb-2" />
    <span className="text-[10px] font-bold text-amber-300 font-mono tracking-wider">
      Loading Astral Echoes...
    </span>
  </div>
);

export const App: React.FC = () => {
  const store = useGameStore();
  const isBattle = store.view === 'BATTLE' && store.activeBattleId;
  const [accountChosen, setAccountChosen] = useState(() => getAccountState().chosen);

  useEffect(() => {
    return subscribeAccountState(() => {
      setAccountChosen(getAccountState().chosen);
    });
  }, []);

  // Broadcast local player state to P2P / Multi-Tab Co-op room
  useEffect(() => {
    const pushPresence = () => {
      const activeBattle = store.activeBattleId ? store.battles[store.activeBattleId] : null;
      const acct = getAccountState();
      broadcastPresence({
        name: store.player.name,
        title: store.player.customization?.title || 'Novice Hunter',
        job: store.player.currentJob,
        skin: store.player.equippedSkins?.[store.player.currentJob],
        level: store.player.jobs[store.player.currentJob]?.level || 1,
        realmId: store.currentRealmId,
        x: store.player.x,
        y: store.player.y,
        isWalking: false,
        facingLeft: false,
        authMode: acct.mode,
        activeEnemyId: activeBattle && activeBattle.active && !activeBattle.isDungeon ? activeBattle.enemyId : null,
        hp: store.currentHp,
        maxHp: store.maxHp,
      });
    };
    pushPresence();
    const timer = setInterval(pushPresence, 1500);
    return () => clearInterval(timer);
  }, [
    store.player.name,
    store.player.currentJob,
    store.player.x,
    store.player.y,
    store.currentRealmId,
    store.activeBattleId,
    store.currentHp,
    store.maxHp,
  ]);

  return (
    <div className="w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Centered Mobile-First Viewport Frame (430px x 850px) */}
      <main className="w-full max-w-[430px] h-full sm:h-[850px] mx-auto sm:border-x sm:border-slate-800 shadow-2xl overflow-hidden flex flex-col bg-slate-950 relative">
        {/* Persistent Top HUD (64px) */}
        <TopHud />

        {/* Dynamic Main Viewport (flex-1) */}
        <div className="flex-1 w-full relative overflow-hidden flex flex-col">
          <Suspense fallback={<ViewLoadingFallback />}>
            {isBattle ? (
              <BattleErrorBoundary battleId={store.activeBattleId!}>
                <BattleArena battleId={store.activeBattleId!} />
              </BattleErrorBoundary>
            ) : (
              <>
                {store.activeTab === 'MAP' && <OverworldMap />}
                {store.activeTab === 'EQUIP' && <LoadoutModal />}
                {store.activeTab === 'JOBS' && <JobModal />}
                {store.activeTab === 'SUMMON' && <GachaModal />}

                {/* Persistent Overworld Bottom Dock */}
                <BottomDock />
              </>
            )}
            {!accountChosen && <AccountChoiceModal />}
            {accountChosen && store.player.hasCompletedOnboarding === false && <HeroOnboardingModal />}
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default App;
