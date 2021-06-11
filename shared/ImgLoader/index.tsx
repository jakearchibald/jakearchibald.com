import { Component, createRef, Fragment, FunctionalComponent, h } from 'preact';
import AsyncContent, { Styles as AsyncContentStyle } from 'shared/AsyncContent';
import Tabs, { Styles as TabsStyles } from 'shared/Tabs';
import DecodedImg from 'shared/DecodedImg';

const styles = `
.img-loader {
  position: relative;
}
.img-loader-preview {
  position: relative;
  overflow: hidden;
  background: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><path d="M1 2V0h1v1H0v1z" fill-opacity=".025"/></svg>');
  background-size: 20px 20px;
}
.img-loader-ratio {
  height: auto;
}
.img-loader-output {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
.img-loader-output canvas,
.img-loader-output img {
  margin: 0 auto;
}
`;

export const Styles: FunctionalComponent = () => (
  <Fragment>
    <AsyncContentStyle />
    <TabsStyles />
    <style dangerouslySetInnerHTML={{ __html: styles }} />
  </Fragment>
);

interface Props {
  width: number;
  height: number;
  src: string;
}

interface State {
  loading: boolean;
}

export default class ImgLoader extends Component<Props, State> {
  state: State = {
    loading: false,
  };

  private _canvasRef = createRef<HTMLCanvasElement>();

  private _onLoadEnd = () => {
    this.setState({ loading: false });
  };

  private _onLoadStart = () => {
    this.setState({ loading: true });
  };

  render({ width, height, src }: Props, { loading }: State) {
    return (
      <div class="img-loader">
        <div class="img-loader-preview">
          <AsyncContent loading={loading}>
            <canvas class="img-loader-ratio" width={width} height={height} />
            <canvas class="img-loader-output" ref={this._canvasRef} />
            <div class="img-loader-output">
              <DecodedImg
                src={src}
                renderWidth={width}
                lazy={true}
                onLoadEnd={this._onLoadEnd}
                onLoadStart={this._onLoadStart}
              />
            </div>
          </AsyncContent>
        </div>
      </div>
    );
  }
}
