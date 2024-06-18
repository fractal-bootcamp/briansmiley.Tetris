import { Cell } from "../Tetris";

interface BoardCellProps {
  cellValue: Cell;
  position: [number, number];
}

const BoardCell = ({ cellValue, position }: BoardCellProps) => {
  const [row, col] = position;
  const blankCellBackground =
    ((row % 2) + (col % 2)) % 2 ? "#121212" : "#090909";
  const cellDynamicStyles: React.CSSProperties = {
    background: cellValue || blankCellBackground.toString(),
    borderWidth: cellValue ? 6 : 0,
    borderStyle: "outset",
    boxSizing: "border-box",
    borderColor: `rgb(from ${cellValue} calc(.8*r) calc(.8*g) calc(.8*b))`,
    flex: "1 1 16px"
  };
  return <div style={cellDynamicStyles}></div>;
};

export default BoardCell;
