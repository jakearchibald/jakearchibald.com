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
import faviconURL from 'asset-url:static-build/imgs/favicon.png';
import analyticsBundleURL from 'client-bundle:client/analytics/index.js';

interface Props {
  title: string;
}

const GenericHead: FunctionalComponent<Props> = ({ title }: Props) => (
  <Fragment>
    <title>{title} - JakeArchibald.com</title>
    <meta
      name="viewport"
      content="width=device-width, minimum-scale=1.0"
    ></meta>
    <link rel="icon" type="image/png" href={faviconURL} />
    <script type="module" async src={analyticsBundleURL}></script>
    <link
      rel="alternate"
      type="application/rss+xml"
      title="Jake Archibald's Blog"
      href="/posts.rss"
    />
  </Fragment>
);

export default GenericHead;
