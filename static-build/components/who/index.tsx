import { h, FunctionalComponent } from 'preact';

import meJpeg from 'asset-url:./me-cat.jpg';
import meWebp from 'asset-url:./me-cat.webp';
import meAvif from 'asset-url:./me-cat.avif';
import twitterUrl from 'asset-url:./twitter.svg';
import githubUrl from 'asset-url:./github.svg';
import podcastUrl from 'asset-url:./podcast.svg';
import mastodonUrl from 'asset-url:./mastodon.svg';
import blueskyUrl from 'asset-url:./bluesky.svg';
import threadsUrl from 'asset-url:./threads.svg';
import rssUrl from 'asset-url:./rss.svg';

const Who: FunctionalComponent<{}> = () => (
  <section>
    <figure class="my-big-face">
      <h1>
        <picture>
          <source srcset={meAvif} type="image/avif" />
          <source srcset={meWebp} type="image/webp" />
          <img
            width="800"
            height="844"
            src={meJpeg}
            alt="Jake Archibald in a garden with a black cat"
          />
        </picture>
      </h1>
    </figure>

    <p>
      Hello, I'm Jake and that's me there. The one that isn't a cat. I'm a
      developer of sorts.
    </p>
    <h1>Links</h1>
    <ul class="icon-list">
      {[
        {
          url: 'https://offthemainthread.tech/',
          img: podcastUrl,
          content: 'Podcast',
        },
        {
          url: 'https://mastodon.social/@jaffathecake',
          img: mastodonUrl,
          content: 'Mastodon',
        },
        {
          url: 'https://bsky.app/profile/jakearchibald.com',
          img: blueskyUrl,
          content: 'Bluesky',
        },
        {
          url: 'https://www.threads.net/@jaffathecake',
          img: threadsUrl,
          content: 'Threads',
        },
        {
          url: 'https://twitter.com/jaffathecake',
          img: twitterUrl,
          content: 'Muskhole',
        },
        {
          url: 'https://github.com/jakearchibald/',
          img: githubUrl,
          content: 'Github',
        },
        {
          url: '/posts.rss',
          img: rssUrl,
          content: 'RSS',
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
