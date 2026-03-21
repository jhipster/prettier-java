import { builders } from "prettier/doc";
import { SyntaxType, type NamedNode } from "../node-types.ts";
import {
  findBaseIndent,
  printValue,
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

    const lines = path.node.children
      .map(({ value }) => value)
      .join("")
      .split("\n")
      .slice(1);
    const baseIndent = findBaseIndent(lines);
    const textBlock = join(hardline, [
      '"""',
      ...lines.map(line => line.slice(baseIndent))
    ]);
    const parentType = (path.parent as NamedNode | null)?.type;
    const grandparentType = (path.grandparent as NamedNode | null)?.type;
    return parentType === SyntaxType.AssignmentExpression ||
      parentType === SyntaxType.VariableDeclarator ||
      (path.node.fieldName === "object" &&
        (grandparentType === SyntaxType.AssignmentExpression ||
          grandparentType === SyntaxType.VariableDeclarator))
      ? indent(textBlock)
      : textBlock;
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
