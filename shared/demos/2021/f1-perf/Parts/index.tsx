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

const parts = ['Methodology & Alpha Tauri'];

const Parts: FunctionalComponent<Props> = ({ includeIntro, partIndex }) => (
  <Fragment>
    {includeIntro && <p>TODO: intro</p>}
    <ol>
      {parts.map((part, i) => (
        <li>
          <Part href={partIndex === i ? '' : `/2021/f1-perf-part-${i + 1}`}>
            {partIndex === i && '➡️'} {part}
          </Part>
          <li>…more coming soon…</li>
        </li>
      ))}
    </ol>
  </Fragment>
);

export default Parts;
