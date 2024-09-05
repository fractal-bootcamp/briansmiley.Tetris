import { Computer, Globe } from 'lucide-react';

type LocalGlobalToggleProps = {
  displayGlobal: boolean;
  toggleGlobal: () => void;
};
export default function LocalGlobalToggle({
  displayGlobal,
  toggleGlobal,
}: LocalGlobalToggleProps) {
  const displayClass = (global: boolean) =>
    global === displayGlobal ? 'text-white' : 'text-slate-400';
  const switchStyle: React.CSSProperties = {
    position: 'absolute',
    top: '0',
    left: '0',
    transition: 'transform 0.5s',
    transform: displayGlobal ? 'translateX(calc(45%))' : 'translateX(-45%)',
    zIndex: '20',
    width: '56px',
    height: '28px',
  };
  return (
    <button
      onClick={toggleGlobal}
      className="relative flex h-7 items-center justify-between gap-3 overflow-hidden rounded-full bg-slate-300 px-1"
    >
      <div className="rounded-full bg-slate-500" style={switchStyle} />
      <Computer
        size={18}
        className={`${displayClass(false)} z-30 transition-all duration-500`}
      />
      <Globe
        size={18}
        className={`${displayClass(true)} z-30 transition-all duration-500`}
      />{' '}
    </button>
  );
}
