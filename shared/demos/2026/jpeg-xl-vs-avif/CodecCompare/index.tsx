import { Fragment, FunctionalComponent, h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import AsyncContent, {
  Styles as AsyncContentStyles,
} from 'shared/AsyncContent';
import DecodedImg from 'shared/DecodedImg';

interface Encoding {
  url: string;
  /** Via asset-size. It's substituted into the props JSON, so it arrives as a string. */
  bytes: string;
  /** Actual SSIMULACRA2 score. A string to preserve trailing zeros. */
  score: string;
}

interface Quality {
  /** Target SSIMULACRA2 score */
  target: number;
  /** Encodings, keyed by Format.key */
  [format: string]: Encoding | number;
}

interface Format {
  /** The key of this format's encodings in each Quality */
  key: string;
  label: string;
  /** Bar colour */
  color?: string;
  /** Overrides the lossless image, for formats that need a different reference */
  lossless?: string;
  /** Via asset-size, see Encoding.bytes */
  losslessBytes?: string;
}

interface Props {
  ratio: number;
  maxWidth: number;
  /** Space around the image, in px */
  padding?: number;
  lossless: string;
  /** Via asset-size, see Encoding.bytes */
  losslessBytes: string;
  /** What to call the lossless image, in case it's something else, like the original */
  losslessLabel?: string;
  qualities: Quality[];
  formats?: Format[];
  initialQuality?: number;
  /** Format.key of the initially selected format */
  initialCodec?: string;
}

// Same hues as the charts
const defaultFormats: Format[] = [
  { key: 'avif', label: 'AVIF', color: '#2a78d6' },
  { key: 'jxl', label: 'JPEG XL (libjxl)', color: '#eb6834' },
  { key: 'jixel', label: 'JPEG XL (jixel)', color: '#1baf7a' },
];

// SSIMULACRA2's own quality descriptions.
const qualityDescriptions: Record<number, string> = {
  50: 'medium',
  70: 'high',
  80: 'very high',
  90: 'visually lossless',
};

const formatBytes = (bytes: number) =>
  bytes < 1e6
    ? `${(bytes / 1e3).toFixed(1)} kB`
    : `${(bytes / 1e6).toFixed(2)} MB`;

const holdKeys = new Set([' ', 'Enter']);

const CodecCompare: FunctionalComponent<Props> = ({
  ratio,
  maxWidth,
  padding = 0,
  lossless,
  losslessBytes,
  losslessLabel = 'Lossless',
  qualities,
  formats = defaultFormats,
  initialQuality = 0,
  initialCodec = formats[0].key,
}) => {
  const [qualityIndex, setQualityIndex] = useState(initialQuality);
  const [codec, setCodec] = useState(initialCodec);
  const [holding, setHolding] = useState(false);
  const [loading, setLoading] = useState(false);
  // Lossless images are only fetched once the user first asks for them.
  const [losslessRequested, setLosslessRequested] = useState<string[]>([]);
  const [losslessLoaded, setLosslessLoaded] = useState<string[]>([]);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const format = formats.find((f) => f.key === codec)!;
  const currentLossless = format.lossless ?? lossless;
  const currentLosslessBytes = format.losslessBytes ?? losslessBytes;

  // Pointer capture doesn't reliably end if the window loses focus mid-hold.
  useEffect(() => {
    if (!holding) return;
    const release = () => setHolding(false);
    addEventListener('blur', release);
    return () => removeEventListener('blur', release);
  }, [holding]);

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

  useEffect(() => {
    if (!holding || losslessRequested.includes(currentLossless)) return;
    setLosslessRequested([...losslessRequested, currentLossless]);
  }, [holding, currentLossless]);

  const quality = qualities[qualityIndex];
  const getEncoding = (key: string) => quality[key] as Encoding;
  const encoding = getEncoding(codec);
  const sizes = formats.map((f) => Number(getEncoding(f.key).bytes));
  const maxBytes = Math.max(...sizes);
  const minBytes = Math.min(...sizes);
  const description = qualityDescriptions[quality.target];
  const showingLossless = holding && losslessLoaded.includes(currentLossless);

  const onPointerDown = (event: PointerEvent) => {
    // Only track the first pointer, so other fingers don't end the hold.
    if (event.button !== 0 || holding) return;
    // Releasing this pointer (or the browser cancelling it) fires
    // lostpointercapture, even if it happens outside the element.
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
    setHolding(true);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!holdKeys.has(event.key)) return;
    event.preventDefault();
    setHolding(true);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    if (!holdKeys.has(event.key)) return;
    setHolding(false);
  };

  return (
    <div class="codec-compare" ref={root}>
      <div
        class="codec-compare-preview"
        onPointerDown={onPointerDown}
        onLostPointerCapture={() => setHolding(false)}
        onContextMenu={(event) => {
          // Long-press is how touch users hold for lossless, so don't let it
          // open a menu. Right-click is left alone.
          if ('pointerType' in event && event.pointerType === 'touch') {
            event.preventDefault();
          }
        }}
      >
        <div class="codec-compare-scroller" style={{ padding }}>
          <div
            class="codec-compare-frame"
            style={{ '--max-width': maxWidth + 'px' }}
          >
            <AsyncContent
              loading={
                holding ? !losslessLoaded.includes(currentLossless) : loading
              }
            >
              <div style={{ maxWidth, margin: '0 auto' }}>
                <div style={{ paddingTop: (1 / ratio) * 100 + '%' }}></div>
              </div>
              {!__PRERENDER__ && (
                <div
                  class="codec-compare-layer"
                  style={{
                    inset: padding,
                    // Hidden rather than just covered, as images with alpha would
                    // show the lossy version through the lossless one.
                    visibility: showingLossless ? 'hidden' : '',
                  }}
                >
                  <DecodedImg
                    src={encoding.url}
                    renderWidth={maxWidth}
                    lazy={true}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                  />
                </div>
              )}
              {losslessRequested.map((url) => (
                // Kept around after the first hold, so later holds are instant.
                <div
                  key={url}
                  class="codec-compare-layer"
                  style={{
                    inset: padding,
                    visibility:
                      holding && url === currentLossless ? '' : 'hidden',
                  }}
                >
                  <DecodedImg
                    src={url}
                    renderWidth={maxWidth}
                    onLoadEnd={() =>
                      setLosslessLoaded((loaded) => [...loaded, url])
                    }
                  />
                </div>
              ))}
            </AsyncContent>
          </div>
        </div>
        {canFullscreen && (
          <button
            class="codec-compare-button codec-compare-fullscreen"
            type="button"
            // Otherwise the preview's pointerdown starts a hold
            onPointerDown={(event) => event.stopPropagation()}
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
        <button
          class="codec-compare-button codec-compare-hold"
          type="button"
          // Pointer presses are handled by the preview's pointerdown.
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          aria-pressed={holding ? 'true' : 'false'}
        >
          {holding
            ? `${losslessLabel} (${formatBytes(Number(currentLosslessBytes))})`
            : `Hold for ${losslessLabel.toLowerCase()}`}
        </button>
      </div>
      {/*
        A form so the radio group is scoped to this instance. Each instance is
        its own Preact root, so useId() isn't unique across instances.
      */}
      <form
        class={`codec-compare-controls${
          formats.length > 2 ? ' codec-compare-controls-many' : ''
        }`}
        onSubmit={(event) => event.preventDefault()}
      >
        <label class="codec-compare-quality">
          <span class="codec-compare-heading">
            SSIMULACRA2 target: {quality.target}
            {description && (
              <span class="codec-compare-description"> ({description})</span>
            )}
          </span>
          <input
            class="codec-compare-slider"
            type="range"
            min={0}
            max={qualities.length - 1}
            step={1}
            value={qualityIndex}
            aria-valuetext={String(quality.target)}
            onInput={(event) =>
              setQualityIndex(Number(event.currentTarget.value))
            }
          />
          <div class="codec-compare-ticks" aria-hidden="true">
            {qualities.map((q, i) => (
              <span
                class="codec-compare-tick"
                style={{ '--pos': i / (qualities.length - 1) }}
              >
                {q.target}
              </span>
            ))}
          </div>
        </label>
        <fieldset class="codec-compare-codecs">
          <legend class="codec-compare-heading">Format</legend>
          <div class="codec-compare-codec-options">
            {formats.map((f, i) => {
              const bytes = sizes[i];
              const { score } = getEncoding(f.key);
              // Relative to the smallest
              const larger = Math.round((bytes / minBytes - 1) * 100);

              return (
                <label class="codec-compare-codec">
                  <input
                    type="radio"
                    name="codec"
                    checked={f.key === codec}
                    onChange={() => setCodec(f.key)}
                  />
                  <span class="codec-compare-codec-inner">
                    <span class="codec-compare-codec-name">{f.label}</span>
                    <span class="codec-compare-codec-size">
                      {formatBytes(bytes)}
                      {larger > 0 && ` (+${larger}%)`}
                    </span>
                    <span class="codec-compare-bar">
                      <span
                        style={{
                          width: (bytes / maxBytes) * 100 + '%',
                          background: f.color,
                        }}
                      />
                    </span>
                    <span class="codec-compare-codec-score">
                      SSIMULACRA2: {score}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default CodecCompare;

const thumbSize = '22px';

const thumbStyles = `
  width: ${thumbSize};
  height: ${thumbSize};
  border-radius: 50%;
  border: none;
  background: #000;
`;

const styles = `
.codec-compare-preview {
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  background: url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><path d="M1 2V0h1v1H0v1z" fill-opacity=".025"/></svg>');
  background-size: 20px 20px;
}
.codec-compare-layer {
  position: absolute;
  inset: 0;
}
.codec-compare-layer img,
.codec-compare-layer canvas {
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translateX(-50%);
}
.codec-compare-layer img {
  /* Holding the image shows lossless, so don't let a long-press start a drag */
  -webkit-user-drag: none;
}
.codec-compare-button {
  position: absolute;
  font: inherit;
  font-size: 0.9rem;
  padding: 0.5em 0.9em;
  border: none;
  border-radius: 100px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  cursor: pointer;
  touch-action: manipulation;
}
.codec-compare-hold {
  right: 10px;
  bottom: 10px;
}
.codec-compare-fullscreen {
  right: 10px;
  top: 10px;
  display: grid;
  padding: 0.45em;
}
.codec-compare-fullscreen svg {
  width: 1.3em;
  height: 1.3em;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.codec-compare-hold[aria-pressed=true] {
  background: #ffe454;
  color: #000;
}
.codec-compare:fullscreen {
  display: flex;
  flex-direction: column;
  background: #fff;
}
/* Avoids notches etc when the preview reaches the edges of the screen */
.codec-compare:fullscreen .codec-compare-fullscreen {
  top: max(10px, env(safe-area-inset-top));
  right: max(10px, env(safe-area-inset-right));
}
.codec-compare:fullscreen .codec-compare-preview {
  flex: 1;
  min-height: 0;
}
.codec-compare:fullscreen .codec-compare-scroller {
  position: absolute;
  inset: 0;
  overflow: auto;
  display: flex;
}
/* Shown at its 2x size, or smaller if it doesn't fit the width */
.codec-compare:fullscreen .codec-compare-frame {
  flex: none;
  /* Centres, but unlike align/justify-content, it doesn't clip when scrolled */
  margin: auto;
  width: var(--max-width);
  max-width: 100%;
}
.codec-compare:fullscreen .codec-compare-layer img,
.codec-compare:fullscreen .codec-compare-layer canvas {
  /* Overrides DecodedImg's inline width, so it shrinks with the frame */
  width: 100% !important;
}
.codec-compare-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 2rem;
  padding: 1rem;
  font-size: 0.9rem;
  line-height: 1.3;
}
/* Give the formats more room. The slider has few steps, so it can spare it. */
.codec-compare-controls-many {
  grid-template-columns: 1fr 3fr;
}
@media (max-width: 600px) {
  .codec-compare-controls {
    grid-template-columns: 1fr;
  }
}
.codec-compare-heading {
  display: block;
  font-weight: bold;
  padding: 0;
  margin-bottom: 0.6em;
}
.codec-compare-description {
  font-weight: normal;
}
.codec-compare-slider {
  display: block;
  width: 100%;
  margin: 0;
  height: ${thumbSize};
  background: transparent;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}
.codec-compare-slider::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 3px;
  background: #ffe454;
}
.codec-compare-slider::-moz-range-track {
  height: 6px;
  border-radius: 3px;
  background: #ffe454;
}
.codec-compare-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  margin-top: calc((6px - ${thumbSize}) / 2);
  ${thumbStyles}
}
.codec-compare-slider::-moz-range-thumb {
  ${thumbStyles}
}
.codec-compare-ticks {
  position: relative;
  height: 1.3em;
  margin-top: 0.3em;
}
.codec-compare-tick {
  position: absolute;
  /* Line up with the centre of the thumb at each step */
  left: calc(${thumbSize} / 2 + (100% - ${thumbSize}) * var(--pos));
  transform: translateX(-50%);
}
.codec-compare-codecs {
  border: none;
  margin: 0;
  padding: 0;
  min-width: 0;
}
.codec-compare-codec-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7em, 1fr));
  gap: 0.5rem;
}
.codec-compare-codec {
  display: grid;
  cursor: pointer;
}
.codec-compare-codec input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.codec-compare-codec-inner {
  display: grid;
  gap: 0.3em;
  padding: 0.6em 0.7em;
  border: 2px solid #ffe454;
}
.codec-compare-codec input:checked + .codec-compare-codec-inner {
  background: #ffe454;
}
.codec-compare-codec input:focus-visible + .codec-compare-codec-inner {
  outline: 2px solid #000;
  outline-offset: 2px;
}
.codec-compare-codec-name {
  font-weight: bold;
}
.codec-compare-bar {
  display: block;
  height: 6px;
  background: rgba(0, 0, 0, 0.08);
}
.codec-compare-bar span {
  display: block;
  height: 100%;
  transition: width 200ms ease-out;
}
.codec-compare-codec-score {
  font-size: 0.8rem;
}
`;

export const Styles: FunctionalComponent = () => (
  <Fragment>
    <AsyncContentStyles />
    <style dangerouslySetInnerHTML={{ __html: styles }} />
  </Fragment>
);
