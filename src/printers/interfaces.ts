import type { Doc } from "prettier";
import { builders } from "prettier/doc";
import { SyntaxType } from "../node-types.ts";
import {
  hasChild,
  indentInParentheses,
  printArrayInitializer,
  printBlock,
  printBodyDeclarations,
  printModifiers,
  printVariableDeclaration,
  type NamedNodePrinters
} from "./helpers.ts";

const { group, indent, join, line } = builders;

export default {
  interface_declaration(path, print) {
    const parts = ["interface ", path.call(print, "nameNode")];

    const extendsInterfacesIndex = path.node.namedChildren.findIndex(
      ({ type }) => type === SyntaxType.ExtendsInterfaces
    );
    const hasExtendsInterfaces = extendsInterfacesIndex !== -1;
    const hasPermits = hasChild(path, "permitsNode");
    const hasMultipleClauses = hasExtendsInterfaces && hasPermits;

    const hasTypeParameters = hasChild(path, "type_parametersNode");
    if (hasTypeParameters) {
      const typeParameters = path.call(print, "type_parametersNode");
      parts.push(
        hasMultipleClauses ? group(indent(typeParameters)) : typeParameters
      );
    }

    if (hasExtendsInterfaces || hasPermits) {
      const separator = hasTypeParameters && !hasMultipleClauses ? " " : line;
      const clauses: Doc[] = [];
      if (hasExtendsInterfaces) {
        clauses.push(
          separator,
          path.call(print, "namedChildren", extendsInterfacesIndex)
        );
      }
      if (hasPermits) {
        clauses.push(separator, path.call(print, "permitsNode"));
      }
      const hasBody = path.node.bodyNode.namedChildren.length > 0;
      const clauseGroup = [
        hasTypeParameters && !hasMultipleClauses ? clauses : indent(clauses),
        hasBody ? separator : " "
      ];
      parts.push(hasMultipleClauses ? clauseGroup : group(clauseGroup));
    } else {
      parts.push(" ");
    }

    return [
      ...printModifiers(path, print, "declarationOnly"),
      group(parts),
      path.call(print, "bodyNode")
    ];
  },

  extends_interfaces(path, print) {
    const typeListIndex = path.node.namedChildren.findIndex(
      ({ type }) => type === SyntaxType.TypeList
    );
    return group([
      "extends",
      indent([line, path.call(print, "namedChildren", typeListIndex)])
    ]);
  },

  interface_body(path, print) {
    return printBlock(path, printBodyDeclarations(path, print));
  },

  constant_declaration: printVariableDeclaration,

  annotation_type_declaration(path, print) {
    const parts = printModifiers(path, print);

    parts.push(
      "@interface ",
      path.call(print, "nameNode"),
      " ",
      path.call(print, "bodyNode")
    );

    return parts;
  },

  annotation_type_body(path, print) {
    return printBlock(path, printBodyDeclarations(path, print));
  },

  annotation_type_element_declaration(path, print) {
    const parts = printModifiers(path, print);

    parts.push(
      path.call(print, "typeNode"),
      " ",
      path.call(print, "nameNode"),
      "()"
    );

    if (hasChild(path, "dimensionsNode")) {
      parts.push(path.call(print, "dimensionsNode"));
    }

    if (hasChild(path, "valueNode")) {
      parts.push(" default ", path.call(print, "valueNode"));
    }

    parts.push(";");

    return parts;
  },

  annotation(path, print) {
    return [
      "@",
      path.call(print, "nameNode"),
      path.call(print, "argumentsNode")
    ];
  },

  marker_annotation(path, print) {
    return ["@", path.call(print, "nameNode")];
  },

  annotation_argument_list(path, print) {
    const args = path.map(print, "namedChildren");
    return args.length === 1 &&
      path.node.namedChildren[0].type ===
        SyntaxType.ElementValueArrayInitializer
      ? ["(", args[0], ")"]
      : group(indentInParentheses(join([",", line], args)));
  },

  element_value_pair(path, print) {
    return group([
      path.call(print, "keyNode"),
      " = ",
      path.call(print, "valueNode")
    ]);
  },

  element_value_array_initializer: printArrayInitializer
} satisfies Partial<NamedNodePrinters>;
