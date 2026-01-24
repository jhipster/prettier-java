import type { IToken } from "java-parser";
import { util, type AstPath } from "prettier";
import parser from "./parser.js";
import {
  isEmptyStatement,
  isNonTerminal,
  isTerminal,
  type JavaNode,
  type JavaNonTerminal,
  type JavaParserOptions
} from "./printers/helpers.js";

const prettierIgnoreRangesByCst = new WeakMap<
  JavaNode,
  PrettierIgnoreRange[]
>();

export function determinePrettierIgnoreRanges(cst: JavaNonTerminal) {
  const { comments } = cst;
  if (!comments) {
    return;
  }
  const ranges = comments
    .filter(({ image }) =>
      /^\/(?:\/\s*(?:prettier-ignore-(?:start|end)|@formatter:(?:off|on))\s*|\*\s*(?:prettier-ignore-(?:start|end)|@formatter:(?:off|on))\s*\*\/)$/.test(
        image
      )
    )
    .reduce((ranges, { image, startOffset }) => {
      const previous = ranges.at(-1);
      if (image.includes("start") || image.includes("off")) {
        if (previous?.end !== Infinity) {
          ranges.push({ start: startOffset, end: Infinity });
        }
      } else if (previous?.end === Infinity) {
        previous.end = startOffset;
      }
      return ranges;
    }, new Array<PrettierIgnoreRange>());
  prettierIgnoreRangesByCst.set(cst, ranges);
}

export function isFullyBetweenPrettierIgnore(path: AstPath<JavaNode>) {
  const { node, root } = path;
  if (isNonTerminal(node) && node.location === undefined) {
    return false;
  }
  const start = parser.locStart(node);
  const end = parser.locEnd(node);
  return (
    prettierIgnoreRangesByCst
      .get(root)
      ?.some(range => range.start < start && end < range.end) === true
  );
}

export function canAttachComment(node: JavaNode) {
  if (isTerminal(node)) {
    const { name, CATEGORIES } = node.tokenType;
    return (
      name === "Identifier" ||
      CATEGORIES?.find(({ name }) => name === "BinaryOperator") !== undefined
    );
  }
  const { children, name } = node;
  switch (name) {
    case "argumentList":
    case "blockStatements":
    case "emptyStatement":
    case "enumBodyDeclarations":
      return false;
    case "annotationInterfaceMemberDeclaration":
    case "classMemberDeclaration":
    case "interfaceMemberDeclaration":
    case "methodBody":
      return !children.Semicolon;
    case "blockStatement":
      return !children.statement || !isEmptyStatement(children.statement[0]);
    case "classBodyDeclaration":
      return !children.classMemberDeclaration?.[0].children.Semicolon;
    case "recordBodyDeclaration":
      return !children.classBodyDeclaration?.[0].children
        .classMemberDeclaration?.[0].children.Semicolon;
    case "statement":
      return !isEmptyStatement(node);
    case "statementWithoutTrailingSubstatement":
      return !children.emptyStatement;
    default:
      return true;
  }
}

export function handleLineComment(
  commentNode: JavaComment,
  _: string,
  options: JavaParserOptions
) {
  return [
    handleBinaryExpressionComments,
    handleConditionalExpressionComments,
    handleFqnOrRefTypeComments,
    handleIfStatementComments,
    handleJumpStatementComments,
    handleLabeledStatementComments,
    handleNameComments,
    handleTryStatementComments
  ].some(fn => fn(commentNode, options));
}

export function handleRemainingComment(commentNode: JavaComment) {
  return [
    handleFqnOrRefTypeComments,
    handleMethodDeclaratorComments,
    handleNameComments,
    handleJumpStatementComments
  ].some(fn => fn(commentNode));
}

