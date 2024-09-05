import { Color, CONFIG, TetrisShape } from '../TetrisConfig';
export const cellBorderColorFromColor = (color: Color) => {
  const [r, g, b] = color;
  return `rgb(${Math.floor(0.8 * r)}, ${Math.floor(0.8 * g)}, ${Math.floor(
    0.8 * b
  )})`;
};
export const cellBorderColorFromShape = (shape: TetrisShape) => {
  return cellBorderColorFromColor(CONFIG.SHAPE_COLORS[shape]);
};

export const pieceDisplayOffsets: Record<TetrisShape, [number, number]> = {
  I: [-45, 0],
  J: [0, -40],
  L: [0, -40],
  O: [0, 0],
  S: [0, -40],
  T: [0, -40],
  Z: [0, -30],
};
