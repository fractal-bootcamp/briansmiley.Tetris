import { CONFIG, TetrisShape } from '../TetrisConfig';

type PieceDisplayProps = {
  piece: TetrisShape | null;
  text?: string;
};
export default function PieceDisplay({ piece, text }: PieceDisplayProps) {
  const shape = piece === null ? [] : CONFIG.BLOCK_SHAPES[piece];
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
              width: '20%',
              height: '20%',
              transform: `translate(${coord[1] * 100}%, ${coord[0] * 100}%)`,
            }}
          />
        ))}
    </div>
  );
}
