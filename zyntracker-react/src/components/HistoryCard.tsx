import type { AppState } from '../types';
import { dateStr, buildPlan, getCurrentPhaseIndex } from '../utils';

interface Props {
  state: AppState;
}

export default function HistoryCard({ state }: Props) {
  const startDate = new Date(state.startDate + 'T00:00:00');
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const phases = buildPlan(state.startDate, state.quitDate, state.dailyAvg, state.strength);

  const days: { ds: string; count: number }[] = [];
  for (let i = 0; i <= 13; i++) {
    const dd = new Date(now); dd.setDate(dd.getDate() - i);
    const ds = dateStr(dd);
    if (dd >= startDate) days.push({ ds, count: state.log[ds] ?? 0 });
  }

  return (
    <div className="card" id="historyCard">
      <div className="card-title">Recent history</div>
      <ul className="history-list">
        {days.length === 0 ? (
          <li className="empty-msg">No history yet.</li>
        ) : (
          days.map(({ ds, count }) => {
            const pi = getCurrentPhaseIndex(phases, ds);
            const dayAllowed = phases[pi].allowed;
            let badgeClass: string;
            let badgeText: string;
            if (count === 0) {
              badgeClass = 'badge badge-zero'; badgeText = 'Clean ✓';
            } else if (count <= dayAllowed) {
              const ratio = count / (state.dailyAvg || 1);
              badgeClass = `badge ${ratio > 0.5 ? 'badge-mid' : 'badge-low'}`;
              badgeText = `${count} ${count === 1 ? 'pouch' : 'pouches'}`;
            } else {
              badgeClass = 'badge badge-high';
              badgeText = `${count} pouches`;
            }
            const dateLabel = new Date(ds + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric',
            });
            return (
              <li key={ds} className="history-item">
                <span className="history-date">{dateLabel}</span>
                <span className={badgeClass}>{badgeText}</span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
