import { util, type AstPath, type Doc } from "prettier";
import { builders } from "prettier/doc";
import { SyntaxType, type CommentNode, type SyntaxNode } from "./node-types.ts";
import parser from "./parser.ts";
import printer from "./printer.ts";
import {
  hasChild,
  printComment,
  type JavaParserOptions,
  type NamedNodePath
} from "./printers/helpers.ts";

const { hasNewline, isPreviousLineEmpty, skipNewline, skipSpaces } = util;
const { breakParent, hardline, line, lineSuffix } = builders;

const prettierIgnoreRangesByTree = new WeakMap<
  SyntaxNode,
  PrettierIgnoreRange[]
>();

export function determinePrettierIgnoreRanges(tree: SyntaxNode) {
  const { comments } = tree;
  if (!comments) {
    return;
  }
  const ranges = comments
    .filter(({ value }) =>
      /^\/(?:\/\s*(?:prettier-ignore-(?:start|end)|@formatter:(?:off|on))\s*|\*\s*(?:prettier-ignore-(?:start|end)|@formatter:(?:off|on))\s*\*\/)$/.test(
        value
      )
    )
    .reduce((ranges, { value, start }) => {
      const previous = ranges.at(-1);
      if (value.includes("start") || value.includes("off")) {
        if (previous?.end !== Infinity) {
          ranges.push({ start: start.index, end: Infinity });
        }
      } else if (previous?.end === Infinity) {
        previous.end = start.index;
      }
      return ranges;
    }, new Array<PrettierIgnoreRange>());
  prettierIgnoreRangesByTree.set(tree, ranges);
}

export function isFullyBetweenPrettierIgnore(path: AstPath<SyntaxNode>) {
  const { node, root } = path;
  const start = parser.locStart(node);
  const end = parser.locEnd(node);
  return (
    prettierIgnoreRangesByTree
      .get(root)
      ?.some(range => range.start < start && end < range.end) === true
  );
}

export function isPrettierIgnore(comment: CommentNode) {
  return /^(\/\/\s*prettier-ignore|\/\*\s*prettier-ignore\s*\*\/)$/.test(
    comment.value
  );
}

export function willPrintOwnComments(path: AstPath<SyntaxNode>): boolean {
  return isMember(path.node) && !printer.hasPrettierIgnore(path);
}

export function canAttachComment(node: SyntaxNode) {
  if (!node.isNamed) {
    return isBinaryOperator(node);
  }
  switch (node.type) {
    case SyntaxType.EnumBodyDeclarations:
    case SyntaxType.EscapeSequence:
    case SyntaxType.FormalParameters:
    case SyntaxType.Modifier:
    case SyntaxType.MultilineStringFragment:
    case SyntaxType.ParenthesizedExpression:
    case SyntaxType.Program:
    case SyntaxType.StringFragment:
    case SyntaxType.Visibility:
      return false;
    default:
      return true;
  }
}

export function handleLineComment(
  commentNode: CommentNode,
  _: string,
  options: JavaParserOptions
) {
  return [
    handleBinaryExpressionComments,
    handleFqnOrRefTypeComments,
    handleIfStatementComments,
    handleJumpStatementComments,
    handleLabeledStatementComments,
    handleMemberChainComments,
    handleModifiersComments,
    handleNameComments,
    handleTernaryExpressionComments,
    handleTryStatementComments
  ].some(fn => fn(commentNode, options));
}

export function handleRemainingComment(commentNode: CommentNode) {
  return [
    handleFqnOrRefTypeComments,
    handleNameComments,
    handleJumpStatementComments
  ].some(fn => fn(commentNode));
}

function handleBinaryExpressionComments(
  commentNode: CommentNode,
  options: JavaParserOptions
) {
  const { enclosingNode, precedingNode, followingNode } = commentNode;
  if (enclosingNode?.type === SyntaxType.BinaryExpression) {
    if (isBinaryOperator(followingNode)) {
      if (options.experimentalOperatorPosition === "start") {
        util.addLeadingComment(followingNode, commentNode);
      } else {
        util.addTrailingComment(followingNode, commentNode);
      }
      return true;
    } else if (
      options.experimentalOperatorPosition === "start" &&
      isBinaryOperator(precedingNode)
    ) {
      util.addLeadingComment(precedingNode, commentNode);
      return true;
    }
  }
  return false;
}

