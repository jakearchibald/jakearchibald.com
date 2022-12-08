import { Component, Fragment, FunctionalComponent, h } from 'preact';
import { escapeStyleScriptContent } from 'shared/utils';
import { inline as styles } from 'css-bundle:./styles.css';

export const Styles: FunctionalComponent = () => (
  <style
    dangerouslySetInnerHTML={{ __html: escapeStyleScriptContent(styles) }}
  />
);

function degsToRads(degs: number) {
  return (degs * Math.PI) / 180;
}

interface GenerateCircularArcOpts {
  midX?: number;
  midY?: number;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  arc?: 0 | 1;
  sweep?: 0 | 1;
}

function generateCircularArc({
  midX = 0,
  midY = 0,
  radius = 0,
  startAngle = 0,
  endAngle = 0,
  arc = 0,
  sweep = 1,
}: GenerateCircularArcOpts): string {
  const startAngleRad = degsToRads(startAngle);
  const endAngleRad = degsToRads(endAngle);

  return (
    `M ${Math.sin(startAngleRad) * radius + midX}` +
    ` ${Math.cos(startAngleRad) * (radius * -1) + midY}` +
    ` A ${radius} ${radius} 0 ${arc} ${sweep}` +
    ` ${Math.sin(endAngleRad) * radius + midX}` +
    ` ${Math.cos(endAngleRad) * (radius * -1) + midY}`
  );
}

const arcRadius = 100;
const detourOffset = 100;
const taskSize = 23;

interface Props {
  initialState: State;
  width: number;
  height: number;
}

interface State {}

export default class EventLoop extends Component<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = props.initialState;
  }

  render({ width, height }: Props, {}: State) {
    const size = Math.max(width, height);

    return (
      <div class="event-loop-container">
        <div
          class="event-loop-cropper"
          style={{ '--width': width, '--height': height }}
        >
          <svg
            class="event-loop-svg"
            viewBox={`${size / -2} ${size / -2} ${size} ${size}`}
          >
            <g class="event-loop-canvas">
              <g class="path-tracks">
                <path
                  d={generateCircularArc({
                    radius: arcRadius,
                    startAngle: 0,
                    endAngle: 180,
                  })}
                />
                <path
                  d={generateCircularArc({
                    radius: arcRadius,
                    startAngle: 180,
                    endAngle: 0,
                  })}
                />
                <path
                  d={`M 0 ${-arcRadius} l ${detourOffset} 0 ${generateCircularArc(
                    {
                      midX: detourOffset,
                      radius: arcRadius,
                      startAngle: 0,
                      endAngle: 180,
                    },
                  )} M ${detourOffset} ${arcRadius} l ${-detourOffset} 0`}
                />
                <path
                  d={`M 0 ${arcRadius} l ${-detourOffset} 0 ${generateCircularArc(
                    {
                      midX: -detourOffset,
                      radius: arcRadius,
                      startAngle: 180,
                      endAngle: 270 - taskSize / 2,
                    },
                  )} ${generateCircularArc({
                    midX: -detourOffset,
                    radius: arcRadius,
                    startAngle: 270 + taskSize / 2,
                    endAngle: 0,
                  })} M ${-detourOffset} ${-arcRadius} l ${detourOffset} 0`}
                />
              </g>
            </g>
          </svg>
        </div>
      </div>
    );
  }
}
