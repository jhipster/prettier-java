import type {
  AnnotationCstNode,
  ClassPermitsCstNode,
  ClassTypeCtx,
  CstElement,
  CstNode,
  ExpressionCstNode,
  InterfacePermitsCstNode,
  IToken,
  StatementCstNode
} from "java-parser";
import type { AstPath, Doc, ParserOptions } from "prettier";
import { builders } from "prettier/doc";
import type { JavaComment } from "../comments.js";
import parser from "../parser.js";

const { group, hardline, ifBreak, indent, join, line, softline } = builders;

export function onlyDefinedKey<
  T extends Record<string, any>,
  K extends Key<T> & string
>(obj: T, options?: K[]) {
  const keys = definedKeys(obj, options);
  if (keys.length === 1) {
    return keys[0];
  }
  throw new Error(
    keys.length > 1
      ? `More than one defined key found: ${keys}`
      : "No defined keys found"
  );
}

export function definedKeys<
  T extends Record<string, any>,
  K extends Key<T> & string
>(obj: T, options?: K[]) {
  return (options ?? (Object.keys(obj) as K[])).filter(
    key => obj[key] !== undefined
  );
}

const indexByModifierName = [
  "Public",
  "Protected",
  "Private",
  "Abstract",
  "Default",
  "Static",
  "Final",
  "Transient",
  "Volatile",
  "Synchronized",
  "Native",
  "Sealed",
  "NonSealed",
  "Strictfp"
].reduce((map, name, index) => map.set(name, index), new Map<string, number>());

export function sortModifiersAndGetDeclarationAnnotationCount(
  modifiers: ModifierNode[],
  allAnnotationsFirst = false
) {
  const nonAnnotationRange = modifiers.reduce<number[] | undefined>(
    (range, modifier, index) => {
      if (!modifier.children.annotation) {
        range ??= [index];
        range[1] = index;
      }
      return range;
    },
    undefined
  );
  if (!nonAnnotationRange) {
    return modifiers.length;
  }
  const start = nonAnnotationRange[0];
  const end = allAnnotationsFirst ? modifiers.length : nonAnnotationRange[1];
  if (start === end) {
    return start;
  }
  const { declarationAnnotations, nonAnnotations } = modifiers
    .slice(start, end + 1)
    .reduce(
      (organized, modifier) => {
        (modifier.children.annotation
          ? organized.declarationAnnotations
          : organized.nonAnnotations
        ).push(modifier);
        return organized;
      },
      {
        declarationAnnotations: [] as ModifierNode[],
        nonAnnotations: [] as ModifierNode[]
      }
    );
  nonAnnotations.sort(
    ({ children: a }, { children: b }) =>
      indexByModifierName.get(Object.keys(a)[0])! -
      indexByModifierName.get(Object.keys(b)[0])!
  );
  modifiers.splice(
    start,
    end - start + 1,
    ...declarationAnnotations,
    ...nonAnnotations
  );
  return start + declarationAnnotations.length;
}

export function hasDeclarationAnnotations(modifiers: ModifierNode[]) {
  return modifiers.at(0)?.children.annotation !== undefined;
}

export function call<
  T extends CstNode,
  U,
  P extends IterProperties<T["children"]>
>(
  path: AstPath<T>,
  callback: MapCallback<IndexValue<IndexValue<T, "children">, P>, U>,
  child: P,
  index = 0
) {
  return map(path, callback, child)[index];
}

export function map<
  T extends CstNode,
  U,
  P extends IterProperties<T["children"]>
>(
  path: AstPath<T>,
  callback: MapCallback<IndexValue<IndexValue<T, "children">, P>, U>,
  child: P
) {
  return path.map(callback, "children", child);
}

export function flatMap<
  T extends CstNode,
  U,
  P extends IterProperties<T["children"]>
>(
  path: AstPath<T>,
  callback: MapCallback<IndexValue<IndexValue<T, "children">, P>, U>,
  children: P[]
) {
  return children
    .flatMap(child =>
      map(path, callback, child).map((doc, index) => {
        const node = path.node.children[child][index];
        return {
          doc,
          startOffset: parser.locStart(node)
        };
      })
    )
    .sort((a, b) => a.startOffset - b.startOffset)
    .map(({ doc }) => doc);
}

export function printSingle(
  path: AstPath<JavaNonTerminal>,
  print: JavaPrintFn,
  _?: JavaParserOptions,
  args?: unknown
) {
  return call(
    path,
    childPath => print(childPath, args),
    onlyDefinedKey(path.node.children)
  );
}

export function lineStartWithComments(node: JavaNonTerminal) {
  const { comments, location } = node;
  return comments
    ? Math.min(location.startLine, comments[0].startLine)
    : location.startLine;
}

export function lineEndWithComments(node: JavaNonTerminal) {
  const { comments, location } = node;
  return comments
    ? Math.max(location.endLine, comments.at(-1)!.endLine)
    : location.endLine;
}

