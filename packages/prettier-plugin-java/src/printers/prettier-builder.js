"use strict";
const prettier = require("prettier").doc.builders;

const hardLineWithoutBreakParent = { type: "line", hard: true };

function getImageWithComments(token) {
  const arr = [];
  if (Object.prototype.hasOwnProperty.call(token, "leadingComments")) {
    token.leadingComments.forEach(element => {
      if (element.startLine !== token.startLine) {
        arr.push(prettier.lineSuffixBoundary);
        arr.push(concat(formatComment(element)));
        arr.push(hardLineWithoutBreakParent);
      } else {
        arr.push(concat(formatComment(element)));
      }
    });
  }
  arr.push(token.image);
  if (Object.prototype.hasOwnProperty.call(token, "trailingComments")) {
    if (token.trailingComments[0].startLine !== token.startLine) {
      arr.push(hardLineWithoutBreakParent);
    }
    token.trailingComments.forEach(element => {
      if (element.startLine !== token.startLine) {
        arr.push(concat(formatComment(element)));
        arr.push(hardLineWithoutBreakParent);
      } else if (element.tokenType.tokenName === "LineComment") {
        // Do not add extra space in case of empty statement
        const separator = token.image === "" ? "" : " ";
        arr.push(
          prettier.lineSuffix(
            concat([separator, concat(formatComment(element))])
          )
        );
      } else {
        arr.push(concat(formatComment(element)));
      }
    });
    if (
      token.trailingComments[token.trailingComments.length - 1].startLine !==
      token.startLine
    ) {
      arr.pop();
    }
  }
  return concat(arr);
}

function formatComment(comment) {
  const res = [];
  comment.image.split("\n").forEach(l => {
    if (l.match(/(\s+)(\*)(.*)/gm) && !l.match(/(\/)(\*)(.*)(\*)(\/)/gm)) {
      res.push(" " + l.trim());
    } else {
      res.push(l);
    }
    res.push(hardLineWithoutBreakParent);
  });
  if (res[res.length - 1] === hardLineWithoutBreakParent) {
    res.pop();
  }
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
  const concatenation = prettier.concat(processComments(docs));
  return concatenation.parts.length === 0 ? "" : concatenation;
}

function join(sep, docs) {
  const concatenation = prettier.join(
    processComments(sep),
    processComments(docs)
  );
  return concatenation.parts.length === 0 ? "" : concatenation;
}

function group(doc, opts) {
  const group = prettier.group(processComments(doc), opts);
  return group.contents === undefined ? "" : group;
}

function fill(docs) {
  const fill = prettier.fill(processComments(docs));
  return fill.parts.length === 0 ? "" : fill;
}

function indent(doc) {
  const indentedDoc = prettier.indent(processComments(doc));
  return indentedDoc.contents.length === 0 ? "" : indentedDoc;
}

function dedent(doc) {
  const indentedDoc = prettier.dedent(processComments(doc));
  return indentedDoc.contents.length === 0 ? "" : indentedDoc;
}

module.exports = {
  concat,
  join,
  group,
  fill,
  indent,
  dedent,
  getImageWithComments,
  hardLineWithoutBreakParent
};
