import { Component, createRef, Fragment, FunctionalComponent, h } from 'preact';
import AsyncContent, { Styles as AsyncContentStyle } from 'shared/AsyncContent';
import Tabs, { Styles as TabsStyles } from 'shared/Tabs';
import Decoder from 'shared/DecodedImg/decoder';
import { canDecodeImageType, extensionTypes } from 'shared/DecodedImg/utils';

const styles = `
.density-demo {
  position: relative;
}
.density-demo-preview {
  position: relative;
  overflow: hidden;
  background: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><path d="M1 2V0h1v1H0v1z" fill-opacity=".025"/></svg>');
  background-size: 20px 20px;
}
.density-demo-ratio {
  height: auto;
}
.density-demo-output {
  position: absolute;
  top: 0;
  left: 0;
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
  selected: number;
  loading: boolean;
  tabs: string[];
}

async function loadImage(
  src: string,
): Promise<HTMLImageElement | HTMLCanvasElement> {
  const ext = src.split('.').slice(-1)[0];

  // Assuming type from extension is hacky and not how things work on the web.
  // In Squoosh we sniff image bytes (similar to how the browser does it),
  // another way would be to use the response Content-Type.
  // But this is quick and easy and works for the blog post.
  const type = extensionTypes[ext];

  if (!type) throw Error('Unexpected extension');

  const canDecode = await canDecodeImageType(type);

  if (canDecode) {
    const image = new Image();
    image.src = src;
    await image.decode();
    return image;
  }

  const decoder = new Decoder();
  decoder.awake(type as 'image/webp' | 'image/avif');
  const blob = await fetch(src).then((r) => r.blob());
  const imageData = await decoder.decode(
    new AbortController().signal,
    type as 'image/webp' | 'image/avif',
    blob,
  );
  const canvas = document.createElement('canvas');

  canvas.width = imageData.width;
  canvas.height = imageData.height;
  canvas.getContext('2d')!.putImageData(imageData, 0, 0);
  return canvas;
}

export default class DensityDemo extends Component<Props, State> {
  state: State = {
    selected: 0,
    loading: true,
    tabs: ['…', '…'],
  };

  private _image?: HTMLImageElement | HTMLCanvasElement;
  private _fullDensityWidth: number = 0;
  private _fullDensityHeight: number = 0;

  componentDidMount() {
    this._loadImage();
    const observer = new ResizeObserver(([entry]) => this._resize(entry));

    try {
      observer.observe(this._sizerRef.current!, {
        box: 'device-pixel-content-box',
      });
    } catch (err) {
      observer.observe(this._sizerRef.current!);
    }
  }

  componentDidUpdate(_: Props, previousState: State) {
    if (previousState.selected !== this.state.selected) {
      this._drawCanvas();
    }
  }

  private _resize(entry: ResizeObserverEntry) {
    this._fullDensityWidth = entry.devicePixelContentBoxSize
      ? entry.devicePixelContentBoxSize[0].inlineSize
      : Math.ceil(entry.contentRect.width * devicePixelRatio);

    this._fullDensityHeight = entry.devicePixelContentBoxSize
      ? entry.devicePixelContentBoxSize[0].blockSize
      : Math.ceil(entry.contentRect.height * devicePixelRatio);

    const canvas = this._canvasRef.current!;
    canvas.style.width = entry.contentRect.width + 'px';
    canvas.style.height = entry.contentRect.height + 'px';
    this._drawCanvas();
  }

  private async _loadImage() {
    this._image = await loadImage(this.props.src);
    this.setState({ loading: false });
    this._drawCanvas();
  }

  private _drawCanvas() {
    if (!this._image) return;
    const canvas = this._canvasRef.current!;
    const canvasRect = canvas.getBoundingClientRect();

    if (this.state.selected === 0) {
      // Fake the effect for 1x screens
      const multiplier = devicePixelRatio === 1 ? 0.5 : 1;

      canvas.width = Math.ceil(canvasRect.width * multiplier);
      canvas.height = Math.ceil(canvasRect.height * multiplier);
    } else {
      canvas.width = this._fullDensityWidth;
      canvas.height = this._fullDensityHeight;
    }

    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this._image, 0, 0, canvas.width, canvas.height);

    const fullDensity = Math.min(
      this._image.width / canvasRect.width,
      devicePixelRatio,
    );
    const roundTo = 10 ** 2;
    const roundedDensity = Math.round(fullDensity * roundTo) / roundTo;
    this.setState({
      tabs: [devicePixelRatio === 1 ? '0.5x' : '1x', roundedDensity + 'x'],
    });
  }

  private _onChange = (num: number) => {
    this.setState({ selected: num });
  };

  private _canvasRef = createRef<HTMLCanvasElement>();
  private _sizerRef = createRef<HTMLCanvasElement>();

  render({ width, height }: Props, { selected, loading, tabs }: State) {
    return (
      <div class="density-demo">
        <div class="density-demo-preview">
          <AsyncContent loading={loading}>
            <canvas
              ref={this._sizerRef}
              class="density-demo-ratio"
              width={width}
              height={height}
            />
            <canvas class="density-demo-output" ref={this._canvasRef} />
          </AsyncContent>
        </div>
        <Tabs titles={tabs} selected={selected} onChange={this._onChange} />
      </div>
    );
  }
}
