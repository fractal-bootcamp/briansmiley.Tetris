import { HighScore, Platform } from '../../lib/highscores';
import useLocalHighZcores from '../../hooks/useHighScoreZtorage';
import { useQuery } from '@tanstack/react-query';
import { BREAKPOINTS } from '../../App';
import { useBreakpoint } from 'use-breakpoint';
import { useState } from 'react';
import LocalGlobalToggle from './LocalGlobalToggle';
import { Globe } from 'lucide-react';
type HighScoreListProps = {
  scoreCount: number;
  highlightScore?: number;
};

export default function HighScoreList({
  scoreCount,
  highlightScore,
}: HighScoreListProps) {
  const [displayGlobal, setDisplayGlobal] = useState(false);
  const [localHighScores, _] = useLocalHighZcores();
  const { breakpoint } = useBreakpoint(BREAKPOINTS);
  const platform: Platform = breakpoint === 'mobile' ? 'MOBILE' : 'DESKTOP';

  //Database global highscores query
  // const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['highscores', platform],
    queryFn: async () => {
      const response = await fetch(`/getHighScores/${platform}`);
      if (!response.ok) {
        throw new Error('Failed to fetch high scores');
      }
      const data: HighScore[] = await response.json();
      return data;
    },
  });
  const scoreList = displayGlobal ? query.data || [] : localHighScores;
  //Toggles row background in highscore list
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
      className="border-outset text-default relative flex w-full flex-col gap-1 bg-slate-700"
    >
      <div className="absolute right-0 top-0 p-2">
        <LocalGlobalToggle
          displayGlobal={displayGlobal}
          toggleGlobal={() => setDisplayGlobal(!displayGlobal)}
        />
      </div>
      <span className="text-default self-center p-2 text-xl font-semibold underline">
        High Scores
      </span>
      <div className="flex flex-col items-center">
        <div
          className={`text-md relative flex w-full justify-between bg-slate-900 px-3 py-1 font-semibold text-white underline`}
        >
          <span className="basis-1/3">Initials </span>
          <span className="basis-1/3 text-center">Lines</span>
          <span className="basis-1/3 text-end">Score</span>
        </div>
        {displayGlobal && query.isLoading && (
          <Globe size={50} className="mt-3 animate-bounce" />
        )}
        {scoreList.slice(0, scoreCount).map((highscore, index) => (
          <div
            key={index}
            className={`relative flex w-full justify-between px-3 py-1 text-lg ${bgClass(index, highscore)}`}
          >
            <div
              className={`absolute inset-0 z-10 h-full w-full animate-fastFlash bg-blue-500 ${highscore.gameStartTime === highlightScore ? '' : 'hidden'}`}
            />
            <span className="z-20 basis-1/3 text-white">
              {highscore.initials}
            </span>
            <span className="z-20 basis-1/3 text-center text-white">
              {highscore.linesCleared === 0 ? '-' : highscore.linesCleared}
            </span>
            <span className="z-20 basis-1/3 text-end text-white">
              {highscore.score.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
