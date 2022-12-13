import { Fragment, FunctionalComponent, h } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';

const WhenIntersecting: FunctionalComponent = ({ children }) => {
  const isIntersecting = useSignal(false);
  const el = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!el.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => (isIntersecting.value = entry.isIntersecting),
    );
    observer.observe(el.current);
    return () => observer.disconnect();
  }, [el.current]);

  return (
    <div ref={el} class="intersector">
      {(isIntersecting.value || __PRERENDER__) && children}
    </div>
  );
};

export default WhenIntersecting;
