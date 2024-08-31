import { HighScore } from '../data';
import useLocalHighZcores from '../hooks/useHighScoreZtorage';

type HighScoreListProps = {
  scoreCount: number;
  highlightScore?: number;
};
export default function HighScoreList({
  scoreCount,
  highlightScore,
}: HighScoreListProps) {
  const [highscores, _] = useLocalHighZcores();

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
      className="border-outset text-default flex w-[85%] flex-col gap-1 bg-slate-700"
    >
      <span className="text-default self-center p-2 text-2xl font-semibold underline">
        High Scores
      </span>
      <div className="flex flex-col">
        <div
          className={`relative flex justify-between bg-slate-900 px-3 py-1 font-semibold text-white underline`}
        >
          <span className="basis-1/3">Initials </span>
          <span className="basis-1/3 text-center">Lines</span>
          <span className="basis-1/3 text-end">Score</span>
        </div>
        {highscores.slice(0, scoreCount).map((highscore, index) => (
          <div
            key={index}
            className={`relative flex justify-between px-3 py-1 ${bgClass(index, highscore)}`}
          >
            <div
              className={`animate-fastFlash absolute inset-0 z-10 h-full w-full bg-blue-500 ${highscore.gameStartTime === highlightScore ? '' : 'hidden'}`}
            />
            <span className="z-20 basis-1/3 text-white">
              {highscore.initials}
            </span>
            <span className="z-20 basis-1/3 text-center text-white">
              {highscore.linesCleared}
            </span>
            <span className="z-20 basis-1/3 text-end text-white">
              {highscore.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
