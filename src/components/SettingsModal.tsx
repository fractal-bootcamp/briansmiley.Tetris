import { defaultHighscores } from '../data';
import useLocalStorage from '../hooks/useLocalStorage';
import HighScoreList from './HighScoreList';
import { useState } from 'react';
import ControlsInfo from './ControlsInfo';

type SubDisplay = 'highscores' | 'controls' | 'none';
type SettingsModalProps = {};
export default function SettingsModal({}: SettingsModalProps) {
  const [_, setHighscores] = useLocalStorage(
    'tetris-highscores',
    defaultHighscores
  );
  const [subDisplay, setSubDisplay] = useState<SubDisplay>('none');
  const resetHighScores = () => {
    setHighscores(defaultHighscores);
    setSubDisplay('none');
  };
  const toggleSubDisplay = (newSubDisplay: SubDisplay) => () => {
    if (newSubDisplay === subDisplay) {
      setSubDisplay('none');
    } else {
      setSubDisplay(newSubDisplay);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-3 p-2 text-xl">
      <div
        className="text-default border-outset relative flex w-[60%] flex-col items-center justify-center gap-3 bg-slate-900 p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 text-2xl font-bold underline">Settings</div>
        <button onClick={toggleSubDisplay('controls')}>
          {' '}
          {subDisplay === 'controls' ? 'Hide' : 'Show'} Controls
        </button>
        <button onClick={toggleSubDisplay('highscores')}>
          {subDisplay === 'highscores' ? 'Hide' : 'Show'} High Scores
        </button>
        <button onClick={resetHighScores}>Reset High Scores</button>
      </div>
      <div
        className={`flex w-full origin-top items-center justify-center ${subDisplay === 'controls' ? '' : 'hidden'}`}
      >
        <ControlsInfo />
      </div>
      <div
        className={`w-full origin-top ${subDisplay === 'highscores' ? '' : 'hidden'}`}
      >
        <HighScoreList scoreCount={5} />
      </div>
    </div>
  );
}
