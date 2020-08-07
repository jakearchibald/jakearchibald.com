export default class Slide extends HTMLElement {
  private _waitUntilPromise: Promise<unknown> = Promise.resolve();

  /** Should the slide perform transitions between states? */
  get transition(): boolean {
    const el = this.closest('js-preso') as
      | import('./Presentation').default
      | undefined;
    if (!el) return false;
    return el.transition;
  }

  /**
   * Declare an async dependency
   *
   * @param promise
   */
  waitUntil(promise: Promise<unknown>) {
    this._waitUntilPromise = this._waitUntilPromise.then(() =>
      promise.catch((error) => {
        console.error(error);
      }),
    );
  }

  /**
   * Get a promise that resolves once all async dependencies are resolved, including additional dependencies added while waiting.
   */
  async ready() {
    let waitUntilPromise;

    while (this._waitUntilPromise !== waitUntilPromise) {
      waitUntilPromise = this._waitUntilPromise;
      await waitUntilPromise;
    }
  }

  /**
   * A promise that resolves once all _current_ async dependencies are resolved
   *
   * Only use this if you're going to add additional `waitUntil` dependencies that you don't want to wait on yourself. Otherwise, use `ready()`.
   */
  get currentWaits() {
    return this._waitUntilPromise;
  }
}

customElements.define('ja-steps', Slide);
