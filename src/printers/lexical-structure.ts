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
    const hasInterpolations = path.node.namedChildren.some(
      ({ type }) => type === SyntaxType.StringInterpolation
    );
    if (hasInterpolations || path.node.children[0].value === '"') {
      return path.map(print, "children");
    }

    return printTextBlock(
      path,
      join(hardline, textBlockContents(path.node).split("\n"))
    );
  },

  string_fragment: printValue,
  multiline_string_fragment: printValue,

  string_interpolation(path, print) {
    const expressionType = path.node.namedChildren[0].type;
    const expression = path.call(print, "namedChildren", 0);

    return expressionType === SyntaxType.BinaryExpression ||
      expressionType === SyntaxType.TernaryExpression
      ? group(["\\{", indent([softline, expression]), softline, "}"])
      : ["\\{", expression, "}"];
  },

  escape_sequence: printValue,
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
