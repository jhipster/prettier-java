"use strict";

const javaParser = require("java-parser");

function parse(text) {
  const ast = javaParser.parse(text);
  return ast;
}

module.exports = parse;
