import { useEffect, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import {
  defaultHighscores,
  HIGHSCORES_LOCALSTORAGE_KEY,
  sortHighScores,
} from '../data';
import HighScoreList from './HighScoreList';

type HighScoreEntryProps = {
  score: number;
  gameStartTime: number;
  displayCount?: number;
};
export default function HighScoreEntry({
  score,
  gameStartTime,
  displayCount: scoreCount = 10,
}: HighScoreEntryProps) {
  const [entering, setEntering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [initials, setInitials] = useState('');
  const [highscores, setHighscores] = useLocalStorage(
    HIGHSCORES_LOCALSTORAGE_KEY,
    defaultHighscores
  );
  const sortedHighscores = sortHighScores(highscores);
  //on load initialize entering state
  useEffect(
    /**Entering a new score if:
     * - the score is greater than 0
     * - the game hasnt been entered before (based on timestamp)
     * - the high score is bigger than the lowest one in the list
     */
    () =>
      setEntering(
        score > 0 &&
          !sortedHighscores.find(
            (score) => score.gameStartTime === gameStartTime
          ) &&
          sortedHighscores[sortedHighscores.length - 1].score < score
      ),
    []
  );

  const submitScoreOnClick = () => {
    if (initials.length === 0) {
      setErrorMessage('Enter initials');
      return;
    }
    setHighscores((prev) => {
      const newHighscores = [...prev, { score, initials, gameStartTime }];
      return newHighscores
        .sort((a, b) => b.score - a.score)
        .slice(0, scoreCount);
    });
    setEntering(false);
  };

  return (
    <div className="text-default relative w-[80%] bg-slate-700 text-xl">
      {/* New Score Entry */}
      {entering ? (
        <div className="flex flex-col gap-1 p-2">
          <span className="self-center">New High Score!</span>
          <input
            type="text"
            maxLength={3}
            placeholder="Enter Initials"
            value={initials}
            className="border bg-slate-900 p-2 text-center text-white"
            onChange={(e) => {
              setErrorMessage('');
              setInitials(e.target.value.toUpperCase());
            }}
          />
          <span className="text-lg text-red-500">{errorMessage}</span>
          <button
            className="btn active-outset self-center"
            onClick={submitScoreOnClick}
          >
            Submit
          </button>
        </div>
      ) : (
        <HighScoreList scoreCount={scoreCount} />
      )}
    </div>
  );
}
