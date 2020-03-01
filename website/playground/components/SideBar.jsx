import { getCliName } from "../utils/optionsUtils.jsx";

class SideBar extends React.Component {
  constructor(props) {
    super();
  }

  render() {
    const { options, onValueChange } = this.props;

    return (
      <div class="sidebar">
        <h2 class="sidebar-title">Options:</h2>
        {Object.keys(options).map(option => {
          return (
            <div class="option">
              <label>{getCliName(option)}</label>
              <input
                type="number"
                onChange={evt => onValueChange(evt, option)}
                value={options[option]}
              ></input>
            </div>
          );
        })}
      </div>
    );
  }
}

export default SideBar;
