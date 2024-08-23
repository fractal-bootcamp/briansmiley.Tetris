import BoardDisplay from './components/BoardDisplay';
import { useEffect, useRef, useState } from 'react';
import {
  Direction,
  boardWithFallingBlock,
  gameInit,
  hardDropBlock,
  holdAndPopHeld,
  rotateBlock,
  shiftBlock,
  startGame,
  tickGameClock,
} from './Tetris';
import ThemeSong from './assets/ThemeSong.mp3';
import { CONFIG } from './TetrisConfig';
import PieceDisplay from './components/PieceDisplay';
import { SwipeEventData, useSwipeable } from 'react-swipeable';
const music = new Audio(ThemeSong);

const cellBorderStyles = ['outset', 'none'];

export default function MobileApp() {
  const [gameState, setGameState] = useState(gameInit());
  const gameStateRef = useRef(gameState);
  const [cellBorderStyleIndex, setCellBorderStyle] = useState(0);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  //Increment game clock every tickInterval ms
  useEffect(() => {
    const tickInterval = setInterval(
      () => setGameState((prevState) => tickGameClock(prevState)),
      CONFIG.CLOCK_TICK_RATE
    );
    return () => clearInterval(tickInterval);
  }, []);

  //disable scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'scroll';
    };
  }, []);

  const [lastShiftSteps, setLastShiftSteps] = useState(0); //how many steps from swipe origin we have shifted the current block
  const PIXELS_PER_SHIFT_STEP = 32; //how many pixels of swiping corresponds to a side shift step
  const handleSwipeStart = () => {
    setLastShiftSteps(0);
  };
  const handleSwiping = (e: SwipeEventData) => {
    const dx = e.deltaX;
    const shiftSteps = Math.floor(dx / PIXELS_PER_SHIFT_STEP);
    if (shiftSteps !== lastShiftSteps) {
      const direction: Direction = shiftSteps > lastShiftSteps ? 'R' : 'L';
      setGameState((prevState) => shiftBlock(prevState, direction));
      setLastShiftSteps(shiftSteps);
    }
  };
  const handleTap = () => {
    setGameState((prevState) => rotateBlock(prevState, 'CW'));
  };
  const handleSwipeDown = () => {
    setGameState((prevState) => hardDropBlock(prevState));
  };
  const handleSwipeUp = () => {
    setGameState((prevState) => holdAndPopHeld(prevState));
  };

  const handlers = useSwipeable({
    onSwiping: handleSwiping,
    onSwipeStart: handleSwipeStart,
    onTap: handleTap,
    onSwipedDown: handleSwipeDown,
    onSwipedUp: handleSwipeUp,
    preventScrollOnSwipe: true,
    delta: { down: 50, up: 50 },
  });
  return (
    <div className="relative flex flex-col items-center overflow-hidden">
      {/* Top bar */}
      <div className="flex w-full items-center justify-between">
        <div className="aspect-square w-1/4 shrink-0 border-r">
          <PieceDisplay piece={gameState.heldShape} text="Held" />
        </div>
        <div className="text-default flex w-full flex-col justify-between self-stretch bg-black px-2 py-2">
          <span>
            Score: {gameState.blocksSpawned === 0 ? '-' : gameState.score}
          </span>
          <span>
            Lines:{' '}
            {gameState.blocksSpawned === 0 ? '-' : gameState.linesCleared}
          </span>
          <span>
            Level: {gameState.blocksSpawned === 0 ? '-' : gameState.level}
          </span>
        </div>
        <div className="aspect-square w-1/4 shrink-0 border-l">
          <PieceDisplay piece={gameState.shapeQueue[0]} text="Next" />
        </div>
      </div>
      {/* Main game board */}
      <div {...handlers} className="w-[80%]">
        <BoardDisplay
          board={boardWithFallingBlock(gameState)}
          cellBorderStyle={cellBorderStyles[cellBorderStyleIndex]}
          classNames="w-full"
        />
      </div>
      {/* Game over modal */}
      {gameState.over && (
        <div className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-slate-900 bg-opacity-80">
          <div className="text-default flex h-full w-full animate-flash flex-col items-center justify-center gap-5 px-8 py-4 text-5xl">
            <span className="">GAME OVER</span>
            <span>Score: {gameState.score}</span>
          </div>
        </div>
      )}
      {/* Startgame modal */}
      {gameState.blocksSpawned === 0 && (
        <button
          className="text-default absolute left-1/2 top-1/2 -translate-x-1/2 border-[10px] border-green-500 bg-slate-900 bg-opacity-80 px-4 py-4"
          style={{ borderStyle: 'inset' }}
          onClick={() => setGameState(startGame(gameState))}
        >
          Start
        </button>
      )}
    </div>
  );
}
