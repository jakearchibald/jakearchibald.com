import { Component, h } from 'preact';

interface Props {}

interface State {}

export default class App extends Component<Props, State> {
  state = {};

  render(_: Props, {}: State) {
    return (
      <div class="app">
        <div class="settings">
          <form>
            <h2>Request</h2>
            <div class="input-row">
              <label>
                Method <input required value="GET" />
              </label>
            </div>
            <div class="input-row">
              <label>
                <input type="checkbox" /> Credentials
              </label>
            </div>
            <h3>Headers</h3>
            <div class="input-row">
              <input placeholder="Header name" />
              :
              <input placeholder="Header value" />
            </div>
            <div class="input-row">
              <button type="button">Add header</button>
            </div>
            <h2>Preflight response</h2>
            <div class="input-row">
              <label>
                <input type="checkbox" /> Allow preflight response
              </label>
            </div>
            <h3>Headers</h3>
            <div class="input-row">
              <label>
                Access-Control-Allow-Origin{' '}
                <input value="*" placeholder="[don't send]" />
              </label>
            </div>
            <div class="input-row">
              <label>
                Access-Control-Allow-Credentials{' '}
                <input placeholder="[don't send]" />
              </label>
            </div>
            <div class="input-row">
              <label>
                Access-Control-Allow-Methods{' '}
                <input placeholder="[don't send]" />
              </label>
            </div>
            <div class="input-row">
              <label>
                Access-Control-Allow-Headers{' '}
                <input placeholder="[don't send]" />
              </label>
            </div>
            <h2>Response</h2>
            <h3>Set cookie</h3>
            <div class="input-row">
              <input placeholder="Name" value="foo" />
              =
              <input placeholder="Value" value="bar" />
            </div>
            <h3>Headers</h3>
            <div class="input-row">
              <label>
                Access-Control-Allow-Origin{' '}
                <input value="*" placeholder="[don't send]" />
              </label>
            </div>
            <div class="input-row">
              <label>
                Access-Control-Allow-Credentials{' '}
                <input placeholder="[don't send]" />
              </label>
            </div>
            <div class="input-row">
              <label>
                Access-Control-Expose-Headers{' '}
                <input placeholder="[don't send]" />
              </label>
            </div>
            <div class="input-row">
              <button>Send</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
