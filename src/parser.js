"use strict";

const chevrotainJava = require("chevrotain-java");

function parse(text) {
  return chevrotainJava.parse(text);
}

module.exports = parse;
