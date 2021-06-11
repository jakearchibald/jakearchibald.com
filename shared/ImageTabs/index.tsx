import { Component, Fragment, FunctionalComponent, h } from 'preact';
import AsyncContent, { Styles as AsyncContentStyle } from 'shared/AsyncContent';
import Tabs, { Styles as TabsStyles } from 'shared/Tabs';
import DecodedImg from '../DecodedImg';

const styles = `
.image-tabs {
  position: relative;
}
.image-tabs-pop-out-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  fill: #fff;
  width: 32px;
  filter: drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.7));
}
.image-tabs-preview {
  position: relative;
  overflow: hidden;
  background: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><path d="M1 2V0h1v1H0v1z" fill-opacity=".025"/></svg>');
  background-size: 20px 20px;
}
.image-tabs-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0 auto;
}
.image-tabs-transformer {
  position: relative;
}
.image-tabs-transformer img,
.image-tabs-transformer canvas {
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  transform: translateX(-50%);
}
`;

export const ImageTabsStyles: FunctionalComponent = () => (
  <style dangerouslySetInnerHTML={{ __html: styles }} />
);

export const Styles: FunctionalComponent = () => (
  <Fragment>
    <AsyncContentStyle />
    <TabsStyles />
    <ImageTabsStyles />
  </Fragment>
);

interface Props {
  images: [
    title: string,
    url: string,
    imgStyle?: {
      [key: string]: string | number;
    },
  ][];
  ratio: number;
  maxWidth: number;
  initial?: number;
  category?: string;
  previewPadding?: string;
  backgroundStyle?: {
    [key: string]: string | number;
  };
  transform?: string;
}

interface State {
  selected: number;
  loading: boolean;
}

export default class ImageTabs extends Component<Props, State> {
  state: State = {
    selected: this.props.initial ?? this.props.images.length - 1,
    loading: false,
  };

  private _onChange = (num: number) => {
    this.setState({ selected: num });
  };

  private _onLoadStart = () => this.setState({ loading: true });

  private _onLoadEnd = () => this.setState({ loading: false });

  render(
    {
      images,
      maxWidth,
      ratio,
      transform,
      category,
      previewPadding,
      backgroundStyle,
    }: Props,
    { selected, loading }: State,
  ) {
    const src = __PRERENDER__ ? undefined : images[selected][1];
    const imgStyle = images[selected][2] && images[selected][2];

    return (
      <div class="image-tabs">
        <div
          class="image-tabs-preview"
          style={{ padding: previewPadding || '' }}
        >
          {backgroundStyle && (
            <div class="image-tabs-background" style={backgroundStyle} />
          )}
          <AsyncContent loading={loading}>
            <div
              class="image-tabs-transformer"
              style={{ transform: transform || '' }}
            >
              <div class="image-tabs-sizer" style={{ maxWidth }}>
                <div style={{ paddingTop: (1 / ratio) * 100 + '%' }}></div>
              </div>
              {src && (
                <DecodedImg
                  src={src}
                  renderWidth={maxWidth}
                  lazy={true}
                  onLoadStart={this._onLoadStart}
                  onLoadEnd={this._onLoadEnd}
                  imgStyle={imgStyle}
                />
              )}
            </div>
          </AsyncContent>
        </div>
        <Tabs
          titles={images.map(([title]) => title)}
          selected={selected}
          onChange={this._onChange}
        />
        {category && (
          <a
            href={`/2020/avif-has-landed/demos/compare/?show=${category}&img=${src}`}
            target="_blank"
          >
            <svg
              viewBox="0 0 24 24"
              class="image-tabs-pop-out-icon"
              title="View in full page"
            >
              <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14c0 1.1.9 2 2 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3h-7z" />
            </svg>
          </a>
        )}
      </div>
    );
  }
}
