/**Taken from Becca Peckman: https://gist.github.com/becpeck/68b7a44d302e63a15b95d73af37579ff*/
import { useState } from 'react';
import { type ZodSchema } from 'zod';

export default function useLocalZtorage<T, S extends ZodSchema<T>>(
  key: string,
  schema: S,
  initialValue: T
): [T, (valueOrCallback: T | ((prevValue: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = window.localStorage.getItem(key);
    const { success, data } = schema.safeParse(JSON.parse(item!));
    if (!success) {
      window.localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    }
    return data;
  });
  //setter function sets state and local storage
  const setValue = (valueOrCallback: T | ((prevValue: T) => T)) => {
    setStoredValue((prevValue) => {
      const newValue =
        valueOrCallback instanceof Function
          ? valueOrCallback(prevValue)
          : valueOrCallback;
      window.localStorage.setItem(key, JSON.stringify(newValue));
      return newValue;
    });
  };

  return [storedValue, setValue];
}
