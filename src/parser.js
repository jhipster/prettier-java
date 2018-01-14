"use strict";

const pegjsJava = require("pegjs-java");
//const pegjsJava = require("../../pegjs-java/pegjs-java");

function parse(text) {
  /*parse(text, parsers, opts)*/
  return pegjsJava.parse(text);
}

module.exports = parse;
