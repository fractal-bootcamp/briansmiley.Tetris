import { HighScore, Platform } from '../../src/lib/highscores';
import highScoreService from './highScoreService';

const controller = {
  postHighScore: (highscore: HighScore, platform: Platform) => {
    console.log('controller posting to db');
    return highScoreService().post(highscore, platform);
  },
  getHighScores: highScoreService().getAll,
  getHighScoresByPlatform: highScoreService().getAllByPlatform,
};

export default controller;
