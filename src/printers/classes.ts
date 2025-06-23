import type { Doc } from "prettier";
import { builders } from "prettier/doc";
import { SyntaxType, type NamedNode } from "../node-types.ts";
import {
  definedKeys,
  hasChild,
  hasLeadingComments,
  indentInParentheses,
  printBlock,
  printBlockStatements,
  printBodyDeclarations,
  printModifiers,
  printValue,
  printVariableDeclaration,
  type NamedNodePrinters
} from "./helpers.ts";

const { group, hardline, indent, indentIfBreak, join, line, softline } =
  builders;

export default {
  class_declaration(path, print, options) {
    const parts: Doc[] = ["class ", path.call(print, "nameNode")];
    const definedClauses = definedKeys(path.node, [
      "superclassNode",
      "interfacesNode",
      "permitsNode"
    ]);
    const hasMultipleClauses = definedClauses.length > 1;

    const hasTypeParameters = hasChild(path, "type_parametersNode");
    if (hasTypeParameters) {
      const typeParameters = path.call(print, "type_parametersNode");
      parts.push(
        hasMultipleClauses ? group(indent(typeParameters)) : typeParameters
      );
    }

    if (definedClauses.length) {
      const separator = hasTypeParameters && !hasMultipleClauses ? " " : line;
      const clauses = definedClauses.flatMap(clause =>
        hasChild(path, clause) ? [separator, path.call(print, clause)] : []
      );
      const hasBody = path.node.bodyNode.namedChildren.length > 0;
      const afterClauses =
        options?.braceStyle === "next-line" ? "" : hasBody ? separator : " ";
      const clauseGroup = [
        hasTypeParameters && !hasMultipleClauses ? clauses : indent(clauses),
        afterClauses
      ];
      parts.push(hasMultipleClauses ? clauseGroup : group(clauseGroup));
    } else if (options?.braceStyle !== "next-line") {
      parts.push(" ");
    }

    return [
      ...printModifiers(path, print, "declarationOnly"),
      group(parts),
      path.call(print, "bodyNode")
    ];
  },

  type_parameters(path, print) {
    return [
      "<",
      indent([softline, join([",", line], path.map(print, "namedChildren"))]),
      softline,
      ">"
    ];
  },

  superclass(path, print) {
    return ["extends ", path.call(print, "namedChildren", 0)];
  },

  super_interfaces(path, print) {
    return group([
      "implements",
      indent([line, path.call(print, "namedChildren", 0)])
    ]);
  },

  permits(path, print) {
    return group([
      "permits",
      indent([line, path.call(print, "namedChildren", 0)])
    ]);
  },

  type_list(path, print) {
    return join([",", line], path.map(print, "namedChildren"));
  },

  class_body(path, print, options) {
    return printBlock(
      path,
      printBodyDeclarations(
        path,
        print,
        (path.parent as NamedNode | null)?.type ===
          SyntaxType.ClassDeclaration && options?.braceStyle !== "next-line"
      ),
      options
    );
  },

  field_declaration: printVariableDeclaration,

  variable_declarator(path, print) {
    const declarator = [path.call(print, "nameNode")];
    if (hasChild(path, "dimensionsNode")) {
      declarator.push(path.call(print, "dimensionsNode"));
    }
    if (!hasChild(path, "valueNode")) {
      return declarator;
    }
    declarator.push(" =");
    const value = path.call(print, "valueNode");
    if (
      path.node.valueNode.type === SyntaxType.BinaryExpression ||
      (path.node.valueNode.type === SyntaxType.TernaryExpression &&
        path.node.valueNode.conditionNode.type ===
          SyntaxType.BinaryExpression) ||
      hasLeadingComments(path.node.valueNode)
    ) {
      declarator.push(group(indent([line, value])));
    } else {
      const groupId = Symbol("assignment");
      declarator.push(
        group(indent(line), { id: groupId }),
        indentIfBreak(value, { groupId })
      );
    }
    return group(declarator);
  },

  method_declaration(path, print) {
    const modifiers = printModifiers(path, print);
    const declaration: Doc[] = [];

    if (hasChild(path, "type_parametersNode")) {
      declaration.push(group(path.call(print, "type_parametersNode")), " ");
    }

    declaration.push(path.call(print, "typeNode"));

    if (hasChild(path, "dimensionsNode")) {
      declaration.push(path.call(print, "dimensionsNode"));
    }

    declaration.push(
      " ",
      path.call(print, "nameNode"),
      group(path.call(print, "parametersNode"))
    );

    const throwsIndex = path.node.namedChildren.findIndex(
      ({ type }) => type === SyntaxType.Throws
    );
    if (throwsIndex !== -1) {
      declaration.push(
        group(indent([line, path.call(print, "namedChildren", throwsIndex)]))
      );
    }

    return hasChild(path, "bodyNode")
      ? [modifiers, group(declaration), " ", path.call(print, "bodyNode")]
      : [modifiers, group(declaration), ";"];
  },

  receiver_parameter(path, print) {
    return path.map(
      child =>
        child.isLast
          ? print(child)
          : [
              print(child),
              child.node.type === SyntaxType.Identifier ? "." : " "
            ],
      "namedChildren"
    );
  },

  formal_parameters(path, print) {
    return indentInParentheses(
      join(
        [",", line],
        (path.parent as NamedNode | null)?.type === SyntaxType.RecordDeclaration
          ? printBodyDeclarations(path, print)
          : path.map(print, "namedChildren")
      )
    );
  },

  formal_parameter(path, print) {
    const parameter = printModifiers(
      path,
      print,
      (path.grandparent as NamedNode | null)?.type ===
        SyntaxType.RecordDeclaration
        ? "avoidBreak"
        : "noBreak"
    );

    parameter.push(path.call(print, "typeNode"));

    if (hasChild(path, "dimensionsNode")) {
      parameter.push(path.call(print, "dimensionsNode"));
    }

    parameter.push(" ", path.call(print, "nameNode"));

    return group(parameter);
  },

  spread_parameter(path, print) {
    const parts = printModifiers(path, print, "noBreak");

    parts.push(path.call(print, "typeNode"));

    if (hasChild(path, "annotationsNodes")) {
      parts.push(
        ...path.map(annotation => [" ", print(annotation)], "annotationsNodes")
      );
    }

    parts.push(
      "... ",
      path.call(print, "namedChildren", path.node.namedChildren.length - 1)
    );

    return parts;
  },

  throws(path, print) {
    return ["throws ", ...join(", ", path.map(print, "namedChildren"))];
  },

  static_initializer(path, print) {
    return ["static ", path.call(print, "namedChildren", 0)];
  },

  constructor_declaration(path, print) {
    const modifiers = printModifiers(path, print, "declarationOnly");
    const declaration: Doc[] = [];

    if (hasChild(path, "type_parametersNode")) {
      declaration.push(group(path.call(print, "type_parametersNode")), " ");
    }

    declaration.push(
      path.call(print, "nameNode"),
      group(path.call(print, "parametersNode"))
    );

    const throwsIndex = path.node.namedChildren.findIndex(
      ({ type }) => type === SyntaxType.Throws
    );
    if (throwsIndex !== -1) {
      declaration.push(
        group(indent([line, path.call(print, "namedChildren", throwsIndex)]))
      );
    }

    return [modifiers, group(declaration), " ", path.call(print, "bodyNode")];
  },

  constructor_body(path, print, options) {
    return printBlock(path, printBlockStatements(path, print), options);
  },

  explicit_constructor_invocation(path, print) {
    const invocation: Doc[] = [];

    if (hasChild(path, "objectNode")) {
      invocation.push(path.call(print, "objectNode"), ".");
    }

    if (hasChild(path, "type_argumentsNode")) {
      invocation.push(path.call(print, "type_argumentsNode"));
    }

    invocation.push(
      path.call(print, "constructorNode"),
      path.call(print, "argumentsNode"),
      ";"
    );

    return invocation;
  },

  visibility: printValue,
  modifier: printValue,

  modifiers(path, print, _, args) {
    const parts: Doc[] = [];
    const modifiers: string[] = [];
    const typeAnnotations: Doc[] = [];

    path.each(child => {
      if (
        child.node.type === SyntaxType.Annotation ||
        child.node.type === SyntaxType.MarkerAnnotation
      ) {
        (modifiers.length ? typeAnnotations : parts).push(print(child));
      } else {
        modifiers.push(child.node.value);
        parts.push(...typeAnnotations);
        typeAnnotations.length = 0;
      }
    }, "namedChildren");

    const annotationMode =
      args && typeof args === "object" && "annotationMode" in args
        ? args.annotationMode
        : null;

    if (annotationMode === "declarationOnly") {
      parts.push(...typeAnnotations);
      typeAnnotations.length = 0;
    }

    modifiers.sort(
      (a, b) => (indexByModifier.get(a) ?? -1) - (indexByModifier.get(b) ?? -1)
    );

    if (modifiers.length || typeAnnotations.length) {
      parts.push(join(" ", [...modifiers, ...typeAnnotations]));
    }

    const separator =
      annotationMode === "avoidBreak"
        ? line
        : annotationMode === "noBreak"
          ? " "
          : hardline;
    return join(separator, parts);
  },

  enum_declaration(path, print) {
    const parts = printModifiers(path, print);

    parts.push("enum ", path.call(print, "nameNode"));
    if (hasChild(path, "interfacesNode")) {
      const hasBody = path.node.bodyNode.namedChildren.length > 0;
      parts.push(
        indent([line, path.call(print, "interfacesNode")]),
        hasBody ? line : " "
      );
    } else {
      parts.push(" ");
    }
    return [group(parts), path.call(print, "bodyNode")];
  },

  enum_body(path, print, options) {
    const parts = printBodyDeclarations(path, print);

    const enumBodyDeclarationsIndex = path.node.namedChildren.findIndex(
      ({ type }) => type === SyntaxType.EnumBodyDeclarations
    );
    const declarations: Doc[] = [];
    if (enumBodyDeclarationsIndex !== -1) {
      const hasDeclarations =
        path.node.namedChildren[enumBodyDeclarationsIndex].namedChildren
          .length > 0;
      const enumBodyDeclarations = parts.pop()!;
      if (hasDeclarations) {
        if (!parts.length) {
          declarations.push(hardline);
        }
        declarations.push(enumBodyDeclarations);
      }
    }

    const contents: Doc[] = [];
    if (parts.length) {
      contents.push(join([",", hardline], parts));
      if (!declarations.length && options.trailingComma !== "none") {
        contents.push(",");
      }
    }
    if (declarations.length) {
      contents.push(";", hardline, ...declarations);
    }
    return printBlock(path, contents.length ? [contents] : [], options);
  },

  enum_constant(path, print) {
    const initializer = printModifiers(path, print);
    initializer.push(path.call(print, "nameNode"));
    if (hasChild(path, "argumentsNode")) {
      initializer.push(path.call(print, "argumentsNode"));
    }
    if (hasChild(path, "bodyNode")) {
      initializer.push(" ", path.call(print, "bodyNode"));
    }
    return initializer;
  },

  enum_body_declarations(path, print) {
    return join(hardline, printBodyDeclarations(path, print));
  },

  record_declaration(path, print) {
    const parts = printModifiers(path, print, "declarationOnly");

    parts.push("record ", path.call(print, "nameNode"));

    if (hasChild(path, "type_parametersNode")) {
      parts.push(group(path.call(print, "type_parametersNode")));
    }

    parts.push(path.call(print, "parametersNode"));

    if (hasChild(path, "interfacesNode")) {
      const hasParameters = path.node.parametersNode.namedChildren.length > 0;
      const hasBody = path.node.bodyNode.namedChildren.length > 0;
      const interfaces = [
        hasParameters ? " " : line,
        path.call(print, "interfacesNode")
      ];
      parts.push(
        group([
          hasParameters ? interfaces : indent(interfaces),
          hasBody ? line : " "
        ])
      );
    } else {
      parts.push(" ");
    }

    return [group(parts), path.call(print, "bodyNode")];
  },

  compact_constructor_declaration(path, print) {
    const parts = printModifiers(path, print, "declarationOnly");

    parts.push(path.call(print, "nameNode"), " ", path.call(print, "bodyNode"));

    return parts;
  }
} satisfies Partial<NamedNodePrinters>;

const indexByModifier = [
  "public",
  "protected",
  "private",
  "abstract",
  "default",
  "static",
  "final",
  "transient",
  "volatile",
  "synchronized",
  "native",
  "sealed",
  "non-sealed",
  "strictfp"
].reduce((map, name, index) => map.set(name, index), new Map<string, number>());
