import { Component, h } from 'preact';
import DecodedImg from '../DecodedImg';

interface Props {
  images: [title: string, url: string][];
  ratio: number;
  maxWidth: number;
  initial: number;
  category: string;
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

  render(
    { images, maxWidth, ratio, transform, category }: Props,
    { selected }: State,
  ) {
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
            {src && <DecodedImg src={src} renderWidth={maxWidth} lazy={true} />}
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
        <a
          href={`/2020/avif-is-exciting/demos/compare/?show=${category}&img=${src}`}
          target="_blank"
        >
          <svg
            viewBox="0 0 24 24"
            class="pop-out-icon"
            title="View in full page"
          >
            <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14c0 1.1.9 2 2 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3h-7z" />
          </svg>
        </a>
      </div>
    );
  }
}
