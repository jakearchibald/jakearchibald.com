import { Fragment, FunctionalComponent, h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import AsyncContent, {
  Styles as AsyncContentStyles,
} from 'shared/AsyncContent';
import DecodedImg from 'shared/DecodedImg';

type Codec = 'avif' | 'jxl';

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
  avif: Encoding;
  jxl: Encoding;
}

interface Props {
  ratio: number;
  maxWidth: number;
  lossless: string;
  /** Via asset-size, see Encoding.bytes */
  losslessBytes: string;
  qualities: Quality[];
  initialQuality?: number;
  initialCodec?: Codec;
}

const codecs: Codec[] = ['avif', 'jxl'];
const codecNames: Record<Codec, string> = {
  avif: 'AVIF',
  jxl: 'JPEG XL',
};

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
  lossless,
  losslessBytes,
  qualities,
  initialQuality = 0,
  initialCodec = 'avif',
}) => {
  const [qualityIndex, setQualityIndex] = useState(initialQuality);
  const [codec, setCodec] = useState<Codec>(initialCodec);
  const [holding, setHolding] = useState(false);
  const [loading, setLoading] = useState(false);
  // The lossless image is only fetched once the user first asks for it.
  const [losslessRequested, setLosslessRequested] = useState(false);
  const [losslessLoaded, setLosslessLoaded] = useState(false);

  // Pointer capture doesn't reliably end if the window loses focus mid-hold.
  useEffect(() => {
    if (!holding) return;
    const release = () => setHolding(false);
    addEventListener('blur', release);
    return () => removeEventListener('blur', release);
  }, [holding]);

  useEffect(() => {
    if (holding) setLosslessRequested(true);
  }, [holding]);

  const quality = qualities[qualityIndex];
  const encoding = quality[codec];
  const sizes: Record<Codec, number> = {
    avif: Number(quality.avif.bytes),
    jxl: Number(quality.jxl.bytes),
  };
  const maxBytes = Math.max(sizes.avif, sizes.jxl);
  const minBytes = Math.min(sizes.avif, sizes.jxl);
  const description = qualityDescriptions[quality.target];

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
    <div class="codec-compare">
      <div
        class="codec-compare-preview"
        onPointerDown={onPointerDown}
        onLostPointerCapture={() => setHolding(false)}
        onContextMenu={(event) => event.preventDefault()}
      >
        <AsyncContent loading={holding ? !losslessLoaded : loading}>
          <div style={{ maxWidth, margin: '0 auto' }}>
            <div style={{ paddingTop: (1 / ratio) * 100 + '%' }}></div>
          </div>
          {!__PRERENDER__ && (
            <div class="codec-compare-layer">
              <DecodedImg
                src={encoding.url}
                renderWidth={maxWidth}
                lazy={true}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
              />
            </div>
          )}
          {losslessRequested && (
            // Kept around after the first hold, so later holds are instant.
            <div
              class="codec-compare-layer"
              style={{ visibility: holding ? '' : 'hidden' }}
            >
              <DecodedImg
                src={lossless}
                renderWidth={maxWidth}
                onLoadEnd={() => setLosslessLoaded(true)}
              />
            </div>
          )}
        </AsyncContent>
        <button
          class="codec-compare-hold"
          type="button"
          // Pointer presses are handled by the preview's pointerdown.
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          aria-pressed={holding ? 'true' : 'false'}
        >
          {holding
            ? `Lossless (${formatBytes(Number(losslessBytes))})`
            : 'Hold for lossless'}
        </button>
      </div>
      {/*
        A form so the radio group is scoped to this instance. Each instance is
        its own Preact root, so useId() isn't unique across instances.
      */}
      <form
        class="codec-compare-controls"
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
            {codecs.map((c) => {
              const bytes = sizes[c];
              const { score } = quality[c];
              const larger =
                bytes === maxBytes && bytes !== minBytes
                  ? Math.round((bytes / minBytes - 1) * 100)
                  : 0;

              return (
                <label class={`codec-compare-codec codec-compare-codec-${c}`}>
                  <input
                    type="radio"
                    name="codec"
                    checked={c === codec}
                    onChange={() => setCodec(c)}
                  />
                  <span class="codec-compare-codec-inner">
                    <span class="codec-compare-codec-name">
                      {codecNames[c]}
                    </span>
                    <span class="codec-compare-codec-size">
                      {formatBytes(bytes)}
                      {larger > 0 && ` (+${larger}%)`}
                    </span>
                    <span class="codec-compare-bar">
                      <span style={{ width: (bytes / maxBytes) * 100 + '%' }} />
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
.codec-compare-hold {
  position: absolute;
  right: 10px;
  bottom: 10px;
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
.codec-compare-hold[aria-pressed=true] {
  background: #ffe454;
  color: #000;
}
.codec-compare-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 2rem;
  padding: 1rem;
  font-size: 0.9rem;
  line-height: 1.3;
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
  grid-template-columns: 1fr 1fr;
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
/* Same hues as the charts */
.codec-compare-codec-avif .codec-compare-bar span {
  background: #2a78d6;
}
.codec-compare-codec-jxl .codec-compare-bar span {
  background: #eb6834;
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
