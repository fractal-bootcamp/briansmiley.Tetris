import BoardCell from "./BoardCell";
import { Board, Config } from "../Tetris";

type BoardDisplayProps = {
  board: Board;
  CONFIG: Config;
};
const BoardDisplay = ({ board, CONFIG }: BoardDisplayProps) => {
  const aspectRatio = CONFIG.BOARD_WIDTH / CONFIG.BOARD_HEIGHT;
  const dimensions: React.CSSProperties = {
    height: "90vh",
    width: `${aspectRatio * 90}vh`
  };
  return (
    <div className="flex flex-col" style={dimensions}>
      {board.map((r, row) => (
        <div className="flex flex-1">
          {r.map((cell, col) => (
            <BoardCell position={[row, col]} cellValue={cell} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default BoardDisplay;
