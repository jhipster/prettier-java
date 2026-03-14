import type { AstPath, Doc, Options, ParserOptions } from "prettier";
import { builders, utils } from "prettier/doc";
import {
  SyntaxType,
  type CommentNode,
  type NamedNode,
  type NamedType,
  type SyntaxNode
} from "../node-types.ts";

const { group, hardline, ifBreak, indent, join, line, softline } = builders;
const { mapDoc } = utils;

export function hasType<T extends NamedType>(
  path: AstPath<NamedNode>,
  type: T
): path is AstPath<NamedNode<T>> {
  return path.node.type === type;
}

export function hasChild<T, K extends keyof T>(
  path: AstPath<T>,
  fieldName: K
): path is AstPath<T & { [P in K]-?: NonNullable<T[P]> }> {
  return path.node[fieldName] != null;
}

export function definedKeys<T extends SyntaxNode, K extends keyof T>(
  obj: T,
  options?: K[]
) {
  return (options ?? (Object.keys(obj) as K[])).filter(
    key => obj[key] !== undefined
  );
}

export function printModifiers(
  path: NamedNodePath,
  print: PrintFunction,
  annotationMode?: "declarationOnly" | "avoidBreak" | "noBreak"
): Doc[] {
  const modifiersIndex = path.node.namedChildren.findIndex(
    ({ type }) => type === SyntaxType.Modifiers
  );
  if (modifiersIndex === -1) {
    return [];
  }
  const separator =
    annotationMode === "avoidBreak"
      ? line
      : annotationMode === "noBreak" ||
          path.node.namedChildren[modifiersIndex].children.some(
            ({ type }) =>
              type !== SyntaxType.Annotation &&
              type !== SyntaxType.MarkerAnnotation
          )
        ? " "
        : hardline;
  return [
    path.call(
      modifiers => print(modifiers, { annotationMode }),
      "namedChildren",
      modifiersIndex
    ),
    separator
  ];
}

export function printValue(path: AstPath<SyntaxNode>) {
  return path.node.value;
}

export function lineStartWithComments(node: SyntaxNode) {
  return node.comments?.length
    ? Math.min(node.start.row, node.comments[0].start.row)
    : node.start.row;
}

export function lineEndWithComments(node: SyntaxNode) {
  return node.comments?.length
    ? Math.max(node.end.row, node.comments.at(-1)!.end.row)
    : node.end.row;
}

export function printDanglingComments(path: NamedNodePath) {
  if (!path.node.comments?.length) {
    return [];
  }
  const comments: Doc[] = [];
  path.each(commentPath => {
    const comment = commentPath.node;
    if (comment.leading || comment.trailing) {
      return;
    }
    comment.printed = true;
    comments.push(printComment(comment));
  }, "comments");
  return join(hardline, comments);
}

export function printComment(comment: CommentNode) {
  const lines = comment.value.split("\n").map(line => line.trim());
  return lines.length > 1 &&
    lines[0].startsWith("/*") &&
    lines.slice(1).every(line => line.startsWith("*")) &&
    lines.at(-1)!.endsWith("*/")
    ? join(
        hardline,
        lines.map((line, index) => (index === 0 ? line : ` ${line}`))
      )
    : comment.value;
}

export function hasLeadingComments(node: SyntaxNode) {
  return node.comments?.some(({ leading }) => leading) ?? false;
}

export function indentInParentheses(contents: Doc) {
  return !Array.isArray(contents) || contents.length
    ? ["(", indent([softline, contents]), softline, ")"]
    : "()";
}

export function printArrayInitializer(
  path: NamedNodePath<
    SyntaxType.ArrayInitializer | SyntaxType.ElementValueArrayInitializer
  >,
  print: PrintFunction,
  options: JavaParserOptions
) {
  if (!path.node.namedChildren.length) {
    const danglingComments = printDanglingComments(path);
    return danglingComments.length
      ? ["{", indent([hardline, ...danglingComments]), hardline, "}"]
      : "{}";
  }

  const list = join([",", line], path.map(print, "namedChildren"));

  if (list.length && options.trailingComma !== "none") {
    list.push(ifBreak(","));
  }

  return group(["{", indent([softline, ...list]), softline, "}"]);
}

