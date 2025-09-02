import('./html.js').then(({ html }) => {
  const data = document.documentElement;
  const htmlEl = document.createElementNS(
    'http://www.w3.org/1999/xhtml',
    'html',
  );
  data.replaceWith(htmlEl);

  const bookHTML = (bookEl) => html`
    <div class="book">
      <img class="cover" src="${bookEl.querySelector('cover').textContent}" />
      <div class="book-info">
        <div>
          <span class="title">
            ${bookEl.querySelector(':scope > title').textContent}
          </span>
          -
          <span class="author">
            ${bookEl.parentNode.querySelector(':scope > name').textContent}
          </span>
        </div>
        <div>
          <span class="genre">
            ${bookEl.querySelector(':scope > genre').textContent}
          </span>
        </div>
      </div>
    </div>
  `;

  htmlEl.setHTMLUnsafe(html`
    <head>
      <title>Some books</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body>
      <h1>Some books</h1>
      <ul class="book-list">
        ${[...data.querySelectorAll('book')].map(
          (book) => html`<li>${bookHTML(book)}</li>`,
        )}
      </ul>
    </body>
  `);
});
