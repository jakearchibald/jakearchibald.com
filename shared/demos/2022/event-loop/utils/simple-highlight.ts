import Prism from 'prismjs';
import dedent from 'dedent';

export default function simpleHighlight(language: string, code: string) {
  if (!Prism.languages[language]) {
    throw Error(`Language ${language} not supported by Prism`);
  }
  return Prism.highlight(dedent(code), Prism.languages[language], language);
}
