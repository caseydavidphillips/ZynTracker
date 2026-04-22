import type { AppState } from '../types';
import {
  todayStr, buildPlan, getCurrentPhaseIndex,
  buildDailySchedule, countColorClass, pillClass,
} from '../utils';

interface Props {
  state: AppState;
  onUpdate: (state: AppState) => void;
}

function AllowanceSub({ todayCount, allowed }: { todayCount: number; allowed: number }) {
  if (allowed === 0) {
    return todayCount === 0
      ? <span><strong>No pouches today — you're free.</strong></span>
      : <span><strong style={{ color: 'var(--danger)' }}>{todayCount} over your limit</strong> — quit day!</span>;
  }
  const remaining = Math.max(0, allowed - todayCount);
  if (todayCount === 0) {
    return <span><strong>{allowed}</strong> pouches allowed today</span>;
  }
  if (todayCount > allowed) {
    return <span><strong style={{ color: 'var(--danger)' }}>{todayCount - allowed} over</strong> your limit of {allowed}</span>;
  }
  return <span><strong>{remaining}</strong> of {allowed} left today</span>;
}

export default function TodayCard({ state, onUpdate }: Props) {
  const today = todayStr();
  const phases = buildPlan(state.startDate, state.quitDate, state.dailyAvg, state.strength);
  const phaseIdx = getCurrentPhaseIndex(phases, today);
  const allowed = phases[phaseIdx].allowed;
  const currentStrength = phases[phaseIdx].strength;
  const todayCount = state.log[today] ?? 0;

  const cc = countColorClass(todayCount, allowed);

  const progressWidth = cc === 'c-zero' || cc === 'c-over' || allowed === 0
    ? '100%'
    : `${Math.min(100, (todayCount / allowed) * 100)}%`;

  const schedule = allowed > 0
    ? buildDailySchedule(state.wakeTime, state.sleepTime, allowed)
    : [];

  const addPouch = () => {
    onUpdate({
      ...state,
      log: { ...state.log, [today]: todayCount + 1 },
    });
  };

  const undoPouch = () => {
    if (todayCount > 0) {
      onUpdate({
        ...state,
        log: { ...state.log, [today]: todayCount - 1 },
      });
    }
  };

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="card today-card">
      <div className="today-date-label">{dateLabel}</div>
      <div className={`today-count ${cc}`}>{todayCount}</div>
      <div className="allowance-sub">
        <AllowanceSub todayCount={todayCount} allowed={allowed} />
      </div>
      {currentStrength > 0 && (
        <div className={`strength-badge ${pillClass(currentStrength, false)}`}>
          {currentStrength}mg pouches
        </div>
      )}
      <div className="progress-wrap">
        <div className={`progress-fill ${cc}`} style={{ width: progressWidth }} />
      </div>
      <button className="btn add-btn" onClick={addPouch}>+ Had a pouch</button>
      <button className="undo-btn" onClick={undoPouch} disabled={todayCount === 0}>
        Undo last
      </button>
      {schedule.length > 0 && (
        <div className="schedule-section">
          <div className="schedule-title">Today's Schedule</div>
          <ul className="schedule-list">
            {schedule.map((time, idx) => {
              let iconClass: string;
              let icon: string;
              if (idx < todayCount)        { iconClass = 'slot-icon-done';     icon = '✓'; }
              else if (idx === todayCount) { iconClass = 'slot-icon-next';     icon = '▶'; }
              else                         { iconClass = 'slot-icon-upcoming'; icon = '·'; }
              return (
                <li key={idx} className="schedule-slot">
                  <span className="slot-time">{time}</span>
                  <span className={iconClass}>{icon}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
