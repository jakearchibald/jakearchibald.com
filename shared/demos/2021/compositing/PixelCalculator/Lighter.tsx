import { Component, h } from 'preact';
import { Colors, CrossFadeRange, Fields, Header, Results } from '.';
import { Pixel, multiplyAlpha, unmultiplyAlpha, clamp01 } from './utils';

interface Props {
  initialFrom: Pixel;
  initialTo: Pixel;
}

interface CalculateResult {
  destination: Pixel;
  source: Pixel;
  premultipliedSource: Pixel;
  premultipliedDestination: Pixel;
  premultipliedResult: Pixel;
  result: Pixel;
}

interface State extends CalculateResult {
  fromColor: Pixel;
  toColor: Pixel;
  mix: number;
}

function calculate(
  fromColor: Pixel,
  toColor: Pixel,
  mix: number,
): CalculateResult {
  const destination = fromColor.slice() as Pixel;
  destination[3] *= 1 - mix;

  const source = toColor.slice() as Pixel;
  source[3] *= mix;

  const premultipliedSource = multiplyAlpha(source);
  const premultipliedDestination = multiplyAlpha(destination);

  const premultipliedResult = premultipliedDestination.map((channel, i) =>
    clamp01(channel + premultipliedSource[i]),
  ) as Pixel;

  const result = unmultiplyAlpha(premultipliedResult);

  return {
    destination,
    source,
    premultipliedSource,
    premultipliedDestination,
    premultipliedResult,
    result,
  };
}

const initialMix = 0.5;

export default class Lighter extends Component<Props, State> {
  state: State = {
    fromColor: this.props.initialFrom,
    toColor: this.props.initialTo,
    mix: initialMix,
    ...calculate(this.props.initialFrom, this.props.initialTo, initialMix),
  };

  private _fromChange = (fromColor: Pixel) => {
    this.setState({ fromColor });
  };

  private _toChange = (toColor: Pixel) => {
    this.setState({ toColor });
  };

  private _mixChange = (mix: number) => {
    this.setState({ mix });
  };

  componentDidUpdate(_: Props, prevState: State) {
    const watchProps: (keyof State)[] = ['fromColor', 'toColor', 'mix'];
    const changed = watchProps.some(
      (prop) => prevState[prop] !== this.state[prop],
    );
    if (!changed) return;

    const { fromColor, toColor, mix } = this.state;
    this.setState(calculate(fromColor, toColor, mix));
  }

  render(
    _: Props,
    {
      fromColor,
      toColor,
      mix,
      destination,
      source,
      premultipliedDestination,
      premultipliedSource,
      premultipliedResult,
      result,
    }: State,
  ) {
    return (
      <div class="full-figure max-figure pixel-calculator-figure">
        <div class="pixel-calculator">
          <Header />
          <Fields label="From" pixel={fromColor} onChange={this._fromChange} />
          <Fields label="To" pixel={toColor} onChange={this._toChange} />
          <CrossFadeRange value={mix} onChange={this._mixChange} />
          <Results label="Destination" pixel={destination} />
          <Results label="Source" pixel={source} />
          <Results
            label="Premultiplied destination"
            pixel={premultipliedDestination}
          />
          <Results label="Premultiplied source" pixel={premultipliedSource} />
          <Results label="Premultiplied result" pixel={premultipliedResult} />
          <Results label="Result" pixel={result} />
        </div>
        <Colors destination={destination} source={source} result={result} />
      </div>
    );
  }
}
