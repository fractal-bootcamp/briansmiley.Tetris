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
  { score: 2000, initials: '---', gameStartTime: 0, linesCleared: 20 },
  { score: 1800, initials: '---', gameStartTime: 0, linesCleared: 18 },
  { score: 1600, initials: '---', gameStartTime: 0, linesCleared: 16 },
  { score: 1400, initials: '---', gameStartTime: 0, linesCleared: 14 },
  { score: 1200, initials: '---', gameStartTime: 0, linesCleared: 12 },
  { score: 1000, initials: '---', gameStartTime: 0, linesCleared: 10 },
  { score: 800, initials: '---', gameStartTime: 0, linesCleared: 8 },
  { score: 600, initials: '---', gameStartTime: 0, linesCleared: 6 },
  { score: 400, initials: '---', gameStartTime: 0, linesCleared: 4 },
  { score: 200, initials: '---', gameStartTime: 0, linesCleared: 2 },
];

export const sortHighScores = (highscores: HighScore[]) => {
  const ret = [...highscores];
  ret.sort((a, b) =>
    a.score === b.score ? a.gameStartTime - b.gameStartTime : b.score - a.score
  );
  return ret;
};
