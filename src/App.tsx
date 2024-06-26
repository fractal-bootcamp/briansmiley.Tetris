import { useEffect, useRef, useState } from "react";
import BoardDisplay from "./components/Board";
import { Volume2, VolumeX } from "lucide-react";
import {
  Game,
  boardWithFallingBlock,
  gameInit,
  hardDropBlock,
  rotateBlock,
  setAllowedInput,
  shiftBlock,
  startGame,
  tickGravity
} from "./Tetris";
import ThemeSong from "./assets/ThemeSong.mp3";
import useKeysPressed from "./hooks/useKeysPressed";
import { CONFIG, InputCategory } from "./TetrisConfig";
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
  { key: "ArrowDown", type:"shift", callback: (prevGameState) => rotateBlock(prevGameState, "CCW")},
];

function App() {
  const [gameClock, setGameClock] = useState(0);
  const [gameState, setGameState] = useState(gameInit());
  const gameStateRef = useRef(gameState);
  const [unMuted, setMuted] = useState<boolean | null>(null);
  const keysPressed = useKeysPressed(keyBindings.map(binding => binding.key));
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
    keyBindings.forEach(binding => {
      const inputType = binding.type;
      //if that input type is disallowed, skip
      if (!gameStateRef.current.allowedInputs[inputType]) return;
      //otherwise, if the binding's key is currently pressed, process the input, disable that type and set a timeout to reenable it
      if (keysPressedRef.current[binding.key]) {
        setGameState(prev =>
          setAllowedInput(binding.callback(prev), inputType, false)
        );
        setTimeout(
          () => setGameState(prev => setAllowedInput(prev, inputType, true)),
          CONFIG.POLL_RATES[inputType]
        );
      }
    });
  };

  //Increment game clock every tickInterval ms
  useEffect(() => {
    const tickTimeout = setTimeout(
      () => setGameClock(prevTime => prevTime + 1),
      gameState.tickInterval
    );
    return () => clearTimeout(tickTimeout);
  }, [gameClock]);
  //call tick gravity every tick of the game clock
  useEffect(() => {
    setGameState(gameState =>
      gameState.over ? gameState : tickGravity(gameState)
    );
  }, [gameClock, gameState.over]);

  //tie mute state of music to muted state
  useEffect(() => {
    music.muted = !unMuted;
  }, [unMuted]);

  const handleSoundClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (unMuted === null) startMusic();
    setMuted(!unMuted);
  };

  return (
    <>
      <div className="flex justify-center">
        <div className="m-2 flex flex-col items-center gap-2 w-fit">
          <BoardDisplay board={boardWithFallingBlock(gameState)} />
          <div className="flex justify-between w-full ">
            <div className="flex justify-start basis-full">
              <div className="text-5xl font-mono text-green-500">
                {gameState.score}
              </div>
            </div>
            <div className="flex justify-center basis-full">
              <button
                className="btn [border-style:outset] active:[border-style:inset] border-8 rounded-none border-[#7f7f7f] font-semibold text-xl"
                onClick={() => setGameState(startGame(gameState))}
              >
                Start
              </button>
            </div>
            <div className="flex justify-end basis-full">
              <div onClick={e => handleSoundClick(e)}>
                {unMuted ? (
                  <Volume2 className="w-10 h-10" color="#ffffff" />
                ) : (
                  <VolumeX className="w-10 h-10" color="#ffffff" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
