"use strict";
const JavaLexer = require("./lexer");
const JavaParser = require("./parser");

// const startTime = new Date().getTime();
const parser = new JavaParser();
const BaseJavaCstVisitor = parser.getBaseCstVisitorConstructor();
const BaseJavaCstVisitorWithDefaults = parser.getBaseCstVisitorConstructorWithDefaults();

// const endTime = new Date().getTime();
// const totalTime = endTime - startTime;
// console.log("parse start time (ms): " + totalTime);

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

  //Checking if all tokens have a LABEL
  lexResult.tokens.map(value => {
    if (!value.tokenType.LABEL) {
      //If a LABEL is missing, we try to add one. This is so that Identifier gets labelled without changing the lexer
      if (typeof value.tokenType.PATTERN === "string") {
        value.tokenType.label = `'${value.tokenType.PATTERN}'`;
      }
      // Complex token (e.g literal)
      else if (value.tokenType.PATTERN instanceof RegExp) {
        value.tokenType.label = `'${value.tokenType.name}'`;
      } else {
        //If the token doesn't have any pattern, we can't give it a Label.
        throw Error(
          "Sad sad bear, label not found for token: " +
            value.tokenType.name +
            " at line " +
            value.startLine +
            ", column " +
            value.startColumn +
            "\n"
        );
      }
    }
  });

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

module.exports = {
  parse,
  BaseJavaCstVisitor,
  BaseJavaCstVisitorWithDefaults
};
