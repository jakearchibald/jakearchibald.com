import { Fragment, FunctionalComponent, h } from 'preact';
import { useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';

export interface Row {
  seriesId: string;
  codec: 'avif' | 'jxl';
  effort: number;
  effortLabel: string;
  yuv: string | null;
  /** How an HDR AVIF stores its HDR data. Null for SDR. */
  hdrMode?: 'gainmap' | 'pq' | 'gainmap-hdr' | null;
  quality: number;
  bytes: number;
  /** Best-of-N multi-threaded encode time */
  encodeMs: number | null;
  /** Peak multi-threaded encoder memory, in bytes */
  encodeMemory: number | null;
  /** Mean decode time per browser */
  decodeMs: Partial<Record<Browser, number>>;
  ssimulacra2: number;
  jod: number | null;
}

type Metric = 'ssimulacra2' | 'jod';

type YAxis = 'bytes' | 'encodeMs' | 'encodeMemory' | 'decodeMs';

export type Browser = 'firefox' | 'chrome' | 'safari';

const browsers: { value: Browser; label: string }[] = [
  { value: 'firefox', label: 'Firefox' },
  { value: 'chrome', label: 'Chrome' },
  { value: 'safari', label: 'Safari' },
];

export interface ChartProps {
  metric: Metric;
  /** What to plot on the y-axis. Defaults to bytes. */
  y?: YAxis;
  /** Limit the chart to these series IDs. Defaults to all. */
  series?: string[];
}

interface Props extends ChartProps {
  data: Row[];
}

const metricTitles: Record<Metric, string> = {
  ssimulacra2: 'SSIMULACRA2 (higher is closer to the original)',
  jod: 'ColorVideoVDP, JOD (10 = no visible difference)',
};

// Codec is identified by hue, effort by lightness (darker = more effort).
const avifColors = ['#0b3d7a', '#1d5aa8', '#2a78d6', '#5d9be6', '#93bdf0'];
const jxlColors = ['#8a3410', '#c04a1c', '#eb6834', '#f39a72'];
const dashPattern = '6 3';

// The plot is drawn in a 0-1000 space, stretched to fit. Strokes are
// non-scaling, so they stay the same width regardless of stretching.
const plotSize = 1000;
// Pointer distance (in CSS pixels) within which a point is 'hovered'.
const hoverDistance = 40;

const formatBytes = (bytes: number) =>
  bytes < 1000 ? `${bytes} B` : `${(bytes / 1000).toFixed(1)} kB`;

const formatKB = (bytes: number) => `${bytes / 1000} kB`;

const formatMs = (ms: number) =>
  ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;

const formatMB = (bytes: number) => `${Math.round(bytes / 1_000_000)} MB`;

const formatMsTick = (ms: number) =>
  ms < 1000 ? `${ms} ms` : `${ms / 1000} s`;

const yAxes: Record<
  YAxis,
  {
    title: string;
    formatTick: (value: number) => string;
    getValue: (row: Row, browser: Browser) => number | null | undefined;
  }
> = {
  bytes: {
    title: 'File size',
    formatTick: formatKB,
    getValue: (row) => row.bytes,
  },
  encodeMs: {
    title: 'Encode time',
    formatTick: formatMsTick,
    getValue: (row) => row.encodeMs,
  },
  encodeMemory: {
    title: 'Peak encoder memory',
    formatTick: formatMB,
    getValue: (row) => row.encodeMemory,
  },
  decodeMs: {
    title: 'Decode time',
    formatTick: formatMsTick,
    getValue: (row, browser) => row.decodeMs[browser],
  },
};

function seriesLabel(row: Row): string {
  const parts = [row.codec.toUpperCase(), row.effortLabel];
  if (row.hdrMode === 'pq') parts.splice(1, 0, 'PQ');
  if (row.hdrMode === 'gainmap') parts.splice(1, 0, 'gain map');
  if (row.yuv && row.yuv !== '444') parts.push(row.yuv.split('').join(':'));
  return parts.join(' ');
}

interface Point {
  x: number;
  y: number;
  row: Row;
}

interface Series {
  id: string;
  label: string;
  color: string;
  dashed: boolean;
  points: Point[];
}

function createSeries(
  rows: Row[],
  metric: Metric,
  getY: (row: Row) => number | null | undefined,
  seriesFilter?: string[],
): Series[] {
  const bySeries = new Map<string, Row[]>();

  for (const row of rows) {
    if (seriesFilter && !seriesFilter.includes(row.seriesId)) continue;
    if (row[metric] === null || getY(row) == null) continue;
    if (!bySeries.has(row.seriesId)) bySeries.set(row.seriesId, []);
    bySeries.get(row.seriesId)!.push(row);
  }

  const series = [...bySeries.values()].sort(
    ([a], [b]) =>
      a.codec.localeCompare(b.codec) ||
      (b.yuv ?? '').localeCompare(a.yuv ?? '') ||
      Number(a.hdrMode === 'pq') - Number(b.hdrMode === 'pq') ||
      a.effort - b.effort,
  );

  // Colors are assigned per codec + effort, so the same effort gets the same
  // color regardless of subsampling or filtering.
  const effortsFor = (codec: Row['codec']) =>
    [...new Set(rows.filter((r) => r.codec === codec).map((r) => r.effort))]
      // Lower AVIF speed = more effort. Higher JXL effort = more effort.
      .sort((a, b) => (codec === 'avif' ? a - b : b - a));

  const avifEfforts = effortsFor('avif');
  const jxlEfforts = effortsFor('jxl');

  return series.map((seriesRows) => {
    const first = seriesRows[0];
    const color =
      first.codec === 'avif'
        ? avifColors[avifEfforts.indexOf(first.effort) % avifColors.length]
        : jxlColors[jxlEfforts.indexOf(first.effort) % jxlColors.length];

    return {
      id: first.seriesId,
      label: seriesLabel(first),
      color,
      // 4:2:0 and PQ never appear in the same dataset, so they share dashes.
      dashed: first.yuv === '420' || first.hdrMode === 'pq',
      points: seriesRows
        .map((row) => ({ x: row[metric]!, y: getY(row)!, row }))
        .sort((a, b) => a.x - b.x),
    };
  });
}

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
  name: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

function Segmented<T extends string>({
  label,
  name,
  options,
  value,
  onChange,
}: SegmentedProps<T>) {
  return (
    <fieldset class="quality-chart-segmented" disabled={__PRERENDER__}>
      <legend>{label}</legend>
      <div class="quality-chart-segmented-options">
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
  series: Series;
  point: Point;
}

const QualityChart: FunctionalComponent<Props> = ({
  data,
  metric,
  y = 'bytes',
  series: seriesFilter,
}) => {
  const yAxis = yAxes[y];
  const [scaleType, setScaleType] = useState<'linear' | 'log'>('linear');
  const [browser, setBrowser] = useState<Browser>('firefox');
  const [hiddenSeries, setHiddenSeries] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [id] = useState(() => `quality-chart-${instanceId++}`);
  const anchorName = `--${id}`;

  useLayoutEffect(() => {
    const tooltip = tooltipRef.current!;
    if (hovered && !tooltip.matches(':popover-open')) tooltip.showPopover();
    else if (!hovered && tooltip.matches(':popover-open')) {
      tooltip.hidePopover();
    }
  }, [hovered]);

  const allSeries = useMemo(
    () =>
      createSeries(
        data,
        metric,
        (row) => yAxis.getValue(row, browser),
        seriesFilter,
      ),
    [data, metric, y, browser, seriesFilter],
  );

  const visibleSeries = allSeries.filter((s) => !hiddenSeries.has(s.id));
  // Scale to the visible series, unless that's nothing.
  const scaledPoints = (
    visibleSeries.length ? visibleSeries : allSeries
  ).flatMap((s) => s.points);

  const xValues = scaledPoints.map((p) => p.x);
  const yValues = scaledPoints.map((p) => p.y);
  const xScale = linearScale(Math.min(...xValues), Math.max(...xValues));
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
    <div class="quality-chart">
      <div class="quality-chart-controls">
        {y === 'decodeMs' && (
          <Segmented
            label="Browser"
            name={`${id}-browser`}
            options={browsers}
            value={browser}
            onChange={(value) => {
              setBrowser(value);
              setHovered(null);
            }}
          />
        )}
        <Segmented
          label="Scale"
          name={`${id}-scale`}
          options={scaleOptions}
          value={scaleType}
          onChange={(value) => {
            setScaleType(value);
            setHovered(null);
          }}
        />
      </div>
      <div class="quality-chart-graph">
        <div class="quality-chart-y-title">{yAxis.title}</div>
        <div class="quality-chart-y-ticks" aria-hidden="true">
          {yScale.ticks.map((tick) => (
            <span style={{ top: `${(1 - yScale.toFraction(tick)) * 100}%` }}>
              {yAxis.formatTick(tick)}
            </span>
          ))}
        </div>
        <div
          class="quality-chart-plot"
          onPointerMove={onPointerMove}
          onPointerDown={onPointerMove}
          onPointerLeave={() => setHovered(null)}
        >
          <svg
            viewBox={`0 0 ${plotSize} ${plotSize}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`${yAxis.title} against ${metricTitles[metric]}`}
          >
            <g class="quality-chart-grid">
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
                  class="quality-chart-line"
                  d={series.points
                    .map(
                      (p, i) =>
                        `${i === 0 ? 'M' : 'L'}${plotX(p.x)} ${plotY(p.y)}`,
                    )
                    .join('')}
                  stroke-dasharray={series.dashed ? dashPattern : undefined}
                />
                <path
                  class="quality-chart-points"
                  d={series.points
                    .map((p) => dot(plotX(p.x), plotY(p.y)))
                    .join('')}
                />
              </g>
            ))}
            {hovered && (
              <g class="quality-chart-hovered">
                <path
                  class="quality-chart-hovered-ring"
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
              class="quality-chart-tooltip-anchor"
              style={{
                left: `${xScale.toFraction(hovered.point.x) * 100}%`,
                top: `${(1 - yScale.toFraction(hovered.point.y)) * 100}%`,
                '--anchor-name': anchorName,
              }}
            />
          )}
          <div
            class="quality-chart-tooltip"
            popover="manual"
            ref={tooltipRef}
            style={{ '--anchor-name': anchorName }}
          >
            {hovered && (
              <Fragment>
                <div class="quality-chart-tooltip-title">
                  {hovered.series.label}
                </div>
                <div>
                  SSIMULACRA2: {hovered.point.row.ssimulacra2.toFixed(2)}
                </div>
                {hovered.point.row.jod !== null && (
                  <div>
                    ColorVideoVDP: {hovered.point.row.jod.toFixed(3)} JOD
                  </div>
                )}
                <div>Size: {formatBytes(hovered.point.row.bytes)}</div>
                {hovered.point.row.encodeMs !== null && (
                  <div>Encode time: {formatMs(hovered.point.row.encodeMs)}</div>
                )}
                {hovered.point.row.encodeMemory !== null && (
                  <div>
                    Encoder memory: {formatMB(hovered.point.row.encodeMemory)}
                  </div>
                )}
                {y === 'decodeMs' && (
                  <div>Decode time: {formatMs(hovered.point.y)}</div>
                )}
                <div>Quality setting: {hovered.point.row.quality}</div>
              </Fragment>
            )}
          </div>
        </div>
        <div class="quality-chart-x-ticks" aria-hidden="true">
          {xScale.ticks.map((tick) => (
            <span style={{ left: `${xScale.toFraction(tick) * 100}%` }}>
              {formatTick(tick, xScale.ticks)}
            </span>
          ))}
        </div>
        <div class="quality-chart-x-title">{metricTitles[metric]}</div>
      </div>
      <ul class="quality-chart-legend">
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
                  class="quality-chart-line"
                  d="M0 5h24"
                  stroke-dasharray={series.dashed ? dashPattern : undefined}
                />
                <path class="quality-chart-points" d={dot(12, 5)} />
              </svg>
              {series.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QualityChart;

const styles = `
.quality-chart {
  padding: 1em;
  background: #fff;
  font-size: 0.8rem;
  line-height: 1.3;
}

.quality-chart-graph {
  display: grid;
  grid-template-columns: auto 4.5em 1fr;
  grid-template-rows: 380px auto auto;
}

.quality-chart-y-title {
  grid-area: 1 / 1;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-align: center;
}

.quality-chart-y-ticks,
.quality-chart-x-ticks {
  position: relative;
  color: #555;
  white-space: nowrap;

  & > span {
    position: absolute;
  }
}

.quality-chart-y-ticks {
  grid-area: 1 / 2;

  & > span {
    right: 0.6em;
    transform: translateY(-50%);
  }
}

.quality-chart-x-ticks {
  grid-area: 2 / 3;
  height: 1.8em;

  & > span {
    top: 0.4em;
    transform: translateX(-50%);
  }
}

.quality-chart-x-title {
  grid-area: 3 / 3;
  text-align: center;
}

.quality-chart-plot {
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

.quality-chart svg {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;

  & * {
    vector-effect: non-scaling-stroke;
  }
}

.quality-chart-grid {
  stroke: #e5e5e5;
  stroke-width: 1px;
  stroke-linecap: butt;
}

.quality-chart-line {
  stroke-width: 2px;
}

.quality-chart-points {
  stroke-width: 6px;
}

.quality-chart-hovered {
  stroke-width: 12px;
}

.quality-chart-hovered-ring {
  stroke: #fff;
  stroke-width: 16px;
}

.quality-chart-tooltip-anchor {
  position: absolute;
  anchor-name: var(--anchor-name);
}

.quality-chart-tooltip {
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

.quality-chart-tooltip-title {
  font-weight: bold;
}

.quality-chart-legend {
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

.quality-chart-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5em 1.5em;
  margin-bottom: 1em;
}

.quality-chart-segmented {
  display: flex;
  align-items: center;
  gap: 0.6em;
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

.quality-chart-segmented-options {
  display: flex;
  border: 1px solid #999;
  border-radius: 4px;
  overflow: hidden;

  & label {
    position: relative;
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
