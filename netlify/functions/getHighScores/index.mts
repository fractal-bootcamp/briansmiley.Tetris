import { Config, Context } from '@netlify/functions';
import controller from '../../lib/controller';
import { PlatformSchema } from '../../../src/lib/highscores';
import { z } from 'zod';

const requestablePlatformSchema = z.union([PlatformSchema, z.literal('ALL')]);
export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const { success, data } = requestablePlatformSchema.safeParse(
    context.params.platform
  );
  if (!success) {
    return new Response(
      JSON.stringify({ error: 'Bad request; platform specified incorrectly' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  const platform = data;
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

export const config: Config = {
  path: '/getHighScores/:platform',
};
