import BoardCell from "./BoardCell";
import { Board, Config } from "../Tetris";

type BoardDisplayProps = {
  board: Board;
  CONFIG: Config;
};

const keyFromPosition = (a: number, b: number) =>
  a.toString().padStart(2, "0") + b.toString().padStart(2, "0");

const BoardDisplay = ({ board, CONFIG }: BoardDisplayProps) => {
  const aspectRatio = CONFIG.BOARD_WIDTH / CONFIG.BOARD_HEIGHT;
  const dimensions: React.CSSProperties = {
    height: "90vh",
    width: `${aspectRatio * 90}vh`
  };
  return (
    <div className="flex flex-col" style={dimensions}>
      {board.map((r, row) => (
        <div className="flex flex-1" key={row}>
          {r.map((cell, col) => (
            <BoardCell
              position={[row, col]}
              cellValue={cell}
              key={keyFromPosition(row, col)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default BoardDisplay;
