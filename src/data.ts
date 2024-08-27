export const HIGHSCORES_LOCALSTORAGE_KEY = 'tetris-highscores';
export type HighScore = {
  score: number;
  initials: string;
};
export const defaultHighscores: HighScore[] = [
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
