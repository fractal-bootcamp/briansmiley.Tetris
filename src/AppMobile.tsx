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
import { CONFIG } from './TetrisConfig';
import PieceDisplay from './components/PieceDisplay';
import { SwipeEventData, useSwipeable } from 'react-swipeable';

const cellBorderStyles = ['outset', 'none'];

export default function MobileApp() {
  const [gameState, setGameState] = useState(gameInit());
  const gameStateRef = useRef(gameState);
  const [cellBorderStyleIndex] = useState(0);
  const [softDropping, setSoftDropping] = useState(false);
  const softDroppingRef = useRef(softDropping);
  const [lastShiftSteps, setLastShiftSteps] = useState(0); //how many steps from swipe origin we have shifted the current block
  const [swipeStart, setSwipeStart] = useState(0);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  useEffect(() => {
    softDroppingRef.current = softDropping;
  }, [softDropping]);

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

  //setup polling for softdrop
  useEffect(() => {
    const softDropInterval = setInterval(() => {
      if (softDroppingRef.current) {
        setGameState((prevState) => shiftBlock(prevState, 'D'));
      }
    }, CONFIG.POLL_RATES.shift);
    return () => clearInterval(softDropInterval);
  }, []);
  const PIXELS_PER_SHIFT_STEP = 32; //how many pixels of swiping corresponds to a side shift step
  const Y_SHIFT_WINDOW = 50; //how far down a swipe can go before it stops shifting side to side (prevents accidental sideswiping while dropping )
  const handleSwipeStart = () => {
    setLastShiftSteps(0);
    setSwipeStart(Date.now());
  };
  const handleSwipeEnd = () => {
    setSwipeStart(0);
    setLastShiftSteps(0);
  };
  const handleSwiping = (e: SwipeEventData) => {
    const dx = e.deltaX;
    const dy = e.deltaY;
    const shiftSteps = Math.floor(dx / PIXELS_PER_SHIFT_STEP);
    if (shiftSteps !== lastShiftSteps && Math.abs(dy) < Y_SHIFT_WINDOW) {
      const direction: Direction = shiftSteps > lastShiftSteps ? 'R' : 'L';
      setGameState((prevState) => shiftBlock(prevState, direction));
      setLastShiftSteps(shiftSteps);
    }
  };
  const handleTap = () => {
    setGameState((prevState) => rotateBlock(prevState, 'CW'));
  };
  const handleSwipeDown = () => {
    const swipeDuration = Date.now() - swipeStart;
    if (swipeDuration > 500) return;
    setGameState((prevState) => hardDropBlock(prevState));
  };
  const handleSwipeUp = () => {
    const swipeDuration = Date.now() - swipeStart;
    if (swipeDuration > 500) return;
    if (!gameState.allowedInputs.hold) return;
    setGameState((prevState) => holdAndPopHeld(prevState));
  };

  const handlers = useSwipeable({
    onSwiped: handleSwipeEnd,
    onSwiping: handleSwiping,
    onSwipeStart: handleSwipeStart,
    onTap: handleTap,
    onSwipedDown: handleSwipeDown,
    onSwipedUp: handleSwipeUp,
    preventScrollOnSwipe: false,
    delta: 50,
  });

  return (
    <>
      <div
        className="relative z-20 flex flex-col items-center overflow-hidden"
        onContextMenu={(e) => e.preventDefault()}
      >
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
        <div {...handlers} className="w-[70%]">
          <BoardDisplay
            board={boardWithFallingBlock(gameState)}
            cellBorderStyle={cellBorderStyles[cellBorderStyleIndex]}
            classNames="w-full"
          />
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
        {/* Game over modal */}
        {gameState.over && (
          <div className="absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center bg-slate-900 bg-opacity-80">
            <div className="text-default flex w-full animate-flash flex-col items-center justify-center gap-5 px-8 py-4 text-5xl">
              <span className="">GAME OVER</span>
              <span>Score: {gameState.score}</span>
            </div>
            <button
              onClick={() => setGameState(startGame(gameState))}
              style={{ borderStyle: 'inset' }}
              className="text-default mt-4 border-[8px] border-green-500 bg-slate-900 bg-opacity-80 px-4 py-4"
            >
              Restart
            </button>
          </div>
        )}
      </div>
      <div
        className="absolute bottom-0 z-30 h-1/5 w-full bg-transparent"
        // soft drop while touching this div
        onTouchStart={() => setSoftDropping(true)}
        onTouchEnd={() => setSoftDropping(false)}
        onContextMenu={(e) => e.preventDefault()}
      />
      <div className="absolute bottom-0 z-0 h-1/5 w-full bg-slate-500 bg-opacity-80" />
    </>
  );
}
