import { Cell } from "../Tetris";

interface BoardCellProps {
  cellValue: Cell;
  position: [number, number];
}
const BoardCell = ({ cellValue, position }: BoardCellProps) => {
  const [row, col] = position;
  const blankCellBackground =
    ((row % 2) + (col % 2)) % 2 ? "#919191" : "#999999";
  return (
    <div
      className={`bg-red-500 p-2 w-[10%]`}
      style={{ background: cellValue || blankCellBackground }}
    ></div>
  );
};

export default BoardCell;
