import { Component, h } from 'preact';
import DecodedImg from '../DecodedImg';

interface Props {
  images: [title: string, url: string][];
  ratio: number;
  maxWidth: number;
  initial: number;
  transform?: string;
}

interface State {
  selected: number;
}

export default class ImageTabs extends Component<Props, State> {
  state: State = {
    selected: this.props.initial,
  };

  private _onChange = (event: Event) => {
    const num = Number(
      new FormData(event.currentTarget as HTMLFormElement).get('tabs'),
    );
    this.setState({ selected: num });
  };

  render({ images, maxWidth, ratio, transform }: Props, { selected }: State) {
    const src = __PRERENDER__ ? undefined : images[selected][1];

    return (
      <div class="image-tabs">
        <div class="image-tabs-preview">
          <div
            class="image-tabs-transformer"
            style={{ transform: transform || '' }}
          >
            <div class="image-tabs-sizer" style={{ maxWidth }}>
              <div style={{ paddingTop: (1 / ratio) * 100 + '%' }}></div>
            </div>
            {src && <DecodedImg src={src} renderWidth={maxWidth} />}
          </div>
        </div>
        <form class="image-tabs-tabs" onChange={this._onChange}>
          {images.map(([title], i) => (
            <label class="image-tabs-tab">
              <input
                name="tabs"
                type="radio"
                checked={i === selected}
                value={i}
              />
              <span class="image-tabs-label">{title}</span>
            </label>
          ))}
        </form>
      </div>
    );
  }
}
