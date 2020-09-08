import { inline as shadowStyles } from 'css-bundle:./styles.css';

// So it doesn't cause an error when running in node
const HTMLEl = ((__PRERENDER__
  ? Object
  : HTMLElement) as unknown) as typeof HTMLElement;

/**
 * A simple spinner. This custom element has no JS API. Just put it in the document, and it'll
 * spin. You can configure the following using CSS custom properties:
 *
 * --size: Size of the spinner element (it's always square). Default: 28px.
 * --color: Color of the spinner. Default: #4285f4.
 * --stroke-width: Width of the stroke of the spinner. Default: 3px.
 */
export default class LoadingSpinner extends HTMLEl {
  constructor() {
    super();
    if (__PRERENDER__) return;

    const shadow = this.attachShadow({ mode: 'closed' });
    // prettier-ignore
    shadow.innerHTML = '' +
      `<style>${ shadowStyles }</style>` +
      `<div class="spinner-container">` +
        `<div class="spinner-layer">` +
          `<div class="spinner-circle-clipper spinner-left">` +
            `<div class="spinner-circle"></div>` +
          '</div>' +
          `<div class="spinner-gap-patch">` +
            `<div class="spinner-circle"></div>` +
          '</div>' +
          `<div class="spinner-circle-clipper spinner-right">` +
            `<div class="spinner-circle"></div>` +
          '</div>' +
        '</div>' +
      '</div>';
  }
}

if (!__PRERENDER__) customElements.define('loading-spinner', LoadingSpinner);
