import * as prettier from 'prettier';

/**
 * The print widths, in characters, that each code block is formatted to. The
 * first is the base (used when nothing wider fits); CSS container queries in
 * components.css pick the widest one that fits the block's text area.
 *
 * Derived from the article layout and Inconsolata's 0.5em advance width: the
 * code text area holds ~37 characters on a 320px viewport, ~47 on a 390px
 * phone, and ~73 at full desktop measure. Below ~40ch Prettier's output
 * degrades to about one identifier per line, which reads worse than
 * scrolling, so 40 is the floor and genuinely narrow viewports scroll a
 * little. Keep this list and the `@container` blocks in components.css in
 * step.
 */
export const TIERS = [40, 48, 56, 64, 72];

/**
 * Markdown code-fence languages mapped to the Prettier parser to use. Kept
 * explicit — a language that isn't listed is left exactly as the author wrote
 * it rather than guessed at.
 */
const parsers = {
  js: 'babel',
  jsx: 'babel',
  mjs: 'babel',
  cjs: 'babel',
  javascript: 'babel',
  ts: 'typescript',
  tsx: 'typescript',
  typescript: 'typescript',
  css: 'css',
  scss: 'scss',
  less: 'less',
  html: 'html',
  svg: 'html',
  vue: 'vue',
  json: 'json',
  json5: 'json5',
  jsonc: 'jsonc',
  yaml: 'yaml',
  yml: 'yaml',
  md: 'markdown',
  markdown: 'markdown',
  mdx: 'mdx',
  graphql: 'graphql',
};

// Matched against the repo's own .prettierrc so article code reads the same as
// the source it was copied from. Deliberately not `resolveConfig()`: article
// samples want a stable house style, not whatever config happens to sit next
// to the markdown file.
const baseOptions = {
  singleQuote: true,
  trailingComma: 'all',
};

const RE_NOTATION = /\[!code /;
const RE_PRETTIER_IGNORE = /prettier-ignore/;

const longestLine = (code) =>
  Math.max(...code.split('\n').map((line) => line.length));

/** The trimmed text of every line carrying a shiki `[!code …]` marker. */
const notationLines = (code) =>
  code
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => RE_NOTATION.test(line));

const sameLines = (a, b) =>
  a.length === b.length && a.every((line, i) => line === b[i]);

/**
 * Whether every `[!code …]` marker sits on a line directly preceded by a
 * `prettier-ignore`, which pins that line's layout so reflowing can't move the
 * marker off the code it annotates.
 */
const notationIsPinned = (source) => {
  const lines = source.split('\n');
  return lines.every(
    (line, i) =>
      !RE_NOTATION.test(line) ||
      (i > 0 && RE_PRETTIER_IGNORE.test(lines[i - 1])),
  );
};

/**
 * @typedef {object} Variant
 * @prop {string} code The formatted source.
 * @prop {number[]} tiers The print widths that produce this exact output,
 *   ascending.
 */

/**
 * Format `source` at each width in `tiers`, deduplicating identical results.
 *
 * Returns `null` when the code should be left exactly as authored — an
 * unmapped language, an unpinned `[!code …]` marker, or a fragment Prettier
 * can't parse. Never throws: a malformed snippet must not fail the build.
 *
 * @param {string} source
 * @param {string} lang
 * @param {{ tiers?: number[] }} [opts]
 * @returns {Promise<Variant[] | null>}
 */
export async function formatVariants(source, lang, { tiers = TIERS } = {}) {
  const parser = parsers[lang];
  if (!parser) return null;

  // Shiki's `[!code ++]` / `[!code word:…]` markers annotate one *physical*
  // line, so reflowing can strand them: Prettier keeps a trailing marker
  // attached to its statement, and if that statement gets split over several
  // lines the marker ends up on the last of them, leaving the rest of it
  // unhighlighted. A `prettier-ignore` directly above pins the marker's
  // statement, so those blocks are safe to reformat around; anything else is
  // left laid out as authored.
  const sourceNotation = RE_NOTATION.test(source)
    ? notationLines(source)
    : null;
  if (sourceNotation && !notationIsPinned(source)) return null;

  const format = async (printWidth) => {
    const code = (
      await prettier.format(source, { ...baseOptions, parser, printWidth })
    ).replace(/\n+$/, '');

    // `prettier-ignore` pins the node that *follows* it, so the check above is
    // really an assumption about where each marker sits within that node.
    // Confirm it held rather than trust it: if a marker line came out
    // different, the marker has moved and the highlighting would be wrong.
    if (sourceNotation && !sameLines(notationLines(code), sourceNotation)) {
      throw Error('formatting moved a shiki notation marker');
    }

    return code;
  };

  const ascending = [...tiers].sort((a, b) => a - b);
  const widest = ascending.at(-1);

  try {
    const widestCode = await format(widest);

    // The common case: nothing in the block is longer than the narrowest tier,
    // so every tier would produce this same output. Skip the rest of the work.
    if (longestLine(widestCode) <= ascending[0]) {
      return [{ code: widestCode, tiers: ascending }];
    }

    /** @type {Map<string, Variant>} */
    const byOutput = new Map();

    for (const printWidth of ascending) {
      const code =
        printWidth === widest ? widestCode : await format(printWidth);
      const existing = byOutput.get(code);
      if (existing) {
        existing.tiers.push(printWidth);
      } else {
        byOutput.set(code, { code, tiers: [printWidth] });
      }
    }

    return [...byOutput.values()];
  } catch {
    // Either an illustrative fragment that legitimately doesn't parse
    // (`if (foo) {\n  // …`), or a notation marker that moved. Both mean the
    // author's own layout is the one to ship.
    return null;
  }
}