export function printBlock(path: NamedNodePath, contents: Doc[]) {
  if (contents.length) {
    return group([
      "{",
      indent([hardline, ...join(hardline, contents)]),
      hardline,
      "}"
    ]);
  }
  const danglingComments = printDanglingComments(path);
  if (danglingComments.length) {
    return ["{", indent([hardline, ...danglingComments]), hardline, "}"];
  }
  const parent = path.parent;
  const grandparent = path.grandparent;
  return (parent?.type === SyntaxType.CatchClause &&
    (grandparent?.type === SyntaxType.TryStatement ||
      grandparent?.type === SyntaxType.TryWithResourcesStatement) &&
    grandparent.namedChildren.filter(
      ({ type }) => type === SyntaxType.CatchClause
    ).length === 1 &&
    !grandparent.namedChildren.some(
      ({ type }) => type === SyntaxType.FinallyClause
    )) ||
    (parent &&
      [
        SyntaxType.ForStatement,
        SyntaxType.DoStatement,
        SyntaxType.EnhancedForStatement,
        SyntaxType.WhileStatement
      ].includes(parent.type)) ||
    [
      SyntaxType.AnnotationTypeBody,
      SyntaxType.ClassBody,
      SyntaxType.ConstructorBody,
      SyntaxType.EnumBody,
      SyntaxType.InterfaceBody,
      SyntaxType.ModuleBody,
      SyntaxType.RecordPatternBody
    ].includes(path.node.type) ||
    (parent &&
      [
        SyntaxType.Block,
        SyntaxType.LambdaExpression,
        SyntaxType.MethodDeclaration,
        SyntaxType.StaticInitializer,
        SyntaxType.SynchronizedStatement
      ].includes(parent.type))
    ? "{}"
    : ["{", hardline, "}"];
}

export function printBlockStatements(
  path: NamedNodePath<
    | SyntaxType.Block
    | SyntaxType.ConstructorBody
    | SyntaxType.SwitchBlockStatementGroup
  >,
  print: PrintFunction
) {
  const parts: Doc[] = [];
  path.each(child => {
    const { node, previous } = child;

    if (node.type === SyntaxType.SwitchLabel) {
      return;
    }

    const blankLine =
      parts.length &&
      previous &&
      lineStartWithComments(node) > lineEndWithComments(previous) + 1;

    const declaration = print(child);
    parts.push(blankLine ? [hardline, declaration] : declaration);
  }, "namedChildren");
  return parts;
}

export function printBodyDeclarations(
  path: NamedNodePath<
    | SyntaxType.AnnotationTypeBody
    | SyntaxType.ClassBody
    | SyntaxType.EnumBody
    | SyntaxType.EnumBodyDeclarations
    | SyntaxType.FormalParameters
    | SyntaxType.InterfaceBody
  >,
  print: PrintFunction,
  padFirst = false
) {
  const isInterfaceBody = path.node.type === SyntaxType.InterfaceBody;
  const isFormalParameters = path.node.type === SyntaxType.FormalParameters;
  const separator = isFormalParameters ? softline : hardline;
  let previousRequiresPadding = padFirst;

  return path.map(child => {
    const { node, previous } = child;

    const modifiers =
      node.namedChildren.find(({ type }) => type === SyntaxType.Modifiers)
        ?.children ?? [];
    const firstAnnotationIndex = modifiers.findIndex(
      ({ type }) =>
        type === SyntaxType.Annotation || type === SyntaxType.MarkerAnnotation
    );
    const lastNonAnnotationIndex = modifiers.findLastIndex(
      ({ type }) =>
        type !== SyntaxType.Annotation && type !== SyntaxType.MarkerAnnotation
    );
    const hasDeclarationAnnotation =
      firstAnnotationIndex !== -1 &&
      ((!isFormalParameters && lastNonAnnotationIndex === -1) ||
        firstAnnotationIndex < lastNonAnnotationIndex);
    const currentRequiresPadding =
      hasDeclarationAnnotation ||
      (!isFormalParameters &&
        node.type !== SyntaxType.ConstantDeclaration &&
        node.type !== SyntaxType.EnumConstant &&
        node.type !== SyntaxType.FieldDeclaration &&
        !(
          isInterfaceBody &&
          node.type === SyntaxType.MethodDeclaration &&
          !node.bodyNode
        ));

    const blankLine =
      previousRequiresPadding ||
      (previous &&
        (currentRequiresPadding ||
          lineStartWithComments(node) > lineEndWithComments(previous) + 1));

    previousRequiresPadding = currentRequiresPadding;

    const declaration = print(child);
    return blankLine ? [separator, declaration] : declaration;
  }, "namedChildren");
}

