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

function DesktopApp() {
  const [gameState, setGameState] = useState(gameInit());
  const gameStateRef = useRef(gameState);
  const [unMuted, setMuted] = useState<boolean | null>(null);
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
        if (binding.type === 'shift' || binding.type === 'hold') return;
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
  const processShiftInputs = () => {
    let shifting = false;
    keyBindings.forEach((binding) => {
      if (binding.type !== 'shift') return; //we are only polling keydown repeats for shifts
      let extraDelay = 0;
      const inputType = binding.type;
      if (keysPressedRef.current[binding.key]) {
        shifting = true;
        extraDelay = currentlyShiftingRef.current ? 0 : CONFIG.SHIFT_DEBOUNCE;
      }
      //if that input type is disallowed, skip
      if (!gameStateRef.current.allowedInputs[inputType]) {
        return;
      }

      if (keysPressedRef.current[binding.key]) {
        setGameState((prev) =>
          setAllowedInput(binding.callback(prev), inputType, false)
        );
        setTimeout(
          () => setGameState((prev) => setAllowedInput(prev, inputType, true)),
          CONFIG.POLL_RATES[inputType] + extraDelay
        );
      }
    });
    //if no shift inputs were hit setting shifting to true, we arent currently shifting and reset so that we get debounce when we do
    currentlyShiftingRef.current = shifting;
  };

  //Increment game clock every tickInterval ms
  useEffect(() => {
    const tickInterval = setInterval(
      () => setGameState((prevState) => tickGameClock(prevState)),
      CONFIG.CLOCK_TICK_RATE
    );
    return () => clearInterval(tickInterval);
  }, []);
  //tie mute state of music to muted state
  useEffect(() => {
    music.muted = !unMuted;
  }, [unMuted]);
  const previewBoard = useMemo(
    () => miniPreviewBoard(gameState.shapeQueue),
    [JSON.stringify(gameState.shapeQueue)]
  );
  const toggleCellBorderStyle = () => {
    const newIndex = (cellBorderStyleIndex + 1) % cellBorderStyles.length;
    setCellBorderStyle(newIndex);
  };
  const handleSoundClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (unMuted === null) startMusic();
    setMuted(!unMuted);
  };

  return (
    <>
      <div className="m-2 flex justify-center gap-2">
        <div className="flex w-1/3 flex-col items-end justify-start gap-10">
          <div className="flex justify-end gap-2 font-mono text-2xl text-green-500">
            Held <br />
            (c)
            <BoardDisplay
              board={miniHeldBoard(gameState.heldShape)}
              classNames="h-[20vh] aspect-square"
              cellBorderStyle={cellBorderStyles[cellBorderStyleIndex]}
            />
          </div>
          <div className="min-w-[13ch] font-mono text-3xl text-green-500">
            <div className="flex flex-col">
              <div className="border border-green-500">
                Score: {gameState.blocksSpawned === 0 ? '-' : gameState.score}
              </div>
              <div className="border border-green-500">
                Lines:{' '}
                {gameState.blocksSpawned === 0 ? '-' : gameState.linesCleared}
              </div>
              <div className="border border-green-500">
                Level: {gameState.blocksSpawned === 0 ? '-' : gameState.level}
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-fit flex-col items-center gap-2">
          {/* game board */}
          <div className="relative">
            <BoardDisplay
              board={boardWithFallingBlock(gameState)}
              cellBorderStyle={cellBorderStyles[cellBorderStyleIndex]}
              classNames="h-[90vh]"
            />
            {gameState.over && (
              <div className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-slate-900 bg-opacity-80">
                <div className="text-default flex h-full w-full animate-flash flex-col items-center justify-center gap-5 px-8 py-4 text-5xl">
                  <span className="">GAME OVER</span>
                  <span>Score: {gameState.score}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex w-full justify-between">
            <div className="flex basis-full justify-start"></div>
            <div className="flex basis-full justify-center">
              <button
                className="btn rounded-none border-8 border-[#7f7f7f] text-xl font-semibold [border-style:outset] active:[border-style:inset]"
                onClick={() => setGameState(startGame(gameState))}
              >
                Start
              </button>
            </div>
            <div className="flex basis-full items-start justify-end">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8" onClick={toggleCellBorderStyle}>
                  <BoardCell
                    cellValue={{ color: [0, 255, 255], type: 'block' }}
                    cellBorderStyle={cellBorderStyles[cellBorderStyleIndex]}
                    position={[0, 0]}
                  />
                </div>
                <div onClick={(e) => handleSoundClick(e)}>
                  {unMuted ? (
                    <Volume2 className="h-10 w-10" color="#ffffff" />
                  ) : (
                    <VolumeX className="h-10 w-10" color="#ffffff" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-1/3 justify-start gap-2 font-mono text-2xl text-green-500">
          <BoardDisplay
            board={previewBoard}
            cellBorderStyle={cellBorderStyles[cellBorderStyleIndex]}
            classNames="h-[20vh] aspect-square"
          />
          Next
        </div>
      </div>
    </>
  );
}

export default DesktopApp;