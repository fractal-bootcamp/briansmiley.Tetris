import { useEffect, useState } from "react";
import BoardDisplay from "./components/Board";
import { Volume2, VolumeX } from "lucide-react";
import {
  Game,
  allowInput,
  boardWithFallingBlock,
  forbidInput,
  gameInit,
  hardDropBlock,
  rotateBlock,
  shiftBlock,
  startGame,
  tickGravity
} from "./Tetris";
import ThemeSong from "./assets/ThemeSong.mp3";
import useKeysPressed from "./hooks/useKeysPressed";
const music = new Audio(ThemeSong);
const startMusic = () => {
  music.loop = true;
  music.play();
};
interface KeyBinding {
  key: string;
  type: "rotation" | "shift" | "drop";
  callback: (prev: Game) => Game;
}
//prettier-ignore
const keyBindings: KeyBinding[] = [
  { key: "w", type: "rotation",callback: (prevGameState) => rotateBlock(prevGameState, "CW") },
  { key: "e", type: "rotation",callback: (prevGameState) => rotateBlock(prevGameState, "CCW")},
  { key: "a", type:"shift", callback: (prevGameState) => shiftBlock(prevGameState, "L")},
  { key: "d", type:"shift", callback: (prevGameState) => shiftBlock(prevGameState, "R")},
  { key: "s", type:"shift", callback: (prevGameState) => shiftBlock(prevGameState, "D")},
  { key: " ", type: "drop", callback: (prevGameState) => hardDropBlock(prevGameState, )},
  { key: "ArrowLeft", type:"shift", callback: (prevGameState) => shiftBlock(prevGameState, "L")},
  { key: "ArrowRight", type:"shift", callback: (prevGameState) => shiftBlock(prevGameState, "R")},
  { key: "ArrowUp", type: "rotation",callback: (prevGameState) => rotateBlock(prevGameState, "CW")},
  { key: "ArrowDown", type:"shift", callback: (prevGameState) => rotateBlock(prevGameState, "CCW")},
];

function App() {
  const [gameClock, setGameClock] = useState(0);
  const [gameState, setGameState] = useState(gameInit());
  const [unMuted, setMuted] = useState<boolean | null>(null);
  //each time the game clock ticks, sets the next tick to happen after a delay set by the current value of tickInterval
  useEffect(() => {
    // if (gameState.over) return; //stop ticking if the game ends
    const tickTimeout = setTimeout(
      () => setGameClock(gameClock + 1),
      gameState.tickInterval
    );
    return () => clearTimeout(tickTimeout);
  }, [gameClock]);
  //call tick gravity every tick of the game clock
  useEffect(() => {
    if (gameState.over) return;
    setGameState(tickGravity(gameState));
  }, [gameClock]);
  useEffect(() => {
    music.muted = !unMuted;
  }, [unMuted]);
  const handleInput = (newGameState: Game) => {
    if (gameState.over || gameState.inputForbidden) return;
    setGameState(forbidInput(newGameState));
    setTimeout(
      () => setGameState(game => allowInput(game)),
      gameState.CONFIG.INPUT_REPEAT_DELAY
    );
  };
  const handleSoundClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (unMuted === null) startMusic();
    setMuted(!unMuted);
  };

  //prettier-ignore
  {
  useKeyDown(() => handleInput(shiftBlock(gameState, "L")), ["a","ArrowLeft"]);
  useKeyDown(() => handleInput(shiftBlock(gameState, "R")), ["d","ArrowRight"]);
  useKeyDown(() => handleInput(shiftBlock(gameState, "D")), ["s","ArrowDown"]);
  useKeyDown(() => handleInput(hardDropBlock(gameState)), [" "]);
  useKeyDown(() => handleInput(rotateBlock(gameState, "CCW")), ["w","ArrowUp"]);
  useKeyDown(() => handleInput(rotateBlock(gameState, "CW")), ["e"]);
  }
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
