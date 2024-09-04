import { CONFIG } from '../TetrisConfig';

export default function ScoringInfo() {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`text-default border-outset flex w-[90%] flex-col items-center justify-center gap-2 bg-slate-900 p-3`}
    >
      <div className="mb-2 text-2xl font-bold underline">Scoring</div>
      <div className="flex w-full flex-col gap-3 text-lg">
        <div className="flex w-full">
          <span className="basis-1/2 text-center underline">Lines</span>
          <span className="te basis-1/2 text-center underline">Points</span>
        </div>
        <div className="flex w-full flex-col">
          {CONFIG.LINES_CLEARED_SCORE.map((score, index) => (
            <div
              className="flex w-full justify-between"
              key={`cleared-${index}`}
            >
              <span className="basis-1/2 text-center">{index}</span>
              <span className="basis-1/2 text-center">{score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
