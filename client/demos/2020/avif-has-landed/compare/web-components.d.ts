import type { JSXInternal } from 'preact/src/jsx';

declare module 'preact/src/jsx' {
  namespace JSXInternal {
    interface IntrinsicElements {
      'two-up': TwoUpAttributes;
      'pinch-zoom': HTMLAttributes;
    }
    interface HTMLAttributes { }
  }
}

interface TwoUpAttributes extends JSXInternal.HTMLAttributes {
  'legacy-clip-compat'?: boolean;
  orientation?: 'horizontal' | 'vertical';
}
