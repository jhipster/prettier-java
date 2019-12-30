"use strict";
const {
  concat,
  hardline,
  lineSuffix,
  breakParent,
  literalline
} = require("prettier").doc.builders;

/**
 * Takes a token and return a doc with:
 * - concatenated leading comments
 * - the token image
 * - concatenated trailing comments
 *
 * @param {Token} token
 * @return a doc with the token and its comments
 */
function printTokenWithComments(token) {
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
 * @param {CSTNode} node
 * @param {Doc} value - the converted node value
 * @return a doc with the token and its comments
 */
function printNodeWithComments(node, value) {
  return printWithComments(
    node,
    value,
    getNodeLeadingComments,
    getNodeTrailingComments
  );
}

function printWithComments(
  nodeOrToken,
  value,
  getLeadingComments,
  getTrailingComments
) {
  const leadingComments = getLeadingComments(nodeOrToken);
  const trailingComments = getTrailingComments(nodeOrToken, value);

  return leadingComments.length === 0 && trailingComments.length === 0
    ? value
    : concat([...leadingComments, value, ...trailingComments]);
}

/**
 * @param {Token} token
 * @return an array containing processed leading comments and separators
 */
function getTokenLeadingComments(token) {
  return getLeadingComments(token, token);
}

/**
 * @param {CSTNode} node
 * @return an array containing processed leading comments and separators
 */
function getNodeLeadingComments(node) {
  return getLeadingComments(node, node.location);
}

function getLeadingComments(nodeOrToken, location) {
  const arr = [];
  if (Object.prototype.hasOwnProperty.call(nodeOrToken, "leadingComments")) {
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
 * @param {Token} token
 * @return an array containing processed trailing comments and separators
 */
function getTokenTrailingComments(token) {
  return getTrailingComments(token, token.image, token);
}

/**
 * @param {CSTNode} node
 * @return an array containing processed trailing comments and separators
 */
function getNodeTrailingComments(node, value) {
  return getTrailingComments(node, value, node.location);
}

function getTrailingComments(nodeOrToken, value, location) {
  const arr = [];
  let previousEndLine = location.endLine;
  if (Object.prototype.hasOwnProperty.call(nodeOrToken, "trailingComments")) {
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

function isJavaDoc(comment, lines) {
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

function formatJavaDoc(lines) {
  const res = [lines[0].trim()];

  for (let i = 1; i < lines.length; i++) {
    res.push(hardline);
    res.push(" " + lines[i].trim());
  }

  return res;
}

function formatComment(comment) {
  const res = [];
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

function isToken(doc) {
  return (
    doc && Object.prototype.hasOwnProperty.call(doc, "image") && doc.tokenType
  );
}

function processComments(docs) {
  if (!Array.isArray(docs)) {
    if (isToken(docs)) {
      return printTokenWithComments(docs);
    }
    return docs;
  }
  return docs.map(elt => {
    if (isToken(elt)) {
      return printTokenWithComments(elt);
    }
    return elt;
  });
}

module.exports = {
  getTokenLeadingComments,
  processComments,
  printTokenWithComments,
  printNodeWithComments
};
