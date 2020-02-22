const React = require("react");
import ReactDOM from "react-dom";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";

class Playground extends React.Component {
  render() {
    return <AceEditor mode="java" theme="github" name="UNIQUE_ID_OF_DIV" />;
  }
}

ReactDOM.render(<Playground />, document.getElementById("root"));
