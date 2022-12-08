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
import { h, FunctionalComponent, RenderableProps } from 'preact';

import { inline as inlineStyles } from 'css-bundle:./css/all.css';
import GenericHead from 'static-build/components/generic-head';
import { escapeStyleScriptContent } from 'shared/utils';

interface Props {
  post: Post;
}

const EventLoopPage: FunctionalComponent<Props> = ({
  post,
}: RenderableProps<Props>) => {
  return (
    <html lang="en">
      <head>
        <GenericHead title={post.title} />
        <link
          href="https://fonts.googleapis.com/css2?family=Copse&family=Noto+Serif:ital,wght@0,400;0,700;1,400"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: escapeStyleScriptContent(inlineStyles),
          }}
        />
      </head>
      <body>
        <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
      </body>
    </html>
  );
};

export default EventLoopPage;
