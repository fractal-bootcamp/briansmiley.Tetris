import { defaultHighscores, HIGHSCORES_LOCALSTORAGE_KEY } from '../data';
import useLocalStorage from '../hooks/useLocalStorage';

type HighScoreListProps = {
  scoreCount: number;
};
export default function HighScoreList({ scoreCount }: HighScoreListProps) {
  const [highscores, _] = useLocalStorage(
    HIGHSCORES_LOCALSTORAGE_KEY,
    defaultHighscores
  );
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="border-outset text-default flex w-full flex-col gap-1 bg-slate-700"
    >
      <span className="text-default self-center p-2 text-2xl font-semibold underline">
        High Scores
      </span>
      <div className="flex flex-col">
        {highscores.slice(0, scoreCount).map((highscore, index) => (
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
  );
}
