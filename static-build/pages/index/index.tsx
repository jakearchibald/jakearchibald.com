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
import { h, FunctionalComponent } from 'preact';
import BasePage from 'static-build/components/base';
import { getPostUrl } from 'static-build/utils';
import date from 'date-and-time';
import Who from 'static-build/components/who';

interface PaginationProps {
  pageNum: number;
  totalPages: number;
}

const Pagination: FunctionalComponent<PaginationProps> = ({
  pageNum,
  totalPages,
}: PaginationProps) => (
  <ol class="pagination">
    {pageNum === 1 ? (
      <li>
        <span class="disabled prev">Previous</span>
      </li>
    ) : (
      <li>
        <a href={pageNum === 2 ? './' : (pageNum - 1).toString()} class="prev">
          Previous<span class="arrow"></span>
        </a>
      </li>
    )}
    {Array.from({ length: totalPages }, (_, i) =>
      i + 1 === pageNum ? (
        <li>
          <span class="current page">{i + 1}</span>
        </li>
      ) : (
        <li>
          <a href={i === 0 ? './' : (i + 1).toString()} class="page">
            {i + 1}
          </a>
        </li>
      ),
    )}
    {pageNum === totalPages ? (
      <li>
        <span class="disabled next">Next</span>
      </li>
    ) : (
      <li>
        <a href={(pageNum + 1).toString()} class="next">
          Next<span class="arrow"></span>
        </a>
      </li>
    )}
  </ol>
);

interface Props {
  posts: Post[];
  pageNum: number;
  totalPages: number;
}

const IndexPage: FunctionalComponent<Props> = ({
  posts,
  pageNum,
  totalPages,
}: Props) => (
  <BasePage title="Blog" pageClass="blog-index" authorAction=" wrote…">
    <div class="content-n-side">
      <div class="content">
        {posts.map((post, i) => (
          <article class={`post-preview ${i === 0 ? 'first' : ''}`}>
            <header class="preview-header width-padding">
              <h1 class="h-2">
                <a href={getPostUrl(post)}>{post.title}</a>
              </h1>
              <time
                class="article-date"
                dateTime={date.format(new Date(post.date), 'YYYY-MM-DD')}
              >
                Posted {date.format(new Date(post.date), 'DD MMMM YYYY')}{' '}
                {post.mindframe}
              </time>
            </header>
            <div class="article-content">
              {post.image && (
                <div class="preview-image">
                  <a href={getPostUrl(post)}>
                    <img src={post.image} alt="" />
                  </a>
                </div>
              )}
              <div dangerouslySetInnerHTML={{ __html: post.summary }}></div>
              <p>
                <a href={getPostUrl(post)}>Read on…</a>
              </p>
            </div>
          </article>
        ))}
        <Pagination pageNum={pageNum} totalPages={totalPages} />
      </div>
      <div class="side">
        <Who />
      </div>
    </div>
  </BasePage>
);
export default IndexPage;
