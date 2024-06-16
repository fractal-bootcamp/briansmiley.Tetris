import { useEffect } from "react";

const useKeyDown = (callback: (...args: any) => any, keys: string[]) => {
  const onKeyDown = (event: KeyboardEvent) => {
    const wasAnyKeyPressed = keys.some(key => event.key === key);
    if (wasAnyKeyPressed) {
      event.preventDefault();
      callback(event);
    }
  };
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);
};

export default useKeyDown;
