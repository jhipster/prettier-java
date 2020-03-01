const React = require("react");
import ReactDOM from "react-dom";

import CodeEditor from "./components/CodeEditor.jsx";
import SideBar from "./components/SideBar.jsx";

class PlaygroundContainer extends React.Component {
  constructor() {
    super();
    this.state = {
      options: {
        printWidth: 80,
        tabWidth: 4
      }
    };
  }

  handleOptionsValueChange(value, option) {
    const options = this.state.options;
    options[option] = parseInt(value);

    this.setState({
      options
    });
  }

  render() {
    const { options } = this.state;

    return (
      <div class="playground-container">
        <SideBar
          options={options}
          onValueChange={(evt, option) =>
            this.handleOptionsValueChange(evt.target.value, option)
          }
        ></SideBar>
        <CodeEditor options={options} />
      </div>
    );
  }
}

ReactDOM.render(<PlaygroundContainer />, document.getElementById("root"));
