const React = require("react");
import ReactDOM from "react-dom";

import CodeEditor from "./CodeEditor.jsx";

class PlaygroundContainer extends React.Component {
  render() {
    return <CodeEditor />;
  }
}

ReactDOM.render(<PlaygroundContainer />, document.getElementById("root"));
