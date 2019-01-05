"use strict";
const JavaLexer = require("./lexer");
const JavaParser = require("./parser");

// const startTime = new Date().getTime();
const parser = new JavaParser();
// const endTime = new Date().getTime();
// const totalTime = endTime - startTime;
// console.log("parse start time (ms): " + totalTime);

// Our visitor has no state, so a single instance is sufficient.

function parse(inputText, entryPoint = "compilationUnit") {
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

  return cst;
}

module.exports = { parse };