function handleFqnOrRefTypeComments(commentNode: CommentNode) {
  const { enclosingNode, followingNode } = commentNode;
  if (
    enclosingNode?.type === SyntaxType.ScopedTypeIdentifier &&
    followingNode
  ) {
    util.addLeadingComment(followingNode, commentNode);
    return true;
  }
  return false;
}

function handleIfStatementComments(commentNode: CommentNode) {
  const { enclosingNode, precedingNode } = commentNode;
  if (
    enclosingNode?.type === SyntaxType.IfStatement &&
    precedingNode?.fieldName === "consequence"
  ) {
    util.addDanglingComment(enclosingNode, commentNode, undefined);
    return true;
  }
  return false;
}

function handleJumpStatementComments(commentNode: CommentNode) {
  const { enclosingNode, precedingNode, followingNode } = commentNode;
  if (
    enclosingNode &&
    !precedingNode &&
    !followingNode &&
    (enclosingNode.type === SyntaxType.BreakStatement ||
      enclosingNode.type === SyntaxType.ContinueStatement ||
      enclosingNode.type === SyntaxType.ReturnStatement)
  ) {
    util.addTrailingComment(enclosingNode, commentNode);
    return true;
  }
  return false;
}

function handleLabeledStatementComments(commentNode: CommentNode) {
  const { enclosingNode, precedingNode } = commentNode;
  if (
    enclosingNode?.type === SyntaxType.LabeledStatement &&
    precedingNode?.type === SyntaxType.Identifier
  ) {
    util.addLeadingComment(precedingNode, commentNode);
    return true;
  }
  return false;
}

function handleMemberChainComments(commentNode: CommentNode) {
  const { enclosingNode, precedingNode, followingNode } = commentNode;
  if (
    (enclosingNode?.type === SyntaxType.FieldAccess ||
      enclosingNode?.type === SyntaxType.MethodInvocation) &&
    followingNode?.type === SyntaxType.Identifier
  ) {
    util.addLeadingComment(enclosingNode, commentNode);
    return true;
  } else if (
    followingNode &&
    isMember(followingNode) &&
    precedingNode !== enclosingNode &&
    !isPrettierIgnore(commentNode)
  ) {
    util.addDanglingComment(followingNode, commentNode, undefined);
    return true;
  }
  return false;
}

function handleModifiersComments(commentNode: CommentNode) {
  const { precedingNode } = commentNode;
  if (
    precedingNode?.type === SyntaxType.Annotation ||
    precedingNode?.type === SyntaxType.MarkerAnnotation ||
    precedingNode?.type === SyntaxType.Modifiers
  ) {
    util.addTrailingComment(precedingNode, commentNode);
    return true;
  }
  return false;
}

function handleNameComments(commentNode: CommentNode) {
  const { enclosingNode, precedingNode } = commentNode;
  if (
    enclosingNode &&
    precedingNode?.type === SyntaxType.Identifier &&
    (enclosingNode.type === SyntaxType.ScopedIdentifier ||
      enclosingNode.type === SyntaxType.ModuleDeclaration ||
      enclosingNode.type === SyntaxType.PackageDeclaration ||
      enclosingNode.type === SyntaxType.ScopedTypeIdentifier)
  ) {
    util.addTrailingComment(precedingNode, commentNode);
    return true;
  }
  return false;
}

function handleTernaryExpressionComments(commentNode: CommentNode) {
  const { enclosingNode, precedingNode, followingNode } = commentNode;
  if (
    enclosingNode?.type === SyntaxType.TernaryExpression &&
    precedingNode?.isNamed &&
    followingNode?.isNamed &&
    precedingNode.end.row < commentNode.start.row &&
    commentNode.end.row < followingNode.start.row
  ) {
    util.addLeadingComment(followingNode, commentNode);
    return true;
  }
  return false;
}

function handleTryStatementComments(commentNode: CommentNode) {
  const { enclosingNode, followingNode } = commentNode;
  if (
    enclosingNode &&
    (enclosingNode.type === SyntaxType.CatchClause ||
      enclosingNode.type === SyntaxType.TryStatement ||
      enclosingNode.type === SyntaxType.TryWithResourcesStatement) &&
    followingNode?.isNamed
  ) {
    const block =
      followingNode.type === SyntaxType.CatchClause
        ? followingNode.bodyNode
        : followingNode.type === SyntaxType.FinallyClause
          ? followingNode.namedChildren[0]
          : null;
    if (!block) {
      return false;
    }
    const blockStatement = block.namedChildren.at(0);
    if (blockStatement) {
      util.addLeadingComment(blockStatement, commentNode);
    } else {
      util.addDanglingComment(block, commentNode, undefined);
    }
    return true;
  }
  return false;
}

