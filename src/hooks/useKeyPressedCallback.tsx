import { useEffect, useRef } from "react";
/**
 * Triggers a callback once on keypress then repeatedly until key is released. This seems to have major issues with never clearing the interval
 * when more than two keys get pressed so ¯\_(ツ)_/¯
 * @param callback function that will run repeatedly until keyup
 * @param keys keys which activate the callback
 * @param debounce optional delay after first callback trigger before repetition starts @default 50
 * @param interval repeat speed in milliseconds between callbacks; @default 50
 */
const useKeyPressedCallback = (
  callback: (...args: any) => any,
  keys: string[],
  debounce: number = 500,
  interval: number = 500
) => {
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  // const fallbackTimeoutRef = useRef<number | null>(null);
  const keyIsAlreadyDown = useRef(false);
  const reset = () => {
    keyIsAlreadyDown.current = false;
    clearInterval(intervalRef.current!);
    clearTimeout(timeoutRef.current!);
    timeoutRef.current = null;
    intervalRef.current = null;
  };
  useEffect(() => {
    /** onKeydown checks if the event involves a trigger key and if so triggers callback then the repeat interval */
    const onKeyDown = (event: KeyboardEvent) => {
      const wasTriggerKeyPressed = (event: KeyboardEvent) =>
        keys.some(key => key === event.key);
      if (wasTriggerKeyPressed(event)) {
        event.preventDefault();
        //only run subsequent code (i.e. do anything) if the timeout and interval refs have been cleaned up by keyup
        if (!keyIsAlreadyDown.current) {
          keyIsAlreadyDown.current = true;
          callback();
          timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(callback, interval);
          }, debounce);
        }
        document.addEventListener(
          "keyup",
          (event: KeyboardEvent) => {
            wasTriggerKeyPressed(event) && reset();
          },
          { once: true }
        );
      }
    };
    document.addEventListener("keydown", onKeyDown);
    //return a cleanup which removes our main listener and the listeners
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []); //useeffect will remake everything if any of the parameters change
};

export default useKeyPressedCallback;
