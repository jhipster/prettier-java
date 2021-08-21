import { builders } from "prettier/doc";
import { CstElement, CstNode, IToken } from "java-parser";
import { CstNodeLocation } from "@chevrotain/types";
import { isCstElementOrUndefinedIToken } from "../../types/utils";
import { Doc } from "prettier";

const { concat, hardline, lineSuffix, breakParent, literalline } = builders;

/**
 * Takes a token and return a doc with:
 * - concatenated leading comments
 * - the token image
 * - concatenated trailing comments
 *
 * @param {IToken} token
 * @return a doc with the token and its comments
 */
export function printTokenWithComments(token: IToken) {
  return printWithComments(
    token,
    token.image,
    getTokenLeadingComments,
    getTokenTrailingComments
  );
}

/**
 * Takes a node and return a doc with:
 * - concatenated leading comments
 * - the node doc value
 * - concatenated trailing comments
 *
 * @param {CstNode} node
 * @param {Doc} value - the converted node value
 * @return a doc with the token and its comments
 */
export function printNodeWithComments(node: CstNode, value: string) {
  return printWithComments(
    node,
    value,
    getNodeLeadingComments,
    getNodeTrailingComments
  );
}

function printWithComments<T extends CstNode | IToken>(
  nodeOrToken: T,
  value: string,
  getLeadingComments: (token: T) => Doc[],
  getTrailingComments: (token: T, value: string) => Doc[]
) {
  const leadingComments = getLeadingComments(nodeOrToken);
  const trailingComments = getTrailingComments(nodeOrToken, value);

  return leadingComments.length === 0 && trailingComments.length === 0
    ? value
    : concat([...leadingComments, value, ...trailingComments]);
}

/**
 * @param {IToken} token
 * @return an array containing processed leading comments and separators
 */
export function getTokenLeadingComments(token: IToken) {
  return getLeadingComments(token, token);
}

/**
 * @param {CstNode} node
 * @return an array containing processed leading comments and separators
 */
function getNodeLeadingComments(node: CstNode) {
  return getLeadingComments(node, node.location);
}

function getLeadingComments(
  nodeOrToken: CstElement,
  location: CstNodeLocation | IToken
): Doc[] {
  const arr = [];
  if (nodeOrToken.leadingComments !== undefined) {
    let previousEndLine = nodeOrToken.leadingComments[0].endLine;
    let step;
    arr.push(concat(formatComment(nodeOrToken.leadingComments[0])));
    for (let i = 1; i < nodeOrToken.leadingComments.length; i++) {
      step = nodeOrToken.leadingComments[i].startLine - previousEndLine;
      if (
        step === 1 ||
        nodeOrToken.leadingComments[i].startOffset > location.startOffset
      ) {
        arr.push(hardline);
      } else if (step > 1) {
        arr.push(hardline, hardline);
      }

      arr.push(concat(formatComment(nodeOrToken.leadingComments[i])));
      previousEndLine = nodeOrToken.leadingComments[i].endLine;
    }

    step = location.startLine - previousEndLine;
    if (
      step === 1 ||
      nodeOrToken.leadingComments[nodeOrToken.leadingComments.length - 1]
        .startOffset > location.startOffset
    ) {
      arr.push(hardline);
    } else if (step > 1) {
      arr.push(hardline, hardline);
    }
  }

  return arr;
}

/**
 * @param {IToken} token
 * @return an array containing processed trailing comments and separators
 */
function getTokenTrailingComments(token: IToken) {
  return getTrailingComments(token, token.image, token);
}

/**
 * @param {CstNode} node
 * @param {string} value
 * @return an array containing processed trailing comments and separators
 */
function getNodeTrailingComments(node: CstNode, value: string) {
  return getTrailingComments(node, value, node.location);
}

function getTrailingComments(
  nodeOrToken: CstElement,
  value: string,
  location: CstNodeLocation | IToken
) {
  const arr: Doc = [];
  let previousEndLine = location.endLine;
  if (nodeOrToken.trailingComments !== undefined) {
    nodeOrToken.trailingComments.forEach((comment, idx) => {
      let separator = "";

      if (comment.startLine !== previousEndLine) {
        arr.push(hardline);
      } else if (value !== "" && idx === 0) {
        separator = " ";
      }

      if (comment.tokenType.name === "LineComment") {
        arr.push(
          lineSuffix(
            concat([separator, concat(formatComment(comment)), breakParent])
          )
        );
      } else {
        arr.push(concat(formatComment(comment)));
      }

      previousEndLine = comment.endLine;
    });
  }

  return arr;
}

function isJavaDoc(comment: IToken, lines: string[]) {
  let isJavaDoc = true;
  if (comment.tokenType.name === "TraditionalComment" && lines.length > 1) {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim().charAt(0) !== "*") {
        isJavaDoc = false;
        break;
      }
    }
  } else {
    isJavaDoc = false;
  }

  return isJavaDoc;
}

function formatJavaDoc(lines: string[]) {
  const res: Doc[] = [lines[0].trim()];

  for (let i = 1; i < lines.length; i++) {
    res.push(hardline);
    res.push(" " + lines[i].trim());
  }

  return res;
}

function formatComment(comment: IToken) {
  const res: Doc[] = [];
  const lines = comment.image.split("\n");

  if (isJavaDoc(comment, lines)) {
    return formatJavaDoc(lines);
  }

  lines.forEach(line => {
    res.push(line);
    res.push(literalline);
  });
  res.pop();
  return res;
}

export function processComments(
  docs: (CstElement | undefined)[] | CstElement | undefined
) {
  if (!Array.isArray(docs)) {
    if (isCstElementOrUndefinedIToken(docs)) {
      return printTokenWithComments(docs);
    }
    return docs;
  }
  return docs.map(elt => {
    if (isCstElementOrUndefinedIToken(elt)) {
      return printTokenWithComments(elt);
    }
    return elt;
  });
}
