import { Board } from "./Tetris";

const superIndex = (arr: any[][], row: number, col: number) =>
  row * arr[0].length + col;
const BoardDisplay = ({ board }: { board: Board }) => {
  return (
    <div className="flex flex-col w-[50%]">
      {board.map((r, row) => (
        <div className="flex flex-row w-[100%]">
          {r.map((cell, col) => (
            <div
              className="bg-red-500 p-2 w-[50px] h-[50px]"
              key={superIndex(board, row, col).toString()}
            >
              <div>{cell ? "1" : "0"}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default BoardDisplay;
