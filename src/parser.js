"use strict";

const chevrotainJava = require("chevrotain-apex");

function parse(text) {
  return chevrotainJava.parse(text);
}

module.exports = parse;
