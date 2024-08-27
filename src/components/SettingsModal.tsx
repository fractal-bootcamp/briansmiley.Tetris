import { X } from 'lucide-react';
import { defaultHighscores } from '../data';
import useLocalStorage from '../hooks/useLocalStorage';

type SettingsModalProps = {
  closeModal: () => void;
};
export default function SettingsModal({ closeModal }: SettingsModalProps) {
  const [_, setHighscores] = useLocalStorage(
    'tetris-highscores',
    defaultHighscores
  );
  const resetHighScores = () => setHighscores(defaultHighscores);

  return (
    <div className="text-default border-inset relative flex w-[60%] flex-col items-center justify-center gap-1 bg-slate-900 p-2">
      <button
        onClick={closeModal}
        className="absolute inset-0 h-5 w-5 rounded-full p-0.5"
      >
        <X color="#ffffff" className="h-full w-full" />
      </button>
      <div className="mb-2 text-2xl font-bold underline">Settings</div>
      <button onClick={resetHighScores}>Reset Highscores</button>
    </div>
  );
}
