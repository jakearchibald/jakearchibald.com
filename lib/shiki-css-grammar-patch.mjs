import { bundledLanguages } from 'shiki';

// Shiki's bundled CSS TextMate grammar hardcodes the set of known property
// names, value keywords, and functions, and lags behind newer CSS features.
// Anything not in those lists renders as plain, uncoloured text. Rather than
// fork the whole grammar, we inject the missing tokens into the existing
// alternation patterns at load time.
//
// Add new tokens here as posts start using them.

const PROPERTY_NAMES = [
  'position-area',
  'position-try',
  'position-try-fallbacks',
  'position-try-order',
  'position-anchor',
  'position-visibility',
  'anchor-name',
  'anchor-scope',
  'field-sizing',
  'content-visibility',
  'interpolate-size',
];

const PROPERTY_VALUES = [
  // anchor-positioning area / try keywords
  'self-block-start',
  'self-block-end',
  'self-inline-start',
  'self-inline-end',
  'span-self-block-start',
  'span-self-block-end',
  'span-self-inline-start',
  'span-self-inline-end',
  'span-all',
  'most-block-size',
  'most-inline-size',
  'most-width',
  'most-height',
  // container-type
  'anchored',
  // interpolate-size
  'allow-keywords',
];

const FUNCTIONS = ['anchor', 'anchor-size'];

// `(?i)(?<![-\w])(?:` … `)(?![-\w])` — inject extra alternatives just before
// the closing of the alternation group.
function extendAlternation(match, tokens) {
  const escaped = tokens.map((t) => t.replace(/[-]/g, '\\$&'));
  // The group ends right before the trailing negative-lookahead boundary.
  const boundary = '(?![-\\w])';
  const idx = match.lastIndexOf(boundary);
  if (idx === -1) {
    throw Error(`Unexpected CSS grammar pattern: ${match.slice(0, 60)}…`);
  }
  return (
    match.slice(0, idx).replace(/\)$/, `|${escaped.join('|')})`) +
    match.slice(idx)
  );
}

function patchAlternationRule(rule, tokens) {
  const pattern = rule.patterns[0];
  pattern.match = extendAlternation(pattern.match, tokens);
}

export async function loadPatchedCSS() {
  const grammar = (await bundledLanguages.css()).default[0];

  patchAlternationRule(grammar.repository['property-names'], PROPERTY_NAMES);
  patchAlternationRule(
    grammar.repository['property-keywords'],
    PROPERTY_VALUES,
  );

  // Functions are matched by a `begin` rule per function group. Add a fresh one
  // scoped like the built-in misc functions (e.g. calc).
  grammar.repository['functions'].patterns.unshift({
    begin: `(?i)(?<![-\\w])(${FUNCTIONS.map((f) => f.replace(/[-]/g, '\\$&')).join('|')})(\\()`,
    beginCaptures: {
      1: { name: 'support.function.misc.css' },
      2: { name: 'punctuation.section.function.begin.bracket.round.css' },
    },
    end: '\\)',
    endCaptures: {
      0: { name: 'punctuation.section.function.end.bracket.round.css' },
    },
    name: 'meta.function.misc.css',
    patterns: [{ include: '#property-values' }],
  });

  return grammar;
}
