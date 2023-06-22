import { Ref, useLayoutEffect, useRef } from 'preact/hooks';

export default function useOnResize(
  elRef: Ref<null | HTMLElement>,
  callback: () => void,
) {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useLayoutEffect(() => {
    if (!elRef.current) throw Error('Expected element for resize hook');

    const observer = new ResizeObserver(() => callback());

    observer.observe(elRef.current);
    return () => observer.disconnect();
  }, []);
}
