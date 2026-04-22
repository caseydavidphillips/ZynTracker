import { useState, useRef } from 'react';
import type { AppState } from '../types';
import { todayStr, dateStr } from '../utils';

const STRENGTH_OPTIONS = [3, 6, 9, 12, 15];

interface Props {
  onStart: (state: AppState) => void;
}

export default function SetupForm({ onStart }: Props) {
  const [selectedStrength, setSelectedStrength] = useState<number | null>(null);
  const quitDateRef = useRef<HTMLInputElement>(null);
  const dailyAvgRef = useRef<HTMLInputElement>(null);
  const wakeTimeRef = useRef<HTMLInputElement>(null);
  const sleepTimeRef = useRef<HTMLInputElement>(null);

  const today = todayStr();
  const todayDate = new Date(today + 'T00:00:00');
  const minDate = new Date(todayDate); minDate.setDate(minDate.getDate() + 7);
  const maxDate = new Date(todayDate); maxDate.setDate(maxDate.getDate() + 14);
  const defDate = new Date(todayDate); defDate.setDate(defDate.getDate() + 10);

  const handleSubmit = () => {
    const dateInput = quitDateRef.current?.value ?? '';
    const avgInput = parseInt(dailyAvgRef.current?.value ?? '', 10);
    const wakeTime = wakeTimeRef.current?.value ?? '';
    const sleepTime = sleepTimeRef.current?.value ?? '';

    if (!dateInput) { alert('Please pick a target quit date.'); return; }
    const chosen = new Date(dateInput + 'T00:00:00');
    if (chosen < minDate || chosen > maxDate) {
      alert('Quit date must be 7–14 days from today.'); return;
    }
    if (!selectedStrength || !STRENGTH_OPTIONS.includes(selectedStrength)) {
      alert('Please select a starting strength.'); return;
    }
    if (!avgInput || avgInput < 1) { alert('Please enter your average daily usage.'); return; }
    if (!wakeTime) { alert('Please enter your wake time.'); return; }
    if (!sleepTime) { alert('Please enter your sleep time.'); return; }

    onStart({
      startDate: today,
      quitDate: dateInput,
      dailyAvg: avgInput,
      strength: selectedStrength,
      wakeTime,
      sleepTime,
      log: {},
    });
  };

  return (
    <div className="card" id="setup">
      <h2>Start your journey</h2>
      <p>Tell us your current habit, and we'll build a personalized taper plan that steps you down to freedom.</p>

      <label htmlFor="quitDate">
        Target quit date{' '}
        <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(7–14 days from today)</span>
      </label>
      <input
        type="date"
        id="quitDate"
        ref={quitDateRef}
        min={dateStr(minDate)}
        max={dateStr(maxDate)}
        defaultValue={dateStr(defDate)}
      />

      <label>Starting strength</label>
      <div className="strength-group">
        {STRENGTH_OPTIONS.map(mg => (
          <button
            key={mg}
            className={`strength-btn${selectedStrength === mg ? ' selected' : ''}`}
            onClick={() => setSelectedStrength(mg)}
          >
            {mg}mg
          </button>
        ))}
      </div>

      <label htmlFor="dailyAvg">Average pouches per day (right now)</label>
      <input type="number" id="dailyAvg" ref={dailyAvgRef} min={1} max={50} placeholder="e.g. 10" />

      <label htmlFor="wakeTime">Wake time</label>
      <input type="time" id="wakeTime" ref={wakeTimeRef} defaultValue="07:00" />

      <label htmlFor="sleepTime">Sleep time</label>
      <input type="time" id="sleepTime" ref={sleepTimeRef} defaultValue="22:00" />

      <button className="btn" onClick={handleSubmit}>Let's do this</button>
    </div>
  );
}
