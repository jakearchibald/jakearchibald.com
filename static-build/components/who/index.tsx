import { h, FunctionalComponent } from 'preact';

import meUrl from 'asset-url:./me.jpg';

const Who: FunctionalComponent<{}> = () => (
  <section>
    <figure class="my-big-face">
      <h1>
        <img src={meUrl} alt="Jake Archibald" />
      </h1>
    </figure>

    <p>
      Hello, I’m Jake and that is my face. I’m a developer advocate for Google
      Chrome.
    </p>

    <h1>Elsewhere</h1>
    <ul class="icon-list link-list">
      <li>
        <a href="https://twitter.com/jaffathecake">
          <span class="i i-social twitter"></span>
          Twitter
        </a>
      </li>
      <li>
        <a href="https://github.com/jakearchibald/">
          <span class="i i-social github"></span>
          Github
        </a>
      </li>
    </ul>
    <h1>Contact</h1>
    <p>
      Feel free to <a href="mailto:jaffathecake@gmail.com">throw me an email</a>
      , unless you're a recruiter, in which case destroy every email-capable
      device you own to prevent this possibility.
    </p>
  </section>
);
export default Who;
