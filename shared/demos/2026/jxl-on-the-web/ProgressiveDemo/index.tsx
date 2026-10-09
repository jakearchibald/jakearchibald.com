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

  const postBytes = (value: number) => {
    iframeRef.current?.contentWindow?.postMessage(
      { bytes: value },
      location.origin,
    );
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data === 'ready') postBytes(bytesRef.current);
    };
    addEventListener('message', onMessage);
    return () => removeEventListener('message', onMessage);
  }, []);

  return (
    <div class="progressive-demo">
      <iframe
        ref={iframeRef}
        src={src}
        title="Images loading progressively"
        loading="lazy"
        style={{ aspectRatio: String(ratio), maxWidth }}
      />
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
                {loaded === sizes[i] && ' (complete)'}
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
