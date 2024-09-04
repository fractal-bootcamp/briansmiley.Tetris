import prisma from '../../src/client';
import { HighScore, Platform } from '../../src/lib/highscores';
import { HighScore as DbHighScore } from '@prisma/client';
const mutations = {
  post: async (newHighScore: HighScore, platform: Platform) => {
    const topScores = await prisma.highScore.findMany({
      where: { platform: platform },
      orderBy: { score: 'desc' },
      take: 100,
    });
    console.log(`Retrieved ${topScores.length} top scores`);

    const rank =
      topScores.findIndex((highscore) => highscore.score < newHighScore.score) +
      1;
    if (rank === -1) return null;
    const dbRes = await prisma.highScore.create({
      data: {
        score: newHighScore.score,
        initials: newHighScore.initials,
        gameStartTime: newHighScore.gameStartTime,
        linesCleared: newHighScore.linesCleared,
        platform: platform,
      },
    });

    return { rank, newDbHighScore: dbRes };
  },
};
const queries = {
  getAll: async () => {
    const dbRes = await prisma.highScore.findMany({
      orderBy: {
        score: 'desc',
      },
    });
    return dbRes;
  },
  getAllByPlatform: async (platform: Platform) => {
    const dbRes = await prisma.highScore.findMany({
      where: {
        platform: platform,
      },
      orderBy: {
        score: 'desc',
      },
    });
    return dbRes;
  },
};

const transformHighScore = (highScore: DbHighScore): HighScore => ({
  score: highScore.score,
  initials: highScore.initials,
  gameStartTime: highScore.gameStartTime,
  linesCleared: highScore.linesCleared,
});
type IHighScoreService = {
  /**Returns the rank of the new highscore if it is inserted, and null if it didnt make the cut */
  post: (
    highScore: HighScore,
    platform: Platform
  ) => Promise<{ rank: number; newHighScore: HighScore } | null>;
  /**Returns all highscores */
  getAll: () => Promise<HighScore[]>;
  /**Returns all highscores for a specific platform */
  getAllByPlatform: (platform: Platform) => Promise<HighScore[]>;
};
const highScoreService = (): IHighScoreService => ({
  post: async (highScore: HighScore, platform: Platform) => {
    const dbRes = await mutations.post(highScore, platform);
    if (dbRes === null) return null;
    const newHighScore = transformHighScore(dbRes.newDbHighScore);
    return { rank: dbRes.rank, newHighScore };
  },
  getAll: async () => {
    return (await queries.getAll()).map(transformHighScore);
  },
  getAllByPlatform: async (platform: Platform) => {
    return (await queries.getAllByPlatform(platform)).map(transformHighScore);
  },
});

export default highScoreService;