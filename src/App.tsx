import { useEffect, useState } from "react";
import BoardDisplay from "./Board";
import {
  boardWithFallingBlock,
  gameInit,
  startGame,
  tickGravity
} from "./Tetris";

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
