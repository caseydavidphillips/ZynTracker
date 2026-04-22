import type { Phase } from './types';

const STRENGTH_STEPS = [3, 6, 9, 12, 15];
export const PRICE_PER_POUCH = 0.75;

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatDate(ds: string): string {
  return new Date(ds + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function buildPlan(
  startDateStr: string,
  quitDateStr: string,
  dailyAvg: number,
  strength: number,
): Phase[] {
  const strengthPhases = STRENGTH_STEPS.filter(s => s <= strength)
    .reverse()
    .map(mg => ({ strength: mg, allowed: dailyAvg }));

  const countSteps: number[] = [];
  let val = dailyAvg;
  while (val > 0) {
    countSteps.push(val);
    val = val === 1 ? 0 : Math.ceil(val / 2);
  }
  const countPhases = countSteps.map(c => ({ strength: 3, allowed: c }));

  const allPhases = [...strengthPhases.slice(0, -1), ...countPhases];
  const numPhases = allPhases.length;

  const startDate = new Date(startDateStr + 'T00:00:00');
  const quitDate = new Date(quitDateStr + 'T00:00:00');
  const totalDays = Math.round((quitDate.getTime() - startDate.getTime()) / 86400000);

  const baseDays = Math.max(1, Math.floor(totalDays / numPhases));
  const extraDays = Math.max(0, totalDays - baseDays * numPhases);

  const phases: Phase[] = [];
  let cursor = new Date(startDate);

  allPhases.forEach(({ strength: mg, allowed }, i) => {
    const days = baseDays + (i < extraDays ? 1 : 0);
    const end = new Date(cursor);
    end.setDate(end.getDate() + days - 1);
    phases.push({ strength: mg, allowed, start: dateStr(cursor), end: dateStr(end) });
    cursor = new Date(end);
    cursor.setDate(cursor.getDate() + 1);
  });

  phases.push({ strength: 0, allowed: 0, start: quitDateStr, end: null });
  return phases;
}

export function buildDailySchedule(wakeTime: string, sleepTime: string, count: number): string[] {
  if (count === 0) return [];

  const toMins = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const formatTime = (t: number): string => {
    const total = Math.round(t);
    const h24 = Math.floor(total / 60) % 24;
    const m = total % 60;
    const suffix = h24 < 12 ? 'am' : 'pm';
    const h12 = h24 % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')}${suffix}`;
  };

  const first = toMins(wakeTime) + 60;
  const last = toMins(sleepTime) - 180;
  if (last <= first) return Array(count).fill(formatTime(first)) as string[];
  if (count === 1) return [formatTime(first)];
  const interval = (last - first) / (count - 1);
  return Array.from({ length: count }, (_, i) => formatTime(first + interval * i));
}

export function getCurrentPhaseIndex(phases: Phase[], today: string): number {
  for (let i = 0; i < phases.length - 1; i++) {
    if (today >= phases[i].start && today <= (phases[i].end ?? '')) return i;
  }
  return phases.length - 1;
}

export function pillClass(strength: number, isPast: boolean): string {
  if (isPast) return 'pill-past';
  if (strength === 0) return 'pill-quit';
  const map: Record<number, string> = {
    15: 'pill-str-15', 12: 'pill-str-12', 9: 'pill-str-9',
    6: 'pill-str-6', 3: 'pill-str-3',
  };
  return map[strength] ?? 'pill-low';
}

export function countColorClass(count: number, allowed: number): string {
  if (count === 0) return 'c-zero';
  if (allowed === 0 || count > allowed) return 'c-over';
  if (count === allowed) return 'c-near';
  return 'c-good';
}
