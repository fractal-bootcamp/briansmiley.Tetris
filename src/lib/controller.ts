import highScoreService from './highScoreService';

const controller = {
  postHighScore: highScoreService().post,
  getHighScores: highScoreService().getAll,
  getHighScoresByPlatform: highScoreService().getAllByPlatform,
};

export default controller;
