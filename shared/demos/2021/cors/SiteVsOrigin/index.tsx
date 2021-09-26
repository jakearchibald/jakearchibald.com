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

interface Result {
  sameOrigin: boolean;
  sameSite: boolean;
}

interface Props {}

interface State {
  url1: string;
  url2: string;
  result: Result | undefined | Error;
}

export default class SiteVsOrigin extends Component<Props, State> {
  state: State = {
    url1: 'https://jakearchibald.com/foo',
    url2: 'https://app.jakearchibald.com/bar',
    result: { sameOrigin: false, sameSite: true },
  };

  private _url1Input = createRef<HTMLInputElement>();
  private _url2Input = createRef<HTMLInputElement>();

  private _processTimeout?: number;

  private _onInput = () => {
    if (this._processTimeout) clearTimeout(this._processTimeout);

    this._processTimeout = setTimeout(() => this._process(), 100);

    this.setState({
      result: undefined,
      url1: this._url1Input.current!.value,
      url2: this._url2Input.current!.value,
    });
  };

  private async _process() {
    let url1: URL | undefined;
    let url2: URL | undefined;
    let url1Site: string | undefined;
    let url2Site: string | undefined;

    try {
      url1 = new URL(this.state.url1);
      url1Site = await getSite(url1.hostname);
    } catch (error) {
      this.setState({ result: Error(`URL 1: ${(error as Error).message}`) });
      return;
    }

    try {
      url2 = new URL(this.state.url2);
      url2Site = await getSite(url2.hostname);
    } catch (error) {
      this.setState({ result: Error(`URL 2: ${(error as Error).message}`) });
      return;
    }

    this.setState({
      result: {
        sameOrigin: url1.origin === url2.origin,
        sameSite: url1Site === url2Site,
      },
    });
  }

  render(_: Props, { url1, url2, result }: State) {
    return (
      <form class="form-rows">
        <div class="form-rows-inner">
          <div class="field">
            <label for="url-1-input" class="label">
              URL 1:
            </label>
            <div class="input">
              <input
                onInput={this._onInput}
                ref={this._url1Input}
                id="url-1-input"
                required
                type="url"
                value={url1}
              />
            </div>
          </div>
          <div class="field">
            <label for="url-2-input" class="label">
              URL 2:
            </label>
            <div class="input">
              <input
                onInput={this._onInput}
                ref={this._url2Input}
                id="url-2-input"
                required
                type="url"
                value={url2}
              />
            </div>
          </div>
          <div class="field">
            <div class="label">Same origin:</div>
            <div class="input">
              {!result
                ? '…'
                : result instanceof Error
                ? result.message
                : result.sameOrigin
                ? '✅'
                : '❌'}
            </div>
          </div>
          <div class="field">
            <div class="label">Same site:</div>
            <div class="input">
              {!result
                ? '…'
                : result instanceof Error
                ? ''
                : result.sameSite
                ? '✅'
                : '❌'}
            </div>
          </div>
        </div>
      </form>
    );
  }
}
