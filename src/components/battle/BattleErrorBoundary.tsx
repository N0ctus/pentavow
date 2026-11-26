import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Shield, RotateCcw } from 'lucide-react';
import { gameActions } from '../../state/useGameStore';

interface Props {
  battleId: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class BattleErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Pentavow Battle Crash Caught]:', error, errorInfo);
  }

  private handleReturnToSanctuary = () => {
    try {
      gameActions.endBattle(this.props.battleId, false);
      gameActions.setPlayerPosition(1452, 2628);
    } catch (e) {
      console.error('Failed to end battle gracefully:', e);
      window.location.reload();
    }
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 select-none animate-fadeIn z-50">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-rose-500/80 rounded-2xl p-6 shadow-[0_0_35px_rgba(244,63,94,0.4)] flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-rose-950/80 border border-rose-500/60 flex items-center justify-center mb-3">
              <Shield className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-lg font-black text-rose-300 tracking-wider uppercase mb-1">
              Astral Anomaly Mitigated
            </h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              A temporal fluctuation occurred during combat. Your hunter and weapons are safe.
            </p>

            <div className="w-full space-y-2">
              <button
                onClick={this.handleReturnToSanctuary}
                className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Return to Safe Sanctuary</span>
              </button>

              <button
                onClick={this.handleRetry}
                className="w-full py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Resume Combat</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
