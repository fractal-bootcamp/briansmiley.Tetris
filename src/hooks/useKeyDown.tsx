import { useEffect } from "react";
//adapted from https://medium.com/@paulohfev/problem-solving-custom-react-hook-for-keydown-events-e68c8b0a371

const useKeyDown = (callback: (...args: any) => any, keys: string[]) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const wasAnyKeyPressed = keys.some(key => event.key === key);
      if (wasAnyKeyPressed) {
        event.preventDefault();
        callback(event);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [callback, keys]);
};

export default useKeyDown;
