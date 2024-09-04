import { useEffect, useState } from 'react';
import { HighScore, Platform, sortHighScores } from '../../lib/highscores';
import HighScoreList from './HighScoreList';
import useLocalHighZcores from '../../hooks/useHighScoreZtorage';
import { Game } from '../../Tetris';
import { BREAKPOINTS } from '../../App';
import { useBreakpoint } from 'use-breakpoint';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PostHighScoreReqBody } from '../../../netlify/lib/interface';
type HighScoreEntryProps = {
  game: Game;
  displayCount?: number;
};
export default function HighScoreEntry({
  game,
  displayCount: scoreCount = 10,
}: HighScoreEntryProps) {
  const [entering, setEntering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [initials, setInitials] = useState('');
  const [highscores, setHighscores] = useLocalHighZcores();
  const sortedHighscores = sortHighScores(highscores);
  const { breakpoint } = useBreakpoint(BREAKPOINTS);
  const platform: Platform = breakpoint === 'mobile' ? 'MOBILE' : 'DESKTOP';
  //on load initialize entering state
  useEffect(
    /**Entering a new score if:
     * - the score is greater than 0
     * - the game hasnt been entered before (based on timestamp)
     * - the high score is bigger than the lowest one in the list
     */
    () =>
      setEntering(
        game.score > 0 &&
          !sortedHighscores.find(
            (score) => score.gameStartTime === game.startTime
          ) &&
          sortedHighscores[sortedHighscores.length - 1].score < game.score
      ),
    []
  );
  //Database global highscores query
  const queryClient = useQueryClient();
  const dbMutation = useMutation({
    mutationFn: (newHighScore: HighScore) => {
      console.log(`Sending ${newHighScore} to database`);
      const highScorePostBody: PostHighScoreReqBody = {
        highScore: newHighScore,
        platform,
      };
      return fetch(
        `https:bs-tetris.netlify.app/.netlify/functions/postHighScore`,
        {
          method: 'POST',
          body: JSON.stringify(highScorePostBody),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    },
    onSuccess: (res) => {
      console.log('Successfully sent highscore to database', res.body);
      queryClient.invalidateQueries({ queryKey: ['highscores'] });
    },
    onError: (error) => {
      console.log('Error sending highscore to database');
      console.error(error);
    },
  });

  const submitScoreOnClick = () => {
    if (initials.length === 0) {
      setErrorMessage('Enter initials');
      return;
    }
    const newHighScore: HighScore = {
      score: game.score,
      initials,
      gameStartTime: game.startTime,
      linesCleared: game.linesCleared,
    };
    setHighscores((prev) => {
      const newHighscores = [...prev, newHighScore];
      return newHighscores
        .sort((a, b) => b.score - a.score)
        .slice(0, scoreCount);
    });
    dbMutation.mutate(newHighScore);
    setEntering(false);
  };

  return (
    <div className="text-default relative flex w-[80%] flex-col items-center bg-slate-700 text-xl">
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
        <HighScoreList
          scoreCount={scoreCount}
          highlightScore={game.startTime}
        />
      )}
    </div>
  );
}
