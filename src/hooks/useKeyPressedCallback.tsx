import { useEffect, useRef } from 'react';
/**
 * Triggers a callback once on keypress then repeatedly until key is released. This seems to have major issues with never clearing the interval
 * when more than two keys get pressed so ¯\_(ツ)_/¯
 * @param callback function that will run repeatedly until keyup
 * @param keys keys which activate the callback
 * @param debounce optional delay after first callback trigger before repetition starts @default 50
 * @param interval repeat speed in milliseconds between callbacks; @default 50
 */
const useKeyPressedCallback = (
  callback: () => void,
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
  const wasTriggerKeyPressed = (event: KeyboardEvent) =>
    keys.some((key) => key === event.key);
  useEffect(() => {
    /** onKeydown checks if the event involves a trigger key and if so triggers callback then the repeat interval */
    const onKeyDown = (event: KeyboardEvent) => {
      if (wasTriggerKeyPressed(event)) {
        event.preventDefault();
        if (!keyIsAlreadyDown.current) {
          keyIsAlreadyDown.current = true; //set the key to now being down
          callback(); //run the callback
          //set a timeout to begin the regular interval callback after debounce delay
          timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(callback, interval);
          }, debounce);
          document.addEventListener(
            'keyup',
            (event: KeyboardEvent) => {
              wasTriggerKeyPressed(event) && reset();
            },
            { once: true }
          );
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    //return a cleanup which removes our main listener and the listeners
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [callback, debounce, interval, keys]); //useeffect will remake everything if any of the parameters change
};

export default useKeyPressedCallback;
