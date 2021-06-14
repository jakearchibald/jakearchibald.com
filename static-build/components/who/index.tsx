import { h, FunctionalComponent } from 'preact';

import meWalkJpeg from 'asset-url:./me-walk.jpg';
import meWalkWebp from 'asset-url:./me-walk.webp';
import meWalkAvif from 'asset-url:./me-walk.avif';
import twitterUrl from 'asset-url:./twitter.svg';
import githubUrl from 'asset-url:./github.svg';
import youtubeUrl from 'asset-url:./youtube.svg';
import podcastUrl from 'asset-url:./podcast.svg';

const Who: FunctionalComponent<{}> = () => (
  <section>
    <figure class="my-big-face">
      <h1>
        <picture>
          <source srcset={meWalkAvif} type="image/avif" />
          <source srcset={meWalkWebp} type="image/webp" />
          <img
            width="800"
            height="858"
            src={meWalkJpeg}
            alt="Jake Archibald next to a 90km sign"
          />
        </picture>
      </h1>
    </figure>

    <p>
      Hello, I’m Jake and that is my tired face. I’m a developer advocate for
      Google Chrome.
    </p>

    <h1>Elsewhere</h1>
    <ul class="icon-list">
      {[
        {
          url: 'https://twitter.com/jaffathecake',
          img: twitterUrl,
          content: 'Twitter',
        },
        {
          url: 'https://github.com/jakearchibald/',
          img: githubUrl,
          content: 'Github',
        },
        {
          url:
            'https://www.youtube.com/playlist?list=PLNYkxOF6rcIAKIQFsNbV0JDws_G_bnNo9',
          img: youtubeUrl,
          content: 'YouTube',
        },
        {
          url: 'https://http203.libsyn.com/',
          img: podcastUrl,
          content: 'Podcast',
        },
      ].map((item) => (
        <li>
          <a href={item.url} class="icon-list-item">
            <img class="icon-list-icon" src={item.img} alt="" />
            {item.content}
          </a>
        </li>
      ))}
    </ul>
    <h1>Contact</h1>
    <p>
      Feel free to <a href="mailto:jaffathecake@gmail.com">throw me an email</a>
      , unless you're a recruiter, or someone trying to offer me 'sponsored
      content' for this site, in which case write your request on a piece of
      paper, and fling it out the window.
    </p>
  </section>
);
export default Who;
