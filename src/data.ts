export const HIGHSCORES_LOCALSTORAGE_KEY = 'tetris-highscores';
import { z } from 'zod';

//values to fill in when old highscores are missing details added to the schema
export const defaultValues = {
  score: 0,
  initials: '---',
  gameStartTime: 0,
  linesCleared: 0,
};

export const HighScoreSchema = z.object({
  score: z.number().int().nonnegative(),
  gameStartTime: z.number().int(),
  initials: z.string().min(1).max(3),
  linesCleared: z.number().int().nonnegative(),
});

export type HighScore = z.infer<typeof HighScoreSchema>;

export const createHighScore = (
  partialHighScore: Partial<HighScore>
): HighScore => {
  return HighScoreSchema.parse({
    ...defaultValues,
    ...partialHighScore,
  });
};

export const defaultHighscores: HighScore[] = [
  { score: 20000, initials: '---', gameStartTime: 0, linesCleared: 200 },
  { score: 18000, initials: '---', gameStartTime: 0, linesCleared: 180 },
  { score: 16000, initials: '---', gameStartTime: 0, linesCleared: 160 },
  { score: 14000, initials: '---', gameStartTime: 0, linesCleared: 140 },
  { score: 12000, initials: '---', gameStartTime: 0, linesCleared: 120 },
  { score: 10000, initials: '---', gameStartTime: 0, linesCleared: 100 },
  { score: 8000, initials: '---', gameStartTime: 0, linesCleared: 80 },
  { score: 6000, initials: '---', gameStartTime: 0, linesCleared: 60 },
  { score: 4000, initials: '---', gameStartTime: 0, linesCleared: 40 },
  { score: 2000, initials: '---', gameStartTime: 0, linesCleared: 20 },
];

export const sortHighScores = (highscores: HighScore[]) => {
  const ret = [...highscores];
  ret.sort((a, b) =>
    a.score === b.score ? a.gameStartTime - b.gameStartTime : b.score - a.score
  );
  return ret;
};
