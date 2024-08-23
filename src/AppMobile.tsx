import BoardDisplay from './components/BoardDisplay';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import {
  Game,
  boardWithFallingBlock,
  gameInit,
  hardDropBlock,
  holdAndPopHeld,
  miniHeldBoard,
  miniPreviewBoard,
  rotateBlock,
  setAllowedInput,
  shiftBlock,
  startGame,
  tickGameClock,
} from './Tetris';
import ThemeSong from './assets/ThemeSong.mp3';
import useKeysPressed from './hooks/useKeysPressed';
import { CONFIG, InputCategory } from './TetrisConfig';
import BoardCell from './components/BoardCell';
import PieceDisplay from './components/PieceDisplay';
const music = new Audio(ThemeSong);
const startMusic = () => {
  music.loop = true;
  music.play();
};
interface KeyBinding {
  key: string;
  type: InputCategory;
  callback: (prev: Game) => Game;
}
//prettier-ignore
const keyBindings: KeyBinding[] = [
  { key: "w", type: "rotate",callback: (prevGameState) => rotateBlock(prevGameState, "CW") },
  { key: "e", type: "rotate",callback: (prevGameState) => rotateBlock(prevGameState, "CCW")},
  { key: "a", type:"shift", callback: (prevGameState) => shiftBlock(prevGameState, "L")},
  { key: "d", type:"shift", callback: (prevGameState) => shiftBlock(prevGameState, "R")},
  { key: "s", type:"shift", callback: (prevGameState) => shiftBlock(prevGameState, "D")},
  { key: " ", type: "drop", callback: (prevGameState) => hardDropBlock(prevGameState, )},
  { key: "ArrowLeft", type:"shift", callback: (prevGameState) => shiftBlock(prevGameState, "L")},
  { key: "ArrowRight", type:"shift", callback: (prevGameState) => shiftBlock(prevGameState, "R")},
  { key: "ArrowUp", type: "rotate",callback: (prevGameState) => rotateBlock(prevGameState, "CW")},
  { key: "ArrowDown", type:"shift", callback: (prevGameState) => shiftBlock(prevGameState, "D")},
  { key: "c", type:"hold", callback: (prevGameState) => holdAndPopHeld(prevGameState)},
];
const cellBorderStyles = ['outset', 'none'];

export default function MobileApp() {
  const [gameState, setGameState] = useState(gameInit());
  const gameStateRef = useRef(gameState);
  const [cellBorderStyleIndex, setCellBorderStyle] = useState(0);
  const keysPressed = useKeysPressed(keyBindings.map((binding) => binding.key));
  const keysPressedRef = useRef(keysPressed);
  const currentlyShiftingRef = useRef(false);

  //Sync up gamestate and keyspressed refs
  useEffect(() => {
    keysPressedRef.current = keysPressed;
  }, [keysPressed]);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  //set up input polling
  useEffect(() => {
    const shiftInputLoop = setInterval(
      processShiftInputs,
      gameState.CONFIG.POLL_RATES.base
    );
    const handleKeyDowns = (e: KeyboardEvent) => {
      keyBindings.forEach((binding) => {
        if (
          binding.type === 'shift' ||
          !gameStateRef.current.allowedInputs[binding.type]
        )
          return; //shift is hadnled by keyspressed
        if (e.key === binding.key) {
          setGameState((prev) =>
            setAllowedInput(binding.callback(prev), binding.type, false)
          );
        }
      });
    };
    const handleKeyUps = (e: KeyboardEvent) => {
      keyBindings.forEach((binding) => {
        if (binding.type === 'shift') return;
        if (e.key === binding.key) {
          setGameState((prev) => setAllowedInput(prev, binding.type, true));
        }
      });
    };
    document.addEventListener('keydown', handleKeyDowns);
    document.addEventListener('keyup', handleKeyUps);
    return () => {
      document.removeEventListener('keydown', handleKeyDowns);
      document.removeEventListener('keyup', handleKeyUps);
      clearInterval(shiftInputLoop);
    };
  }, []);
  //   const processShiftInputs = () => {
  //     let shifting = false;
  //     keyBindings.forEach((binding) => {
  //       if (binding.type !== 'shift') return; //we are only polling keydown repeats for shifts
  //       let extraDelay = 0;
  //       const inputType = binding.type;
  //       if (keysPressedRef.current[binding.key]) {
  //         shifting = true;
  //         extraDelay = currentlyShiftingRef.current ? 0 : CONFIG.SHIFT_DEBOUNCE;
  //       }
  //       //if that input type is disallowed, skip
  //       if (!gameStateRef.current.allowedInputs[inputType]) {
  //         return;
  //       }

  //       if (keysPressedRef.current[binding.key]) {
  //         setGameState((prev) =>
  //           setAllowedInput(binding.callback(prev), inputType, false)
  //         );
  //         setTimeout(
  //           () => setGameState((prev) => setAllowedInput(prev, inputType, true)),
  //           CONFIG.POLL_RATES[inputType] + extraDelay
  //         );
  //       }
  //     });
  //     //if no shift inputs were hit setting shifting to true, we arent currently shifting and reset so that we get debounce when we do
  //     currentlyShiftingRef.current = shifting;
  //   };

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
      <BoardDisplay
        board={boardWithFallingBlock(gameState)}
        cellBorderStyle={cellBorderStyles[cellBorderStyleIndex]}
        classNames="w-[80%]"
      />
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
