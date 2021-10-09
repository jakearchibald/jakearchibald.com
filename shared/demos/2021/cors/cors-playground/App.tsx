import { Component, h, createRef, Fragment } from 'preact';
import MaterialCheckbox from './MaterialCheckbox';
import MaterialText from './MaterialText';

type HeaderState = [name: string, value: string];

interface Props {}

interface State {
  requestUseCORS: boolean;
  requestSendCredentials: boolean;
  requestMethod: string;
  requestHeaders: HeaderState[];
}

function dataToRequestHeaderState(
  data: FormData | URLSearchParams,
): HeaderState[] {
  const headerNames = data.getAll('requestHeaderName');
  const headerValues = data.getAll('requestHeaderValue');

  return headerNames.map((name, i) => {
    const headerValue = headerValues[i];
    return [(name || '').toString(), (headerValue || '').toString()];
  });
}

function dataToState(data: FormData | URLSearchParams): State {
  return {
    requestMethod: (data.get('requestMethod') ?? 'GET').toString(),
    requestUseCORS: data.has('requestUseCORS'),
    requestSendCredentials: data.has('requestSendCredentials'),
    requestHeaders: dataToRequestHeaderState(data),
  };
}

const defaultState: State = {
  requestUseCORS: true,
  requestSendCredentials: false,
  requestMethod: 'GET',
  requestHeaders: [],
};

const initialState: Partial<State> = (() => {
  if (__PRERENDER__) return {};
  const data = new URL(location.href).searchParams;
  if (!data.has('prefillForm')) return {};
  return dataToState(data);
})();

export default class App extends Component<Props, State> {
  state: State = {
    ...defaultState,
    ...initialState,
  };

  private _formRef = createRef<HTMLFormElement>();

  private _onInput = () => {
    this.setState(dataToState(new FormData(this._formRef.current!)));
  };

  private _onAddHeaderClick = () => {
    this.setState((state) => ({
      requestHeaders: [...state.requestHeaders, ['', '']],
    }));
  };

  private _onRemoveHeaderClick = (event: Event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const index = Number(button.dataset.index);
    this.setState((state) => ({
      requestHeaders: state.requestHeaders.filter((_, i) => i !== index),
    }));
  };

  render(
    _: Props,
    {
      requestMethod,
      requestUseCORS,
      requestSendCredentials,
      requestHeaders,
    }: State,
  ) {
    return (
      <div class="app">
        <header></header>
        <main>
          <form ref={this._formRef}>
            <h2>Request</h2>
            <div class="field-grid">
              <div class="field">
                <MaterialText
                  label="Method"
                  input={{
                    name: 'requestMethod',
                    value: requestMethod,
                    onInput: this._onInput,
                  }}
                />
              </div>
              <div class="field">
                <label class="checkbox-field">
                  <MaterialCheckbox
                    input={{
                      name: 'requestUseCORS',
                      checked: requestUseCORS,
                      onChange: this._onInput,
                    }}
                  />{' '}
                  Use CORS
                </label>
              </div>
              <div class="field">
                <label class="checkbox-field">
                  <MaterialCheckbox
                    input={{
                      name: 'requestSendCredentials',
                      checked: requestSendCredentials,
                      onChange: this._onInput,
                    }}
                  />{' '}
                  Send credentials
                </label>
              </div>
              {requestHeaders.map(([name, value], i) => (
                <Fragment key={i}>
                  <div class="field new-row">
                    <MaterialText
                      label="Header name"
                      input={{
                        name: 'requestHeaderName',
                        value: name,
                        onInput: this._onInput,
                      }}
                    />
                  </div>
                  <div class="field">
                    <MaterialText
                      label="Header value"
                      input={{
                        name: 'requestHeaderValue',
                        value: value,
                        onInput: this._onInput,
                      }}
                    />
                  </div>
                  <div class="field">
                    <div class="button-field">
                      <button
                        type="button"
                        data-index={i}
                        onClick={this._onRemoveHeaderClick}
                      >
                        Remove header
                      </button>
                    </div>
                  </div>
                </Fragment>
              ))}
              <div class="field new-row">
                <div class="button-field">
                  <button type="button" onClick={this._onAddHeaderClick}>
                    Add header
                  </button>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    );
  }
}
