import { CONFIG } from '../TetrisConfig';

export default function ScoringInfo() {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`text-default border-outset flex w-[90%] flex-col items-center justify-center gap-4 bg-slate-900 p-3`}
    >
      <div className="mb-2 text-xl font-bold underline">Scoring</div>
      <div className="flex w-full flex-col gap-3 text-lg">
        <div className="flex w-full">
          <span className="basis-1/2 text-center underline">Action</span>
          <span className="te basis-1/2 text-center underline">Points</span>
        </div>
        <div className="flex w-full flex-col gap-1 text-sm">
          {CONFIG.LINES_CLEARED_SCORE.slice(1).map((score, index) => (
            <div
              className="flex w-full justify-between"
              key={`cleared-${index}`}
            >
              <span className="basis-1/2 text-center">
                {index + 1} lines cleared
              </span>
              <span className="basis-1/2 text-center">
                {score}
                <sup>*</sup>
              </span>
            </div>
          ))}
          <div className="flex w-full justify-between">
            <span className="basis-1/2 text-center">Soft drop</span>
            <span className="basis-1/2 text-center">1 x distance</span>
          </div>
          <div className="flex w-full justify-between">
            <span className="basis-1/2 text-center">Hard drop</span>
            <span className="basis-1/2 text-center">2 x distance</span>
          </div>
        </div>
      </div>
      <span className="text-center text-xs">
        <sup>*</sup>multiplied by your current level
      </span>
    </div>
  );
}
