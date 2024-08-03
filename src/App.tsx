import { useEffect, useMemo, useRef, useState } from 'react';
import BoardDisplay from './components/BoardDisplay';
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
  tickGravity,
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

function App() {
  const [gameClock, setGameClock] = useState(0);
  const [gameState, setGameState] = useState(gameInit());
  const gameStateRef = useRef(gameState);
  const [unMuted, setMuted] = useState<boolean | null>(null);
  const [cellBorderStyleIndex, setCellBorderStyle] = useState(0);
  const keysPressed = useKeysPressed(keyBindings.map((binding) => binding.key));
  const keysPressedRef = useRef(keysPressed);
  //up to date ref to pass to our interval callbacks
  useEffect(() => {
    keysPressedRef.current = keysPressed;
  }, [keysPressed]);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  //Set up intervals to ALLOW categories of input: inputs will set their category to disallowed,
  useEffect(() => {
    const inputLoop = setInterval(
      processInputs,
      gameState.CONFIG.POLL_RATES.base
    );
    return () => {
      clearInterval(inputLoop);
    };
  }, []);
  //Check each possible input
  const processInputs = () => {
    keyBindings.forEach((binding) => {
      const inputType = binding.type;
      //if that input type is disallowed, skip
      if (!gameStateRef.current.allowedInputs[inputType]) return;
      //otherwise, if the binding's key is currently pressed, process the input, disable that type and set a timeout to reenable it
      if (keysPressedRef.current[binding.key]) {
        setGameState((prev) =>
          setAllowedInput(binding.callback(prev), inputType, false)
        );
        setTimeout(
          () => setGameState((prev) => setAllowedInput(prev, inputType, true)),
          CONFIG.POLL_RATES[inputType]
        );
      }
    });
  };
  const toggleCellBorderStyle = () => {
    const newIndex = (cellBorderStyleIndex + 1) % cellBorderStyles.length;
    setCellBorderStyle(newIndex);
  };
  //Increment game clock every tickInterval ms
  useEffect(() => {
    const tickTimeout = setTimeout(
      () => setGameClock((prevTime) => prevTime + 1),
      gameState.tickInterval
    );
    return () => clearTimeout(tickTimeout);
  }, [gameClock]);
  //call tick gravity every tick of the game clock
  useEffect(() => {
    setGameState((gameState) =>
      gameState.over ? gameState : tickGravity(gameState)
    );
  }, [gameClock, gameState.over]);

  //tie mute state of music to muted state
  useEffect(() => {
    music.muted = !unMuted;
  }, [unMuted]);
  const previewBoard = useMemo(
    () => miniPreviewBoard(gameState.shapeQueue),
    [JSON.stringify(gameState.shapeQueue)]
  );
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
            Score: {gameState.score} <br />
            Lines: {gameState.linesCleared}
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
              <div className="text-default absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-slate-900 bg-opacity-80 px-8 py-4 text-5xl">
                <span className="animate-flash">GAME OVER</span>
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

export default App;
