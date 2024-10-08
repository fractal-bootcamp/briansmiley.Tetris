import {
  RotateCw,
  Fingerprint,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

type MobileControlsProps = {};
export default function MobileControls({}: MobileControlsProps) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`text-default border-outset flex w-[90%] flex-col items-center justify-center gap-2 bg-slate-900 p-3`}
    >
      <div className="mb-2 text-xl font-bold underline">Controls</div>
      <div className="text-md flex w-full flex-col gap-4">
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-[50%] flex-row items-center justify-center">
            <ArrowLeft />
            <Fingerprint />
            <ArrowRight />
          </div>
          Shift L/R
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-[50%] flex-col items-center justify-center">
            <ArrowUp />
            <Fingerprint />
          </div>
          Hold / Swap
        </div>
        <div className="flex items-center justify-between gap-1">
          <div className="itc-row flex min-w-[50%] items-center justify-center gap-1">
            <Fingerprint /> Tap
          </div>
          <RotateCw />
        </div>
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-[50%] flex-col items-center justify-center">
            <Fingerprint />
            <ArrowDown />
          </div>
          Hard drop
        </div>
        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-[50%] flex-col items-center justify-center gap-2 text-center">
            Tap + hold
            <br />
            bottom region
          </div>
          Soft drop
        </div>
      </div>
    </div>
  );
}
