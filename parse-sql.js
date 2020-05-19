const fs = require('fs').promises;
const mkdirp = require('mkdirp');
const yaml = require('yaml');

function takeBracketOpen(str) {
  const re = /^\s*\(/.exec(str);

  if (re) {
    return [str.slice(re[0].length)];
  }
}

function takeBracketClose(str) {
  const re = /^\s*\)/.exec(str);

  if (re) {
    return [str.slice(re[0].length)];
  }
}

function takeNull(str) {
  const re = /^\s*NULL/.exec(str);

  if (re) {
    return [str.slice(re[0].length), null];
  }
}

function takeNumber(str) {
  const re = /^\s*[-\d.]+/.exec(str);
  if (re) {
    return [str.slice(re[0].length), Number(re[0])];
  }
}

function takeComma(str) {
  const re = /^\s*,/.exec(str);
  if (re) {
    return [str.slice(re[0].length), re[0]];
  }
}

function takeString(str) {
  const re = /^\s*'(.*?)(?<!\\)'/.exec(str);
  if (re) {
    return [
      str.slice(re[0].length),
      JSON.parse(`"${re[1].replace(/\\'/g, "'")}"`),
    ];
  }
}

async function parsePosts() {
  let text = await fs.readFile('./tmp.txt', { encoding: 'utf8' });
  const posts = [];
  let post;

  let result;

  while (true) {
    [text] = takeBracketOpen(text);
    post = {};
    posts.push(post);

    // ID
    [text] = takeNumber(text);

    // Title
    [text] = takeComma(text);
    [text, result] = takeString(text);
    post.title = result;

    // Slug
    [text] = takeComma(text);
    [text, result] = takeString(text);
    post.slug = result;

    // Date
    [text] = takeComma(text);
    [text, result] = takeString(text);
    post.date = result;

    // HTML
    [text] = takeComma(text);
    [text, result] = takeString(text);

    // Content
    [text] = takeComma(text);
    [text, result] = takeString(text);
    post.content = result;

    // Summary
    [text] = takeComma(text);
    [text, result] = takeString(text);
    post.summary = result;

    // Summary HTML
    [text] = takeComma(text);
    [text, result] = takeString(text);

    // Mindframe
    [text] = takeComma(text);
    [text, result] = takeNull(text) || takeString(text);
    post.mindframe = result;

    // Extra Head
    [text] = takeComma(text);
    [text, result] = takeNull(text) || takeString(text);
    if (result) post.content = result + '\n\n' + post.content;

    // Extra Body
    [text] = takeComma(text);
    [text, result] = takeNull(text) || takeString(text);
    if (result) post.content += '\n\n' + result;

    // Image
    [text] = takeComma(text);
    [text, result] = takeNull(text) || takeString(text);
    post.image = result;

    // Meta
    [text] = takeComma(text);
    [text, result] = takeString(text);
    post.meta = result;

    // Image ratio
    [text] = takeComma(text);
    [text, result] = takeNull(text) || takeNumber(text);

    [text] = takeBracketClose(text);
    result = takeComma(text);
    if (!result) break;
    [text] = result;
  }

  return posts;
}

async function main() {
  const posts = await parsePosts();

  await Promise.all(
    posts.map(async (post) => {
      const date = new Date(post.date);
      const dir = `posts/${date.getUTCFullYear()}/${(date.getUTCMonth() + 1)
        .toString()
        .padStart(2, '0')}/${post.slug}/`;

      await mkdirp(dir);

      const fileContent = [
        '---',
        yaml.stringify({
          title: post.title,
          date: post.date,
          mindframe: post.mindframe,
          summary: post.summary,
          meta: post.meta,
        }),
        '---',
        '',
        post.content,
      ].join('\n');

      await fs.writeFile(dir + 'index.md', fileContent);
    }),
  );
}

main();
