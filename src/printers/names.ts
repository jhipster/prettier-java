import { SyntaxType } from "../tree-sitter-java.js";
import { printValue, type JavaNodePrinters } from "./helpers.js";

export default {
  identifier: printValue,
  type_identifier: printValue,

  scoped_identifier(path, print) {
    return [path.call(print, "scopeNode"), ".", path.call(print, "nameNode")];
  },

  scoped_type_identifier(path, print) {
    return path.map(
      child =>
        child.node.type === SyntaxType.Annotation ||
        child.node.type === SyntaxType.MarkerAnnotation
          ? [print(child), " "]
          : print(child),
      "children"
    );
  }
} satisfies Partial<JavaNodePrinters>;
