import type { AstPath, Doc, ParserOptions } from "prettier";
import { SyntaxType, type CommentNode, type SyntaxNode } from "./node-types.ts";
import {
  createTypeCheckFunction,
  lineEndWithComments,
  lineStartWithComments,
  type NamedNodePath,
  type PrintFunction
} from "./printers/helpers.ts";

/** 0-based, inclusive rows. */
interface LineRange {
  start: number;
  end: number;
}

const lineRangesByTree = new WeakMap<SyntaxNode, LineRange[]>();

/**
 * Nodes whose children are formatted or left unchanged as a whole: top-level
 * declarations, class members and statements.
 */
const isLineRangeContainer = createTypeCheckFunction([
  SyntaxType.AnnotationTypeBody,
  SyntaxType.Block,
  SyntaxType.ClassBody,
  SyntaxType.ConstructorBody,
  SyntaxType.EnumBody,
  SyntaxType.EnumBodyDeclarations,
  SyntaxType.InterfaceBody,
  SyntaxType.ModuleBody,
  SyntaxType.Program,
  SyntaxType.SwitchBlock,
  SyntaxType.SwitchBlockStatementGroup
]);

/**
 * Parses the `lineRanges` option: comma-separated, 1-based, inclusive line
 * ranges like `"10-20,35"`. An empty value means the whole file.
 */
export function parseLineRanges(value: string | undefined): LineRange[] {
  if (!value?.trim()) {
    return [];
  }
  return value.split(",").map(part => {
    const match = /^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/.exec(part);
    const start = Number(match?.[1]);
    const end = Number(match?.[2] ?? match?.[1]);
    if (!match || start < 1 || end < start) {
      throw new Error(
        `Invalid lineRanges "${value}": expected 1-based line ranges like "10-20,35"`
      );
    }
    return { start: start - 1, end: end - 1 };
  });
}

export function determineLineRanges(tree: SyntaxNode, value?: string) {
  const ranges = parseLineRanges(value);
  if (ranges.length) {
    lineRangesByTree.set(tree, ranges);
  }
}

export function hasLineRanges(root: SyntaxNode) {
  return lineRangesByTree.has(root);
}

/** Whether rows `start` to `end` (0-based, inclusive) lie outside all line ranges. */
function isUnchangedRows(root: SyntaxNode, start: number, end: number) {
  const ranges = lineRangesByTree.get(root);
  return (
    ranges !== undefined &&
    !ranges.some(range => start <= range.end && end >= range.start)
  );
}

/** Whether `node`, including its comments, lies outside all line ranges. */
export function isUnchanged(root: SyntaxNode, node: SyntaxNode) {
  return isUnchangedRows(
    root,
    lineStartWithComments(node),
    lineEndWithComments(node)
  );
}

/**
 * Whether the node at `path` is a declaration or statement that lies entirely
 * outside the requested line ranges, together with its comments, and should
 * therefore be printed as it is.
 */
export function isOutsideLineRanges(path: AstPath<SyntaxNode>) {
  const { node, parent, root } = path;
  return (
    node.isNamed && isLineRangeContainer(parent) && isUnchanged(root, node)
  );
}

/**
 * Whether imports keep their order: with line ranges, unless every import is
 * within them. Sorting moves lines, so it would change unchanged imports.
 */
export function keepsImportOrder(root: SyntaxNode, program: SyntaxNode) {
  if (!hasLineRanges(root) || !program.isNamed) {
    return false;
  }
  const imports = program.namedChildren.filter(
    child => child.type === SyntaxType.ImportDeclaration
  );
  return !imports.length || imports.some(child => isUnchanged(root, child));
}

const isDeclarationWithBody = createTypeCheckFunction([
  SyntaxType.AnnotationTypeDeclaration,
  SyntaxType.ClassDeclaration,
  SyntaxType.CompactConstructorDeclaration,
  SyntaxType.ConstructorDeclaration,
  SyntaxType.EnumConstant,
  SyntaxType.EnumDeclaration,
  SyntaxType.InterfaceDeclaration,
  SyntaxType.MethodDeclaration,
  SyntaxType.ModuleDeclaration,
  SyntaxType.RecordDeclaration
]);

/**
 * Prints a declaration that is formatted only because of changes in its body:
 * everything before the body (annotations, modifiers, signature) exactly as it
 * is, followed by the formatted body. Undefined when the declaration is
 * printed normally.
 */
export function printUnchangedDeclarationHeader(
  path: NamedNodePath,
  options: ParserOptions<SyntaxNode>,
  print: PrintFunction
): Doc | undefined {
  const { node, root } = path;
  if (!hasLineRanges(root) || !isDeclarationWithBody(node)) {
    return undefined;
  }
  const body = node.bodyNode;
  if (!body || !isUnchangedRows(root, node.start.row, body.start.row)) {
    return undefined;
  }

  // Like Prettier does for ignored nodes: the comments within the header are
  // part of the original text, so they count as printed
  const {
    [Symbol.for("comments")]: comments = [],
    [Symbol.for("printedComments")]: printedComments
  } = options as unknown as Record<symbol, CommentNode[] | Set<CommentNode>>;
  for (const comment of comments as CommentNode[]) {
    if (
      comment.start.index >= node.start.index &&
      comment.end.index <= body.start.index
    ) {
      (printedComments as Set<CommentNode>).add(comment);
    }
  }

  return [
    options.originalText.slice(node.start.index, body.start.index),
    path.call(print, "namedChildren", node.namedChildren.indexOf(body))
  ];
}

/**
 * The number of blank lines to print before `node`, a child of `container`,
 * given the number the printer would use by default. With line ranges, blank
 * lines outside of them are never removed: when the lines between `previous`
 * (or the container's opening line for the first child) and `node` are
 * unchanged, their original count is kept, and only raised to the default
 * when one of the two neighbours is being formatted.
 *
 * Takes the container and root explicitly: inside `path.each`/`path.map`, the
 * path points at the child.
 */
export function blankLinesBefore(
  root: SyntaxNode,
  container: SyntaxNode,
  previous: SyntaxNode | null | undefined,
  node: SyntaxNode,
  byDefault: number
) {
  if (!hasLineRanges(root) || !isLineRangeContainer(container)) {
    return byDefault;
  }
  const from = previous ? lineEndWithComments(previous) : container.start.row;
  return blankLinesBetween(root, from, lineStartWithComments(node), byDefault);
}

/**
 * The number of blank lines to print between the last child of the container
 * at `path` and its closing line, like {@link blankLinesBefore}.
 */
export function blankLinesAtEnd(path: AstPath<SyntaxNode>, byDefault: number) {
  const { node: container, root } = path;
  if (!hasLineRanges(root) || !isLineRangeContainer(container)) {
    return byDefault;
  }
  const last = container.namedChildren.at(-1);
  return last
    ? blankLinesBetween(
        root,
        lineEndWithComments(last),
        container.end.row,
        byDefault
      )
    : byDefault;
}

/** Blank lines between rows `from` and `to`, which hold the neighbouring code. */
function blankLinesBetween(
  root: SyntaxNode,
  from: number,
  to: number,
  byDefault: number
) {
  const original = Math.max(to - from - 1, 0);
  if (original > 0 && !isUnchangedRows(root, from + 1, to - 1)) {
    return byDefault; // the blank lines themselves were edited
  }
  return isUnchangedRows(root, from, from) && isUnchangedRows(root, to, to)
    ? original
    : Math.max(original, byDefault);
}
