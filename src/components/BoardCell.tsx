import { useMemo } from "react";
import { Cell } from "../Tetris";

interface BoardCellProps {
  cellValue: Cell;
  position: [number, number];
}
const BoardCell = ({ cellValue, position }: BoardCellProps) => {
  const [row, col] = position;
  const blankCellBackground = ((row % 2) + (col % 2)) % 2 ? 18 : 9;
  const [r, g, b, a] = useMemo(
    () => cellValue || Array(4).fill(blankCellBackground),
    [cellValue, blankCellBackground]
  );
  const cellDynamicStyles: React.CSSProperties = {
    background: `rgba(${r}, ${g}, ${b}, ${a})`,
    borderWidth: cellValue ? 6 : 0,
    borderStyle: "outset",
    boxSizing: "border-box",
    borderColor: `rgba(${Math.floor(0.8 * r)}, ${Math.floor(
      0.8 * g
    )}, ${Math.floor(0.8 * b)}, ${a})`,
    flex: "1 1 16px"
  };
  return <div style={cellDynamicStyles}></div>;
};

export default BoardCell;
