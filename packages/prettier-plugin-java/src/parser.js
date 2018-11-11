"use strict";

const javaParser = require("java-parser");

function parse(text) {
  return javaParser.parse(text);
}

module.exports = parse;
