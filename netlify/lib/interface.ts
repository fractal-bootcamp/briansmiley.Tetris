import { HighScore, Platform } from '../../src/lib/highscores';

export type GetHighScoresReqBody = {
  platform: Platform | 'ALL';
};

export type PostHighScoreReqBody = {
  highScore: HighScore;
  platform: Platform;
};

export type PostHighScoreRes = {
  rank: number;
  newHighScore: HighScore;
} | null;
