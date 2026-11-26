import React from 'react';
import { DamagePopupItem } from '../../types/game';
import { getElementColor } from '../../utils/combatUtils';

interface DamagePopupProps {
  popups: DamagePopupItem[];
  damageTextMode?: 'ALL' | 'CRITS_ONLY' | 'CONDENSED';
}

export const DamagePopup: React.FC<DamagePopupProps> = ({ popups, damageTextMode = 'ALL' }) => {
  const filteredPopups = popups.filter(p => {
    if (damageTextMode === 'CRITS_ONLY') {
      return p.type === 'crit' || p.type === 'heal' || p.type === 'guard';
    }
    return true;
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      {filteredPopups.map(p => {
        let textColor = '#ffffff';
        let prefix = '';
        let isLarge = false;

        if (p.type === 'crit') {
          textColor = '#facc15';
          prefix = 'CRIT! ';
          isLarge = true;
        } else if (p.type === 'weakness') {
          textColor = '#f59e0b';
          prefix = 'WEAKNESS! ';
          isLarge = true;
        } else if (p.type === 'resist') {
          textColor = '#94a3b8';
          prefix = 'RESIST ';
        } else if (p.type === 'heal') {
          textColor = '#34d399';
          prefix = '+';
          isLarge = true;
        } else if (p.type === 'guard') {
          textColor = '#38bdf8';
          isLarge = true;
        } else if (p.type === 'shield') {
          textColor = '#38bdf8';
          if (typeof p.value === 'number') {
            prefix = 'SHIELD +';
          }
          isLarge = String(p.value).includes('GUARD');
        } else if (p.type === 'buff') {
          textColor = '#60a5fa';
        } else if (p.type === 'miss') {
          textColor = '#94a3b8';
        } else if (p.element) {
          textColor = getElementColor(p.element);
        }

        let displayValue = p.value;
        if (damageTextMode === 'CONDENSED' && typeof p.value === 'number' && p.value >= 1000) {
          displayValue = `${(p.value / 1000).toFixed(1)}k`;
        }

        // Clamp popup coordinates so text never clips beyond mobile viewport boundaries
        const clampedX = Math.max(14, Math.min(86, p.x));
        const clampedY = Math.max(12, Math.min(82, p.y));

        return (
          <div
            key={p.id}
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 select-none"
            style={{
              left: `${clampedX}%`,
              top: `${clampedY}%`,
            }}
          >
            <div
              className={`font-black tracking-wider animate-float-up whitespace-nowrap flex items-center ${
                isLarge ? 'text-base font-extrabold scale-110' : damageTextMode === 'CONDENSED' ? 'text-xs' : 'text-sm'
              }`}
              style={{
                color: textColor,
                textShadow: `0 0 10px ${textColor}, 0 2px 5px rgba(0,0,0,0.95)`,
                WebkitTextStroke: isLarge ? '1px #0f172a' : '0.5px #020617'
              }}
            >
              {p.element && (
                <span className="text-[8px] uppercase mr-1 opacity-90 font-mono">[{p.element}]</span>
              )}
              {prefix}{displayValue}
            </div>
          </div>
        );
      })}
    </div>
  );
};
