import type { HTMLAttributes } from 'preact';

declare global {
  namespace preact.JSX {
    interface IntrinsicElements {
      'two-up': TwoUpAttributes;
      'pinch-zoom': HTMLAttributes;
    }
  }
}

interface TwoUpAttributes extends HTMLAttributes {
  'legacy-clip-compat'?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export {};
