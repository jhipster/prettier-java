import { builders } from "prettier/doc";
import { SyntaxType } from "../node-types.ts";
import {
  printTextBlock,
  printValue,
  textBlockContents,
  type NamedNodePrinters
} from "./helpers.ts";

const { group, hardline, indent, join, softline } = builders;

export default {
  string_literal(path, print) {
    if (path.node.children.length > 0) {
      return path.map(
        child =>
          child.node.type === SyntaxType.BinaryExpression ||
          child.node.type === SyntaxType.TernaryExpression
            ? group([indent([softline, print(child)]), softline])
            : print(child),
        "children"
      );
    }

    if (path.node.value.startsWith('"""')) {
      return printTextBlock(
        join(hardline, textBlockContents(path.node).split("\n"))
      );
    }

    return path.node.value;
  },

  string_template_begin: printValue,
  string_template_mid: printValue,
  string_template_end: printValue,
  text_block_template_begin: printValue,
  text_block_template_mid: printValue,
  text_block_template_end: printValue,
  character_literal: printValue,
  binary_integer_literal: printValue,
  decimal_integer_literal: printValue,
  hex_integer_literal: printValue,
  octal_integer_literal: printValue,
  decimal_floating_point_literal: printValue,
  hex_floating_point_literal: printValue,
  null_literal: printValue,
  true: printValue,
  false: printValue,
  this: printValue,
  super: printValue,
  underscore_pattern: printValue,
  asterisk: printValue
} satisfies Partial<NamedNodePrinters>;
