import { Component, FunctionalComponent, h, RenderableProps } from 'preact';
import 'shared/loading-spinner';

const styles = `
.async-content {
  position: relative;
}
@keyframes async-content-fade-in {
  from { opacity: 0; animation-timing-function: ease-in-out; }
}
.async-content-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, .62);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: 300ms async-content-fade-in;
}
.async-content-loading loading-spinner {
  --color: #fff;
}
`;

export const Styles: FunctionalComponent = () => (
  <style dangerouslySetInnerHTML={{ __html: styles }} />
);

interface Props {
  loading: boolean;
}

interface State {
  showLoading: boolean;
}

export default class ImageTabs extends Component<Props, State> {
  state: State = {
    showLoading: false,
  };

  private _loadingTimeout?: number;

  private _startLoadingTimeout() {
    this._loadingTimeout = setTimeout(
      () => this.setState({ showLoading: true }),
      600,
    );
  }

  componentDidMount() {
    if (this.props.loading) this._startLoadingTimeout();
  }

  componentDidUpdate(previousProps: Props) {
    if (previousProps.loading !== this.props.loading) {
      if (this.props.loading) {
        this._startLoadingTimeout();
      } else {
        clearTimeout(this._loadingTimeout);
        this.setState({ showLoading: false });
      }
    }
  }

  render({ children }: RenderableProps<Props>, { showLoading }: State) {
    return (
      <div class="async-content">
        {children}
        {showLoading && (
          <div class="async-content-loading">
            <loading-spinner />
          </div>
        )}
      </div>
    );
  }
}
