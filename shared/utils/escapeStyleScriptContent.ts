/**
 * Escape a string for insertion in a style or script tag
 */
export default function escapeStyleScriptContent(str: string): string {
  return str
    .replace(/<!--/g, '<\\!--')
    .replace(/<script/g, '<\\script')
    .replace(/<\/script/g, '<\\/script')
    .replace(/<style/g, '<\\style')
    .replace(/<\/style/g, '<\\/style');
}
