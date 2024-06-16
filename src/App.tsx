import { useEffect, useState } from "react";
import BoardDisplay from "./Board";
import {
  boardWithFallingBlock,
  gameInit,
  hardDropBlock,
  rotateBlock,
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

  //each time the game clock ticks, sets the next tick to happen after a delay set by the current value of tickInterval
  useEffect(() => {
    if (gameState.over) return; //stop ticking if the game ends
    const tickTimeout = setTimeout(
      () => setGameClock(gameClock + 1),
      gameState.tickInterval
    );
    return () => clearTimeout(tickTimeout);
  }, [gameClock]);
  //call tick gravity every tick of the game clock
  useEffect(() => {
    setGameState(tickGravity(gameState));
  }, [gameClock]);
  //prettier-ignore
  {
  useKeyDown(() => !gameState.over && setGameState(shiftBlock(gameState, "L")), ["a","ArrowLeft"]);
  useKeyDown(() => !gameState.over && setGameState(shiftBlock(gameState, "R")), ["d","ArrowRight"]);
  useKeyDown(() => !gameState.over && setGameState(shiftBlock(gameState, "D")), ["s","ArrowDown"]);
  useKeyDown(() => !gameState.over && setGameState(hardDropBlock(gameState)), [" "]);
  useKeyDown(() => !gameState.over && setGameState(rotateBlock(gameState, "CW")), ["w","ArrowUp"]);
  useKeyDown(() => !gameState.over && setGameState(rotateBlock(gameState, "CCW")), ["e"]);
  }
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
