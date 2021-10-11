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
    requestUseCORS: Boolean(data.get('requestUseCORS')),
    requestSendCredentials: Boolean(data.get('requestSendCredentials')),
    requestHeaders: dataToPairs(
      data,
      'requestHeaderName',
      'requestHeaderValue',
    ),
    preflightStatus: Number(data.get('preflightStatus') ?? 206),
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

  private _setURL() {
    const url = new URL(location.href);
    url.search = '';
    url.searchParams.append('prefillForm', '1');

    const fields = [
      'requestMethod',
      'requestUseCORS',
      'requestSendCredentials',
      'preflightStatus',
      'preflightAllowOrigin',
      'preflightAllowCredentials',
      'preflightAllowMethods',
      'preflightAllowHeaders',
      'responseAllowOrigin',
      'responseAllowCredentials',
      'responseExposeHeaders',
    ] as const;

    for (const field of fields) {
      if (typeof this.state[field] === 'boolean') {
        url.searchParams.set(field, this.state[field] ? '1' : '');
      } else {
        url.searchParams.set(field, this.state[field].toString());
      }
    }

    for (const [name, value] of this.state.requestHeaders) {
      url.searchParams.append('requestHeaderName', name);
      url.searchParams.append('requestHeaderValue', value);
    }

    for (const [name, value] of this.state.responseCookies) {
      url.searchParams.append('responseCookieName', name);
      url.searchParams.append('responseCookieValue', value);
    }

    history.replaceState(null, '', url.href);
  }

  private _abortController?: AbortController;
  private _queue: Promise<any> = Promise.resolve();

  private _onFormSubmit = (event: Event) => {
    event.preventDefault();
    this._setURL();

    if (this._abortController) this._abortController.abort();
    const controller = new AbortController();
    this._abortController = controller;

    const { state } = this;

    this._queue = this._queue.finally(async () => {
      const id = Math.random().toString();
      const url = new URL('https://cors-playground.deno.dev/resource');
      const params = url.searchParams;

      params.set('id', id);
      params.set('preflight-status', state.preflightStatus.toString());
      params.set(
        'preflight-access-control-allow-origin',
        state.preflightAllowOrigin,
      );
      params.set(
        'preflight-access-control-allow-credentials',
        state.preflightAllowCredentials,
      );
      params.set(
        'preflight-access-control-allow-methods',
        state.preflightAllowMethods,
      );
      params.set(
        'preflight-access-control-allow-headers',
        state.preflightAllowHeaders,
      );
      params.set('access-control-allow-origin', state.responseAllowOrigin);
      params.set(
        'access-control-allow-credentials',
        state.responseAllowCredentials,
      );
      params.set('access-control-expose-headers', state.responseExposeHeaders);

      for (const [name, value] of state.responseCookies) {
        params.append('cookie-name', name);
        params.append('cookie-value', value);
      }

      const request = new Request(url.href, {
        method: state.requestMethod,
        mode: state.requestUseCORS ? 'cors' : 'no-cors',
        credentials: state.requestSendCredentials ? 'include' : 'omit',
        headers: state.requestHeaders,
        signal: controller.signal,
      });

      const response = await fetch(request);
      console.log(response);
    });
  };

  render(_: Props, state: State) {
    return (
      <div class="app">
        <header></header>
        <main>
          <form ref={this._formRef} onSubmit={this._onFormSubmit}>
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
            </div>
            {state.requestHeaders.map(([name, value], i) => (
              <Fragment key={i}>
                <div class="divider">
                  <h3>Header</h3>
                </div>
                <div class="field-grid" style="--min-cell-width: 250px">
                  <div class="field new-row">
                    <MaterialText
                      label="Name"
                      input={{
                        name: 'requestHeaderName',
                        value: name,
                        onInput: this._onInput,
                      }}
                    />
                  </div>
                  <div class="field">
                    <MaterialText
                      label="Value"
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
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </Fragment>
            ))}
            <div class="divider"></div>
            <div class="field-grid" style="--min-cell-width: 250px">
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
            </div>

            {state.responseCookies.map(([name, value], i) => (
              <Fragment key={i}>
                <div class="divider">
                  <h3>Cookie</h3>
                </div>
                <div class="field-grid" style="--min-cell-width: 250px">
                  <div class="field new-row">
                    <MaterialText
                      label="Name"
                      input={{
                        name: 'responseCookieName',
                        value: name,
                        onInput: this._onInput,
                      }}
                    />
                  </div>
                  <div class="field">
                    <MaterialText
                      label="Value"
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
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </Fragment>
            ))}
            <div class="divider"></div>
            <div class="field-grid" style="--min-cell-width: 250px">
              <div class="field new-row">
                <div class="button-field">
                  <button type="button" onClick={this._onAddCookieClick}>
                    Add cookie
                  </button>
                </div>
              </div>
            </div>
            <div class="divider"></div>
            <div class="field-grid" style="--min-cell-width: 250px">
              <div class="button-field">
                <button>Make request</button>
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
          value: '1',
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
