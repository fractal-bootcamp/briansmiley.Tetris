import { useEffect, useState } from "react";
import BoardDisplay from "./Board";
import {
  boardWithFallingBlock,
  gameInit,
  hardDropBlock,
  shiftBlock,
  startGame,
  tickGravity
} from "./Tetris";
/** https://medium.com/@paulohfev/problem-solving-custom-react-hook-for-keydown-events-e68c8b0a371 */
const useKeyDown = (callback: (...args: any) => any, keys: string[]) => {
  const onKeyDown = (event: KeyboardEvent) => {
    const wasAnyKeyPressed = keys.some(key => event.key === key);
    if (wasAnyKeyPressed) {
      event.preventDefault();
      callback(event);
    }
  };
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);
};

function App() {
  const [gameClock, setGameClock] = useState(0);
  const [gameState, setGameState] = useState(gameInit());
  const [tickInterval, setTickInterval] = useState(1000); //sets the time between game clock ticks

  //each time the game clock ticks, sets the next tick to happen after a delay set by the current value of tickInterval
  useEffect(() => {
    const tickTimeout = setTimeout(
      () => setGameClock(gameClock + 1),
      tickInterval
    );
    return () => clearTimeout(tickTimeout);
  }, [gameClock]);
  useEffect(() => {
    setGameState(tickGravity(gameState));
  }, [gameClock]);
  useKeyDown(() => setGameState(shiftBlock(gameState, "L")), ["a"]);
  useKeyDown(() => setGameState(shiftBlock(gameState, "R")), ["d"]);
  useKeyDown(() => setGameState(shiftBlock(gameState, "D")), ["s"]);
  useKeyDown(() => setGameState(hardDropBlock(gameState)), [" "]);
  return (
    <>
      <div className="flex flex-col">
        <BoardDisplay board={boardWithFallingBlock(gameState)} />
        <div className="flex justify-center">
          <button
            className="btn"
            onClick={() => setGameState(startGame(gameState))}
          >
            Start
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
