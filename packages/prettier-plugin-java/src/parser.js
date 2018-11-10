"use strict";

const javaParser = require("java-parser-js");

function parse(text) {
  return javaParser.parse(text);
}

module.exports = parse;
