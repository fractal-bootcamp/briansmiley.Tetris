import { useEffect, useRef } from "react";
/**
 * Track whether a key is currently held down using a useRef which won't trigger a rerender when it changes
 * @param keys array of keys that this will track
 * @returns boolean ref tracking whether any keys in the dependency are currently being held down
 */
const useKeyIsPressedRef = (key: string) => {
  const keyDown = useRef(false);
  const keyWasPressed = (event: KeyboardEvent) => event.key === key;
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (keyWasPressed(e)) keyDown.current = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (keyWasPressed(e)) keyDown.current = false;
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
export default useKeyIsPressedRef;
