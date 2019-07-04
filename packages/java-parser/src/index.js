"use strict";
const JavaLexer = require("./lexer");
const JavaParser = require("./parser");
const {
  attachComments,
  ignoredComments,
  attachIgnoreNodes
} = require("./comments");

const parser = new JavaParser();
const BaseJavaCstVisitor = parser.getBaseCstVisitorConstructor();
const BaseJavaCstVisitorWithDefaults = parser.getBaseCstVisitorConstructorWithDefaults();

function parse(inputText, entryPoint = "compilationUnit") {
  // Lex
  const lexResult = JavaLexer.tokenize(inputText);

  if (lexResult.errors.length > 0) {
    const firstError = lexResult.errors[0];
    throw Error(
      "Sad sad panda, lexing errors detected in line: " +
        firstError.line +
        ", column: " +
        firstError.column +
        "!\n" +
        firstError.message
    );
  }

  parser.input = lexResult.tokens;

  // prettier-ignore support
  const ignoreComments = ignoredComments(
    lexResult.tokens,
    lexResult.groups.comments
  );
  parser.setIgnoredComments(ignoreComments);

  // Automatic CST created when parsing
  const cst = parser[entryPoint]();

  if (parser.errors.length > 0) {
    const error = parser.errors[0];
    throw Error(
      "Sad sad panda, parsing errors detected in line: " +
        error.token.startLine +
        ", column: " +
        error.token.startColumn +
        "!\n" +
        error.message +
        "!\n\t->" +
        error.context.ruleStack.join("\n\t->")
    );
  }

  // only comments code support
  // https://github.com/jhipster/prettier-java/pull/217
  if (lexResult.tokens.length === 0) {
    const EOF = Object.assign({}, cst.children.EOF[0]);
    EOF.startOffset = Number.MAX_SAFE_INTEGER;
    EOF.endOffset = Number.MAX_SAFE_INTEGER;
    cst.children.EOF = [EOF];
    attachComments(cst.children.EOF, lexResult.groups.comments);
  } else {
    attachComments(lexResult.tokens, lexResult.groups.comments);
  }

  attachIgnoreNodes(ignoreComments, parser.ignoredNodes);

  return cst;
}

module.exports = {
  parse,
  BaseJavaCstVisitor,
  BaseJavaCstVisitorWithDefaults
};
