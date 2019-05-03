"use strict";
const prettier = require("prettier").doc.builders;

function getImageWithComments(token) {
  const arr = [];
  if (token.hasOwnProperty("leadingComments")) {
    token.leadingComments.forEach(element => {
      arr.push(concat(formatComment(element)));
      if (element.startLine !== token.startLine) {
        arr.push(prettier.hardline);
      }
    });
  }
  arr.push(token.image);
  if (token.hasOwnProperty("trailingComments")) {
    if (token.trailingComments[0].startLine !== token.startLine) {
      arr.push(prettier.hardline);
    }
    token.trailingComments.forEach(element => {
      arr.push(concat(formatComment(element)));
      if (
        element.startLine !== token.startLine ||
        element.tokenType.tokenName === "LineComment"
      ) {
        arr.push(prettier.hardline);
      }
    });
    if (
      token.trailingComments[token.trailingComments.length - 1].startLine !==
      token.startLine
    ) {
      arr.pop();
    }
  }
  return group(concat(arr));
}

function formatComment(comment) {
  const res = [];
  comment.image.split("\n").forEach(l => {
    res.push(l.trim());
    res.push(prettier.hardline);
  });
  if (res[res.length - 1] === prettier.hardline) {
    res.pop();
  }
  return res;
}

function isToken(doc) {
  return doc && doc.image && doc.tokenType;
}

function processComments(docs) {
  if (!Array.isArray(docs)) {
    if (isToken(docs)) {
      return getImageWithComments(docs);
    }
    return docs;
  }
  return docs.map(elt => {
    if (isToken(elt)) {
      return getImageWithComments(elt);
    }
    return elt;
  });
}

function concat(docs) {
  return prettier.concat(processComments(docs));
}

function join(sep, docs) {
  return prettier.join(processComments(sep), processComments(docs));
}

function group(doc, opts) {
  return prettier.group(processComments(doc), opts);
}

function indent(doc) {
  return prettier.indent(processComments(doc));
}

function dedent(doc) {
  return prettier.dedent(processComments(doc));
}

module.exports = {
  concat,
  join,
  group,
  indent,
  dedent,
  getImageWithComments,
  isToken
};
