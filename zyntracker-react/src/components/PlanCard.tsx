import { useEffect, useRef } from 'react';
import type { AppState } from '../types';
import { todayStr, buildPlan, getCurrentPhaseIndex, formatDate, pillClass } from '../utils';

interface Props {
  state: AppState;
}

export default function PlanCard({ state }: Props) {
  const today = todayStr();
  const phases = buildPlan(state.startDate, state.quitDate, state.dailyAvg, state.strength);
  const currentIdx = getCurrentPhaseIndex(phases, today);
  const currentRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      currentRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <div className="card" id="planCard">
      <div className="card-title">Your quit plan</div>
      <ul className="plan-list">
        {phases.map((phase, i) => {
          const isPast = i < currentIdx;
          const isCurrent = i === currentIdx;
          const isQuit = phase.strength === 0 && phase.allowed === 0;

          let phaseClass = isQuit ? 'plan-phase quit-phase' : 'plan-phase';
          if (isPast) phaseClass += ' past';
          else if (isCurrent) phaseClass += ' current';
          else phaseClass += ' future';

          let icon = isPast ? '✓' : isCurrent ? '▶' : '·';
          if (isQuit) icon = '★';

          const dateRange = isQuit
            ? `${formatDate(phase.start)} onwards`
            : `${formatDate(phase.start)} – ${formatDate(phase.end!)}`;

          const phaseName = isQuit ? 'Quit!' : `${phase.strength}mg — ${phase.allowed}/day`;
          const pc = pillClass(phase.strength, isPast);
          const pillText = isQuit ? 'Free!' : `${phase.strength}mg`;

          return (
            <li
              key={i}
              className={phaseClass}
              ref={isCurrent ? currentRef : null}
            >
              <span className="phase-status">{icon}</span>
              <div className="phase-info">
                <div className="phase-name">
                  {phaseName}
                  {isCurrent && <span className="plan-current-tag">now</span>}
                </div>
                <div className="phase-dates">{dateRange}</div>
              </div>
              <span className={`badge phase-pill ${pc}`}>{pillText}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
