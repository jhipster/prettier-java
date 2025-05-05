import type { CstElement, IToken } from "java-parser";
import { util, type AstPath } from "prettier";
import parser from "./parser.js";
import {
  isEmptyStatement,
  isNode,
  isToken,
  type JavaParserOptions
} from "./printers/helpers.js";

const formatterOffOnRangesByCst = new WeakMap<
  CstElement,
  FormatterOffOnRange[]
>();

export function determineFormatterOffOnRanges(cst: CstElement) {
  const { comments } = cst;
  if (!comments) {
    return;
  }
  const ranges = comments
    .filter(({ image }) =>
      /^(\/\/\s*@formatter:(off|on)\s*|\/\*\s*@formatter:(off|on)\s*\*\/)$/.test(
        image
      )
    )
    .reduce((ranges, { image, startOffset }) => {
      const previous = ranges.at(-1);
      if (image.endsWith("off")) {
        if (previous?.on !== Infinity) {
          ranges.push({ off: startOffset, on: Infinity });
        }
      } else if (previous?.on === Infinity) {
        previous.on = startOffset;
      }
      return ranges;
    }, new Array<FormatterOffOnRange>());
  formatterOffOnRangesByCst.set(cst, ranges);
}

export function isFullyBetweenFormatterOffOn(path: AstPath<CstElement>) {
  const { node, root } = path;
  const start = parser.locStart(node);
  const end = parser.locEnd(node);
  return (
    formatterOffOnRangesByCst
      .get(root)
      ?.some(range => range.off < start && end < range.on) === true
  );
}

export function canAttachComment(node: CstElement) {
  if (isToken(node)) {
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
    handleFqnOrRefTypeComments,
    handleIfStatementComments,
    handleJumpStatementComments,
    handleLabeledStatementComments,
    handleNameComments
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
  if (
    enclosingNode &&
    isNode(enclosingNode) &&
    enclosingNode.name === "binaryExpression"
  ) {
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

function handleFqnOrRefTypeComments(commentNode: JavaComment) {
  const { enclosingNode, followingNode } = commentNode;
  if (
    enclosingNode &&
    isNode(enclosingNode) &&
    enclosingNode.name === "fqnOrRefType" &&
    followingNode
  ) {
    util.addLeadingComment(followingNode, commentNode);
    return true;
  }
  return false;
}

function handleIfStatementComments(commentNode: JavaComment) {
  const { enclosingNode, precedingNode } = commentNode;
  if (
    enclosingNode &&
    isNode(enclosingNode) &&
    enclosingNode.name === "ifStatement" &&
    precedingNode &&
    isNode(precedingNode) &&
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
    isNode(enclosingNode) &&
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
    enclosingNode &&
    precedingNode &&
    isNode(enclosingNode) &&
    enclosingNode.name === "labeledStatement" &&
    isToken(precedingNode) &&
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
    enclosingNode &&
    isNode(enclosingNode) &&
    enclosingNode.name === "methodDeclarator" &&
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
    isNode(enclosingNode) &&
    isToken(precedingNode) &&
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

function isBinaryOperator(node?: CstElement) {
  return (
    node !== undefined &&
    (isNode(node)
      ? node.name === "shiftOperator"
      : node.tokenType.CATEGORIES?.some(
          ({ name }) => name === "BinaryOperator"
        ))
  );
}

type FormatterOffOnRange = {
  off: number;
  on: number;
};

type JavaComment = IToken & {
  enclosingNode?: CstElement;
  precedingNode?: CstElement;
  followingNode?: CstElement;
};
