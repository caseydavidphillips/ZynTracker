export interface AppState {
  startDate: string;
  quitDate: string;
  dailyAvg: number;
  strength: number;
  wakeTime: string;
  sleepTime: string;
  log: Record<string, number>;
}

export interface Phase {
  strength: number;
  allowed: number;
  start: string;
  end: string | null;
}
