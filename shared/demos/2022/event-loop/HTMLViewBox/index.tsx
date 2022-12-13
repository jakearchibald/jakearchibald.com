import { Fragment, FunctionalComponent, h } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { useSignal } from '@preact/signals';

interface Props {
  width: number;
  height: number;
}

const HTMLViewBox: FunctionalComponent<Props> = ({
  width,
  height,
  children,
}) => {
  return (
    <svg class="html-viewport" viewBox={`0 0 ${width} ${height}`}>
      <foreignObject width="100%" height="100%">
        {children}
      </foreignObject>
    </svg>
  );
};

export default HTMLViewBox;