export function printDanglingComments(path: AstPath<JavaNonTerminal>) {
  if (!path.node.comments) {
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

export function printComment(node: JavaTerminal) {
  const { image } = node;
  const lines = image.split("\n").map(line => line.trim());
  return lines.length > 1 &&
    lines[0].startsWith("/*") &&
    lines.slice(1).every(line => line.startsWith("*")) &&
    lines.at(-1)!.endsWith("*/")
    ? join(
        hardline,
        lines.map((line, index) => (index === 0 ? line : ` ${line}`))
      )
    : image;
}

export function hasLeadingComments(node: JavaNode) {
  return node.comments?.some(({ leading }) => leading);
}

export function indentInParentheses(
  contents: Doc,
  opts?: { shouldBreak?: boolean }
) {
  return !Array.isArray(contents) || contents.length
    ? group(["(", indent([softline, contents]), softline, ")"], opts)
    : "()";
}

export function printArrayInitializer<
  T extends JavaNonTerminal,
  P extends IterProperties<T["children"]>
>(path: AstPath<T>, print: JavaPrintFn, options: JavaParserOptions, child: P) {
  const list: Doc[] = [];
  if (child && child in path.node.children) {
    list.push(call(path, print, child));
    if (options.trailingComma !== "none") {
      list.push(ifBreak(","));
    }
  }
  list.push(...printDanglingComments(path));
  return list.length ? group(["{", indent([line, ...list]), line, "}"]) : "{}";
}

export function printBlock(path: AstPath<JavaNonTerminal>, contents: Doc[]) {
  if (!contents.length) {
    const danglingComments = printDanglingComments(path);
    return danglingComments.length
      ? ["{", indent([hardline, ...danglingComments]), hardline, "}"]
      : "{}";
  }
  return group([
    "{",
    indent([hardline, ...join(hardline, contents)]),
    hardline,
    "}"
  ]);
}

export function printName(
  path: AstPath<JavaNonTerminal & { children: { Identifier: IToken[] } }>,
  print: JavaPrintFn
) {
  return join(".", map(path, print, "Identifier"));
}

export function printList<
  T extends JavaNonTerminal,
  P extends IterProperties<T["children"]>
>(path: AstPath<T>, print: JavaPrintFn, child: P) {
  return join([",", line], map(path, print, child));
}

export function printClassPermits(
  path: AstPath<ClassPermitsCstNode | InterfacePermitsCstNode>,
  print: JavaPrintFn
) {
  return group([
    "permits",
    indent([line, group(printList(path, print, "typeName"))])
  ]);
}

export function printClassType(
  path: AstPath<JavaNonTerminal & { children: ClassTypeCtx }>,
  print: JavaPrintFn
) {
  return flatMap(
    path,
    childPath => {
      const { node, isLast } = childPath;
      const child = [print(childPath)];
      if (isTerminal(node)) {
        if (!isLast) {
          child.push(".");
        }
      } else if (node.name === "annotation") {
        child.push(" ");
      }
      return child;
    },
    definedKeys(path.node.children, [
      "annotation",
      "Identifier",
      "typeArguments"
    ])
  );
}

export function isBinaryExpression(expression: ExpressionCstNode) {
  const conditionalExpression =
    expression.children.conditionalExpression?.[0].children;
  if (!conditionalExpression) {
    return false;
  }
  const isTernary = conditionalExpression.QuestionMark !== undefined;
  if (isTernary) {
    return false;
  }
  const hasNonAssignmentOperators = Object.values(
    conditionalExpression.binaryExpression[0].children
  ).some(
    child =>
      isTerminal(child[0]) &&
      !child[0].tokenType.CATEGORIES?.some(
        category => category.name === "AssignmentOperator"
      )
  );
  return hasNonAssignmentOperators;
}

export function findBaseIndent(lines: string[]) {
  return lines.length
    ? Math.min(
        ...lines.map(line => line.search(/\S/)).filter(indent => indent >= 0)
      )
    : 0;
}

export function isEmptyStatement(statement: StatementCstNode) {
  return (
    statement.children.statementWithoutTrailingSubstatement?.[0].children
      .emptyStatement !== undefined
  );
}

export function isNonTerminal(node: CstElement): node is JavaNonTerminal {
  return !isTerminal(node);
}

export function isTerminal(node: CstElement): node is IToken {
  return "tokenType" in node;
}

export type JavaNode = CstElement & { comments?: JavaComment[] };
export type JavaNonTerminal = Exclude<JavaNode, IToken>;
export type JavaTerminal = Exclude<JavaNode, CstNode>;
export type JavaNodePrinters = {
  [T in JavaNonTerminal["name"]]: JavaNodePrinter<T>;
};
export type JavaNodePrinter<T> = (
  path: AstPath<Extract<JavaNonTerminal, { name: T }>>,
  print: JavaPrintFn,
  options: JavaParserOptions,
  args?: unknown
) => Doc;
export type JavaPrintFn = (path: AstPath<JavaNode>, args?: unknown) => Doc;
export type JavaParserOptions = ParserOptions<JavaNode> & {
  entrypoint?: string;
};
export type IterProperties<T> = T extends any[]
  ? IndexProperties<T>
  : ArrayProperties<T>;

type Key<T> = T extends T ? keyof T : never;
type ModifierNode = JavaNonTerminal & {
  children: { annotation?: AnnotationCstNode[] };
};
type IsTuple<T> = T extends []
  ? true
  : T extends [infer First, ...infer Remain]
    ? IsTuple<Remain>
    : false;
type IndexProperties<T extends { length: number }> =
  IsTuple<T> extends true ? Exclude<Partial<T>["length"], T["length"]> : number;
type ArrayProperties<T> = {
  [K in keyof T]: NonNullable<T[K]> extends readonly any[] ? K : never;
}[keyof T];
type ArrayElement<T> = T extends Array<infer E> ? E : never;
type MapCallback<T, U> = (
  path: AstPath<ArrayElement<T>>,
  index: number,
  value: any
) => U;
type IndexValue<T, P> = T extends any[]
  ? P extends number
    ? T[P]
    : never
  : P extends keyof T
    ? T[P]
    : never;
