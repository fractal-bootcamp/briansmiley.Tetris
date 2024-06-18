import { useEffect, useRef } from "react";

const useGameStateRef = <T,>(gameStateProp: T) => {
  const gameStateRef = useRef(gameStateProp);

  useEffect(() => {
    gameStateRef.current = gameStateProp;
  }, [gameStateProp]);
  return gameStateRef;
};

export default useGameStateRef;
