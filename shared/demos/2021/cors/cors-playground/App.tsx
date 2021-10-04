import { Component, h } from 'preact';

interface Props {}

interface State {}

export default class App extends Component<Props, State> {
  state = {};

  render(_: Props, {}: State) {
    return <p>Hello there!</p>;
  }
}
