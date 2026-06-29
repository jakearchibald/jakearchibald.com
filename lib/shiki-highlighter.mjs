import { createHighlighter, bundledLanguages } from 'shiki';
import { loadPatchedCSS } from './shiki-css-grammar-patch.mjs';

export const theme = 'dark-plus';

// Languages whose bundled grammar we patch before loading (keyed by lang id).
const patchedGrammars = {
  css: loadPatchedCSS,
};

let highlighterPromise;

/**
 * Get the shared highlighter. It starts with no languages loaded — call
 * `ensureLanguage` to lazily load each one just before it's highlighted.
 */
export function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({ themes: [theme], langs: [] });
  }
  return highlighterPromise;
}

/**
 * Lazily load a single language into the shared highlighter. Once loaded,
 * `codeToHtml` can highlight it synchronously.
 */
export async function ensureLanguage(lang) {
  const highlighter = await getHighlighter();
  if (highlighter.getLoadedLanguages().includes(lang)) return;
  if (!(lang in bundledLanguages)) {
    throw Error(`Unsupported shiki language "${lang}"`);
  }
  // Some bundled grammars are out of date; load a patched copy where we have
  // one, otherwise the bundled grammar by name.
  await highlighter.loadLanguage(
    patchedGrammars[lang] ? await patchedGrammars[lang]() : lang,
  );
}
