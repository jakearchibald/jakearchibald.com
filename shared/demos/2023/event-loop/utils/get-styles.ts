export interface StyleInfo {
  rect: DOMRect;
  width: string;
  height: string;
  opacity: string;
  transform: string;
}

export default function getStyles(el: HTMLElement): StyleInfo {
  const { width, height, opacity, transform } = getComputedStyle(el);
  return {
    rect: el.getBoundingClientRect(),
    width,
    height,
    opacity,
    transform,
  };
}
