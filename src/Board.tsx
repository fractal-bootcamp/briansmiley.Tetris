import { useState } from "react";
import { Game, gameInit } from "./Tetris";
const Board = ({ game }: { game: Game }) => {
  const [gameState, setGameState] = useState(gameInit());
};

export default Board;
