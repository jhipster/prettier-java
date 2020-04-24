"use strict";

const javaParser = require("java-parser");

function parse(text, parsers, opts) {
  const cst = javaParser.parse(text, opts.entrypoint);
  return cst;
}

module.exports = parse;
