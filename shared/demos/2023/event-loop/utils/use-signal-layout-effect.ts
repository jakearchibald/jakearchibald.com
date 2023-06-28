import { effect } from '@preact/signals';
import { useLayoutEffect, useRef } from 'preact/hooks';

/**
 * The `useLayoutEffect()` version of `useSignalEffect()`
 */
export function useSignalLayoutEffect(cb: () => void | (() => void)) {
  const callback = useRef(cb);
  callback.current = cb;
  useLayoutEffect(() => effect(() => callback.current()), []);
}
