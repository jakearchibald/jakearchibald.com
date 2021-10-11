import { Component, h, createRef, Fragment, FunctionalComponent } from 'preact';
import MaterialCheckbox from './MaterialCheckbox';
import MaterialText from './MaterialText';
import 'shared/loading-spinner';

type KeyValue = [key: string, value: string];

interface Result {
  preflightHeaders?: KeyValue[];
  requestHeaders?: KeyValue[];
  requestMethod?: string;
  responseInfo?: string;
  responseHeaders?: KeyValue[];
  error?: string;
}

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
  result?: Result;
  loading: boolean;
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
  loading: false,
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
  private _resultsAreaRef = createRef<HTMLDivElement>();

  componentDidUpdate(_: {}, previousState: Readonly<State>) {
    if (
      (this.state.loading && !previousState.loading) ||
      (this.state.result && this.state.result !== previousState.result)
    ) {
      this._resultsAreaRef.current!.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private _onInput = () => {
    this.setState(dataToState(new FormData(this._formRef.current!)));
  };

  private _onAddHeaderClick = () => {
    this.setState(
      (state) => ({
        requestHeaders: [...state.requestHeaders, ['', '']],
      }),
      () => {
        const base = this.base as HTMLDivElement;
        const inputs = [
          ...base.querySelectorAll('input[name=requestHeaderName]'),
        ] as HTMLInputElement[];
        inputs[inputs.length - 1].focus();
      },
    );
  };

  private _onRemoveHeaderClick = (event: Event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const index = Number(button.dataset.index);
    this.setState((state) => ({
      requestHeaders: state.requestHeaders.filter((_, i) => i !== index),
    }));
  };

  private _onAddCookieClick = () => {
    this.setState(
      (state) => ({
        responseCookies: [...state.responseCookies, ['', '']],
      }),
      () => {
        const base = this.base as HTMLDivElement;
        const inputs = [
          ...base.querySelectorAll('input[name=responseCookieName]'),
        ] as HTMLInputElement[];
        inputs[inputs.length - 1].focus();
      },
    );
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
      if (controller.signal.aborted) throw new DOMException('', 'AbortError');

      const timeout = setTimeout(() => {
        this.setState({ loading: true });
      }, 1000);

      try {
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
        params.set(
          'access-control-expose-headers',
          state.responseExposeHeaders,
        );

        for (const [name, value] of state.responseCookies) {
          if (!name) continue;
          params.append('cookie-name', name);
          params.append('cookie-value', value);
        }

        let request: Request;

        try {
          request = new Request(url.href, {
            method: state.requestMethod,
            mode: state.requestUseCORS ? 'cors' : 'no-cors',
            credentials: state.requestSendCredentials ? 'include' : 'omit',
            headers: state.requestHeaders.filter(([name]) => name),
            signal: controller.signal,
          });
        } catch (error: any) {
          this.setState({
            loading: false,
            result: {
              error: `Failed to construct the Request object (${error.message}). The browser console may have additional information.`,
            },
          });
          console.error(error);
          return;
        }

        let response: Response | undefined;
        const result: State['result'] = {};

        try {
          response = await fetch(request);
        } catch (error: any) {
          result.responseInfo = `Failed to get a response. The browser console may have additional information.`;
          console.error(error);
        }

        if (response) {
          if (response.type === 'opaque') {
            result.responseInfo = `A response was received, but it's opaque, so the headers & body are not visible to JavaScript on this page.`;
          } else {
            result.responseInfo = `The response is visible to JavaScript on this page. Here are the visible headers:`;
            result.responseHeaders = [...response.headers];
          }
        }

        let details: any;

        const detailsUrl = new URL(
          'https://cors-playground.deno.dev/resource-details',
        );
        detailsUrl.searchParams.set('id', id);

        try {
          details = await fetch(detailsUrl.href).then((r) => r.json());
        } catch (error: any) {
          this.setState({
            loading: false,
            result: {
              error: `Something went wrong when getting server logs. The browser console may have additional information.`,
            },
          });
          console.error(error);
          return;
        }

        if (typeof details === 'object' && details) {
          if ('method' in details && typeof details.method === 'string') {
            result.requestMethod = details.method;
          }
          if (Array.isArray(details.headers)) {
            result.requestHeaders = details.headers
              .filter(
                (header: unknown) =>
                  Array.isArray(header) && header.length === 2,
              )
              .map((header: [unknown, unknown]) => [
                String(header[0]),
                String(header[1]),
              ]);
          }
          if (Array.isArray(details.preflightHeaders)) {
            result.preflightHeaders = details.preflightHeaders
              .filter(
                (header: unknown) =>
                  Array.isArray(header) && header.length === 2,
              )
              .map((header: [unknown, unknown]) => [
                String(header[0]),
                String(header[1]),
              ]);
          }
        }

        this.setState({ result, loading: false });
      } finally {
        clearTimeout(timeout);
      }
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
          {(state.result || state.loading) && (
            <div class="result-area" ref={this._resultsAreaRef}>
              <h2>Result</h2>
              {state.loading && (
                <p>
                  <loading-spinner />
                </p>
              )}
              {state.result && (
                <Fragment>
                  {state.result.error ? (
                    <p>{state.result.error}</p>
                  ) : (
                    <Fragment>
                      <h3>Preflight request</h3>
                      {state.result.preflightHeaders ? (
                        <Fragment>
                          <p>
                            Received a preflight request with the following
                            headers:
                          </p>
                          <HeadersTable
                            headers={state.result.preflightHeaders}
                          />
                        </Fragment>
                      ) : (
                        <p>No preflight request received.</p>
                      )}
                      <h3>Main request</h3>
                      {state.result.requestHeaders ? (
                        <Fragment>
                          <p>
                            Received a request with method "
                            <code>{state.result.requestMethod || ''}</code>"
                            with the following headers:
                          </p>
                          <HeadersTable headers={state.result.requestHeaders} />
                        </Fragment>
                      ) : (
                        <p>No main request received.</p>
                      )}
                      <h3>Response</h3>
                      {state.result.responseInfo && (
                        <p>{state.result.responseInfo}</p>
                      )}
                      {state.result.responseHeaders && (
                        <HeadersTable headers={state.result.responseHeaders} />
                      )}
                    </Fragment>
                  )}
                </Fragment>
              )}
            </div>
          )}
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
        value: (props.state[props.name] || '').toString(),
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

interface HeadersTable {
  headers: KeyValue[];
}

const HeadersTable: FunctionalComponent<HeadersTable> = (props) => (
  <table class="headers-table">
    {props.headers.map(([name, value]) => (
      <tr>
        <td>{name}</td>
        <td>{value}</td>
      </tr>
    ))}
  </table>
);
