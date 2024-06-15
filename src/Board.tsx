import { Board } from "./Tetris";

const superIndex = (arr: any[][], row: number, col: number) =>
  row * arr[0].length + col;
const BoardDisplay = ({ board }: { board: Board }) => {
  return (
    <div>
      {board.map((r, row) =>
        r.map((cell, col) => (
          <div
            className="bg-red-500 p-2"
            key={superIndex(board, row, col).toString()}
          >
            Cell: {cell}
          </div>
        ))
      )}
    </div>
  );
};

export default BoardDisplay;
