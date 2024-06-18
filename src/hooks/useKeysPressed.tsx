import { useEffect, useState } from "react";
/**
 * Creates a state object associating key codes to their pressed state
 * @param keys array of keys that this will track
 * @returns {[key: true | false]}
 */
const useKeysPressed = (keys: string[]) => {
  const [keyBools, setKeyBools] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const listeners: {
      type: "keydown" | "keyup";
      func: (e: KeyboardEvent) => void;
    }[] = [];
    const cleanup = () =>
      listeners.forEach(listener =>
        document.removeEventListener(listener.type, listener.func)
      );

    keys.forEach(key => {
      const keyWasPressed = (event: KeyboardEvent) => event.key === key;
      const onKeyDown = (e: KeyboardEvent) => {
        if (keyWasPressed(e))
          setKeyBools(prev => {
            const newState = { ...prev };
            newState[key] = true;
            return newState;
          });
      };
      const onKeyUp = (e: KeyboardEvent) => {
        if (keyWasPressed(e))
          setKeyBools(prev => {
            const newState = { ...prev };
            newState[key] = false;
            return newState;
          });
      };
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
      listeners.push(
        { type: "keydown", func: onKeyDown },
        { type: "keyup", func: onKeyUp }
      );
    });
    return cleanup;
  }, []);
  return keyBools;
};
export default useKeysPressed;
