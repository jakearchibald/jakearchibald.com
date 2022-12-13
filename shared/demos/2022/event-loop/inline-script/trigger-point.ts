class TriggerPoint extends HTMLElement {
  static #intersecting: Set<TriggerPoint> = new Set();

  static #activate(triggerPoint: TriggerPoint) {
    for (const triggerPoint of TriggerPoint.#intersecting) {
      triggerPoint.classList.remove('active');
    }
    triggerPoint.classList.add('active');
    let triggerScript = triggerPoint.getAttribute('ontrigger');
    if (triggerScript) eval(triggerScript);
  }

  static #observer: IntersectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const target = entry.target as TriggerPoint;

        if (entry.isIntersecting) {
          TriggerPoint.#intersecting.add(target);
          TriggerPoint.#activate(target);
        } else {
          target.classList.remove('active');
          TriggerPoint.#intersecting.delete(target);
        }
      }

      // Cater for the case where a trigger point deactivates, but it should hand back to the last active trigger point.
      const last = [...TriggerPoint.#intersecting].pop();
      if (last && !last.classList.contains('active')) {
        TriggerPoint.#activate(last);
      }
    },
    { rootMargin: '-45% 0%' },
  );

  constructor() {
    super();
    TriggerPoint.#observer.observe(this);
  }
}

customElements.define('trigger-point', TriggerPoint);
