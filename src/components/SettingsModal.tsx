import { X } from 'lucide-react';
import { defaultHighscores } from '../data';
import useLocalStorage from '../hooks/useLocalStorage';
import HighScoreList from './HighScoreList';
import { useState } from 'react';

type SettingsModalProps = {
  closeModal: () => void;
};
export default function SettingsModal({ closeModal }: SettingsModalProps) {
  const [_, setHighscores] = useLocalStorage(
    'tetris-highscores',
    defaultHighscores
  );
  const [showHighScores, setShowHighScores] = useState(false);
  const resetHighScores = () => {
    setHighscores(defaultHighscores);
    setShowHighScores(false);
  };

  return (
    <div className="flex w-[80%] flex-col items-center gap-2 p-2">
      <div className="text-default border-outset relative flex w-[60%] flex-col items-center justify-center gap-1 bg-slate-900 p-2">
        <button
          onClick={closeModal}
          className="absolute inset-0 h-5 w-5 rounded-full p-0.5"
        >
          <X color="#ffffff" className="h-full w-full" />
        </button>
        <div className="mb-2 text-2xl font-bold underline">Settings</div>
        <button onClick={() => setShowHighScores(!showHighScores)}>
          {showHighScores ? 'Hide' : 'Show'} High Scores
        </button>
        <button onClick={resetHighScores}>Reset High Scores</button>
      </div>
      <div className={`w-full origin-top ${showHighScores ? '' : 'hidden'}`}>
        <HighScoreList scoreCount={5} />
      </div>
    </div>
  );
}
