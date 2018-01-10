"use strict";

const pegjsJava = require("pegjs-java");

function parse(text) {
  /*parse(text, parsers, opts)*/
  return pegjsJava.parse(text);
}

module.exports = parse;
