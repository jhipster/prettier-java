import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";

const prettier = require("prettier/standalone");
const prettierPluginJava = require("prettier-plugin-java");

const editorsHeight = "calc(100vh - 30px - 2 * 11px)";

class CodeEditor extends React.Component {
  constructor() {
    super();
    this.state = {
      code: "",
      formattedCode: ""
    };
  }

  formatCode(code) {
    let formattedCode = code;
    try {
      formattedCode = prettier.format(this.code, {
        parser: "java",
        plugins: [prettierPluginJava],
        tabWidth: 2
      });
    } catch (e) {
      console.log(e);
    }

    this.setState({
      code,
      formattedCode
    });
  }

  render() {
    return (
      <div class="code-editor-container">
        <AceEditor
          mode="java"
          theme="github"
          name="input"
          width="50%"
          height={editorsHeight}
          value={this.state.code}
          onChange={code => this.formatCode(code)}
        />
        <AceEditor
          mode="java"
          theme="github"
          name="output"
          width="50%"
          height={editorsHeight}
          value={this.state.formattedCode}
          readOnly
        />
      </div>
    );
  }
}

export default CodeEditor;
