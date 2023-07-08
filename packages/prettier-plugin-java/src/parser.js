"use strict";

const javaParser = require("java-parser");

function parse(text, parsers, opts) {
  return javaParser.parse(text, opts.entrypoint);
}

module.exports = parse;
