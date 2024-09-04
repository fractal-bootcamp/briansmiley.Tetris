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
    global === displayGlobal ? 'text-white' : 'text-slate-500';
  return (
    <button
      onClick={toggleGlobal}
      className="flex h-6 w-12 items-center justify-between"
    >
      <Computer size={20} className={`${displayClass(false)}`} />
      <Globe size={20} className={`${displayClass(true)}`} />{' '}
    </button>
  );
}
