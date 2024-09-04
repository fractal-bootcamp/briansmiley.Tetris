import { Context } from '@netlify/functions';
import { PostHighScoreReqBody, PostHighScoreRes } from '../../lib/interface';
import controller from '../../lib/controller';

export default async (request: Request, context: Context) => {
  const body: PostHighScoreReqBody = await request.json();
  console.log(`Posting high score ${body.highScore}`);
  const { highScore, platform } = body;
  let resBody: PostHighScoreRes;
  try {
    const highScoreDbPostResponse: PostHighScoreRes =
      await controller.postHighScore(highScore, platform);
    resBody = highScoreDbPostResponse;
    return new Response(JSON.stringify(highScoreDbPostResponse), {
      status: 200,
    });
  } catch (error) {
    return new Response(null, { status: 500 });
  }
};
