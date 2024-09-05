import { cellBorderColorFromShape, pieceDisplayOffsets } from '../lib/display';
import { CONFIG, TetrisShape } from '../TetrisConfig';

type PieceDisplayProps = {
  piece: TetrisShape | null;
  borderStyle?: string;
  borderWidth?: string;
  text?: string;
};
export default function PieceDisplay({
  piece,
  text,
  borderStyle = 'none',
  borderWidth = '5px',
}: PieceDisplayProps) {
  const shape = piece === null ? [] : CONFIG.BLOCK_SHAPES[piece];
  const translateOffset = piece ? pieceDisplayOffsets[piece] : [0, 0];
  return (
    <div className="relative h-full w-full bg-black">
      <span className="text-default absolute left-1 top-0">{text}</span>
      {piece &&
        shape.map((coord, i) => (
          <div
            className="absolute left-1/2 top-1/2 border-none"
            key={i}
            style={{
              backgroundColor: `rgb(${CONFIG.SHAPE_COLORS[piece].join(',')})`,
              borderStyle: borderStyle,
              borderColor: cellBorderColorFromShape(piece),
              borderWidth: borderWidth,
              width: '20%',
              height: '20%',
              transform: `translate(${translateOffset[1] + coord[1] * 100}%, ${translateOffset[0] + coord[0] * 98}%)`,
            }}
          />
        ))}
    </div>
  );
}
