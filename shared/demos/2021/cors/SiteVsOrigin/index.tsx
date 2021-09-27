import { Component, Fragment, FunctionalComponent, h, createRef } from 'preact';

import { getSite } from './psl';

const styles = `
.form-rows input[type=url] {
  width: 100%;
  margin: 0;
  box-sizing: border-box;
  font: inherit;
  line-height: 1.5;
  padding: 0 0.2em;
}

.form-rows .label {
  vertical-align: top;
}

.form-rows .input {
  padding: 0.5em;
}
`;

export const SiteVsOriginStyles: FunctionalComponent = () => (
  <style dangerouslySetInnerHTML={{ __html: styles }} />
);

export const Styles: FunctionalComponent = () => (
  <Fragment>
    <SiteVsOriginStyles />
  </Fragment>
);

const enum ResultState {
  Loading,
  Success,
  Error,
}

interface URLState {
  url: string;
  origin: string;
  site: string;
}

interface Props {}

interface State {
  urlState: [URLState, URLState];
  resultState: ResultState;
}

export default class SiteVsOrigin extends Component<Props, State> {
  state: State = {
    urlState: [
      {
        url: 'https://app.jakearchibald.com/foo',
        origin: 'https://app.jakearchibald.com',
        site: 'jakearchibald.com',
      },
      {
        url: 'https://other-app.jakearchibald.com/bar',
        origin: 'https://other-app.jakearchibald.com',
        site: 'jakearchibald.com',
      },
    ],
    resultState: ResultState.Success,
  };

  private _url1Input = createRef<HTMLInputElement>();
  private _url2Input = createRef<HTMLInputElement>();

  private _processQueue: Promise<unknown> = Promise.resolve();

  private _processTimeout?: number;

  private _onInput = () => {
    if (this._processTimeout) clearTimeout(this._processTimeout);

    this._processTimeout = setTimeout(() => this._process(), 100);

    this.setState({
      urlState: [
        { url: this._url1Input.current!.value, origin: '…', site: '…' },
        { url: this._url2Input.current!.value, origin: '…', site: '…' },
      ],
      resultState: ResultState.Loading,
    });
  };

  private async _process() {
    let errored = false;
    let results: { site: string; origin: string }[];

    await (this._processQueue = this._processQueue
      .catch(() => {})
      .then(async () => {
        results = await Promise.all(
          this.state.urlState.map(async ({ url }) => {
            let urlObj: URL;

            try {
              urlObj = new URL(url);
            } catch (error) {
              errored = true;
              return { site: '', origin: (error as Error).message };
            }

            try {
              const site = await getSite(urlObj.hostname);
              return { site, origin: urlObj.origin };
            } catch (error) {
              errored = true;
              return {
                origin: urlObj.origin,
                site: (error as Error).message,
              };
            }
          }),
        );
      }));

    this.setState({
      urlState: [
        { ...this.state.urlState[0], ...results![0] },
        { ...this.state.urlState[1], ...results![1] },
      ],
      resultState: errored ? ResultState.Error : ResultState.Success,
    });
  }

  render(_: Props, { urlState, resultState }: State) {
    return (
      <form class="form-rows">
        <div class="form-rows-inner">
          {urlState.map(({ url, origin, site }, index) => (
            <Fragment>
              <div class="field">
                <label for={`url-${index}-input`} class="label">
                  URL {index + 1}:
                </label>
                <div class="input">
                  <input
                    onInput={this._onInput}
                    ref={index === 0 ? this._url1Input : this._url2Input}
                    id={`url-${index}-input`}
                    required
                    type="url"
                    value={url}
                  />
                </div>
              </div>
              <div class="field">
                <div class="label">Origin:</div>
                <div class="input">{origin}</div>
              </div>
              <div class="field">
                <div class="label">Site:</div>
                <div class="input">{site}</div>
              </div>
            </Fragment>
          ))}
          <div class="field">
            <div class="label">Same origin:</div>
            <div class="input">
              {resultState === ResultState.Loading
                ? '…'
                : resultState === ResultState.Error
                ? ''
                : urlState[0].origin === urlState[1].origin
                ? '✅'
                : '❌'}
            </div>
          </div>
          <div class="field">
            <div class="label">Same site:</div>
            <div class="input">
              {resultState === ResultState.Loading
                ? '…'
                : resultState === ResultState.Error
                ? ''
                : urlState[0].site === urlState[1].site
                ? '✅'
                : '❌'}
            </div>
          </div>
        </div>
      </form>
    );
  }
}
