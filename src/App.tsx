import { useEffect, useState } from "react";
import BoardDisplay from "./components/Board";
import {
  Game,
  allowInput,
  boardWithFallingBlock,
  forbidInput,
  gameInit,
  hardDropBlock,
  rotateBlock,
  shiftBlock,
  startGame,
  tickGravity
} from "./Tetris";
import useKeyDown from "./hooks/useKeyDown";
/** https://medium.com/@paulohfev/problem-solving-custom-react-hook-for-keydown-events-e68c8b0a371 */

function App() {
  const [gameClock, setGameClock] = useState(0);
  const [gameState, setGameState] = useState(gameInit());

  //each time the game clock ticks, sets the next tick to happen after a delay set by the current value of tickInterval
  useEffect(() => {
    // if (gameState.over) return; //stop ticking if the game ends
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

  const handleInput = (newGameState: Game) => {
    if (gameState.over || gameState.inputForbidden) return;
    setGameState(forbidInput(newGameState));
    setTimeout(
      () => setGameState(game => allowInput(game)),
      gameState.CONFIG.INPUT_REPEAT_DELAY
    );
  };

  //prettier-ignore
  {
  useKeyDown(() => handleInput(shiftBlock(gameState, "L")), ["a","ArrowLeft"]);
  useKeyDown(() => handleInput(shiftBlock(gameState, "L")), ["a","ArrowLeft"]);
  useKeyDown(() => handleInput(shiftBlock(gameState, "R")), ["d","ArrowRight"]);
  useKeyDown(() => handleInput(shiftBlock(gameState, "D")), ["s","ArrowDown"]);
  useKeyDown(() => handleInput(hardDropBlock(gameState)), [" "]);
  useKeyDown(() => handleInput(rotateBlock(gameState, "CW")), ["w","ArrowUp"]);
  useKeyDown(() => handleInput(rotateBlock(gameState, "CCW")), ["e"]);
  }
  return (
    <>
      <div className="m-2 flex flex-col items-center gap-2 ">
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
