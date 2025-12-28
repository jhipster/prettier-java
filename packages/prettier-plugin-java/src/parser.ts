import { parse } from "java-parser";
import type { Parser } from "prettier";
import { determinePrettierIgnoreRanges } from "./comments.js";
import {
  isTerminal,
  type JavaNode,
  type JavaNonTerminal,
  type JavaParserOptions
} from "./printers/helpers.js";

export default {
  parse(text, options: JavaParserOptions) {
    const cst = parse(text, options.entrypoint) as JavaNonTerminal;
    cst.comments?.forEach(comment => {
      comment.value = comment.image;
    });
    determinePrettierIgnoreRanges(cst);
    return cst;
  },
  astFormat: "java",
  hasPragma(text) {
    return /^\/\*\*\n\s+\*\s@(format|prettier)\n\s+\*\//.test(text);
  },
  locStart(node) {
    return isTerminal(node) ? node.startOffset : node.location.startOffset;
  },
  locEnd(node) {
    return (isTerminal(node) ? node.endOffset : node.location.endOffset) + 1;
  }
} satisfies Parser<JavaNode>;
