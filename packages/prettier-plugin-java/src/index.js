import parse from "./parser.js";
import print from "./printer.js";
import options from "./options.js";

const languages = [
  {
    name: "Java",
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

function locStart(/* node */) {
  return -1;
}

function locEnd(/* node */) {
  return -1;
}

function hasPragma(text) {
  return /^\/\*\*[\n][\t\s]+\*\s@(prettier|format)[\n][\t\s]+\*\//.test(text);
}

const parsers = {
  java: {
    parse,
    astFormat: "java",
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
  java: {
    print,
    // hasPrettierIgnore,
    printComment,
    canAttachComment,
    massageAstNode: clean
  }
};

export default {
  languages,
  printers,
  parsers,
  options
};
