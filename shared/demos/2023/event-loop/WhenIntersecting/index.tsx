import { FunctionalComponent, h } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';

const WhenIntersecting: FunctionalComponent = ({ children }) => {
  const [isIntersecting, setIsIntersecting] = useState(true);
  const el = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!el.current) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsIntersecting(entry.isIntersecting),
    );
    observer.observe(el.current);
    return () => observer.disconnect();
  }, [el.current]);

  return (
    <div ref={el} class="intersector">
      {isIntersecting && children}
    </div>
  );
};

export default WhenIntersecting;
