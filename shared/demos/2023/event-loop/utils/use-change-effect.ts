import { EffectCallback, Inputs, useLayoutEffect, useRef } from 'preact/hooks';

export function useChangeEffect(effect: EffectCallback, inputs?: Inputs) {
  const firstRef = useRef(true);
  useLayoutEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
    } else {
      return effect();
    }
  }, inputs);
}
