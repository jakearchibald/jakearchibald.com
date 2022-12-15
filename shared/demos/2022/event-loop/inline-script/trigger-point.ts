class TriggerPoint extends HTMLElement {
  static #intersecting: Set<TriggerPoint> = new Set();
  static #active: TriggerPoint | null = null;

  static #observer: IntersectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const target = entry.target as TriggerPoint;

        if (entry.isIntersecting) {
          TriggerPoint.#intersecting.add(target);
          target.#activate();
        } else {
          TriggerPoint.#intersecting.delete(target);
          if (TriggerPoint.#active === target) target.#deactivate();
        }
      }

      // Cater for the case where a trigger point deactivates, but it should hand back to the last active trigger point.
      if (TriggerPoint.#active || TriggerPoint.#intersecting.size === 0) return;
      const last = [...TriggerPoint.#intersecting].pop();
      last!.#activate();
    },
    { rootMargin: '-45% 0%' },
  );

  constructor() {
    super();
    TriggerPoint.#observer.observe(this);
    this.addEventListener('click', () => this.#activate());
  }

  #activate() {
    if (TriggerPoint.#active) TriggerPoint.#active.#deactivate();
    this.classList.add('active');
    TriggerPoint.#active = this;
    let triggerScript = this.getAttribute('ontrigger');
    if (triggerScript) eval(triggerScript);
  }

  #deactivate() {
    if (TriggerPoint.#active !== this) return;
    this.classList.remove('active');
    TriggerPoint.#active = null;
  }
}

customElements.define('trigger-point', TriggerPoint);
