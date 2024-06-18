import { useEffect, useState } from "react";
/**
 * Track whether key is currently held down tracked in a re-rendering state variable
 * @param keys array of keys that this will track
 * @returns boolean ref tracking whether any keys in the dependency are currently being held down
 */
const useKeyIsPressedState = (key: string) => {
  const [keyDown, setKeyDown] = useState(false);
  const keyWasPressed = (event: KeyboardEvent) => event.key === key;
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (keyWasPressed(e)) setKeyDown(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (keyWasPressed(e)) setKeyDown(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);
  return keyDown;
};
export default useKeyIsPressedState;
