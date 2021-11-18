import { Component, Fragment, FunctionalComponent, h, createRef } from 'preact';
import { compositeUnmultiplied, lighter, Pixel, sourceOver } from './composite';

const styles = `
.form-rows input[type=number] {
  width: 100%;
  margin: 0;
  box-sizing: border-box;
  font: inherit;
  line-height: 1.5;
  padding: 0 0.2em;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

.form-rows .label {
  vertical-align: top;
}

.form-rows .input {
  padding: 0.5em;
}

.form-rows .input-result {
  padding: 0.5em calc(0.5em + 0.2em + 2px);
}

@media (max-width: 450px) {
  .ination {
    display: none;
  }
}

.color-view {
  position: relative;
  height: 28px;
  box-sizing: border-box;
  width: 100%;
  border: 1px solid rgb(118, 118, 118);
  border-radius: 2px;
  overflow: hidden;
}

.color-view > div {
  position: absolute;
  inset: 0;
}

.pixel-calc-grid-table {
  display: grid;
  grid-template-columns: max-content 1fr 1fr 1fr 1fr minmax(10px, 56px);
}

.pixel-calc-grid-table .field {
  display: contents;
}

.pixel-calc-grid-table .label,
.pixel-calc-grid-table .input {
  display: block;
  width: auto;
}
`;

export const PixelCalculatorStyles: FunctionalComponent = () => (
  <style dangerouslySetInnerHTML={{ __html: styles }} />
);

export const Styles: FunctionalComponent = () => (
  <Fragment>
    <PixelCalculatorStyles />
  </Fragment>
);

type Methods = 'source-over' | 'lighter';

const compositeMethods = {
  'source-over': sourceOver,
  lighter: lighter,
};

interface Props {
  initialMethod: Methods;
  initialPixel: Pixel;
}

interface State {
  source: Pixel;
  destination: Pixel;
  result: Pixel;
}

export default class PixelCalculator extends Component<Props, State> {
  state: State = {
    source: this.props.initialPixel,
    destination: this.props.initialPixel,
    result: compositeUnmultiplied(
      compositeMethods[this.props.initialMethod],
      this.props.initialPixel,
      this.props.initialPixel,
    ),
  };

  private _sourceRefs = this.props.initialPixel.map(() =>
    createRef<HTMLInputElement>(),
  );
  private _destinationRefs = this.props.initialPixel.map(() =>
    createRef<HTMLInputElement>(),
  );

  private _onInput = () => {
    const source = this._sourceRefs.map(
      (ref) => ref.current!.valueAsNumber,
    ) as Pixel;
    const destination = this._destinationRefs.map(
      (ref) => ref.current!.valueAsNumber,
    ) as Pixel;

    this.setState({
      source,
      destination,
      result: compositeUnmultiplied(
        compositeMethods[this.props.initialMethod],
        source,
        destination,
      ),
    });
  };

  render(_: Props, { result, source, destination }: State) {
    return (
      <form class="form-rows">
        <div class="form-rows-inner pixel-calc-grid-table">
          <div class="field">
            <div></div>
            <div class="label">Red</div>
            <div class="label">Green</div>
            <div class="label">Blue</div>
            <div class="label">Alpha</div>
            <div class="label"></div>
          </div>
          <div class="field">
            <div class="label">Source:</div>
            {source.map((num, i) => (
              <div class="input">
                <input
                  onInput={this._onInput}
                  ref={this._sourceRefs[i]}
                  type="number"
                  required
                  value={num}
                />
              </div>
            ))}
            <div class="input">
              <ColorView color={source} />
            </div>
          </div>
          <div class="field">
            <div class="label">
              Dest<span class="ination">ination</span>:
            </div>
            {destination.map((num, i) => (
              <div class="input">
                <input
                  onInput={this._onInput}
                  ref={this._destinationRefs[i]}
                  type="number"
                  required
                  value={num}
                />
              </div>
            ))}
            <div class="input">
              <ColorView color={destination} />
            </div>
          </div>
          <div class="field">
            <div class="label">Result:</div>
            {result.map((num) => (
              <div class="input input-result">{num.toFixed(3)}</div>
            ))}
            <div class="input">
              <ColorView color={result} />
            </div>
          </div>
        </div>
      </form>
    );
  }
}

export const ColorView: FunctionalComponent<{ color: Pixel }> = ({ color }) => (
  <div class="checkd color-view">
    <div
      style={{
        background: `rgba(${color.map((n) => n * 100 + '%').join(',')})`,
      }}
    ></div>
  </div>
);
