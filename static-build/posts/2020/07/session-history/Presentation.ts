import Slide from './Slide';

type SlideGenerator = AsyncGenerator<void, void, void>;
type SlideFunc = (slide: Slide) => SlideGenerator;

interface AdvanceOptions {
  /** Just switch to the next state rather than transitioning */
  avoidTransition?: boolean;
}

export default class Presentation extends HTMLElement {
  private _slideFuncs: SlideFunc[] = [];
  private _slideQueue = Promise.resolve();
  private _slideComplete = false;
  private _currentSlide?: Slide;
  private _currentSlideIndex: number = -1;
  private _currentStepIndex: number = -1;
  private _currentSlideGenerator?: SlideGenerator;

  /** Should the presentation perform transitions between states? */
  transition = true;

  /**
   * Remove the current slide element, and replace it with a new slide
   *
   * @param index Index of slide function to initialise.
   */
  private _changeSlide(index: number) {
    if (!this._slideFuncs[index]) throw Error(`Cannot find slide`);
    // TODO: transitions would happen here
    if (this._currentSlide) this._currentSlide.remove();
    if (this._currentSlideGenerator) this._currentSlideGenerator.return();

    this._currentSlideIndex = index;
    this._currentStepIndex = -1;
    this._slideComplete = false;
    this._currentSlide = new Slide();
    this.append(this._currentSlide);
    this._currentSlideGenerator = this._slideFuncs[index](this._currentSlide);
  }

  /** Advance slide to the next state */
  private async _advanceSlide() {
    if (!this._currentSlideGenerator) throw Error(`No current slide`);
    this._currentStepIndex++;
    const { done } = await this._currentSlideGenerator.next();
    this._slideComplete = !!done;
  }

  /** Queue slide actions to avoid race conditions */
  private _queueSlideAction(func: () => Promise<void>) {
    return (this._slideQueue = this._slideQueue
      .then(() => func())
      .catch((error) => {
        console.error(error);
      }));
  }

  /**
   * Go to a particular slide
   *
   * @param index Slide index
   * @param options
   */
  goTo(
    index: number,
    { avoidTransition = false }: AdvanceOptions = {},
  ): Promise<void> {
    return this._queueSlideAction(async () => {
      this.transition = !avoidTransition;
      this._changeSlide(index);
      await this._advanceSlide();
    });
  }

  /**
   * Move the presentation forwards.
   *
   * @param options
   */
  next({ avoidTransition = false }: AdvanceOptions = {}): Promise<void> {
    return this._queueSlideAction(async () => {
      this.transition = !avoidTransition;

      if (this._slideComplete) {
        this._changeSlide(this._currentSlideIndex + 1);
      }

      await this._advanceSlide();
    });
  }

  /**
   * Step the presentation backwards, without transition
   */
  previous(): Promise<void> {
    return this._queueSlideAction(async () => {
      this.transition = false;

      let advanceBy: number;

      if (this._currentStepIndex === 0) {
        this._changeSlide(this._currentSlideIndex - 1);
        // This means it'll advance until complete
        advanceBy = -1;
      } else {
        advanceBy = this._currentStepIndex - 1;
        this._changeSlide(this._currentSlideIndex);
      }

      do {
        await this._advanceSlide();
      } while (advanceBy-- && !this._slideComplete);
    });
  }

  /**
   * Add a new slide to the presentation
   *
   * @param func New slide callback
   */
  slide(func: SlideFunc): void {
    this._slideFuncs.push(func);

    if (this._slideFuncs.length === 1) {
      // TODO: debounce this by raf or microtask to handle `startHere`
      this.goTo(0);
    }
  }
}

customElements.define('ja-preso', Presentation);