function handleBinaryExpressionComments(
  commentNode: JavaComment,
  options: JavaParserOptions
) {
  const { enclosingNode, precedingNode, followingNode } = commentNode;
  if (enclosingNode?.name === "binaryExpression") {
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

function handleConditionalExpressionComments(commentNode: JavaComment) {
  const { startLine, endLine, enclosingNode, precedingNode, followingNode } =
    commentNode;
  if (
    enclosingNode?.name === "conditionalExpression" &&
    precedingNode &&
    followingNode &&
    isNonTerminal(precedingNode) &&
    isNonTerminal(followingNode) &&
    precedingNode.location.endLine < startLine &&
    endLine < followingNode.location.startLine
  ) {
    util.addLeadingComment(followingNode, commentNode);
    return true;
  }
  return false;
}

function handleFqnOrRefTypeComments(commentNode: JavaComment) {
  const { enclosingNode, followingNode } = commentNode;
  if (enclosingNode?.name === "fqnOrRefType" && followingNode) {
    util.addLeadingComment(followingNode, commentNode);
    return true;
  }
  return false;
}

function handleIfStatementComments(commentNode: JavaComment) {
  const { enclosingNode, precedingNode } = commentNode;
  if (
    enclosingNode?.name === "ifStatement" &&
    precedingNode &&
    isNonTerminal(precedingNode) &&
    precedingNode.name === "statement"
  ) {
    util.addDanglingComment(enclosingNode, commentNode, undefined);
    return true;
  }
  return false;
}

function handleJumpStatementComments(commentNode: JavaComment) {
  const { enclosingNode, precedingNode, followingNode } = commentNode;
  if (
    enclosingNode &&
    !precedingNode &&
    !followingNode &&
    ["breakStatement", "continueStatement", "returnStatement"].includes(
      enclosingNode.name
    )
  ) {
    util.addTrailingComment(enclosingNode, commentNode);
    return true;
  }
  return false;
}

function handleLabeledStatementComments(commentNode: JavaComment) {
  const { enclosingNode, precedingNode } = commentNode;
  if (
    enclosingNode?.name === "labeledStatement" &&
    precedingNode &&
    isTerminal(precedingNode) &&
    precedingNode.tokenType.name === "Identifier"
  ) {
    util.addLeadingComment(precedingNode, commentNode);
    return true;
  }
  return false;
}

function handleMethodDeclaratorComments(commentNode: JavaComment) {
  const { enclosingNode } = commentNode;
  if (
    enclosingNode?.name === "methodDeclarator" &&
    !enclosingNode.children.receiverParameter &&
    !enclosingNode.children.formalParameterList &&
    enclosingNode.children.LBrace[0].startOffset < commentNode.startOffset &&
    commentNode.startOffset < enclosingNode.children.RBrace[0].startOffset
  ) {
    util.addDanglingComment(enclosingNode, commentNode, undefined);
    return true;
  }
  return false;
}

function handleNameComments(commentNode: JavaComment) {
  const { enclosingNode, precedingNode } = commentNode;
  if (
    enclosingNode &&
    precedingNode &&
    isTerminal(precedingNode) &&
    precedingNode.tokenType.name === "Identifier" &&
    [
      "ambiguousName",
      "classOrInterfaceTypeToInstantiate",
      "expressionName",
      "moduleDeclaration",
      "moduleName",
      "packageDeclaration",
      "packageName",
      "packageOrTypeName",
      "typeName"
    ].includes(enclosingNode.name)
  ) {
    util.addTrailingComment(precedingNode, commentNode);
    return true;
  }
  return false;
}

function handleTryStatementComments(commentNode: JavaComment) {
  const { enclosingNode, followingNode } = commentNode;
  if (
    enclosingNode &&
    ["catches", "tryStatement"].includes(enclosingNode.name) &&
    followingNode &&
    isNonTerminal(followingNode)
  ) {
    const block = (
      followingNode.name === "catches"
        ? followingNode.children.catchClause[0]
        : followingNode.name === "catchClause" ||
            followingNode.name === "finally"
          ? followingNode
          : null
    )?.children.block[0];
    if (!block) {
      return false;
    }
    const blockStatement =
      block.children.blockStatements?.[0].children.blockStatement[0];
    if (blockStatement) {
      util.addLeadingComment(blockStatement, commentNode);
    } else {
      util.addDanglingComment(block, commentNode, undefined);
    }
    return true;
  }
  return false;
}

function isBinaryOperator(node?: JavaNode) {
  return (
    node !== undefined &&
    (isNonTerminal(node)
      ? node.name === "shiftOperator"
      : node.tokenType.CATEGORIES?.some(
          ({ name }) => name === "BinaryOperator"
        ))
  );
}

export type JavaComment = IToken & {
  value: string;
  leading: boolean;
  trailing: boolean;
  printed: boolean;
  enclosingNode?: JavaNonTerminal;
  precedingNode?: JavaNode;
  followingNode?: JavaNode;
};

type PrettierIgnoreRange = {
  start: number;
  end: number;
};
