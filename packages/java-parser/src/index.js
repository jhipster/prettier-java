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

  parser.input = attachComments(lexResult.tokens, lexResult.groups.comments);

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

function attachComments(tokens, comments) {
  const attachComments = [...comments];

  // edge case: when the file start with comments, it attaches as leadingComments to the first token
  const firstToken = tokens[0];
  const headComments = [];
  while (
    attachComments.length > 0 &&
    attachComments[0].endOffset < firstToken.startOffset
  ) {
    headComments.push(attachComments[0]);
    attachComments.splice(0, 1);
  }

  if (headComments.length > 0) {
    firstToken.leadingComments = headComments;
  }

  // edge case: when the file end with comments, it attaches as trailingComments to the last token
  const lastToken = tokens[tokens.length - 1];
  const tailComments = [];
  while (
    attachComments.length > 0 &&
    attachComments[attachComments.length - 1].startOffset > lastToken.endOffset
  ) {
    tailComments.push(attachComments[attachComments.length - 1]);
    attachComments.splice(attachComments.length - 1, 1);
  }

  if (tailComments.length > 0) {
    lastToken.trailingComments = tailComments.reverse();
  }

  let currentToken = 0;
  attachComments.forEach(element => {
    // find the correct position to place the comment
    while (
      !(
        element.startOffset > tokens[currentToken].endOffset &&
        element.endOffset < tokens[currentToken + 1].startOffset
      )
    ) {
      currentToken++;
    }

    // attach comment to the closest token
    if (
      element.startOffset - tokens[currentToken].endOffset <=
      tokens[currentToken + 1].startOffset - element.endOffset
    ) {
      if (!tokens[currentToken].hasOwnProperty("trailingComments")) {
        tokens[currentToken].trailingComments = [];
      }
      tokens[currentToken].trailingComments.push(element);
    } else {
      if (!tokens[currentToken + 1].hasOwnProperty("leadingComments")) {
        tokens[currentToken + 1].leadingComments = [];
      }
      tokens[currentToken + 1].leadingComments.push(element);
    }
  });

  return tokens;
}

module.exports = {
  parse,
  BaseJavaCstVisitor,
  BaseJavaCstVisitorWithDefaults
};
