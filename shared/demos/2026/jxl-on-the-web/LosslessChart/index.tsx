import { Fragment, FunctionalComponent, h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import LineChart, {
  Browser,
  browserOptions,
  ChartSeries,
  formatBytes,
  formatMB,
  formatMs,
  formatMsTick,
  Segmented,
} from '../LineChart';

type Codec = 'avif' | 'jxl' | 'webp';

interface LosslessRow {
  codec: Codec;
  effort: number;
  effortLabel: string;
  bytes: number;
  /** Best-of-N multi-threaded encode time */
  encodeMs: number;
  /** Peak multi-threaded encoder memory, in bytes */
  encodeMemory: number;
  /** Mean decode time per browser */
  decodeMs: Partial<Record<Browser, number>>;
}

export interface LosslessImage {
  label: string;
  rows: LosslessRow[];
}

type XAxis = 'encodeMs' | 'encodeMemory' | 'decodeMs';

export interface LosslessChartProps {
  /** What to plot on the x-axis, against file size */
  x: XAxis;
  /** Label of the initially selected image. Defaults to the first. */
  initialImage?: string;
}

interface Props extends LosslessChartProps {
  images: LosslessImage[];
}

// Same hues as the other charts, plus one for WebP
const codecs: { id: Codec; label: string; color: string }[] = [
  { id: 'avif', label: 'AVIF', color: '#2a78d6' },
  { id: 'webp', label: 'WebP', color: '#1baf7a' },
  { id: 'jxl', label: 'JPEG XL', color: '#eb6834' },
];

const xAxes: Record<
  XAxis,
  {
    title: string;
    formatTick: (value: number) => string;
    getValue: (row: LosslessRow, browser: Browser) => number | undefined;
  }
> = {
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

const formatSizeTick = (bytes: number) =>
  bytes >= 1e6 ? `${bytes / 1e6} MB` : `${bytes / 1e3} kB`;

const formatSize = (bytes: number) =>
  bytes >= 1e6 ? `${(bytes / 1e6).toFixed(2)} MB` : formatBytes(bytes);

/** Higher is more effort, regardless of codec */
const effortRank = (row: LosslessRow) =>
  // AVIF uses 'speed', where lower is more effort.
  row.codec === 'avif' ? -row.effort : row.effort;

const LosslessChart: FunctionalComponent<Props> = ({
  images,
  x,
  initialImage = images[0].label,
}) => {
  const xAxis = xAxes[x];
  const [imageLabel, setImageLabel] = useState(initialImage);
  const [browser, setBrowser] = useState<Browser>('firefox');
  const image = images.find((image) => image.label === imageLabel)!;

  const series = useMemo(
    (): ChartSeries[] =>
      codecs.map((codec) => ({
        id: codec.id,
        label: codec.label,
        color: codec.color,
        // In order of effort, so the line shows what each step up buys.
        points: image.rows
          .filter((row) => row.codec === codec.id)
          .sort((a, b) => effortRank(a) - effortRank(b))
          .map((row) => {
            const details = [
              `Effort: ${row.effortLabel}`,
              `Size: ${formatSize(row.bytes)}`,
              `Encode time: ${formatMs(row.encodeMs)}`,
              `Encoder memory: ${formatMB(row.encodeMemory)}`,
            ];
            const decodeMs = row.decodeMs[browser];
            if (x === 'decodeMs' && decodeMs !== undefined) {
              details.push(`Decode time: ${formatMs(decodeMs)}`);
            }
            return { x: xAxis.getValue(row, browser), y: row.bytes, details };
          })
          .filter((point): point is ChartSeries['points'][number] =>
            Number.isFinite(point.x),
          ),
      })),
    [image, x, browser],
  );

  return (
    <LineChart
      series={series}
      xTitle={xAxis.title}
      yTitle="File size"
      formatXTick={xAxis.formatTick}
      formatYTick={formatSizeTick}
      xLogToggle
      yLogToggle={false}
      controls={
        <Fragment>
          <Segmented
            label="Image"
            options={images.map((image) => ({
              value: image.label,
              label: image.label,
            }))}
            value={imageLabel}
            onChange={setImageLabel}
          />
          {x === 'decodeMs' && (
            <Segmented
              label="Browser"
              options={browserOptions}
              value={browser}
              onChange={setBrowser}
            />
          )}
        </Fragment>
      }
    />
  );
};

export default LosslessChart;
