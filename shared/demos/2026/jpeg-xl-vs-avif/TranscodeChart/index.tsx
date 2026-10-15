import { Fragment, FunctionalComponent, h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import LineChart, {
  Browser,
  browserOptions,
  ChartSeries,
  formatBytes,
  formatKB,
  formatMs,
  formatMsTick,
  Segmented,
} from '../LineChart';

/** A JPEG at a particular resolution & quality, and the JPEG XLs transcoded from it */
export interface TranscodeRow {
  width: number;
  height: number;
  /** The JPEG's quality setting */
  quality: number;
  jpegBytes: number;
  jxlBytes: number;
  /** Mean decode time per browser */
  jpegDecodeMs: Partial<Record<Browser, number>>;
  jxlDecodeMs: Partial<Record<Browser, number>>;
  jixelBytes: number;
  jixelDecodeMs: Partial<Record<Browser, number>>;
}

type YAxis = 'bytes' | 'decodeMs';

export interface TranscodeChartProps {
  /** What to plot on the y-axis. Defaults to bytes. */
  y?: YAxis;
  /** The initially selected JPEG quality. Defaults to 70, or the closest. */
  initialQuality?: number;
}

interface Props extends TranscodeChartProps {
  data: TranscodeRow[];
}

interface Format {
  id: string;
  label: string;
  color: string;
  /** Whether this is a JPEG XL, so its saving is shown */
  transcoded: boolean;
  bytes: (row: TranscodeRow) => number;
  decodeMs: (row: TranscodeRow) => Partial<Record<Browser, number>>;
}

// Same hues as the other charts
const formats: Format[] = [
  {
    id: 'jpeg',
    label: 'JPEG',
    color: '#52514e',
    transcoded: false,
    bytes: (row) => row.jpegBytes,
    decodeMs: (row) => row.jpegDecodeMs,
  },
  {
    id: 'jxl',
    label: 'libjxl',
    color: '#eb6834',
    transcoded: true,
    bytes: (row) => row.jxlBytes,
    decodeMs: (row) => row.jxlDecodeMs,
  },
  {
    id: 'jixel',
    label: 'jixel',
    color: '#1baf7a',
    transcoded: true,
    bytes: (row) => row.jixelBytes,
    decodeMs: (row) => row.jixelDecodeMs,
  },
];

const megapixels = (row: TranscodeRow) => (row.width * row.height) / 1e6;

const TranscodeChart: FunctionalComponent<Props> = ({
  data,
  y = 'bytes',
  initialQuality = 70,
}) => {
  const qualities = useMemo(
    () => [...new Set(data.map((row) => row.quality))].sort((a, b) => a - b),
    [data],
  );
  const [browser, setBrowser] = useState<Browser>('firefox');
  // A string, as that's what the segmented control works with
  const [quality, setQuality] = useState(() =>
    String(
      qualities.reduce((closest, q) =>
        Math.abs(q - initialQuality) < Math.abs(closest - initialQuality)
          ? q
          : closest,
      ),
    ),
  );

  const series = useMemo(
    (): ChartSeries[] =>
      formats.map((format) => ({
        // Not including the quality, so series hidden via the legend stay
        // hidden when the quality changes.
        id: format.id,
        label: format.label,
        color: format.color,
        points: data
          .filter((row) => row.quality === Number(quality))
          .map((row) => {
            const bytes = format.bytes(row);
            const decodeMs = format.decodeMs(row)[browser];
            const details = [
              `${row.width}×${row.height} (${megapixels(row).toFixed(2)} MP)`,
              `JPEG quality: ${row.quality}`,
              `Size: ${formatBytes(bytes)}`,
            ];

            if (format.transcoded) {
              const saving = Math.round((1 - bytes / row.jpegBytes) * 100);
              details.push(`${saving}% smaller than the JPEG`);
            }
            if (decodeMs !== undefined) {
              details.push(`Decode time: ${formatMs(decodeMs)}`);
            }

            return {
              x: megapixels(row),
              y: y === 'bytes' ? bytes : decodeMs,
              details,
            };
          })
          .filter((point): point is ChartSeries['points'][number] =>
            Number.isFinite(point.y),
          )
          .sort((a, b) => a.x - b.x),
      })),
    [data, quality, y, browser],
  );

  return (
    <LineChart
      series={series}
      xTitle="Megapixels"
      yTitle={y === 'bytes' ? 'File size' : 'Decode time'}
      formatYTick={y === 'bytes' ? formatKB : formatMsTick}
      controls={
        <Fragment>
          {y === 'decodeMs' && (
            <Segmented
              label="Browser"
              options={browserOptions}
              value={browser}
              onChange={setBrowser}
            />
          )}
          <Segmented
            label="JPEG quality"
            options={qualities.map((q) => ({
              value: String(q),
              label: String(q),
            }))}
            value={quality}
            onChange={setQuality}
          />
        </Fragment>
      }
    />
  );
};

export default TranscodeChart;
