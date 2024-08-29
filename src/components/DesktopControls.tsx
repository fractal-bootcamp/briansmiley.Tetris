import { RotateCcw, RotateCw } from 'lucide-react';

type KeyDisplayProps = {
  keyString: string;
  textSize?: number;
  width?: number;
  height?: number;
};
const KeyDisplay = ({
  keyString,
  textSize = 18,
  width = 32,
  height = 32,
}: KeyDisplayProps) => {
  const style = {
    fontSize: textSize,
    width: width,
    height: height,
  };
  return (
    <div
      className={`text-default flex items-center justify-center border border-green-500 p-1`}
      style={style}
    >
      {keyString}
    </div>
  );
};

type DesktopControlsProps = {};
export default function DesktopControls({}: DesktopControlsProps) {
  return (
    <div
      className={`text-default border-outset flex w-[90%] flex-col items-center justify-center gap-2 bg-slate-900 p-3`}
    >
      <div className="mb-2 text-2xl font-bold underline">Controls</div>
      <div className="flex w-full flex-col gap-2">
        <div className="flex flex-row items-center justify-between gap-1">
          <div className="flex min-w-24 flex-row items-center justify-center gap-2">
            <KeyDisplay keyString="←" />
            or
            <KeyDisplay keyString="A" />
          </div>
          Shift left
        </div>
        <div className="flex flex-row items-center justify-between gap-1">
          <div className="flex min-w-24 flex-row items-center justify-center gap-2">
            <KeyDisplay keyString="→" />
            or
            <KeyDisplay keyString="D" />
          </div>
          Shift right
        </div>
        <div className="flex flex-row items-center justify-between gap-1">
          <div className="flex min-w-24 flex-row items-center justify-center gap-2">
            <KeyDisplay keyString="↑" textSize={24} />
            or
            <KeyDisplay keyString="W" />
          </div>
          <RotateCw />
        </div>
        <div className="flex flex-row items-center justify-between gap-1">
          <div className="flex min-w-24 flex-row items-center justify-center gap-2">
            <KeyDisplay keyString="E" />
          </div>
          <RotateCcw />
        </div>
        <div className="flex flex-row items-center justify-between gap-1">
          <div className="flex min-w-24 flex-row items-center justify-center gap-2">
            <KeyDisplay keyString="Space" width={72} />
          </div>
          Hard drop
        </div>
        <div className="flex flex-row items-center justify-between gap-1">
          <div className="flex min-w-24 flex-row items-center justify-center gap-2">
            <KeyDisplay keyString="↓" />
            or
            <KeyDisplay keyString="S" />
          </div>
          Soft drop
        </div>
      </div>
    </div>
  );
}
