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

export function printWithModifiers<
  T extends CstNode,
  P extends IterProperties<T["children"]>
>(
  path: AstPath<T>,
  print: JavaPrintFn,
  modifierChild: P,
  contents: Doc,
  noTypeAnnotations = false
) {
  const declarationAnnotations: Doc[] = [];
  const otherModifiers: string[] = [];
  const typeAnnotations: Doc[] = [];
  each(
    path,
    modifierPath => {
      const { children } = modifierPath.node as ModifierNode;
      const modifier = print(modifierPath);
      if (children.annotation) {
        (otherModifiers.length ? typeAnnotations : declarationAnnotations).push(
          modifier
        );
      } else {
        otherModifiers.push(modifier as string);
        declarationAnnotations.push(...typeAnnotations);
        typeAnnotations.length = 0;
      }
    },
    modifierChild
  );
  if (noTypeAnnotations) {
    declarationAnnotations.push(...typeAnnotations);
    typeAnnotations.length = 0;
  }
  otherModifiers.sort(
    (a, b) => indexByModifier.get(a)! - indexByModifier.get(b)!
  );
  return join(hardline, [
    ...declarationAnnotations,
    join(" ", [...otherModifiers, ...typeAnnotations, contents])
  ]);
}

export function hasDeclarationAnnotations(modifiers: ModifierNode[]) {
  let hasAnnotation = false;
  let hasNonAnnotation = false;
  for (const modifier of modifiers) {
    if (modifier.children.annotation) {
      hasAnnotation = true;
    } else if (hasAnnotation) {
      return true;
    } else {
      hasNonAnnotation = true;
    }
  }
  return hasAnnotation && !hasNonAnnotation;
}

export function call<
  T extends CstNode,
  U,
  P extends IterProperties<T["children"]>
>(
  path: AstPath<T>,
  callback: MapCallback<IndexValue<IndexValue<T, "children">, P>, U>,
  child: P
) {
  return path.map(callback, "children", child)[0];
}

export function each<
  T extends CstNode,
  P extends IterProperties<T["children"]>
>(
  path: AstPath<T>,
  callback: MapCallback<IndexValue<IndexValue<T, "children">, P>, void>,
  child: P
) {
  if (path.node.children[child]) {
    path.each(callback, "children", child);
  }
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
  return path.node.children[child] ? path.map(callback, "children", child) : [];
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
  return node.comments?.some(({ leading }) => leading) ?? false;
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
  if (!(child && child in path.node.children)) {
    const danglingComments = printDanglingComments(path);
    return danglingComments.length
      ? ["{", indent([hardline, ...danglingComments]), hardline, "}"]
      : "{}";
  }
  const list = [call(path, print, child)];
  if (options.trailingComma !== "none") {
    list.push(ifBreak(","));
  }
  return list.length ? group(["{", indent([line, ...list]), line, "}"]) : "{}";
}

export function printBlock(path: AstPath<JavaNonTerminal>, contents: Doc[]) {
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
  const parent = path.grandparent;
  const grandparent = path.getNode(4);
  const greatGrandparent = path.getNode(6);
  return (grandparent?.name === "catches" &&
    grandparent.children.catchClause.length === 1 &&
    (greatGrandparent?.name === "tryStatement" ||
      greatGrandparent?.name === "tryWithResourcesStatement") &&
    !greatGrandparent.children.finally) ||
    (greatGrandparent &&
      [
        "basicForStatement",
        "doStatement",
        "enhancedForStatement",
        "whileStatement"
      ].includes(greatGrandparent.name)) ||
    [
      "annotationInterfaceBody",
      "classBody",
      "constructorBody",
      "enumBody",
      "interfaceBody",
      "moduleDeclaration",
      "recordBody"
    ].includes(path.node.name) ||
    (parent &&
      [
        "instanceInitializer",
        "lambdaBody",
        "methodBody",
        "staticInitializer",
        "synchronizedStatement"
      ].includes(parent.name))
    ? "{}"
    : ["{", hardline, "}"];
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
  return group(["permits", indent([line, printList(path, print, "typeName")])]);
}

export function printClassType(
  path: AstPath<JavaNonTerminal & { children: ClassTypeCtx }>,
  print: JavaPrintFn
) {
  const { children } = path.node;
  return definedKeys(children, ["annotation", "Identifier", "typeArguments"])
    .flatMap(child =>
      children[child]!.map((node, index) => ({
        child,
        index,
        startOffset: parser.locStart(node)
      }))
    )
    .sort((a, b) => a.startOffset - b.startOffset)
    .flatMap(({ child, index: childIndex }, index, array) => {
      const node = children[child]![childIndex];
      const next = array.at(index + 1);
      const nextNode = next && children[next.child]![next.index];
      const docs = [path.call(print, "children", child, childIndex)];
      if (nextNode) {
        if (isNonTerminal(node)) {
          docs.push(node.name === "annotation" ? " " : ".");
        } else if (isTerminal(nextNode) || nextNode.name === "annotation") {
          docs.push(".");
        }
      }
      return docs;
    });
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
