"use strict";
const prettier = require("prettier").doc.builders;

function getImageWithComments(token) {
  const leadingComments = getLeadingComments(token);
  const trailingComments = getTrailingComments(token);

  return concat([leadingComments, token.image, trailingComments]);
}

function getLeadingComments(token) {
  const arr = [];
  if (Object.prototype.hasOwnProperty.call(token, "leadingComments")) {
    token.leadingComments.forEach(element => {
      if (element.startLine !== token.startLine) {
        arr.push(prettier.lineSuffixBoundary);
        arr.push(concat(formatComment(element)));
        arr.push(prettier.hardline);
      } else {
        arr.push(concat(formatComment(element)));
      }
    });
  }

  return concat(arr);
}

function getTrailingComments(token) {
  const arr = [];
  if (Object.prototype.hasOwnProperty.call(token, "trailingComments")) {
    if (token.trailingComments[0].startLine !== token.startLine) {
      arr.push(prettier.hardline);
    }
    token.trailingComments.forEach(element => {
      if (element.startLine !== token.startLine) {
        arr.push(concat(formatComment(element)));
        arr.push(prettier.hardline);
      } else if (element.tokenType.name === "LineComment") {
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
    res.push(prettier.hardline);
    res.push(" " + lines[i].trim());
  }

  return res;
}

function formatComment(comment) {
  const res = [];
  comment.image.split("\n").forEach(l => {
    if (l.match(/(\s+)(\*)(.*)/gm) && !l.match(/(\/)(\*)(.*)(\*)(\/)/gm)) {
      res.push(" " + l.trim());
    } else {
      res.push(l);
    }
    res.push(prettier.hardline);
  });
  if (res[res.length - 1] === prettier.hardline) {
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
  getLeadingComments,
  getTrailingComments,
  formatComment
};
