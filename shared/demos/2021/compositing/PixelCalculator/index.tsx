import {
  Component,
  FunctionalComponent,
  h,
  createRef,
  ComponentChildren,
} from 'preact';
import { Pixel } from './utils';

const styles = `
.pixel-calculator input[type=number] {
  margin: 0;
  font: inherit;
  line-height: 1.5;
  padding: 0 0.2em;
  width: 100%;
  box-sizing: border-box;
  padding: 0 0.4rem;
  border: 1px solid #ccc;
  color: inherit;
  font: inherit;
  border-radius: 0;
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

.pixel-calculator-figure {
  overflow: visible;
  background: #fff;
}

.pixel-calculator {
  display: grid;
  grid-template-columns: auto 1fr;
}

.pixel-calculator-row {
  display: contents;
}

.pixel-calculator-row > :first-child {
  grid-column: 1;
}

.pixel-calculator-inner-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: #ececec;
  padding: 0.5em;
  gap: 0.5em;
}

.pixel-calculator-row:nth-child(odd) .pixel-calculator-inner-grid {
  background: #f7f7f7;
}

.pixel-calculator-row:nth-child(odd) .pixel-calculator-label {
  background: #3cb39d;
}

.pixel-calculator-label {
  padding: 0.5em;
}

.pixel-calculator-label,
.pixel-calculator-header.pixel-calculator-row .pixel-calculator-inner-grid {
  color: #fff;
  background: #009d81;
}

.pixel-calculator-header {
  text-align: center;
  top: 0;
}

.pixel-calculator-label {
  padding-left: 20px;
}

@media (min-width: 530px) {
  .pixel-calculator-label {
    padding-left: 32px;
  }
}

.pixel-calculator-field {
  display: grid;
  align-items: center;
}

.pixel-calculator-range {
  grid-column-end: span 3;
}

.pixel-calculator-range input {
  width: 100%;
}

.pixel-calculator-result {
  padding-left: calc(1px + 0.4em);
}

.pixel-calculator-colors {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  height: 100px;
}

.pixel-calculator-colors > * {
  display: grid;
  align-items: center;
  justify-items: center;
}

.pixel-calculator-color-label {
  color: #fff;
  font-size: 1.4rem;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
}
`;

export const Styles: FunctionalComponent = () => (
  <style dangerouslySetInnerHTML={{ __html: styles }} />
);

export const Header: FunctionalComponent = () => (
  <div class="pixel-calculator-row pixel-calculator-header">
    <div class="pixel-calculator-inner-grid" style="grid-column: 2">
      <div>Red</div>
      <div>Green</div>
      <div>Blue</div>
      <div>Alpha</div>
    </div>
  </div>
);

interface ResultsProps {
  pixel: Pixel;
  label: ComponentChildren;
}

export const Results: FunctionalComponent<ResultsProps> = ({
  pixel,
  label,
}) => (
  <div class="pixel-calculator-row pixel-calculator-fields">
    <div class="pixel-calculator-label">{label}</div>
    <div class="pixel-calculator-inner-grid">
      {pixel.map((channel) => (
        <div class="pixel-calculator-field pixel-calculator-result">
          {channel.toFixed(3)}
        </div>
      ))}
    </div>
  </div>
);

interface FieldsProps {
  pixel: Pixel;
  label: ComponentChildren;
  onChange: (pixel: Pixel) => void;
}

export class Fields extends Component<FieldsProps> {
  private _refs = this.props.pixel.map(() => createRef<HTMLInputElement>());

  private _onInput = () => {
    this.props.onChange(
      this._refs.map((ref) => ref.current!.valueAsNumber) as Pixel,
    );
  };

  render({ pixel, label }: FieldsProps) {
    return (
      <div class="pixel-calculator-row pixel-calculator-fields">
        <div class="pixel-calculator-label">{label}</div>
        <div class="pixel-calculator-inner-grid">
          {pixel.map((channel, i) => (
            <div class="pixel-calculator-field">
              <input
                onInput={this._onInput}
                ref={this._refs[i]}
                type="number"
                required
                value={channel}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
}

interface CrossFadeRangeProps {
  value: number;
  onChange: (value: number) => void;
}

export class CrossFadeRange extends Component<CrossFadeRangeProps> {
  private _onInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.props.onChange(input.valueAsNumber);
  };

  render({ value }: CrossFadeRangeProps) {
    return (
      <div class="pixel-calculator-row pixel-calculator-cross-fade">
        <div class="pixel-calculator-label">Cross-fade</div>
        <div class="pixel-calculator-inner-grid">
          <div class="pixel-calculator-field pixel-calculator-range">
            <input
              min="0"
              max="1"
              step="0.001"
              type="range"
              onInput={this._onInput}
              value={value}
            />
          </div>
          <div class="pixel-calculator-field">
            <input
              onInput={this._onInput}
              type="number"
              required
              value={value}
            />
          </div>
        </div>
      </div>
    );
  }
}

interface ColorsProps {
  source: Pixel;
  destination: Pixel;
  result: Pixel;
}

const pixelToCSSColor = (pixel: Pixel) =>
  `rgba(${pixel.map((channel) => channel * 100 + '%').join(',')})`;

export const Colors: FunctionalComponent<ColorsProps> = ({
  destination,
  result,
  source,
}) => (
  <div class="pixel-calculator-colors checkd">
    <div style={{ background: pixelToCSSColor(destination) }}>
      <div class="pixel-calculator-color-label">Destination</div>
    </div>
    <div style={{ background: pixelToCSSColor(source) }}>
      <div class="pixel-calculator-color-label">Source</div>
    </div>
    <div style={{ background: pixelToCSSColor(result) }}>
      <div class="pixel-calculator-color-label">Result</div>
    </div>
  </div>
);
