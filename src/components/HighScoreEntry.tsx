import { useEffect, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
const defaultHighscores: HighScore[] = [
  { score: 2000, initials: 'DEF' },
  { score: 4000, initials: 'DEF' },
  { score: 6000, initials: 'DEF' },
  { score: 8000, initials: 'DEF' },
  { score: 10000, initials: 'DEF' },
  { score: 12000, initials: 'DEF' },
  { score: 14000, initials: 'DEF' },
  { score: 16000, initials: 'DEF' },
  { score: 18000, initials: 'DEF' },
  { score: 20000, initials: 'DEF' },
];
type HighScore = {
  score: number;
  initials: string;
};
type HighScoreEntryProps = {
  score: number;
  displayCount?: number;
};
export default function HighScoreEntry({
  score,
  displayCount: scoreCount = 10,
}: HighScoreEntryProps) {
  const [entering, setEntering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [initials, setInitials] = useState('');
  const [highscores, setHighscores] = useLocalStorage<HighScore[]>(
    'tetris-highscores',
    defaultHighscores
  );
  const sortedHighscores = highscores.sort((a, b) => b.score - a.score);
  //on load initialize entering state
  useEffect(
    () =>
      setEntering(
        score > 0 &&
          (sortedHighscores.length < 6 ||
            sortedHighscores[sortedHighscores.length - 1].score < score)
      ),
    []
  );

  const submitScoreOnClick = () => {
    if (initials.length === 0) {
      setErrorMessage('Enter initials');
      return;
    }
    setHighscores((prev) => {
      const newHighscores = [...prev, { score, initials }];
      return newHighscores
        .sort((a, b) => b.score - a.score)
        .slice(0, scoreCount);
    });
    setEntering(false);
  };

  return (
    <div className="border-inset text-default relative w-[80%] bg-slate-700 text-xl">
      {/* New Score Entry */}
      {entering ? (
        <div className="flex flex-col gap-1 p-2">
          <span className="self-center">New High Score!</span>
          <input
            type="text"
            maxLength={3}
            placeholder="Enter Initials"
            value={initials}
            className="border bg-slate-900 p-2 text-white"
            onChange={(e) => {
              setErrorMessage('');
              setInitials(e.target.value.toUpperCase());
            }}
          />
          <span className="text-lg text-red-500">{errorMessage}</span>
          <button className="btn self-center" onClick={submitScoreOnClick}>
            Submit
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="self-center p-2">High Scores</span>
          <div className="flex flex-col">
            {sortedHighscores.slice(0, scoreCount).map((highscore, index) => (
              <div
                key={index}
                className={`flex justify-between px-3 py-1 ${index % 2 ? 'bg-slate-800' : 'bg-slate-900'}`}
              >
                <span className="text-white">{highscore.initials}</span>
                <span className="text-white">{highscore.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
