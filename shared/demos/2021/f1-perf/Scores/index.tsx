import { Fragment, FunctionalComponent, h } from 'preact';
import bgImgJpeg from 'asset-url:./scores-bg.jpg';
import bgImgAvif from 'asset-url:./scores-bg.avif';
import alphaTauriImg from 'asset-url:./alpha-tauri.svg';
import alfaRomeoImg from 'asset-url:./alfa-romeo.svg';
import redBullImg from 'asset-url:./red-bull.svg';
import williamsImg from 'asset-url:./williams.svg';
import astonImg from 'asset-url:./aston-martin.svg';
import ferrariImg from 'asset-url:./ferrari.svg';
import haasImg from 'asset-url:./haas.svg';
import mclarenImg from 'asset-url:./mclaren.svg';
import googleImg from 'asset-url:./google.svg';

interface ScoreWith2019 extends Score {
  score2019: number;
}

interface Score {
  team: string;
  img: string;
  score: number;
}

const scores: ScoreWith2019[] = [
  {
    team: 'Alpha Tauri',
    img: alphaTauriImg,
    score: 22.1,
    score2019: 12.8,
  },
  {
    team: 'Alfa Romeo',
    img: alfaRomeoImg,
    score: 23.4,
    score2019: 20.1,
  },
  {
    team: 'Red Bull',
    img: redBullImg,
    score: 8.6,
    score2019: 15.8,
  },
  {
    team: 'Williams',
    img: williamsImg,
    score: 11.1,
    score2019: 14.1,
  },
  {
    team: 'Aston Martin',
    img: astonImg,
    score: 8.9,
    score2019: 84.2,
  },
  {
    team: 'Ferrari',
    img: ferrariImg,
    score: 52.8,
    score2019: 46.1,
  },
  {
    team: 'Haas',
    img: haasImg,
    score: 28.2,
    score2019: 12.5,
  },
  {
    team: 'McLaren',
    img: mclarenImg,
    score: 36,
    score2019: 40.7,
  },
  {
    team: 'Google I/O',
    img: googleImg,
    score: 39.2,
    score2019: 0,
  },
];

const css = `
@font-face {
  font-family: 'Titillium Web';
  font-style: normal;
  font-weight: 600;
  src: url(https://fonts.gstatic.com/s/titilliumweb/v9/NaPDcZTIAOhVxoMyOr9n_E7ffBzCGItzY5abuWI.woff2) format('woff2');
}
h2 + .f1-figure {
  margin-top: 0;
}
.f1-scoreboard-container {
  display: grid;
  min-height: 18em;
  align-items: center;
  position: relative;
  padding: 0 0.5em;
}
.f1-scoreboard-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.f1-scoreboard-bg img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}
.f1-scoreboard {
  position: relative;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Titillium Web', sans-serif;
  color: #fff;
  border-collapse: collapse;
  line-height: 1;
  text-align: right;
  counter-reset: pos;
  width: 100%;
  max-width: 420px;
  margin: 1em auto;
  --cell-padding: 0.5em;
}
.f1-scoreboard th {
  background: #000;
  text-align: left;
}
.f1-scoreboard thead th {
  text-align: right;
}
.f1-scoreboard td {
  background: rgba(0, 0, 0, 0.6);
}
.f1-scoreboard td,
.f1-scoreboard th {
  padding: var(--cell-padding);
}
.f1-scoreboard .corner-border {
  border-radius: 0 0.3em 0 0;
}
.f1-scoreboard > tbody > tr:last-child > td:last-child {
  border-radius: 0 0 0.3em 0;
}
.f1-scoreboard > tbody tr {
  counter-increment: pos;
}
.f1-scoreboard > tbody tr > th:nth-child(1) {
  padding: 1px 2px 2px 3px;
}
.f1-scoreboard > tbody tr > th:nth-child(1)::before {
  content: counter(pos);
  text-align: center;
  color: #000;
  background: white;
  display: flex;
  --size: 1.8em;
  height: var(--size);
  width: var(--size);
  align-items: center;
  justify-content: center;
  border-radius: 0 0 0.3em 0;
}
.f1-scoreboard .num-col {
  width: 23%;
}
.f1-scoreboard .slower {
  background: #ffc800;
  color: #000;
}
.f1-scoreboard .faster {
  background: #45b720;
}
.f1-scoreboard .no-padding {
  padding: 0;
}
.f1-scoreboard .team {
  display: grid;
  grid-template-columns: 1fr max-content;
  height: 100%;
  align-items: center;
  white-space: nowrap;
}
.f1-scoreboard .team .name {
  padding: var(--cell-padding);
}
.f1-scoreboard .team .logo {
  width: 32px;
  height: 32px;
}
`;

interface Props {
  results: number;
  separate2019?: boolean;
}

const Scores: FunctionalComponent<Props> = ({
  results,
  separate2019 = false,
}) => {
  const boardResults: ScoreWith2019[] | Score[] = scores
    .slice(0, results)
    .flatMap((result) =>
      !separate2019 || !result.score2019
        ? (result as ScoreWith2019)
        : [
            {
              team: result.team,
              img: result.img,
              score: result.score,
            },
            {
              team: result.team + ' 2019',
              img: result.img,
              score: result.score2019,
            },
          ],
    );
  boardResults.sort((a, b) => a.score - b.score);

  return (
    <Fragment>
      <figure class="full-figure max-figure f1-figure">
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div class="f1-scoreboard-container">
          <picture class="f1-scoreboard-bg">
            <source srcset={bgImgAvif} type="image/avif"></source>
            <img alt="" src={bgImgJpeg} />
          </picture>
          <table class="f1-scoreboard">
            <thead>
              <tr>
                <th class="pos-col"></th>
                <th class="team-col"></th>
                <th class={separate2019 ? 'corner-border num-col' : 'num-col'}>
                  Score
                </th>
                {!separate2019 && (
                  <th class="corner-border num-col">vs 2019</th>
                )}
                <th style="visibility: hidden" class="num-col"></th>
              </tr>
            </thead>
            {boardResults.map((result: Score | ScoreWith2019, i) => (
              <tr>
                <th></th>
                <th class="no-padding">
                  <div class="team">
                    <div class="name">{result.team}</div>
                    <img
                      width="1"
                      height="1"
                      class="logo"
                      src={result.img}
                      alt=""
                    />
                  </div>
                </th>
                <td>{result.score.toFixed(1)}</td>
                {'score2019' in result && (
                  <td
                    class={
                      !result.score2019
                        ? ''
                        : result.score > result.score2019
                        ? 'slower'
                        : 'faster'
                    }
                  >
                    {result.score2019 ? (
                      <Fragment>
                        {result.score > result.score2019 && '+'}
                        {(result.score - result.score2019).toFixed(1)}
                      </Fragment>
                    ) : (
                      'n/a'
                    )}
                  </td>
                )}

                {i === 0 ? (
                  <td class="corner-border">Leader</td>
                ) : (
                  <td>+{(result.score - boardResults[0].score).toFixed(1)}</td>
                )}
              </tr>
            ))}
          </table>
        </div>
      </figure>
    </Fragment>
  );
};

export default Scores;
