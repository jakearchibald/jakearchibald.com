import { FunctionalComponent, h } from 'preact';

interface Props {
  open: boolean;
}

const Door: FunctionalComponent<Props> = ({ open }) => {
  return (
    <g class="door">
      <circle class="door-hinge" r="3" />
      <path class="door-path" d="M 0 0 V47" />
    </g>
  );
};

export default Door;
