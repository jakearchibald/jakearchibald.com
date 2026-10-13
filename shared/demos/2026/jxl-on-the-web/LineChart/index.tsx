import { ComponentChildren, Fragment, FunctionalComponent, h } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';

export interface ChartPoint {
  x: number;
  y: number;
  /** Lines of text for the tooltip */
  details: string[];
}

export interface ChartSeries {
  id: string;
  label: string;
  color: string;
  dashed?: boolean;
  points: ChartPoint[];
}

interface Props {
  series: ChartSeries[];
  xTitle: string;
  yTitle: string;
  formatYTick: (value: number) => string;
  /** Defaults to plain numbers, with enough decimal places for the ticks */
  formatXTick?: (value: number) => string;
  /** Allow the x-axis to be switched to a log scale */
  xLogToggle?: boolean;
  /** Allow the y-axis to be switched to a log scale. Defaults to true. */
  yLogToggle?: boolean;
  /** Extra controls, shown before the scale control */
  controls?: ComponentChildren;
}

export type Browser = 'firefox' | 'chrome' | 'safari';

export const browserOptions: { value: Browser; label: string }[] = [
  { value: 'firefox', label: 'Firefox' },
  { value: 'chrome', label: 'Chrome' },
  { value: 'safari', label: 'Safari' },
];

const dashPattern = '6 3';

// The plot is drawn in a 0-1000 space, stretched to fit. Strokes are
// non-scaling, so they stay the same width regardless of stretching.
const plotSize = 1000;
// Pointer distance (in CSS pixels) within which a point is 'hovered'.
const hoverDistance = 40;

export const formatBytes = (bytes: number) =>
  bytes < 1000 ? `${bytes} B` : `${(bytes / 1000).toFixed(1)} kB`;

export const formatKB = (bytes: number) => `${bytes / 1000} kB`;

export const formatMs = (ms: number) =>
  ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;

export const formatMB = (bytes: number) =>
  `${Math.round(bytes / 1_000_000)} MB`;

export const formatMsTick = (ms: number) =>
  ms < 1000 ? `${ms} ms` : `${ms / 1000} s`;

interface Scale {
  min: number;
  max: number;
  ticks: number[];
  /** Maps a value to 0-1 */
  toFraction(value: number): number;
}

function linearScale(min: number, max: number, targetTicks = 7): Scale {
  const rawStep = (max - min) / targetTicks;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const step =
    magnitude *
    (normalized < 1.5 ? 1 : normalized < 3 ? 2 : normalized < 7 ? 5 : 10);
  // Avoids floating point noise like 9.700000000000001
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  const round = (value: number) => Number(value.toFixed(decimals));

  const start = round(Math.floor(min / step) * step);
  const end = round(Math.ceil(max / step) * step);
  const ticks: number[] = [];

  for (let i = 0; start + i * step <= end + step / 2; i++) {
    ticks.push(round(start + i * step));
  }

  return {
    min: start,
    max: end,
    ticks,
    toFraction: (value) => (value - start) / (end - start),
  };
}

function logScale(min: number, max: number): Scale {
  // Over a wide range, only label 1, 2, and 5 of each power of 10.
  const multiples =
    Math.log10(max / min) > 1.5 ? [1, 2, 5] : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const candidates: number[] = [];

  for (
    let power = Math.floor(Math.log10(min));
    power <= Math.ceil(Math.log10(max));
    power++
  ) {
    for (const multiple of multiples) candidates.push(multiple * 10 ** power);
  }

  const start = candidates.findLast((value) => value <= min) ?? min;
  const end = candidates.find((value) => value >= max) ?? max;
  const logStart = Math.log10(start);
  const logRange = Math.log10(end) - logStart;

  return {
    min: start,
    max: end,
    ticks: candidates.filter((value) => value >= start && value <= end),
    toFraction: (value) => (Math.log10(value) - logStart) / logRange,
  };
}

