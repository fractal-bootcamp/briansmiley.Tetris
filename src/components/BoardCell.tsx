import { useMemo } from 'react';
import { Cell } from '../Tetris';
import { Color } from '../TetrisConfig';
import { cellBorderColorFromColor } from '../lib/display';

interface BoardCellProps {
  cellValue: Cell;
  position: [number, number];
  cellBorderStyle: string;
}
const BoardCell = ({
  cellValue,
  position,
  cellBorderStyle,
}: BoardCellProps) => {
  const [row, col] = position;
  const blankCellBackground = ((row % 2) + (col % 2)) % 2 ? 22 : 6;
  //we use the color of a cell unless it is empty or shadow, in which case we use the blank cell background checkerboard pattern
  const [r, g, b] = useMemo<Color>(
    () =>
      cellValue.type === 'empty'
        ? [blankCellBackground, blankCellBackground, blankCellBackground]
        : cellValue.color,
    [cellValue.color[0], cellValue.color[1], cellValue.color[2], cellValue.type]
  );
  const backgroundColor = useMemo(() => {
    switch (cellValue.type) {
      case 'shadow':
      case 'empty':
        return `#${blankCellBackground
          .toString(16)
          .padStart(2, '0')
          .repeat(3)}`;
      default:
        return `rgba(${r}, ${g}, ${b})`;
    }
  }, [cellValue.type, r, g, b]);
  const borderColor = cellBorderColorFromColor(cellValue.color);
  const borderStyle = (() => {
    switch (cellValue.type) {
      case 'empty':
        return 'none';
      case 'shadow':
        return 'solid';
      case 'block':
        return cellBorderStyle;
      case 'wall':
        return 'outset';
    }
  })();
  const borderWidth = (() => {
    switch (cellValue.type) {
      case 'empty':
        return 0;
      case 'shadow':
        return 3;
      case 'block':
      case 'wall':
        return 6;
    }
  })();

  const cellDynamicStyles: React.CSSProperties = {
    background: backgroundColor,
    borderWidth: borderWidth,
    borderStyle: borderStyle,
    boxSizing: 'border-box',
    borderColor: borderColor,
    flex: '1 1 16px',
  };
  return <div className="h-full w-full" style={cellDynamicStyles}></div>;
};

export default BoardCell;
