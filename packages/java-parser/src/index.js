"use strict";
const JavaLexer = require("./lexer");
const JavaParser = require("./parser");
const SQLToAstVisitor = require("./visitor");

const parser = new JavaParser();

// Our visitor has no state, so a single instance is sufficient.
const toAstVisitorInstance = new SQLToAstVisitor();

function parse(inputText, entryPoint = parser => parser.compilationUnit()) {
  // Lex
  const lexResult = JavaLexer.tokenize(inputText);
  parser.input = lexResult.tokens;

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

  // Automatic CST created when parsing
  const cst = entryPoint(parser);
  if (parser.errors.length > 0) {
    const error = parser.errors[0];
    throw Error(
      "Sad sad panda, parsing errors detected in line: " +
        error.token.startLine +
        ", column: " +
        error.token.startColumn +
        "!\n" +
        error.message
    );
  }

  // Visit
  return toAstVisitorInstance.visit(cst);
}

module.exports = { parse };
