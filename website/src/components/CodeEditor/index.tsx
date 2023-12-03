import { useColorMode } from "@docusaurus/theme-common";
import Editor from "@monaco-editor/react";
import styles from "./index.module.css";

export default function CodeEditor(
  props: Readonly<{
    readOnly?: boolean;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string | undefined) => void;
  }>
) {
  const { colorMode } = useColorMode();

  return (
    <div className={styles.editor}>
      <Editor
        defaultValue={props.defaultValue}
        language="java"
        options={{ readOnly: props.readOnly }}
        theme={colorMode === "dark" ? "vs-dark" : "light"}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
}
