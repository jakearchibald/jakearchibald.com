import { Component, h } from 'preact';

interface Props {}

interface State {
  initialRender: boolean;
}

export default class ImageTabs extends Component<Props, State> {
  state: State = {
    initialRender: true,
  };

  componentDidMount() {
    this.setState({ initialRender: false });
  }

  render({}: Props, { initialRender }: State) {
    return (
      <p>
        Will this actually work? Is this the initial render:{' '}
        {initialRender ? 'yes' : 'no'}.
      </p>
    );
  }
}
