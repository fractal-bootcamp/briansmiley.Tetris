import { useState } from 'react';
import {
  createHighScore,
  defaultHighscores,
  HighScore,
  HIGHSCORES_LOCALSTORAGE_KEY,
  HighScoreSchema,
} from '../lib/highscores';

type HighScoreState = [
  HighScore[],
  (
    valueOrCallback: HighScore[] | ((prevValue: HighScore[]) => HighScore[])
  ) => void,
];
const useLocalHighZcores = (): HighScoreState => {
  const [highscoresState, setHighscoresState] = useState<HighScore[]>(() => {
    const existingLocalStorage =
      window.localStorage.getItem(HIGHSCORES_LOCALSTORAGE_KEY) || '{}';
    const parsedLocalStorage = JSON.parse(existingLocalStorage);
    const fullCheck = HighScoreSchema.array().safeParse(parsedLocalStorage);
    //if the local storage passes the full schema check, use that as the initial state
    if (fullCheck.success) return fullCheck.data;
    //if not, check if it passes the partial schema check (e.g. outdated incomplete highscores)
    const { success, data } = HighScoreSchema.partial()
      .required({
        score: true,
        initials: true,
      })
      .array()
      .safeParse(parsedLocalStorage);

    //if partial schema check fails, write default values to local storage and use that as the initial state
    if (!success) {
      window.localStorage.setItem(
        HIGHSCORES_LOCALSTORAGE_KEY,
        JSON.stringify(defaultHighscores)
      );
      return defaultHighscores;
    }
    // if the partial check passes, map through createHighScore and use that
    const completedHighscores = data.map(createHighScore);
    window.localStorage.setItem(
      HIGHSCORES_LOCALSTORAGE_KEY,
      JSON.stringify(completedHighscores)
    );
    return completedHighscores;
  });

  const setHighScores = (
    valueOrCallback: HighScore[] | ((prevValue: HighScore[]) => HighScore[])
  ) => {
    setHighscoresState((prevValue) => {
      const newValue =
        valueOrCallback instanceof Function
          ? valueOrCallback(prevValue)
          : valueOrCallback;
      window.localStorage.setItem(
        HIGHSCORES_LOCALSTORAGE_KEY,
        JSON.stringify(newValue)
      );
      return newValue;
    });
  };
  return [highscoresState, setHighScores];
};

export default useLocalHighZcores;
