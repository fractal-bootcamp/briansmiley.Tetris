import { useEffect, useRef } from 'react';

import { useState } from 'react';
/**Wrapper for useState which also returns a ref for the state variable that is kept in sync with it for passing to handlers etc. */
const useStateWithRef = <T,>(initialState: T) => {
  const [state, setState] = useState<T>(initialState);
  const stateRef = useRef<T>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return [state, setState, stateRef] as const;
};

export default useStateWithRef;
