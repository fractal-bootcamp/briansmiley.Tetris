import { Context } from '@netlify/functions';
import { HighScore } from '@prisma/client';
import controller from '../../lib/controller';
import { Platform } from '../../../src/lib/highscores';
import { GetHighScoresReqBody } from '../../lib/interface';

export default async (req: Request, context: Context) => {
  const body: GetHighScoresReqBody = await req.json();
  const platform = body.platform;
  try {
    const highScores =
      platform === 'ALL'
        ? await controller.getHighScores()
        : await controller.getHighScoresByPlatform(platform);
    return new Response(JSON.stringify(highScores), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
