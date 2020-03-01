import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-tomorrow";

import { formatCode } from "../utils/prettierFormat.jsx";
import { codeSample } from "../utils/codeSample.jsx";

const editorsHeight = "calc(100vh - 30px - 2 * 11px)";

class CodeEditor extends React.Component {
  constructor(props) {
    super();
    const formattedCode = formatCode(codeSample, props.options);

    this.state = {
      code: codeSample,
      formattedCode
    };
  }

  static getDerivedStateFromProps(props, state) {
    state.formattedCode = formatCode(state.code, props.options);
  }

  handleCodeChange(code) {
    this.setState({
      code,
      formattedCode: formatCode(code, this.props.options)
    });
  }

  render() {
    const { options } = this.props;

    const editorOptions = {
      printMargin: options.printWidth
    };

    return (
      <div class="code-editor-container">
        <AceEditor
          mode="java"
          theme="tomorrow"
          name="input"
          width="50%"
          height={editorsHeight}
          value={this.state.code}
          onChange={code => this.handleCodeChange(code)}
          setOptions={editorOptions}
          tabSize={options.tabWidth}
        />
        <AceEditor
          mode="java"
          theme="tomorrow"
          name="output"
          width="50%"
          height={editorsHeight}
          value={this.state.formattedCode}
          readOnly
          setOptions={editorOptions}
          tabSize={options.tabWidth}
        />
      </div>
    );
  }
}

export default CodeEditor;
