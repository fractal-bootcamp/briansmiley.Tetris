import BoardDisplay from './components/BoardDisplay';
import { useEffect, useRef, useState } from 'react';
import {
  Direction,
  boardWithFallingBlock,
  gameInit,
  hardDropBlock,
  holdAndPopHeld,
  pauseGame,
  rotateBlock,
  shiftBlock,
  tickGameClock,
  unpauseGame,
} from './Tetris';
import { CONFIG } from './TetrisConfig';
import PieceDisplay from './components/PieceDisplay';
import { SwipeEventData, useSwipeable } from 'react-swipeable';
import HighScoreEntry from './components/HighScores/HighScoreEntry';
import SettingsModal from './components/SettingsModal';
import { Settings } from 'lucide-react';

const cellBorderStyles = ['outset', 'none'];
const config = { ...CONFIG, WALLS: false };
export default function MobileApp() {
  const [gameState, setGameState] = useState(gameInit(config));
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [cellBorderStyleIndex] = useState(0);
  const softDroppingRef = useRef(false);
  const [lastShiftSteps, setLastShiftSteps] = useState(0); //how many steps from swipe origin we have shifted the current block
  const [swipeStart, setSwipeStart] = useState(0);

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

  //setup polling for softdrop; if player is touching the softdrop bottom div, shift block down at a set rate
  useEffect(() => {
    const softDropInterval = setInterval(() => {
      if (softDroppingRef.current) {
        setGameState((prevState) => shiftBlock(prevState, 'D'));
      }
    }, CONFIG.POLL_RATES.shift);
    return () => clearInterval(softDropInterval);
  }, []);
  const PIXELS_PER_SHIFT_STEP = 32; //how many pixels of swiping corresponds to a side shift step
  const Y_SHIFT_WINDOW = 20; //how far down a swipe can go before it stops shifting side to side (prevents accidental sideswiping while dropping )
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
    const shiftSteps = Math.floor(dx / PIXELS_PER_SHIFT_STEP); //how many steps from swipe origin we have moved in the current swipe
    //perform a shift whenever we cross a multiple of pixelsPerShiftStep, comparing to whatever threshhold we were last at,
    //and stopping side-shifting if our delta-y gets large enough that we stop considering this a side-swipe
    if (shiftSteps !== lastShiftSteps && Math.abs(dy) < Y_SHIFT_WINDOW) {
      const direction: Direction = shiftSteps > lastShiftSteps ? 'R' : 'L';
      setGameState((prevState) => shiftBlock(prevState, direction));
      setLastShiftSteps(shiftSteps); //keep track of current displacement bucket
    }
  };
  //simple rotate block on tap
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
    delta: 30,
  });
  const pause = () => {
    setGameState((prev) => pauseGame(prev));
  };
  const unpause = () => {
    setGameState((prev) => unpauseGame(prev));
  };
  const openSettings = () => {
    setShowSettingsModal(true);
    pause();
  };
  const closeSettings = () => {
    setShowSettingsModal(false);
    gameState.blocksSpawned > 0 && unpause();
  };
  const startNewGame = () => {
    setGameState(unpauseGame(gameInit(config)));
  };
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
            <div className="flex w-full justify-between">
              <span>
                Score: {gameState.blocksSpawned === 0 ? '-' : gameState.score}
              </span>
              <button onClick={openSettings}>
                <Settings color="#00ff00" className="h-5 w-5" />
              </button>
            </div>
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
        <div
          {...handlers}
          className="flex w-full flex-col items-center justify-start"
        >
          <div className="w-[70%]">
            <BoardDisplay
              board={boardWithFallingBlock(gameState)}
              cellBorderStyle={cellBorderStyles[cellBorderStyleIndex]}
              classNames="w-full"
            />
          </div>
          {/* Startgame modal */}
          {gameState.blocksSpawned === 0 && (
            <button
              className="border-outset text-default absolute left-1/2 top-1/2 -translate-x-1/2 border-[10px] border-green-500 bg-slate-900 bg-opacity-80 p-4 active:[border-style:inset]"
              onClick={startNewGame}
            >
              Start
            </button>
          )}
        </div>
        {/* Game over modal */}
        {gameState.over && !showSettingsModal && (
          <div className="absolute inset-0 h-full w-full bg-slate-900 bg-opacity-50 backdrop-blur-sm">
            <div className="text-default flex h-full w-full flex-col items-center justify-start gap-5 px-8 py-4">
              <div className="mt-20 flex flex-col items-center gap-2">
                <span className="animate-fadedFlash text-5xl">GAME OVER</span>
                <span className="animate-fadedFlash text-5xl">
                  Score: {gameState.score}
                </span>
              </div>
              <HighScoreEntry game={gameState} displayCount={5} />
              <button
                onClick={startNewGame}
                className="border-outset text-default border-[10px] border-green-500 bg-slate-900 bg-opacity-80 p-4 active:[border-style:inset]"
              >
                Restart
              </button>
            </div>
          </div>
        )}
        {showSettingsModal && (
          <div
            onClick={closeSettings}
            className="absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          >
            <SettingsModal
              closeSettings={closeSettings}
              restartGame={startNewGame}
              gameState={gameState}
            />
          </div>
        )}
      </div>
      <div
        className="absolute bottom-0 z-30 h-1/5 w-full bg-transparent"
        // soft drop while touching this div
        onTouchStart={() => (softDroppingRef.current = true)}
        onTouchEnd={() => (softDroppingRef.current = false)}
        onContextMenu={(e) => e.preventDefault()}
      />
      <div className="absolute bottom-0 z-0 h-1/5 w-full bg-slate-500 bg-opacity-80" />
    </>
  );
}
