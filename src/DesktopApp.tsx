import BoardDisplay from './components/BoardDisplay';
import { useEffect, useRef, useState } from 'react';
import { Settings, Volume2, VolumeX } from 'lucide-react';
import {
  Game,
  boardWithFallingBlock,
  gameInit,
  hardDropBlock,
  holdAndPopHeld,
  pauseGame,
  rotateBlock,
  setAllowedInput,
  shiftBlock,
  tickGameClock,
  unpauseGame,
} from './Tetris';
import ThemeSong from './assets/ThemeSong.mp3';
import useKeysPressed from './hooks/useKeysPressed';
import { CONFIG, InputCategory } from './TetrisConfig';
import BoardCell from './components/BoardCell';
import HighScoreEntry from './components/HighScores/HighScoreEntry';
import SettingsModal from './components/SettingsModal';
import useStateWithRef from './hooks/useStateWithRef';
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
const config = { ...CONFIG, WALLS: true };
function DesktopApp() {
  const [gameState, setGameState, gameStateRef] = useStateWithRef(
    gameInit(config)
  );
  const [unMuted, setMuted] = useState<boolean | null>(null);
  const [cellBorderStyleIndex, setCellBorderStyle] = useState(0);
  const keysPressed = useKeysPressed(keyBindings.map((binding) => binding.key));
  const keysPressedRef = useRef(keysPressed);
  const currentlyShiftingRef = useRef(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  //Sync up gamestate and keyspressed refs
  useEffect(() => {
    keysPressedRef.current = keysPressed;
  }, [keysPressed]);
  //set up input polling
  useEffect(() => {
    const shiftInputLoop = setInterval(
      processShiftInputs,
      gameState.CONFIG.POLL_RATES.base
    );
    const handleKeyDowns = (e: KeyboardEvent) => {
      if (gameStateRef.current.paused) return;
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
    //this re-enables inputs when a key is released to prevent key repeat (except shifts which should repeat and hold which reenables on next spawn)
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
  const toggleCellBorderStyle = () => {
    const newIndex = (cellBorderStyleIndex + 1) % cellBorderStyles.length;
    setCellBorderStyle(newIndex);
  };
  const handleSoundClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (unMuted === null) startMusic();
    setMuted(!unMuted);
  };
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
    setShowSettingsModal((prev) => {
      if (prev && gameStateRef.current.blocksSpawned > 0) unpause(); //if the modal was open and the game has started, unpause
      return false; //no matter what, set modal to closed
    });
    // Blur the active element so we dont get trapped hitting the settings icon
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const prevents = [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (prevents.includes(e.key)) e.preventDefault(); //prevent space from clicking bc it does weird stuff
      if (e.key === 'Escape') {
        closeSettings();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  const startNewGame = () => {
    setGameState(unpauseGame(gameInit(config)));
  };
  return (
    <>
      <div className="m-2 flex justify-center gap-2">
        <div className="flex w-1/3 flex-col items-end justify-start gap-10">
          <div className="flex justify-end gap-2 font-mono text-2xl text-green-500">
            Held <br />
            (c)
            <div className="aspect-square h-[20vh]">
              <PieceDisplay
                piece={gameState.heldShape}
                borderStyle={cellBorderStyles[cellBorderStyleIndex]}
              />
            </div>
          </div>
          <div className="min-w-[13ch] font-mono text-3xl text-green-500">
            <div className="flex flex-col">
              <div className="">
                Score:{' '}
                {gameState.blocksSpawned === 0
                  ? '-'
                  : gameState.score.toLocaleString()}
              </div>
              <div className="">
                Lines:{' '}
                {gameState.blocksSpawned === 0 ? '-' : gameState.linesCleared}
              </div>
              <div className="">
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
            {gameState.over && !showSettingsModal && (
              <div className="absolute inset-0 h-full w-full bg-slate-900 bg-opacity-50 backdrop-blur-sm">
                <div className="text-default flex h-full w-full flex-col items-center justify-start gap-5 px-8 py-4">
                  <div className="mt-20 flex flex-col items-center gap-2">
                    <span className="animate-fadedFlash text-5xl">
                      GAME OVER
                    </span>
                    <span className="animate-fadedFlash text-center text-4xl">
                      Score: {gameState.score.toLocaleString()}
                    </span>
                  </div>
                  <HighScoreEntry game={gameState} />
                </div>
              </div>
            )}
            {showSettingsModal && (
              <>
                <div
                  className="fixed inset-0 h-full w-full bg-transparent"
                  onClick={closeSettings}
                />
                <div
                  onClick={closeSettings}
                  className="absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-slate-900 bg-opacity-50 backdrop-blur-sm"
                >
                  <SettingsModal
                    closeSettings={closeSettings}
                    restartGame={startNewGame}
                    gameState={gameState}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex w-full justify-between">
            <div className="basis-full justify-start">
              <button
                onClick={showSettingsModal ? closeSettings : openSettings}
                aria-label="Settings"
              >
                <Settings color="#ffffff" className="h-10 w-10" />
              </button>
            </div>
            <div className="flex basis-full justify-center">
              <button
                className={`btn rounded-none border-8 border-[#7f7f7f] text-xl font-semibold`}
                disabled={gameState.blocksSpawned > 0 && !gameState.over}
                onClick={(e) => {
                  e.currentTarget.blur();
                  startNewGame();
                }}
              >
                Start
              </button>
            </div>
            <div className="flex basis-full items-start justify-end">
              <div className="flex items-center gap-2">
                <button className="h-8 w-8" onClick={toggleCellBorderStyle}>
                  <BoardCell
                    cellValue={{ color: [0, 255, 255], type: 'block' }}
                    cellBorderStyle={cellBorderStyles[cellBorderStyleIndex]}
                    position={[0, 0]}
                  />
                </button>
                <button onClick={(e) => handleSoundClick(e)}>
                  {unMuted ? (
                    <Volume2 className="h-10 w-10" color="#ffffff" />
                  ) : (
                    <VolumeX className="h-10 w-10" color="#ffffff" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-1/3 justify-start gap-2 font-mono text-2xl text-green-500">
          {/* Upcoming pieces; change slice indices to display more/fewer */}
          <div className="flex flex-col">
            {gameState.shapeQueue.slice(0, 3).map((shape, idx) => (
              <div className="h-[90px] w-[120px]" key={`queue-${idx}`}>
                <PieceDisplay
                  piece={shape}
                  borderStyle={cellBorderStyles[cellBorderStyleIndex]}
                  borderWidth="4px"
                />
              </div>
            ))}
          </div>
          Next
        </div>
      </div>
    </>
  );
}

export default DesktopApp;
