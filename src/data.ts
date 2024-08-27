export const HIGHSCORES_LOCALSTORAGE_KEY = 'tetris-highscores';
export type HighScore = {
  score: number;
  gameStartTime: number;
  initials: string;
};
export const defaultHighscores: HighScore[] = [
  { score: 2000, initials: '---', gameStartTime: 0 },
  { score: 4000, initials: '---', gameStartTime: 0 },
  { score: 6000, initials: '---', gameStartTime: 0 },
  { score: 8000, initials: '---', gameStartTime: 0 },
  { score: 10000, initials: '---', gameStartTime: 0 },
  { score: 12000, initials: '---', gameStartTime: 0 },
  { score: 14000, initials: '---', gameStartTime: 0 },
  { score: 16000, initials: '---', gameStartTime: 0 },
  { score: 18000, initials: '---', gameStartTime: 0 },
  { score: 20000, initials: '---', gameStartTime: 0 },
];
