"use strict";

const parse = require("./parser");
const print = require("./printer");

const languages = [
  {
    name: "Apex",
    parsers: ["apex"],
    group: "Apex",
    // tmScope: "text.html.vue", // no Apex support
    // aceMode: "html", // no Apex support
    // codemirrorMode: "clike", // no Apex support
    // codemirrorMimeType: "text/x-java", // no Apex support
    extensions: [".apex"],
    linguistLanguageId: 181,
    vscodeLanguageIds: ["apex"]
  }
];

function locStart(/* node */) {
  return -1;
}

function locEnd(/* node */) {
  return -1;
}

function hasPragma(/* text */) {
  return false;
}

const parsers = {
  apex: {
    parse,
    astFormat: "apex",
    locStart,
    locEnd,
    hasPragma
  }
};

function canAttachComment(node) {
  return node.ast_type && node.ast_type !== "comment";
}

function printComment(commentPath) {
  const comment = commentPath.getValue();

  switch (comment.ast_type) {
    case "comment":
      return comment.value;
    default:
      throw new Error("Not a comment: " + JSON.stringify(comment));
  }
}

function clean(ast, newObj) {
  delete newObj.lineno;
  delete newObj.col_offset;
}

const printers = {
  apex: {
    print,
    // hasPrettierIgnore,
    printComment,
    canAttachComment,
    massageAstNode: clean
  }
};

module.exports = {
  languages,
  printers,
  parsers
};