export function printVariableDeclaration(
  path: NamedNodePath<
    | SyntaxType.ConstantDeclaration
    | SyntaxType.FieldDeclaration
    | SyntaxType.LocalVariableDeclaration
  >,
  print: PrintFunction
) {
  const declaration = printModifiers(path, print);

  declaration.push(path.call(print, "typeNode"), " ");

  const declarators = path.map(print, "declaratorNodes");

  if (
    declarators.length > 1 &&
    path.node.declaratorNodes.some(({ valueNode }) => valueNode)
  ) {
    declaration.push(
      group(indent(join([",", line], declarators)), {
        shouldBreak:
          (path.parent as NamedNode | null)?.type !== SyntaxType.ForStatement
      })
    );
  } else {
    declaration.push(join(", ", declarators));
  }

  declaration.push(";");

  return declaration;
}

export function printTextBlock(
  path: NamedNodePath<SyntaxType.StringLiteral>,
  contents: Doc
) {
  const parts = ['"""', hardline, contents, '"""'];
  const parentType = (path.parent as NamedNode | null)?.type;
  const grandparentType = (path.grandparent as NamedNode | null)?.type;
  return parentType === SyntaxType.AssignmentExpression ||
    parentType === SyntaxType.VariableDeclarator ||
    (path.node.fieldName === "object" &&
      (grandparentType === SyntaxType.AssignmentExpression ||
        grandparentType === SyntaxType.VariableDeclarator))
    ? indent(parts)
    : parts;
}

export function embedTextBlock(path: NamedNodePath<SyntaxType.StringLiteral>) {
  const hasInterpolations = path.node.namedChildren.some(
    ({ type }) => type === SyntaxType.StringInterpolation
  );
  if (hasInterpolations || path.node.children[0].value === '"') {
    return null;
  }

  const language = findEmbeddedLanguage(path);
  if (!language) {
    return null;
  }

  const text = unescapeTextBlockContents(textBlockContents(path.node));

  return async (
    textToDoc: (text: string, options: Options) => Promise<Doc>
  ) => {
    const doc = await textToDoc(text, { parser: language });
    return printTextBlock(path, escapeDocForTextBlock(doc));
  };
}

export function textBlockContents(node: NamedNode<SyntaxType.StringLiteral>) {
  const lines = node.value
    .replace(
      /(?<=^|[^\\])((?:\\\\)*)\\u+([0-9a-fA-F]{4})/g,
      (_, backslashPairs: string, hex: string) =>
        backslashPairs + String.fromCharCode(parseInt(hex, 16))
    )
    .split("\n")
    .slice(1);
  const baseIndent = findBaseIndent(lines);
  return lines
    .map(line => line.slice(baseIndent))
    .join("\n")
    .slice(0, -3);
}

function findBaseIndent(lines: string[]) {
  return Math.min(
    ...lines.map(line => line.search(/\S/)).filter(indent => indent >= 0)
  );
}

function findEmbeddedLanguage(path: NamedNodePath) {
  return path.ancestors
    .find(
      ({ type, comments }) =>
        type === SyntaxType.Block || comments?.some(({ leading }) => leading)
    )
    ?.comments?.filter(({ leading }) => leading)
    .map(
      ({ value }) => value.match(/^(?:\/\/|\/\*)\s*language\s*=\s*(\S+)/)?.[1]
    )
    .findLast(language => language)
    ?.toLowerCase();
}

function escapeDocForTextBlock(doc: Doc) {
  return mapDoc(doc, currentDoc =>
    typeof currentDoc === "string"
      ? currentDoc.replace(/\\|"""/g, match => `\\${match}`)
      : currentDoc
  );
}

function unescapeTextBlockContents(text: string) {
  return text.replace(
    /\\(?:([bstnfr"'\\])|\n|\r\n?|([0-3][0-7]{0,2}|[0-7]{1,2}))/g,
    (_, single, octal) => {
      if (single) {
        switch (single) {
          case "b":
            return "\b";
          case "s":
            return " ";
          case "t":
            return "\t";
          case "n":
            return "\n";
          case "f":
            return "\f";
          case "r":
            return "\r";
          default:
            return single;
        }
      } else if (octal) {
        return String.fromCharCode(parseInt(octal, 8));
      } else {
        return "";
      }
    }
  );
}

export type NamedNodePrinters = {
  [T in NamedType]: NamedNodePrinter<T>;
};
export type NamedNodePrinter<T extends NamedType> = (
  path: NamedNodePath<T>,
  print: PrintFunction,
  options: JavaParserOptions,
  args?: unknown
) => Doc;
export type NamedNodePath<T extends NamedType = NamedType> = AstPath<
  NamedNode<T>
>;
export type PrintFunction = (path: AstPath<SyntaxNode>, args?: unknown) => Doc;
export type JavaParserOptions = ParserOptions<SyntaxNode>;
