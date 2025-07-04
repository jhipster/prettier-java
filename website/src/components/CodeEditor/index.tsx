import { useColorMode } from "@docusaurus/theme-common";
import { Editor, type OnChange } from "@monaco-editor/react";
import styles from "./index.module.css";

export default function CodeEditor(
  props: Readonly<{
    readOnly?: boolean;
    rulers?: number[];
    value?: string;
    onChange?: OnChange;
  }>
) {
  const { colorMode } = useColorMode();

  return (
    <div className={styles.editor}>
      <Editor
        language="java"
        options={{ readOnly: props.readOnly, rulers: props.rulers }}
        theme={colorMode === "dark" ? "vs-dark" : "light"}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
}
