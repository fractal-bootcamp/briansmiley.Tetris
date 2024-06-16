import BoardCell from "./BoardCell";
import { Board } from "./Tetris";

const BoardDisplay = ({ board }: { board: Board }) => {
  return (
    <div className="flex flex-col w-[50%]">
      {board.map((r, row) => (
        <div className="flex flex-row w-[100%]">
          {r.map((cell, col) => (
            <BoardCell position={[row, col]} cellValue={cell} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default BoardDisplay;
