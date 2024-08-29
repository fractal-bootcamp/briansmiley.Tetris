import { X } from 'lucide-react';
import { defaultHighscores } from '../data';
import useLocalStorage from '../hooks/useLocalStorage';
import HighScoreList from './HighScoreList';
import { useState } from 'react';
import ControlsInfo from './ControlsInfo';

type SubDisplay = 'highscores' | 'controls' | 'none';
type SettingsModalProps = {
  closeModal: () => void;
};
export default function SettingsModal({ closeModal }: SettingsModalProps) {
  const [_, setHighscores] = useLocalStorage(
    'tetris-highscores',
    defaultHighscores
  );
  const [subDisplay, setSubDisplay] = useState<SubDisplay>('none');
  const [showHighScores, setShowHighScores] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const resetHighScores = () => {
    setHighscores(defaultHighscores);
    setShowHighScores(false);
  };
  const toggleSubDisplay = (newSubDisplay: SubDisplay) => () => {
    if (newSubDisplay === subDisplay) {
      setSubDisplay('none');
    } else {
      setSubDisplay(newSubDisplay);
    }
  };

  return (
    <div className="flex w-[80%] flex-col items-center gap-2 p-2">
      <div className="text-default border-outset relative flex w-[60%] flex-col items-center justify-center gap-1 bg-slate-900 p-2">
        {/* close button */}
        <button
          onClick={closeModal}
          className="absolute inset-0 h-5 w-5 rounded-full p-0.5"
        >
          <X color="#ffffff" className="h-full w-full" />
        </button>

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
        <ControlsInfo classNames="text-default bg-slate-900 p-3 border-outset w-[75%]" />
      </div>
      <div
        className={`w-full origin-top ${subDisplay === 'highscores' ? '' : 'hidden'}`}
      >
        <HighScoreList scoreCount={5} />
      </div>
    </div>
  );
}
