"use strict";

const javaParser = require("java-parser");

function parse(text) {
  const cst = javaParser.parse(text);
  return cst;
}

module.exports = parse;
