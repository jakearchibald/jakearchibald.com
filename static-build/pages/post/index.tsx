/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { h, FunctionalComponent, Fragment } from 'preact';
import BasePage from 'static-build/components/base';
import { getPostUrl } from 'static-build/utils';
import date from 'date-and-time';
import Who from 'static-build/components/who';
import PostMeta from 'static-build/components/post-meta';

interface Props {
  post: Post;
}

const PostPage: FunctionalComponent<Props> = ({ post }: Props) => (
  <BasePage
    title={post.title}
    authorAction=" wrote…"
    extraHead={<PostMeta post={post} />}
  >
    <div class="content-n-side">
      <div class="content">
        <div class="article-content">
          <h1>{post.title}</h1>
          <time
            class="article-date"
            dateTime={date.format(new Date(post.date), 'YYYY-MM-DD')}
          >
            Posted {date.format(new Date(post.date), 'DD MMMM YYYY')}{' '}
            {post.mindframe}
          </time>
          <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
          <p>
            <small>
              <a
                href={`https://github.com/jakearchibald/jakearchibald.com/blob/main/static-build/posts/${date.format(
                  new Date(post.date),
                  'YYYY/MM',
                )}/${post.slug}/index.md`}
              >
                View this page on GitHub
              </a>
            </small>
          </p>
        </div>
        <div class="comments" id="comments">
          <div id="disqus_thread"></div>
          <script
            // prettier-ignore
            dangerouslySetInnerHTML={{
                __html:
                  `var disqus_shortname = 'jakearchibald';` +
                  `var disqus_identifier = ${JSON.stringify(
                    getPostUrl(post).slice(1, -1),
                  )};` +
                  `var disqus_title = ${JSON.stringify(post.title)};` +
                  `var disqus_url = ${JSON.stringify(
                    `http://jakearchibald.com${getPostUrl(post).slice(0, -1)}`,
                  )};` +
                  `const observer = new IntersectionObserver(([result]) => {` +
                    `if (!result.isIntersecting) return;` +
                    `observer.disconnect();` +
                    `const script = document.createElement('script');` +
                    `script.src = 'https://jakearchibald.disqus.com/embed.js';` +
                    `document.head.append(script);` +
                  `}, { rootMargin: '500px' });` +
                  `observer.observe(document.querySelector('#comments'));`
              }}
          ></script>
          <noscript>
            I hate that Disqus doesn't work without JavaScript. It should.
          </noscript>
          <a href="http://disqus.com" class="dsq-brlink">
            Comments powered by <span class="logo-disqus">Disqus</span>
          </a>
        </div>
      </div>
      <div class="side">
        <Who />
      </div>
    </div>
  </BasePage>
);

export default PostPage;
