import BoardCell from "./BoardCell";
import { Board } from "../Tetris";

const BoardDisplay = ({ board }: { board: Board }) => {
  return (
    <div className="flex flex-col w-[50vh] h-[90vh] ">
      {board.map((r, row) => (
        <div className="flex w-full h-full">
          {r.map((cell, col) => (
            <BoardCell position={[row, col]} cellValue={cell} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default BoardDisplay;
