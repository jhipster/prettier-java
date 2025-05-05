import { parse, type CstElement, type IToken } from "java-parser";
import type { Parser } from "prettier";
import { determineFormatterOffOnRanges } from "./comments.js";
import { isToken, type JavaParserOptions } from "./printers/helpers.js";

export default {
  parse(text, options: JavaParserOptions) {
    const cst = parse(text, options.entrypoint) as CstElement;
    cst.comments?.forEach(comment => {
      (comment as IToken & { value: string }).value = comment.image;
    });
    determineFormatterOffOnRanges(cst);
    return cst;
  },
  astFormat: "java",
  hasPragma(text) {
    return /^\/\*\*\n\s+\*\s@(format|prettier)\n\s+\*\//.test(text);
  },
  locStart(node) {
    return isToken(node) ? node.startOffset : node.location.startOffset;
  },
  locEnd(node) {
    return (isToken(node) ? node.endOffset : node.location.endOffset) + 1;
  }
} satisfies Parser<CstElement>;
