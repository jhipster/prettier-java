"use strict";
const prettier = require("prettier").doc.builders;

const { processComments } = require("./comments/format-comments");

/*
 * ------------------------------------------------------------------
 * Wraps the Prettier builder functions to print tokens with comments
 * ------------------------------------------------------------------
 */

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

function ifBreak(breakContents, flatContents) {
  return prettier.ifBreak(
    processComments(breakContents),
    processComments(flatContents)
  );
}

module.exports = {
  concat,
  join,
  group,
  fill,
  indent,
  dedent,
  ifBreak
};
