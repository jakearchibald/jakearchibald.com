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
import { getPostUrl, siteOrigin } from 'static-build/utils';

import iconUrl from 'asset-url:./icon.png';

interface Props {
  post: Post;
}

const PostMeta: FunctionalComponent<Props> = ({ post }: Props) => {
  const scriptPreloads = [
    ...new Set<string>([
      ...post.scripts.map((s) => s.imports).flat(),
      ...post.scripts.filter((s) => s.preloadOnly).map((s) => s.src),
    ]),
  ];

  return (
    <Fragment>
      {post.image ? (
        <Fragment>
          <meta name="twitter:card" content="summary_large_image" />
          <meta property="og:image" content={`${siteOrigin}${post.image}`} />
          <meta name="twitter:image" content={`${siteOrigin}${post.image}`} />
        </Fragment>
      ) : (
        <Fragment>
          <meta name="twitter:card" content="summary" />
          <meta property="og:image" content={`${siteOrigin}${iconUrl}`} />
          <meta property="twitter:image" content={`${siteOrigin}${iconUrl}`} />
        </Fragment>
      )}
      <meta name="twitter:site" content="@jaffathecake" />
      <meta property="og:url" content={`${siteOrigin}${getPostUrl(post)}`} />
      <meta property="twitter:title" content={post.title} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.meta} />
      {post.scripts.map(
        (script) =>
          !script.preloadOnly && (
            <script src={script.src} async={script.async} type="module" />
          ),
      )}
      {scriptPreloads.map((preload) => (
        <link rel="modulepreload" href={preload} />
      ))}
    </Fragment>
  );
};

export default PostMeta;
