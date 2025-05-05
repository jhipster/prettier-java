import { builders } from "prettier/doc";
import {
  findBaseIndent,
  map,
  onlyDefinedKey,
  printSingle,
  type JavaNodePrinters
} from "./helpers.js";

const { hardline, join } = builders;

export default {
  literal(path, print) {
    const { TextBlock } = path.node.children;
    if (!TextBlock) {
      return printSingle(path, print);
    }
    const lines = TextBlock[0].image.split("\n");
    const open = lines.shift()!;
    const baseIndent = findBaseIndent(lines);
    return join(hardline, [open, ...lines.map(line => line.slice(baseIndent))]);
  },

  integerLiteral: printSingle,
  floatingPointLiteral: printSingle,
  booleanLiteral: printSingle,

  shiftOperator(path, print) {
    return map(path, print, onlyDefinedKey(path.node.children));
  }
} satisfies Partial<JavaNodePrinters>;
