import BoardCell from "./BoardCell";
import { Board } from "../Tetris";

type BoardDisplayProps = {
  board: Board;
};

const keyFromPosition = (a: number, b: number) =>
  a.toString().padStart(2, "0") + b.toString().padStart(2, "0");

const BoardDisplay = ({ board }: BoardDisplayProps) => {
  const aspectRatio = board[0].length / board.length;
  const dimensions: React.CSSProperties = {
    aspectRatio: aspectRatio
  };
  return (
    <div className="flex flex-col h-[90vh]" style={dimensions}>
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
