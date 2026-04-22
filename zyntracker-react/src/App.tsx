import { useZynState } from './hooks/useZynState';
import SetupForm from './components/SetupForm';
import StatsGrid from './components/StatsGrid';
import TodayCard from './components/TodayCard';
import HistoryCard from './components/HistoryCard';
import PlanCard from './components/PlanCard';

export default function App() {
  const { state, setState, resetState } = useZynState();

  if (!state) {
    return (
      <>
        <h1>Quit Zyn</h1>
        <p className="subtitle">Every pouch you skip is a win.</p>
        <SetupForm onStart={setState} />
      </>
    );
  }

  return (
    <>
      <h1>Quit Zyn</h1>
      <p className="subtitle">Every pouch you skip is a win.</p>
      <div id="app">
        <StatsGrid state={state} />
        <TodayCard state={state} onUpdate={setState} />
        <HistoryCard state={state} />
        <PlanCard state={state} />
        <div className="reset-section">
          <button
            className="btn btn-outline"
            onClick={() => {
              if (window.confirm('Are you sure? This will delete all your data.')) {
                resetState();
              }
            }}
          >
            Reset all data
          </button>
        </div>
      </div>
    </>
  );
}
