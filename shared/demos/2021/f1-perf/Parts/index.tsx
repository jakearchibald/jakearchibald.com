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
  { part: 1, title: 'Methodology & Alpha Tauri', url: `/2021/f1-perf-part-1/` },
  { part: 2, title: 'Alfa Romeo', url: `/2021/f1-perf-part-2/` },
  { part: 3, title: 'Red Bull', url: '/2021/f1-perf-part-3/' },
  { part: 4, title: 'Williams', url: '/2021/f1-perf-part-4/' },
  { part: 5, title: 'Aston Martin', url: '/2021/f1-perf-part-5/' },
  { part: 6, title: 'Ferrari', url: '/2021/f1-perf-part-6/' },
  { part: 7, title: 'Haas', url: '/2021/f1-perf-part-7/' },
  { part: 8, title: 'McLaren', url: '/2021/f1-perf-part-8/' },
  { part: 0, title: 'Google I/O', url: '/2021/io-site-perf/' },
] as const;

const css = `
.part-list li {
  display: block;
}
@media (min-width: 580px) {
  .part-list {
    columns: 2;
    column-gap: 2em;
  }
}
`;

const Parts: FunctionalComponent<Props> = ({ includeIntro, partIndex }) => (
  <Fragment>
    {includeIntro && (
      <p>
        This is{' '}
        {partIndex === parts.length - 1
          ? 'the latest'
          : `part ${parts[partIndex].part}`}{' '}
        in a multi-part series looking at the loading performance of F1
        websites. Not interested in F1? It shouldn't matter. This is just a
        performance review of 10 recently-built/updated sites that have broadly
        the same goal, but are built by different teams, and have different
        performance issues.
      </p>
    )}
    <style dangerouslySetInnerHTML={{ __html: css }} />
    <ol class="part-list">
      {parts.map((part, i) => (
        <li>
          <Part href={partIndex === i ? '' : part.url}>
            {partIndex === i && '➡️'}{' '}
            {part.part ? `Part ${part.part}:` : 'Bonus:'} {part.title}
          </Part>
        </li>
      ))}
      <li>…more coming soon…</li>
    </ol>
  </Fragment>
);

export default Parts;
