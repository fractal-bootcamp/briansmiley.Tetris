import {
  defaultHighscores,
  HighScore,
  HIGHSCORES_LOCALSTORAGE_KEY,
} from '../data';
import useLocalStorage from '../hooks/useLocalStorage';

type HighScoreListProps = {
  scoreCount: number;
  highlightScore?: number;
};
export default function HighScoreList({
  scoreCount,
  highlightScore,
}: HighScoreListProps) {
  const [highscores, _] = useLocalStorage(
    HIGHSCORES_LOCALSTORAGE_KEY,
    defaultHighscores
  );

  const bgClass = (index: number, highscore: HighScore) => {
    if (highlightScore && highscore.gameStartTime === highlightScore) {
      return 'bg-blue-600';
    }
    if (index % 2 === 0) {
      return 'bg-slate-800';
    }
    return 'bg-slate-900';
  };
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
            className={`relative flex justify-between px-3 py-1 ${bgClass(index, highscore)}`}
          >
            <div
              className={`animate-fastFlash absolute inset-0 z-10 h-full w-full bg-blue-500 ${highscore.gameStartTime === highlightScore ? '' : 'hidden'}`}
            />
            <span className="z-20 text-white">{highscore.initials}</span>
            <span className="z-20 text-white">{highscore.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
