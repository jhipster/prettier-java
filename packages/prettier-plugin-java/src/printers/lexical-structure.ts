import {
  map,
  onlyDefinedKey,
  printSingle,
  type JavaNodePrinters
} from "./helpers.js";

export default {
  literal: printSingle,
  integerLiteral: printSingle,
  floatingPointLiteral: printSingle,
  booleanLiteral: printSingle,

  shiftOperator(path, print) {
    return map(path, print, onlyDefinedKey(path.node.children));
  }
} satisfies Partial<JavaNodePrinters>;
