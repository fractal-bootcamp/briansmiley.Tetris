import { useMemo } from "react";
import { Cell } from "../Tetris";
import { Color } from "../TetrisConfig";

interface BoardCellProps {
  cellValue: Cell;
  position: [number, number];
}
const BoardCell = ({ cellValue, position }: BoardCellProps) => {
  const [row, col] = position;
  const blankCellBackground = ((row % 2) + (col % 2)) % 2 ? 22 : 6;
  //we use the color of a cell unless it is empty or shadow, in which case we use the blank cell background checkerboard pattern
  const [r, g, b] = useMemo<Color>(
    () =>
      cellValue.type === "empty"
        ? [blankCellBackground, blankCellBackground, blankCellBackground]
        : cellValue.color,
    [cellValue, blankCellBackground]
  );
  const backgroundColor = useMemo(() => {
    switch (cellValue.type) {
      case "shadow":
      case "empty":
        return `#${blankCellBackground
          .toString(16)
          .padStart(2, "0")
          .repeat(3)}`;
      default:
        return `rgba(${r}, ${g}, ${b})`;
    }
  }, [cellValue]);
  const borderColor = useMemo(
    () =>
      `rgb(${Math.floor(0.8 * r)}, ${Math.floor(0.8 * g)}, ${Math.floor(
        0.8 * b
      )})`,
    [cellValue, r, g, b]
  );
  const borderStyle = useMemo(() => {
    switch (cellValue.type) {
      case "empty":
        return "none";
      case "shadow":
        return "solid";
      case "block":
      case "wall":
        return "outset";
    }
  }, [cellValue]);
  const borderWidth = useMemo(() => {
    switch (cellValue.type) {
      case "empty":
        return 0;
      case "shadow":
        return 3;
      case "block":
      case "wall":
        return 6;
    }
  }, [cellValue]);

  const cellDynamicStyles: React.CSSProperties = {
    background: backgroundColor,
    borderWidth: borderWidth,
    borderStyle: borderStyle,
    boxSizing: "border-box",
    borderColor: borderColor,
    flex: "1 1 16px"
  };
  return <div style={cellDynamicStyles}></div>;
};

export default BoardCell;
