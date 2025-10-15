import { Component, FunctionalComponent, h } from 'preact';

const styles = `
.tabs-component {
  display: flex;
  flex-flow: row wrap;
}
.tabs-component-tab {
  flex: 1;
  min-width: 70px;
  display: grid;
}
.tabs-component input[type=radio] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.tabs-component-label {
  border-top: 7px solid #ffe454;
  padding: 0.7em 0.7em;
  text-align: center;
  cursor: pointer;
  line-height: 1.3;
  font-size: 0.9rem;
}
input[type=radio]:checked + .tabs-component-label {
  background: #ffe454;
}
input[type=radio]:focus-visible + .tabs-component-label {
  background: #b9b9b9;
}
input[type=radio]:focus-visible:checked + .tabs-component-label {
  background: #ffc254;
}
`;

export const Styles: FunctionalComponent = () => (
  <style dangerouslySetInnerHTML={{ __html: styles }} />
);

interface Props {
  titles: readonly string[];
  selected: number;
  onChange: (index: number) => void;
}

export default class Tabs extends Component<Props> {
  private _onChange = (event: Event) => {
    const num = Number(
      new FormData(event.currentTarget as HTMLFormElement).get('tabs'),
    );
    this.setState({ selected: num });
    this.props.onChange(num);
  };

  render({ titles, selected }: Props) {
    return (
      <form class="tabs-component" onChange={this._onChange}>
        {titles.map((title, i) => (
          <label class="tabs-component-tab">
            <input
              name="tabs"
              type="radio"
              checked={i === selected}
              value={i}
            />
            <span class="tabs-component-label">{title}</span>
          </label>
        ))}
      </form>
    );
  }
}
