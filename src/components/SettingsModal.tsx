import { defaultHighscores } from '../lib/highscores';
import useLocalStorage from '../hooks/useLocalStorage';
import HighScoreList from './HighScores/HighScoreList';
import { useState } from 'react';
import ControlsInfo from './ControlsInfo';
import { Game } from '../Tetris';
import ScoringInfo from './ScoringInfo';

type SubDisplay = 'highscores' | 'controls' | 'scoring' | 'none';
type SettingsModalProps = {
  closeSettings: () => void;
  restartGame: () => void;
  gameState: Game;
};
export default function SettingsModal({
  closeSettings,
  restartGame,
  gameState,
}: SettingsModalProps) {
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
    <div className="flex w-full flex-col items-center gap-5 p-2">
      <div
        className="text-default border-outset relative flex w-[70%] flex-col items-center justify-center gap-3 bg-slate-900 p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={` ${subDisplay === 'none' ? 'text-2xl' : 'text-lg'} font-bold underline`}
        >
          Settings
        </div>
        <div
          className={`flex flex-col gap-3 ${subDisplay === 'none' ? 'text-lg' : 'text-md'} `}
        >
          <button onClick={toggleSubDisplay('controls')}>
            {' '}
            {subDisplay === 'controls' ? 'Hide' : 'Show'} Controls
          </button>
          <button onClick={toggleSubDisplay('scoring')}>
            {subDisplay === 'scoring' ? 'Hide' : 'Show'} Scoring
          </button>
          {gameState.blocksSpawned > 0 && (
            <button
              onClick={() => {
                closeSettings();
                restartGame();
              }}
            >
              Restart Game
            </button>
          )}
          <button onClick={toggleSubDisplay('highscores')}>
            {subDisplay === 'highscores' ? 'Hide' : 'Show'} High Scores
          </button>
          <button onClick={resetHighScores}>Reset High Scores</button>
        </div>
      </div>
      <div
        className={`flex w-full origin-top items-center justify-center ${subDisplay === 'controls' ? '' : 'hidden'}`}
      >
        <ControlsInfo />
      </div>
      <div
        className={`flex w-[90%] origin-top flex-col items-center ${subDisplay === 'highscores' ? '' : 'hidden'}`}
      >
        <HighScoreList scoreCount={5} highlightScore={gameState.startTime} />
      </div>
      <div
        className={`flex w-[90%] origin-top flex-col items-center ${subDisplay === 'scoring' ? '' : 'hidden'}`}
      >
        <ScoringInfo />
      </div>
    </div>
  );
}
