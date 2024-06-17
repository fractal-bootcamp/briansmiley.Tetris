import { useEffect } from "react";
/**
 * Triggers a callback on keypress then repeatedly until key is released
 * @param callback function that will run repeatedly until keyup
 * @param keys keys which activate the callback
 * @param debounce optional delay after first callback trigger before repetition starts
 * @param interval repeat speed in milliseconds between callbacks
 */
const useKeyPressed = (
  callback: (...args: any) => any,
  keys: string[],
  debounce: number = 50,
  interval: number = 50
) => {
  useEffect(() => {
    /** onKeydown checks if the event involves a trigger key and if so triggers callback then the repeat interval */
    const onKeyDown = (event: KeyboardEvent) => {
      const wasTriggerKeyPressed = (event: KeyboardEvent) =>
        keys.some(key => key === event.key);
      if (wasTriggerKeyPressed(event)) {
        event.preventDefault();
        callback(); //run the function once then...
        //set a timeout after which to begin repeating the key's callback
        const intervalTimeoutId = setTimeout(() => {
          const repeatIntervalId = setInterval(callback, interval);
          document.addEventListener(
            "keyup",
            (e: KeyboardEvent) =>
              wasTriggerKeyPressed(e) && clearInterval(repeatIntervalId),
            { once: true }
          );
        }, debounce);
        document.addEventListener(
          "keyup",
          (e: KeyboardEvent) =>
            wasTriggerKeyPressed(e) && clearTimeout(intervalTimeoutId),
          { once: true }
        );
      }
    };
    document.addEventListener("keydown", onKeyDown);
    //return a cleanu which removes our main listener and the listeners
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
};

export default useKeyPressed;
