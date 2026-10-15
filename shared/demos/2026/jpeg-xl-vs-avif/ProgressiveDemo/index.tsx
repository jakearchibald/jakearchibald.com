import { FunctionalComponent, h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

interface DemoImage {
  label: string;
  url: string;
  /** Via asset-size. It's substituted into the props JSON, so it arrives as a string. */
  bytes: string;
}

interface Props {
  /** URL of the page that renders the images. It's an iframe so its service worker can be scoped to it. */
  page: string;
  ratio: number;
  maxWidth: number;
  initialBytes: number;
  images: DemoImage[];
}

const formatBytes = (bytes: number) => `${(bytes / 1e3).toFixed(1)} kB`;

const ProgressiveDemo: FunctionalComponent<Props> = ({
  page,
  ratio,
  maxWidth,
  initialBytes,
  images,
}) => {
  const sizes = images.map((image) => Number(image.bytes));
  const maxBytes = Math.max(...sizes);
  const [bytes, setBytes] = useState(initialBytes);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const bytesRef = useRef(bytes);
  bytesRef.current = bytes;
  const root = useRef<HTMLDivElement>(null);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Client-only, so the prerendered markup doesn't include a button that
  // might not work.
  useEffect(() => {
    setCanFullscreen(document.fullscreenEnabled);
    const update = () =>
      setFullscreen(document.fullscreenElement === root.current);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  const toggleFullscreen = () => {
    if (fullscreen) {
      document.exitFullscreen();
    } else {
      root.current!.requestFullscreen();
    }
  };

  // The initial state goes in the URL, so the iframe works before this
  // component is interactive. It isn't updated after, as that would reload the
  // iframe.
  const [src] = useState(() => {
    const params = new URLSearchParams();
    for (const [i, image] of images.entries()) {
      params.append('label', image.label);
      params.append('src', image.url);
      params.append('size', String(sizes[i]));
    }
    params.set('bytes', String(initialBytes));
    return `${page}?${params}`;
  });

  const postMessageToFrame = (message: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(message, location.origin);
  };

  const postBytes = (value: number) => postMessageToFrame({ bytes: value });

  const fullscreenRef = useRef(fullscreen);
  fullscreenRef.current = fullscreen;

  useEffect(() => {
    postMessageToFrame({ labels: !fullscreen });
  }, [fullscreen]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data !== 'ready') return;
      postBytes(bytesRef.current);
      postMessageToFrame({ labels: !fullscreenRef.current });
    };
    addEventListener('message', onMessage);
    return () => removeEventListener('message', onMessage);
  }, []);

  return (
    <div class="progressive-demo" ref={root}>
      <div class="progressive-demo-preview">
        <div class="progressive-demo-scroller">
          <div class="progressive-demo-frame" style={{ maxWidth }}>
            <iframe
              ref={iframeRef}
              src={src}
              title="Images loading progressively"
              loading="lazy"
              style={{ aspectRatio: String(ratio), maxWidth }}
            />
            {fullscreen && (
              <div class="progressive-demo-labels">
                {images.map((image) => (
                  <span class="progressive-demo-label">{image.label}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        {canFullscreen && (
          <button
            class="progressive-demo-fullscreen"
            type="button"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d={
                  fullscreen
                    ? 'M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5'
                    : 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5'
                }
              />
            </svg>
          </button>
        )}
      </div>
      <div class="progressive-demo-controls">
        <label>
          <span class="progressive-demo-heading">
            Downloaded: {formatBytes(bytes)}
          </span>
          <input
            class="progressive-demo-slider"
            type="range"
            min={0}
            max={maxBytes}
            step={1}
            value={bytes}
            disabled={__PRERENDER__}
            onInput={(event) => {
              const value = event.currentTarget.valueAsNumber;
              setBytes(value);
              postBytes(value);
            }}
          />
        </label>
        <ul class="progressive-demo-status">
          {images.map((image, i) => {
            const loaded = Math.min(bytes, sizes[i]);
            return (
              <li>
                {image.label}: {formatBytes(loaded)} of {formatBytes(sizes[i])}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ProgressiveDemo;

const thumbSize = '22px';

const thumbStyles = `
  width: ${thumbSize};
  height: ${thumbSize};
  border-radius: 50%;
  border: none;
  background: #000;
`;

const styles = `
.progressive-demo iframe {
  display: block;
  width: 100%;
  margin: 0 auto;
  border: none;
}

.progressive-demo-preview {
  position: relative;
}

.progressive-demo-frame {
  margin: 0 auto;
}

/* Matches the CodecCompare fullscreen button */
.progressive-demo-fullscreen {
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  padding: 0.45em;
  font: inherit;
  font-size: 0.9rem;
  border: none;
  border-radius: 100px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  cursor: pointer;
  touch-action: manipulation;

  & svg {
    width: 1.3em;
    height: 1.3em;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

.progressive-demo:fullscreen {
  display: flex;
  flex-direction: column;
  background: #fff;

  & .progressive-demo-preview {
    flex: 1;
    min-height: 0;
  }

  /* In a flex column, auto margins stop it stretching, so it'd shrink to fit
     its content */
  & .progressive-demo-controls {
    box-sizing: border-box;
    width: 100%;
  }

  & .progressive-demo-scroller {
    position: absolute;
    inset: 0;
    overflow: auto;
    display: flex;
  }

  /* Shown at its 2x size (via the inline max-width), or smaller if it doesn't
     fit the width */
  & .progressive-demo-frame {
    flex: none;
    width: 100%;
    /* Centres, but unlike align/justify-content, it doesn't clip when scrolled */
    margin: auto;
  }
}

/* Replaces the iframe's labels in fullscreen. Zero height, so it sits at the
   bottom of the image, and sticks to the bottom of the scroller when the
   image's bottom edge is scrolled out of view. The labels overflow upwards. */
.progressive-demo-labels {
  position: sticky;
  bottom: 10px;
  height: 0;
  margin-top: -10px;
  padding: 0 10px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  pointer-events: none;
}

/* Matches the iframe's labels */
.progressive-demo-label {
  padding: 0.3em 0.7em;
  border-radius: 100px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-family: sans-serif;
  font-size: 0.9rem;
}

.progressive-demo-controls {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1rem;
  font-size: 0.9rem;
  line-height: 1.3;
  font-variant-numeric: tabular-nums;
}

/* Matches the CodecCompare slider */
.progressive-demo-slider {
  display: block;
  width: 100%;
  margin: 0.6em 0 0;
  height: ${thumbSize};
  background: transparent;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}
.progressive-demo-slider::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 3px;
  background: #ffe454;
}
.progressive-demo-slider::-moz-range-track {
  height: 6px;
  border-radius: 3px;
  background: #ffe454;
}
.progressive-demo-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  margin-top: calc((6px - ${thumbSize}) / 2);
  ${thumbStyles}
}
.progressive-demo-slider::-moz-range-thumb {
  ${thumbStyles}
}
.progressive-demo-slider:disabled {
  cursor: default;
}

.progressive-demo-heading {
  font-weight: bold;
}

.progressive-demo-status {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5em 1em;
  margin: 0.6em 0 0;
  padding: 0;
  list-style: none;

  & li {
    margin: 0;
    padding: 0;
  }
}
`;

export const Styles: FunctionalComponent = () => (
  <style dangerouslySetInnerHTML={{ __html: styles }} />
);