const formatTick = (value: number, ticks: number[]) => {
  const step = ticks[1] - ticks[0];
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  return value.toFixed(decimals);
};

/** A dot, drawn as a zero-length line with a round cap, so it isn't stretched. */
const dot = (x: number, y: number) => `M${x} ${y}h0`;

// Not useId, as each component is its own root, so they'd get the same ID.
let instanceId = 0;

interface SegmentedProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  const [name] = useState(() => `line-chart-${instanceId++}`);

  return (
    <fieldset class="line-chart-segmented" disabled={__PRERENDER__}>
      <legend>{label}</legend>
      <div class="line-chart-segmented-options">
        {options.map((option) => (
          <label>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const scaleOptions: { value: 'linear' | 'log'; label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'log', label: 'Log' },
];

interface Hovered {
  series: ChartSeries;
  point: ChartPoint;
}

const LineChart: FunctionalComponent<Props> = ({
  series: allSeries,
  xTitle,
  yTitle,
  formatYTick,
  formatXTick,
  xLogToggle = false,
  yLogToggle = true,
  controls,
}) => {
  const [scaleType, setScaleType] = useState<'linear' | 'log'>('linear');
  const [xScaleType, setXScaleType] = useState<'linear' | 'log'>('linear');
  const [hiddenSeries, setHiddenSeries] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [anchorName] = useState(() => `--line-chart-${instanceId++}`);

  useLayoutEffect(() => {
    const tooltip = tooltipRef.current!;
    if (hovered && !tooltip.matches(':popover-open')) tooltip.showPopover();
    else if (!hovered && tooltip.matches(':popover-open')) {
      tooltip.hidePopover();
    }
  }, [hovered]);

  // The data changed (e.g. a different browser was picked), so the hovered
  // point may no longer exist.
  useEffect(() => setHovered(null), [allSeries]);

  const visibleSeries = allSeries.filter((s) => !hiddenSeries.has(s.id));
  // Scale to the visible series, unless that's nothing.
  const scaledPoints = (
    visibleSeries.length ? visibleSeries : allSeries
  ).flatMap((s) => s.points);

  const xValues = scaledPoints.map((p) => p.x);
  const yValues = scaledPoints.map((p) => p.y);
  const xScale = (xScaleType === 'log' ? logScale : linearScale)(
    Math.min(...xValues),
    Math.max(...xValues),
  );
  const yScale = (scaleType === 'log' ? logScale : linearScale)(
    Math.min(...yValues),
    Math.max(...yValues),
  );

  const plotX = (value: number) => xScale.toFraction(value) * plotSize;
  const plotY = (value: number) => (1 - yScale.toFraction(value)) * plotSize;

  const toggleSeries = (id: string) => {
    const newHidden = new Set(hiddenSeries);
    if (newHidden.has(id)) newHidden.delete(id);
    else newHidden.add(id);
    setHiddenSeries(newHidden);
    setHovered(null);
  };

  const onPointerMove = (event: PointerEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    let closest: Hovered | null = null;
    let closestDistance = hoverDistance;

    for (const series of visibleSeries) {
      for (const point of series.points) {
        const distance = Math.hypot(
          xScale.toFraction(point.x) * rect.width - pointerX,
          (1 - yScale.toFraction(point.y)) * rect.height - pointerY,
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = { series, point };
        }
      }
    }

    if (closest?.point !== hovered?.point) setHovered(closest);
  };

  return (
    <div class="line-chart">
      <div class="line-chart-controls">
        {controls}
        {xLogToggle && (
          <Segmented
            label="X scale"
            options={scaleOptions}
            value={xScaleType}
            onChange={(value) => {
              setXScaleType(value);
              setHovered(null);
            }}
          />
        )}
        {yLogToggle && (
          <Segmented
            label={xLogToggle ? 'Y scale' : 'Scale'}
            options={scaleOptions}
            value={scaleType}
            onChange={(value) => {
              setScaleType(value);
              setHovered(null);
            }}
          />
        )}
      </div>
      <div class="line-chart-graph">
        <div class="line-chart-y-title">{yTitle}</div>
        <div class="line-chart-y-ticks" aria-hidden="true">
          {yScale.ticks.map((tick) => (
            <span style={{ top: `${(1 - yScale.toFraction(tick)) * 100}%` }}>
              {formatYTick(tick)}
            </span>
          ))}
        </div>
        <div
          class="line-chart-plot"
          onPointerMove={onPointerMove}
          onPointerDown={onPointerMove}
          onPointerLeave={() => setHovered(null)}
        >
          <svg
            viewBox={`0 0 ${plotSize} ${plotSize}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`${yTitle} against ${xTitle}`}
          >
            <g class="line-chart-grid">
              {xScale.ticks.map((tick) => (
                <line x1={plotX(tick)} x2={plotX(tick)} y1={0} y2={plotSize} />
              ))}
              {yScale.ticks.map((tick) => (
                <line x1={0} x2={plotSize} y1={plotY(tick)} y2={plotY(tick)} />
              ))}
            </g>
            {visibleSeries.map((series) => (
              <g stroke={series.color}>
                <path
                  class="line-chart-line"
                  d={series.points
                    .map(
                      (p, i) =>
                        `${i === 0 ? 'M' : 'L'}${plotX(p.x)} ${plotY(p.y)}`,
                    )
                    .join('')}
                  stroke-dasharray={series.dashed ? dashPattern : undefined}
                />
                <path
                  class="line-chart-points"
                  d={series.points
                    .map((p) => dot(plotX(p.x), plotY(p.y)))
                    .join('')}
                />
              </g>
            ))}
            {hovered && (
              <g class="line-chart-hovered">
                <path
                  class="line-chart-hovered-ring"
                  d={dot(plotX(hovered.point.x), plotY(hovered.point.y))}
                />
                <path
                  stroke={hovered.series.color}
                  d={dot(plotX(hovered.point.x), plotY(hovered.point.y))}
                />
              </g>
            )}
          </svg>
          {hovered && (
            <div
              class="line-chart-tooltip-anchor"
              style={{
                left: `${xScale.toFraction(hovered.point.x) * 100}%`,
                top: `${(1 - yScale.toFraction(hovered.point.y)) * 100}%`,
                '--anchor-name': anchorName,
              }}
            />
          )}
          <div
            class="line-chart-tooltip"
            popover="manual"
            ref={tooltipRef}
            style={{ '--anchor-name': anchorName }}
          >
            {hovered && (
              <Fragment>
                <div class="line-chart-tooltip-title">
                  {hovered.series.label}
                </div>
                {hovered.point.details.map((line) => (
                  <div>{line}</div>
                ))}
              </Fragment>
            )}
          </div>
        </div>
        <div class="line-chart-x-ticks" aria-hidden="true">
          {xScale.ticks.map((tick) => (
            <span style={{ left: `${xScale.toFraction(tick) * 100}%` }}>
              {formatXTick ? formatXTick(tick) : formatTick(tick, xScale.ticks)}
            </span>
          ))}
        </div>
        <div class="line-chart-x-title">{xTitle}</div>
      </div>
      <ul class="line-chart-legend">
        {allSeries.map((series) => (
          <li>
            <button
              type="button"
              aria-pressed={!hiddenSeries.has(series.id)}
              disabled={__PRERENDER__}
              onClick={() => toggleSeries(series.id)}
            >
              <svg viewBox="0 0 24 10" stroke={series.color}>
                <path
                  class="line-chart-line"
                  d="M0 5h24"
                  stroke-dasharray={series.dashed ? dashPattern : undefined}
                />
                <path class="line-chart-points" d={dot(12, 5)} />
              </svg>
              {series.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LineChart;

const styles = `
.line-chart {
  padding: 1em;
  background: #fff;
  font-size: 0.8rem;
  line-height: 1.3;
}

.line-chart-graph {
  display: grid;
  grid-template-columns: auto 4.5em 1fr;
  grid-template-rows: 380px auto auto;
}

.line-chart-y-title {
  grid-area: 1 / 1;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-align: center;
}

.line-chart-y-ticks,
.line-chart-x-ticks {
  position: relative;
  color: #555;
  white-space: nowrap;

  & > span {
    position: absolute;
  }
}

.line-chart-y-ticks {
  grid-area: 1 / 2;

  & > span {
    right: 0.6em;
    transform: translateY(-50%);
  }
}

.line-chart-x-ticks {
  grid-area: 2 / 3;
  height: 1.8em;

  & > span {
    top: 0.4em;
    transform: translateX(-50%);
  }
}

.line-chart-x-title {
  grid-area: 3 / 3;
  text-align: center;
}

.line-chart-plot {
  grid-area: 1 / 3;
  position: relative;
  border-left: 1px solid #999;
  border-bottom: 1px solid #999;

  & > svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
}

.line-chart svg {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;

  & * {
    vector-effect: non-scaling-stroke;
  }
}

.line-chart-grid {
  stroke: #e5e5e5;
  stroke-width: 1px;
  stroke-linecap: butt;
}

.line-chart-line {
  stroke-width: 2px;
}

.line-chart-points {
  stroke-width: 6px;
}

.line-chart-hovered {
  stroke-width: 12px;
}

.line-chart-hovered-ring {
  stroke: #fff;
  stroke-width: 16px;
}

.line-chart-tooltip-anchor {
  position: absolute;
  anchor-name: var(--anchor-name);
}

.line-chart-tooltip {
  position-anchor: var(--anchor-name);
  position-area: right;
  position-try-fallbacks: flip-inline, flip-block, flip-block flip-inline;
  inset: auto;
  margin: 0 12px;
  border: none;
  font-size: 0.8rem;
  line-height: 1.3;
  padding: 0.5em 0.7em;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
}

.line-chart-tooltip-title {
  font-weight: bold;
}

.line-chart-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.2em 0.4em;
  margin: 1em 0 0;
  padding: 0;
  list-style: none;

  & li {
    margin: 0;
    padding: 0;
  }

  & button {
    display: flex;
    align-items: center;
    gap: 0.4em;
    padding: 0.2em 0.4em;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
    cursor: pointer;

    &[aria-pressed='false'] {
      opacity: 0.4;
      text-decoration: line-through;
    }

    &:disabled {
      cursor: default;
    }
  }

  & svg {
    width: 24px;
    height: 10px;
    overflow: visible;
  }
}

.line-chart-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5em 1.5em;
  margin-bottom: 1em;
}

.line-chart-segmented {
  display: flex;
  align-items: center;
  gap: 0.6em;
  /* Fieldsets default to min-content, which stops the options scrolling */
  min-width: 0;
  max-width: 100%;
  margin: 0;
  padding: 0;
  border: none;

  & legend {
    /* Legends can't be flex items, so float it into the row */
    float: left;
    padding: 0;
    color: #555;
  }
}

.line-chart-segmented-options {
  display: flex;
  border: 1px solid #999;
  border-radius: 4px;
  /* Scrolls if there are too many options to fit */
  overflow-x: auto;

  & label {
    position: relative;
    flex-shrink: 0;
    cursor: pointer;

    & + label {
      border-left: 1px solid #999;
    }
  }

  & input {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    cursor: inherit;
  }

  & span {
    display: block;
    padding: 0.3em 0.8em;
    white-space: nowrap;
  }

  & label:hover span {
    background: #eee;
  }

  & input:checked + span {
    background: #333;
    color: #fff;
  }

  & input:focus-visible + span {
    outline: 2px solid #2a78d6;
    outline-offset: -4px;
  }

  :disabled & label {
    cursor: default;
  }
}
`;

export const Styles: FunctionalComponent = () => (
  <style dangerouslySetInnerHTML={{ __html: styles }} />
);
