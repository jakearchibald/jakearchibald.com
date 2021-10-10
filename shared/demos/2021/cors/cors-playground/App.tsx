import { Component, h, createRef, Fragment, FunctionalComponent } from 'preact';
import MaterialCheckbox from './MaterialCheckbox';
import MaterialText from './MaterialText';

type KeyValue = [key: string, value: string];

interface Props {}

interface State {
  requestUseCORS: boolean;
  requestSendCredentials: boolean;
  requestMethod: string;
  requestHeaders: KeyValue[];
  preflightStatus: number;
  preflightAllowOrigin: string;
  preflightAllowCredentials: string;
  preflightAllowMethods: string;
  preflightAllowHeaders: string;
  responseAllowOrigin: string;
  responseAllowCredentials: string;
  responseExposeHeaders: string;
  responseCookies: KeyValue[];
}

function dataToPairs(
  data: FormData | URLSearchParams,
  keysKey: string,
  valuesKey: string,
): KeyValue[] {
  const keys = data.getAll(keysKey);
  const values = data.getAll(valuesKey);

  return keys.map((key, i) => {
    const value = values[i];
    return [(key || '').toString(), (value || '').toString()];
  });
}

const defaultState: State = {
  requestUseCORS: true,
  requestSendCredentials: false,
  requestMethod: 'GET',
  requestHeaders: [],
  preflightStatus: 206,
  preflightAllowOrigin: '',
  preflightAllowCredentials: '',
  preflightAllowMethods: '',
  preflightAllowHeaders: '',
  responseAllowOrigin: '*',
  responseAllowCredentials: '',
  responseExposeHeaders: '',
  responseCookies: [],
};

function dataToState(data: FormData | URLSearchParams) {
  return {
    requestMethod: (data.get('requestMethod') ?? 'GET').toString(),
    requestUseCORS: data.has('requestUseCORS'),
    requestSendCredentials: data.has('requestSendCredentials'),
    requestHeaders: dataToPairs(
      data,
      'requestHeaderName',
      'requestHeaderValue',
    ),
    preflightStatus: Number(
      data.get('preflightStatus') ?? defaultState.preflightStatus,
    ),
    preflightAllowOrigin: (data.get('preflightAllowOrigin') ?? '').toString(),
    preflightAllowCredentials: (
      data.get('preflightAllowCredentials') ?? ''
    ).toString(),
    preflightAllowMethods: (data.get('preflightAllowMethods') ?? '').toString(),
    preflightAllowHeaders: (data.get('preflightAllowHeaders') ?? '').toString(),
    responseAllowOrigin: (data.get('responseAllowOrigin') ?? '').toString(),
    responseAllowCredentials: (
      data.get('responseAllowCredentials') ?? ''
    ).toString(),
    responseExposeHeaders: (data.get('responseExposeHeaders') ?? '').toString(),
    responseCookies: dataToPairs(
      data,
      'responseCookieName',
      'responseCookieValue',
    ),
  };
}

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

  private _onAddCookieClick = () => {
    this.setState((state) => ({
      responseCookies: [...state.responseCookies, ['', '']],
    }));
  };

  private _onRemoveCookieClick = (event: Event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const index = Number(button.dataset.index);
    this.setState((state) => ({
      responseCookies: state.responseCookies.filter((_, i) => i !== index),
    }));
  };

  render(_: Props, state: State) {
    return (
      <div class="app">
        <header></header>
        <main>
          <form ref={this._formRef}>
            <h2>Request</h2>
            <div class="field-grid" style="--min-cell-width: 250px">
              <TextField
                label="Method"
                name="requestMethod"
                state={state}
                onInput={this._onInput}
              />
              <CheckboxField
                label="Use CORS"
                name="requestUseCORS"
                state={state}
                onInput={this._onInput}
              />
              <CheckboxField
                label="Send credentials"
                name="requestSendCredentials"
                state={state}
                onInput={this._onInput}
              />
              {state.requestHeaders.map(([name, value], i) => (
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
            <h2>Preflight response</h2>
            <div class="field-grid">
              <TextField
                label="Status"
                name="preflightStatus"
                state={state}
                onInput={this._onInput}
              />
              <TextField
                label="Access-Control-Allow-Origin"
                name="preflightAllowOrigin"
                state={state}
                onInput={this._onInput}
              />
              <TextField
                label="Access-Control-Allow-Credentials"
                name="preflightAllowCredentials"
                state={state}
                onInput={this._onInput}
              />
              <TextField
                label="Access-Control-Allow-Methods"
                name="preflightAllowMethods"
                state={state}
                onInput={this._onInput}
              />
              <TextField
                label="Access-Control-Allow-Headers"
                name="preflightAllowHeaders"
                state={state}
                onInput={this._onInput}
              />
            </div>
            <h2>Main response</h2>
            <div class="field-grid">
              <TextField
                label="Access-Control-Allow-Origin"
                name="responseAllowOrigin"
                state={state}
                onInput={this._onInput}
              />
              <TextField
                label="Access-Control-Allow-Credentials"
                name="responseAllowCredentials"
                state={state}
                onInput={this._onInput}
              />
              <TextField
                label="Access-Control-Expose-Headers"
                name="responseExposeHeaders"
                state={state}
                onInput={this._onInput}
              />
              {state.responseCookies.map(([name, value], i) => (
                <Fragment key={i}>
                  <div class="field new-row">
                    <MaterialText
                      label="Cookie name"
                      input={{
                        name: 'responseCookieName',
                        value: name,
                        onInput: this._onInput,
                      }}
                    />
                  </div>
                  <div class="field">
                    <MaterialText
                      label="Cookie value"
                      input={{
                        name: 'responseCookieValue',
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
                        onClick={this._onRemoveCookieClick}
                      >
                        Remove cookie
                      </button>
                    </div>
                  </div>
                </Fragment>
              ))}
              <div class="field new-row">
                <div class="button-field">
                  <button type="button" onClick={this._onAddCookieClick}>
                    Add cookie
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

interface FieldProps extends Field {
  label: string;
  type?: HTMLInputElement['type'];
  onInput: (event: Event) => void;
  state: State;
  name: keyof State;
}

const TextField: FunctionalComponent<FieldProps> = (props) => (
  <Field newRow={props.newRow}>
    <MaterialText
      label={props.label}
      input={{
        type: props.type || 'text',
        name: props.name,
        value: props.state[props.name].toString(),
        onInput: props.onInput,
      }}
    />
  </Field>
);

const CheckboxField: FunctionalComponent<FieldProps> = (props) => (
  <Field newRow={props.newRow}>
    <label class="checkbox-field">
      <MaterialCheckbox
        input={{
          name: props.name,
          checked: !!props.state[props.name],
          onChange: props.onInput,
        }}
      />{' '}
      {props.label}
    </label>
  </Field>
);

interface Field {
  newRow?: boolean;
}

const Field: FunctionalComponent<Field> = (props) => (
  <div class={'field' + (props.newRow ? ' new-row' : '')}>{props.children}</div>
);
