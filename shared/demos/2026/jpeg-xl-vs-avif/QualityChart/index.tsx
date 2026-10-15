import { FunctionalComponent, h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import LineChart, {
  Browser,
  browserOptions,
  ChartSeries,
  formatBytes,
  formatKB,
  formatMB,
  formatMs,
  formatMsTick,
  Segmented,
} from '../LineChart';

export { Styles } from '../LineChart';
export type { Browser } from '../LineChart';

type Codec = 'avif' | 'jxl' | 'jixel';

export interface Row {
  seriesId: string;
  codec: Codec;
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
const jixelColors = ['#0b5c40', '#0e7a54', '#13956a', '#1baf7a'];

const codecColors: Record<Codec, string[]> = {
  avif: avifColors,
  jxl: jxlColors,
  jixel: jixelColors,
};

const codecOrder: Codec[] = ['avif', 'jxl', 'jixel'];

const codecLabels: Record<Codec, string> = {
  avif: 'AVIF',
  jxl: 'libjxl',
  jixel: 'jixel',
};

// Series at these efforts are shown initially. The rest start toggled off.
const defaultEfforts: Record<Codec, number> = { avif: 6, jxl: 7, jixel: 3 };
const maxEfforts: Record<Codec, number> = { avif: 0, jxl: 10, jixel: 6 };

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
  const parts = [codecLabels[row.codec], row.effortLabel.replace('+', ' + ')];
  if (row.hdrMode === 'pq') parts.splice(1, 0, 'PQ');
  if (row.hdrMode === 'gainmap') parts.splice(1, 0, 'gain map');
  if (row.yuv && row.yuv !== '444') parts.push(row.yuv.split('').join(':'));
  return parts.join(' ');
}

function createSeries(
  rows: Row[],
  metric: Metric,
  getY: (row: Row) => number | null | undefined,
  getDetails: (row: Row) => string[],
  seriesFilter?: string[],
): ChartSeries[] {
  const bySeries = new Map<string, Row[]>();

  for (const row of rows) {
    if (seriesFilter && !seriesFilter.includes(row.seriesId)) continue;
    if (row[metric] === null || getY(row) == null) continue;
    if (!bySeries.has(row.seriesId)) bySeries.set(row.seriesId, []);
    bySeries.get(row.seriesId)!.push(row);
  }

  const series = [...bySeries.values()].sort(
    ([a], [b]) =>
      codecOrder.indexOf(a.codec) - codecOrder.indexOf(b.codec) ||
      (b.yuv ?? '').localeCompare(a.yuv ?? '') ||
      Number(a.hdrMode === 'pq') - Number(b.hdrMode === 'pq') ||
      Number(a.seriesId.endsWith('-patches')) -
        Number(b.seriesId.endsWith('-patches')) ||
      a.effort - b.effort,
  );

  // Colors are assigned per codec + effort, so the same effort gets the same
  // color regardless of subsampling or filtering.
  const effortsFor = (codec: Row['codec']) =>
    [...new Set(rows.filter((r) => r.codec === codec).map((r) => r.effort))]
      // Lower AVIF speed = more effort. Higher JXL/jixel effort = more effort.
      .sort((a, b) => (codec === 'avif' ? a - b : b - a));

  return series.map((seriesRows) => {
    const first = seriesRows[0];
    const colors = codecColors[first.codec];
    const color =
      colors[effortsFor(first.codec).indexOf(first.effort) % colors.length];

    return {
      id: first.seriesId,
      label: seriesLabel(first),
      color,
      // 4:2:0, PQ, and jixel patches never appear in the same series, so they
      // share dashes.
      dashed:
        first.yuv === '420' ||
        first.hdrMode === 'pq' ||
        first.seriesId.endsWith('-patches'),
      hidden:
        first.effort !== defaultEfforts[first.codec] &&
        first.effort !== maxEfforts[first.codec],
      points: seriesRows
        .map((row) => ({
          x: row[metric]!,
          y: getY(row)!,
          details: getDetails(row),
        }))
        .sort((a, b) => a.x - b.x),
    };
  });
}

const QualityChart: FunctionalComponent<Props> = ({
  data,
  metric,
  y = 'bytes',
  series: seriesFilter,
}) => {
  const yAxis = yAxes[y];
  const [browser, setBrowser] = useState<Browser>('firefox');

  const series = useMemo(() => {
    const getDetails = (row: Row) => {
      const details = [`SSIMULACRA2: ${row.ssimulacra2.toFixed(2)}`];
      if (row.jod !== null) {
        details.push(`ColorVideoVDP: ${row.jod.toFixed(3)} JOD`);
      }
      details.push(`Size: ${formatBytes(row.bytes)}`);
      if (row.encodeMs !== null) {
        details.push(`Encode time: ${formatMs(row.encodeMs)}`);
      }
      if (row.encodeMemory !== null) {
        details.push(`Encoder memory: ${formatMB(row.encodeMemory)}`);
      }
      const decodeMs = row.decodeMs[browser];
      if (y === 'decodeMs' && decodeMs !== undefined) {
        details.push(`Decode time: ${formatMs(decodeMs)}`);
      }
      details.push(`Quality setting: ${row.quality}`);
      return details;
    };

    return createSeries(
      data,
      metric,
      (row) => yAxis.getValue(row, browser),
      getDetails,
      seriesFilter,
    );
  }, [data, metric, y, browser, seriesFilter]);

  return (
    <LineChart
      series={series}
      xTitle={metricTitles[metric]}
      yTitle={yAxis.title}
      formatYTick={yAxis.formatTick}
      controls={
        y === 'decodeMs' && (
          <Segmented
            label="Browser"
            options={browserOptions}
            value={browser}
            onChange={setBrowser}
          />
        )
      }
    />
  );
};

export default QualityChart;
