import { Component, h, RenderableProps, JSX } from 'preact';

interface Props {
  input: JSX.IntrinsicElements['input'];
}

interface State {}

export default class MaterialCheckbox extends Component<Props, State> {
  state = {};

  render({ input }: RenderableProps<Props>, {}: State) {
    return (
      <div class="md-checkbox">
        <input {...input} type="checkbox" />
        <div class="md-checkbox-shape">
          <svg class="md-checkbox-shape-checkmark" viewBox="0 0 24 24">
            <path
              fill="none"
              stroke="white"
              d="M1.73,12.91 8.1,19.28 22.79,4.59"
            />
          </svg>
        </div>
        <div class="md-checkbox-ripple" />
      </div>
    );
  }
}
