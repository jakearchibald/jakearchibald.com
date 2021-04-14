import { Fragment, FunctionalComponent, h } from 'preact';

interface PartProps {
  href: string;
}

const Part: FunctionalComponent<PartProps> = ({ href, children }) =>
  href ? <a href={href}>{children}</a> : <Fragment>{children}</Fragment>;

interface Props {
  partIndex: number;
  includeIntro: boolean;
}

const parts = [
  'Methodology & Alpha Tauri',
  'Alfa Romeo',
  'Red Bull',
  'Williams',
  'Aston Martin',
  'Ferrari',
  'Haas',
  'McLaren',
] as const;

const Parts: FunctionalComponent<Props> = ({ includeIntro, partIndex }) => (
  <Fragment>
    {includeIntro && (
      <p>
        This is{' '}
        {partIndex === parts.length - 1
          ? 'the latest'
          : `part ${partIndex + 1}`}{' '}
        in a multi-part series looking at the loading performance of F1
        websites. Not interested in F1? It shouldn't matter. This is just a
        performance review of 10 recently-built/updated sites that have broadly
        the same goal, but are built by different teams, and have different
        performance issues.
      </p>
    )}
    <ol>
      {parts.map((part, i) => (
        <li>
          <Part href={partIndex === i ? '' : `/2021/f1-perf-part-${i + 1}`}>
            {partIndex === i && '➡️'} {part}
          </Part>
        </li>
      ))}
      <li>…more coming soon…</li>
    </ol>
  </Fragment>
);

export default Parts;
