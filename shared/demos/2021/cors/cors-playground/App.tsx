import { Component, h, createRef } from 'preact';
import MaterialCheckbox from './MaterialCheckbox';
import MaterialText from './MaterialText';

interface Props {}

interface State {
  requestMethod: string;
}

export default class App extends Component<Props, State> {
  state: State = {
    requestMethod: 'GET',
  };

  private _requestMethod = createRef<HTMLInputElement>();

  onInput = () => {
    this.setState({
      requestMethod: this._requestMethod.current!.value,
    });
  };

  render(_: Props, { requestMethod }: State) {
    return (
      <div class="app">
        <header></header>
        <main>
          <form>
            <h2>Request</h2>
            <div class="field-grid">
              <div class="field">
                <label class="checkbox-field">
                  <MaterialCheckbox input={{}} /> Use CORS
                </label>
              </div>
              <div class="field">
                <label class="checkbox-field">
                  <MaterialCheckbox input={{}} /> Send credentials
                </label>
              </div>
              <div class="field">
                <MaterialText
                  label="Method"
                  input={{
                    value: requestMethod,
                    ref: this._requestMethod,
                    onInput: this.onInput,
                  }}
                />
              </div>

              <div class="field">
                <MaterialText
                  label="Method"
                  input={{
                    value: requestMethod,
                    ref: this._requestMethod,
                    onInput: this.onInput,
                  }}
                />
              </div>
              <div class="field">
                <MaterialText
                  label="Method"
                  input={{
                    value: requestMethod,
                    ref: this._requestMethod,
                    onInput: this.onInput,
                  }}
                />
              </div>
            </div>
          </form>
        </main>
      </div>
    );
  }
}
