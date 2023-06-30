import { FunctionalComponent, h } from 'preact';
import { useComputed, useSignal } from '@preact/signals';
import { useSignalLayoutEffect } from '../utils/use-signal-layout-effect';
import { useRef } from 'preact/hooks';

const PauseOutOfViewAnims: FunctionalComponent = ({ children }) => {
  const el = useRef<HTMLDivElement>(null);
  const intersecting = useSignal(true);

  useSignalLayoutEffect(() => {
    if (!el.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => (intersecting.value = entry.isIntersecting),
    );
    observer.observe(el.current);
    return () => observer.disconnect();
  });

  const visible = useSignal(
    __PRERENDER__ ? true : document.visibilityState === 'visible',
  );

  useSignalLayoutEffect(() => {
    const onVisibilityChange = () =>
      (visible.value = document.visibilityState === 'visible');

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange);
  });

  const pauseAnims = useComputed(() => !intersecting.value || !visible.value);

  useSignalLayoutEffect(() => {
    if (!el.current) return;

    for (const anim of el.current.getAnimations({ subtree: true })) {
      if (pauseAnims.value) {
        anim.pause();
      } else {
        anim.play();
      }
    }
  });

  return (
    <div ref={el} class="intersector">
      {children}
    </div>
  );
};

export default PauseOutOfViewAnims;
