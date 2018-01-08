"use strict";

const parse = require("./parser");
const print = require("./printer");

const languages = [
  {
    name: "Java",
    since: "X.X.X", // FIXME
    parsers: ["java"],
    group: "Java",
    tmScope: "text.html.vue", // FIXME
    aceMode: "html", // FIXME
    codemirrorMode: "clike",
    codemirrorMimeType: "text/x-java",
    extensions: [".java"],
    linguistLanguageId: 181,
    vscodeLanguageIds: ["java"]
  }
];

const parsers = {
  java: {
    parse,
    astFormat: "java"
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
  java: {
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
