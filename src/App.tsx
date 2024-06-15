import { useEffect, useState } from "react";
import BoardDisplay from "./Board";
import { gameInit, startGame } from "./Tetris";

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
    return clearTimeout(tickTimeout);
  }, [gameClock]);
  return (
    <>
      <BoardDisplay board={gameState.board} />
      <button onClick={() => startGame(gameState)}>Start</button>
    </>
  );
}

export default App;
