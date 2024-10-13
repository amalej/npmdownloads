import { useEffect, useRef } from "react";

// Skips running the use effect callback on first render.
export const useDidMountEffect = (
  func: React.EffectCallback,
  deps?: React.DependencyList
) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
};
