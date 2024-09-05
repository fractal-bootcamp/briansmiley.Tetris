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
export const PlatformSchema = z.enum(['MOBILE', 'DESKTOP']);
export type Platform = z.infer<typeof PlatformSchema>;

export const createHighScore = (
  partialHighScore: Partial<HighScore>
): HighScore => {
  return HighScoreSchema.parse({
    ...defaultValues,
    ...partialHighScore,
  });
};

export const defaultHighscores: HighScore[] = [
  { score: 3750, initials: '---', gameStartTime: 0, linesCleared: 50 },
  { score: 3375, initials: '---', gameStartTime: 0, linesCleared: 45 },
  { score: 3000, initials: '---', gameStartTime: 0, linesCleared: 40 },
  { score: 2625, initials: '---', gameStartTime: 0, linesCleared: 35 },
  { score: 2250, initials: '---', gameStartTime: 0, linesCleared: 30 },
  { score: 1875, initials: '---', gameStartTime: 0, linesCleared: 25 },
  { score: 1500, initials: '---', gameStartTime: 0, linesCleared: 20 },
  { score: 1125, initials: '---', gameStartTime: 0, linesCleared: 15 },
  { score: 750, initials: '---', gameStartTime: 0, linesCleared: 10 },
  { score: 300, initials: '---', gameStartTime: 0, linesCleared: 4 },
];

export const sortHighScores = (highscores: HighScore[]) => {
  const ret = [...highscores];
  ret.sort((a, b) =>
    a.score === b.score ? a.gameStartTime - b.gameStartTime : b.score - a.score
  );
  return ret;
};
