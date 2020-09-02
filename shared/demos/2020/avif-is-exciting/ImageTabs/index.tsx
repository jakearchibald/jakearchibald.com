import { Component, h } from 'preact';
import DecodedImg from '../DecodedImg';

interface Props {
  images: [title: string, url: string][];
  ratio: number;
  maxWidth: number;
  initial: number;
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

  render({ images, maxWidth, ratio }: Props, { selected }: State) {
    const src = __PRERENDER__ ? undefined : images[selected][1];

    return (
      <div>
        <div>{src && <DecodedImg src={src} renderWidth={maxWidth} />}</div>
        <form class="tabs" onChange={this._onChange}>
          {images.map(([title], i) => (
            <div>
              <label>
                <input
                  name="tabs"
                  type="radio"
                  checked={i === selected}
                  value={i}
                />
                <span class="image-tab-label">{title}</span>
              </label>
            </div>
          ))}
        </form>
      </div>
    );
  }
}
