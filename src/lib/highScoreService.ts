import prisma from '../client';
import { HighScore, Platform } from './highscores';

const mutations = {
  post: async (highScore: HighScore, platform: Platform) => {
    const dbRes = await prisma.highScore.create({
      data: {
        score: highScore.score,
        initials: highScore.initials,
        gameStartTime: highScore.gameStartTime,
        linesCleared: highScore.linesCleared,
        platform: platform,
      },
    });
    return dbRes;
  },
};
const queries = {
  getAll: async () => {
    const dbRes = await prisma.highScore.findMany();
    return dbRes;
  },
  getAllByPlatform: async (platform: Platform) => {
    const dbRes = await prisma.highScore.findMany({
      where: {
        platform: platform,
      },
    });
    return dbRes;
  },
};

const highScoreService = () => ({
  post: async (highScore: HighScore, platform: Platform) => {
    return mutations.post(highScore, platform);
  },
  getAll: async () => {
    return queries.getAll();
  },
  getAllByPlatform: async (platform: Platform) => {
    return queries.getAllByPlatform(platform);
  },
});

export default highScoreService;
