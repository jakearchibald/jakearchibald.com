import { Component, h, VNode, RenderableProps, JSX } from 'preact';

interface Props {
  label: string;
  input: JSX.IntrinsicElements['input'];
}

interface State {}

export default class MaterialText extends Component<Props, State> {
  state = {};

  render({ label, input }: RenderableProps<Props>, {}: State) {
    return (
      <label class="md-text">
        <input {...input} />
        <span class={'md-text-outline' + (input.value ? '' : ' empty')}>
          <span class="md-text-outline-left" />
          <span class="md-text-outline-label">
            <span class="md-text-outline-label-text">{label}</span>
          </span>
          <span class="md-text-outline-right" />
        </span>
      </label>
    );
  }
}
