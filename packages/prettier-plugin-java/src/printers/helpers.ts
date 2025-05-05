import type {
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
import parser from "../parser.js";

const { group, hardline, indent, join, line } = builders;

export function onlyDefinedKey<
  T extends Record<string, any>,
  U extends Key<T> & string
>(obj: T, options?: U[]) {
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
  U extends Key<T> & string
>(obj: T, options?: U[]) {
  return (options ?? (Object.keys(obj) as U[])).filter(
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

export function sortModifiers(
  modifiers: CstNode[],
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
        declarationAnnotations: [] as CstNode[],
        nonAnnotations: [] as CstNode[]
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

export function hasDeclarationAnnotations(modifiers: CstNode[]) {
  return modifiers.at(0)?.children.annotation !== undefined;
}

export function call<
  T extends { children: Record<keyof any, any[]> },
  U,
  C extends IterProperties<T["children"]>
>(
  path: AstPath<T>,
  callback: MapCallback<IndexValue<IndexValue<T, "children">, C>, U>,
  child: C,
  index = 0
) {
  return map(path, callback, child)[index];
}

export function map<
  T extends { children: Record<keyof any, any[]> },
  U,
  C extends IterProperties<T["children"]>
>(
  path: AstPath<T>,
  callback: MapCallback<IndexValue<IndexValue<T, "children">, C>, U>,
  child: C
) {
  return path.map(callback, "children", child);
}

export function flatMap<
  T extends CstNode,
  U,
  C extends IterProperties<T["children"]>
>(
  path: AstPath<T>,
  callback: MapCallback<IndexValue<IndexValue<T, "children">, C>, U>,
  children: C[]
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
  path: AstPath<JavaNode>,
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

export function lineStartWithComments(node: CstNode) {
  const { comments, location } = node;
  return comments
    ? Math.min(location.startLine, comments[0].startLine)
    : location.startLine;
}

export function lineEndWithComments(node: CstNode) {
  const { comments, location } = node;
  return comments
    ? Math.max(location.endLine, comments.at(-1)!.endLine)
    : location.endLine;
}

export function printDanglingComments(path: AstPath<CstNode>) {
  if (!path.node.comments) {
    return [];
  }
  const comments: Doc[] = [];
  path.each(commentPath => {
    const comment = commentPath.node as IToken & {
      leading: boolean;
      trailing: boolean;
      printed: boolean;
    };
    if (comment.leading || comment.trailing) {
      return;
    }
    comment.printed = true;
    comments.push(printComment(comment));
  }, "comments");
  return join(hardline, comments);
}

export function printComment(node: IToken) {
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

export function hasLeadingComments(node: CstElement) {
  const comments = (node.comments ?? []) as (IToken & { leading: boolean })[];
  return comments.some(({ leading }) => leading);
}

export function printBody<T extends CstNode>(
  path: AstPath<T>,
  declarations: Doc[]
) {
  if (!declarations.length) {
    const danglingComments = printDanglingComments(path);
    return danglingComments.length
      ? ["{", indent([hardline, ...danglingComments]), hardline, "}"]
      : "{}";
  }
  return group([
    "{",
    indent([hardline, ...join(hardline, declarations)]),
    hardline,
    "}"
  ]);
}

export function printName(
  path: AstPath<{ children: { Identifier: IToken[] } }>,
  print: JavaPrintFn
) {
  return join(".", map(path, print, "Identifier"));
}

export function printList<
  T extends JavaNode,
  C extends IterProperties<T["children"]>
>(
  path: AstPath<T>,
  print: MapCallback<IndexValue<IndexValue<T, "children">, C>, Doc>,
  listKey: C
) {
  return join([",", line], map(path, print, listKey));
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
  path: AstPath<JavaNode & { children: ClassTypeCtx }>,
  print: JavaPrintFn
) {
  return flatMap(
    path,
    childPath => {
      const child = [print(childPath)];
      if (isToken(childPath.node)) {
        if (!childPath.isLast) {
          child.push(".");
        }
      } else if (childPath.node.name === "annotation") {
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
      isToken(child[0]) &&
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

function locStartWithComments(node: JavaNode) {
  if (node.name === "argumentList") {
    return locStartWithComments(node.children.expression[0]);
  } else if (node.name === "blockStatements") {
    return locStartWithComments(node.children.blockStatement[0]);
  }
  const { comments } = node;
  return comments
    ? Math.min(parser.locStart(node), parser.locStart(comments[0]))
    : parser.locStart(node);
}

function locEndWithComments(node: JavaNode) {
  if (node.name === "argumentList") {
    return locEndWithComments(node.children.expression.at(-1)!);
  } else if (node.name === "blockStatements") {
    return locEndWithComments(node.children.blockStatement.at(-1)!);
  }
  const { comments } = node;
  return comments
    ? Math.max(parser.locEnd(node), parser.locEnd(comments.at(-1)!))
    : parser.locEnd(node);
}

export function isEmptyStatement(statement: StatementCstNode) {
  return (
    statement.children.statementWithoutTrailingSubstatement?.[0].children
      .emptyStatement !== undefined
  );
}

export function isNode(node: CstElement): node is JavaNode {
  return !isToken(node);
}

export function isToken(node: CstElement): node is IToken {
  return "tokenType" in node;
}

export type JavaNode = Exclude<CstElement, IToken>;
export type JavaNodePrinters = {
  [T in JavaNode["name"]]: JavaNodePrinter<T>;
};
export type JavaNodePrinter<T> = (
  path: AstPath<Extract<JavaNode, { name: T }>>,
  print: JavaPrintFn,
  options: JavaParserOptions,
  args?: unknown
) => Doc;
export type JavaPrintFn = (path: AstPath<CstElement>, args?: unknown) => Doc;
export type JavaParserOptions = ParserOptions<CstElement> & {
  entrypoint?: string;
};
export type IterProperties<T> = T extends any[]
  ? IndexProperties<T>
  : ArrayProperties<T>;

type Key<T> = T extends T ? keyof T : never;
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