function isMember(node: SyntaxNode) {
  return (
    node.type === SyntaxType.ArrayAccess ||
    node.type === SyntaxType.FieldAccess ||
    node.type === SyntaxType.MethodInvocation
  );
}

const binaryOperators = new Set([
  "<<",
  ">>",
  ">>>",
  "instanceof",
  "<=",
  ">=",
  "==",
  "-",
  "+",
  "&&",
  "&",
  "^",
  "!=",
  "||",
  "|",
  "*",
  "/",
  "%"
]);
function isBinaryOperator(node?: SyntaxNode) {
  return node !== undefined && binaryOperators.has(node.type);
}

type PrettierIgnoreRange = {
  start: number;
  end: number;
};

function printLeadingComment(path: AstPath<CommentNode>) {
  const comment = path.node;
  comment.printed = true;
  const parts: Doc[] = [printComment(comment)];

  const originalText = path.root.value;
  const isBlock = comment.type === SyntaxType.BlockComment;

  // Leading block comments should see if they need to stay on the
  // same line or not.
  if (isBlock) {
    let lineBreak: Doc = " ";
    if (hasNewline(originalText, parser.locEnd(comment))) {
      if (
        hasNewline(originalText, parser.locStart(comment), { backwards: true })
      ) {
        lineBreak = hardline;
      } else {
        lineBreak = line;
      }
    }

    parts.push(lineBreak);
  } else {
    parts.push(hardline);
  }

  const index = skipNewline(
    originalText,
    skipSpaces(originalText, parser.locEnd(comment))
  );

  if (index !== false && hasNewline(originalText, index)) {
    parts.push(hardline);
  }

  return parts;
}

function printTrailingComment(
  path: AstPath<CommentNode>,
  previousComment?: { doc: Doc; isBlock: boolean; hasLineSuffix: boolean }
): NonNullable<typeof previousComment> {
  const comment = path.node;
  comment.printed = true;
  const printed = printComment(comment);

  const originalText = path.root.value;
  const isBlock = comment.type === SyntaxType.BlockComment;

  if (
    (previousComment?.hasLineSuffix && !previousComment?.isBlock) ||
    hasNewline(originalText, parser.locStart(comment), { backwards: true })
  ) {
    // This allows comments at the end of nested structures:
    // f(
    //   1,
    //   2
    //   // A comment
    // );
    // Those kinds of comments are almost always leading comments, but
    // here it doesn't go "outside" the block and turns it into a
    // trailing comment for `2`. We can simulate the above by checking
    // if this a comment on its own line; normal trailing comments are
    // always at the end of another expression.

    const isLineBeforeEmpty = isPreviousLineEmpty(
      originalText,
      parser.locStart(comment)
    );

    return {
      doc: lineSuffix([hardline, isLineBeforeEmpty ? hardline : "", printed]),
      isBlock,
      hasLineSuffix: true
    };
  }

  if (!isBlock || previousComment?.hasLineSuffix) {
    return {
      doc: [lineSuffix([" ", printed]), breakParent],
      isBlock,
      hasLineSuffix: true
    };
  }

  return { doc: [" ", printed], isBlock, hasLineSuffix: false };
}

function printLeadingComments(path: NamedNodePath) {
  if (!hasChild(path, "comments")) {
    return [];
  }
  const docs: Doc[] = [];

  path.each(path => {
    const { node: comment } = path;
    if (!comment.leading) {
      return;
    }

    docs.push(printLeadingComment(path));
  }, "comments");

  return docs;
}

function printTrailingComments(path: NamedNodePath) {
  if (!hasChild(path, "comments")) {
    return [];
  }
  const docs: Doc[] = [];
  let printedTrailingComment:
    | ReturnType<typeof printTrailingComment>
    | undefined;

  path.each(path => {
    const { node: comment } = path;
    if (!comment.trailing) {
      return;
    }

    printedTrailingComment = printTrailingComment(path, printedTrailingComment);

    docs.push(printedTrailingComment.doc);
  }, "comments");

  return docs;
}

export function printCommentsSeparately(path: NamedNodePath) {
  return {
    leading: printLeadingComments(path),
    trailing: printTrailingComments(path)
  };
}

export function printComments(path: NamedNodePath, doc: Doc) {
  const leading = printLeadingComments(path);
  const trailing = printTrailingComments(path);
  return leading.length || trailing.length ? [leading, doc, trailing] : doc;
}
