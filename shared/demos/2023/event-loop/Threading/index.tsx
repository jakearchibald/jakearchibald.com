import { FunctionalComponent, h } from 'preact';
import { useEffect } from 'preact/hooks';

interface Props {}

const Threading: FunctionalComponent<Props> = () => {
  //const animQueue = useRef(Promise.resolve());

  useEffect(() => {
    setAPI('threading', {});
  }, []);

  return (
    <div class="threading-diagram">
      <div class="rows">
        <div class="main-thread">
          <div class="main-thread-content">
            <div class="main-thread-top">
              <span class="main-thread-title">Main thread</span>
            </div>
            <div class="row">
              <div class="timeline-item" style={{ width: '27.1cqw' }}>
                Operation A
              </div>
              <div class="timeline-item" style={{ width: '21.7cqw' }}>
                Operation B
              </div>
              <div class="timeline-item" style={{ width: '18cqw' }}>
                Join A+B
              </div>
              <div
                class="timeline-item render-item"
                style={{ width: '23.4cqw' }}
              >
                Render result
              </div>
            </div>
          </div>
        </div>
        <div class="other-thread">
          <div class="row">
            <div class="timeline-item" style={{ width: '27.1cqw' }}>
              Operation A
            </div>
          </div>
        </div>
        <div class="other-thread">
          <div class="row">
            <div class="timeline-item" style={{ width: '21.7cqw' }}>
              Operation B
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Threading;
