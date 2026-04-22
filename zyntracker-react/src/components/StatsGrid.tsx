import type { AppState } from '../types';
import {
  dateStr, buildPlan, getCurrentPhaseIndex, PRICE_PER_POUCH,
} from '../utils';

interface Props {
  state: AppState;
}

export default function StatsGrid({ state }: Props) {
  const startDate = new Date(state.startDate + 'T00:00:00');
  const now = new Date(); now.setHours(0, 0, 0, 0);

  const daysSince = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / 86400000));

  const phases = buildPlan(state.startDate, state.quitDate, state.dailyAvg, state.strength);

  let streak = 0;
  const d = new Date(now);
  while (true) {
    const ds = dateStr(d);
    if (d < startDate) break;
    const pi = getCurrentPhaseIndex(phases, ds);
    const dayAllowed = phases[pi].allowed;
    const dayCount = state.log[ds] ?? 0;
    if (dayCount <= dayAllowed) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }

  const totalConsumed = Object.values(state.log).reduce((a, b) => a + b, 0);
  const avoided = Math.max(0, daysSince * state.dailyAvg - totalConsumed);
  const moneySaved = (avoided * PRICE_PER_POUCH).toFixed(0);

  return (
    <div className="stats-grid">
      <div className="stat-card highlight">
        <div className="stat-value">{daysSince}</div>
        <div className="stat-label">Days in</div>
      </div>
      <div className="stat-card highlight">
        <div className="stat-value">
          {streak}{streak >= 3 ? ' 🔥' : ''}
        </div>
        <div className="stat-label">Clean streak</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{avoided}</div>
        <div className="stat-label">Pouches avoided</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">${moneySaved}</div>
        <div className="stat-label">Approx. saved</div>
      </div>
    </div>
  );
}
