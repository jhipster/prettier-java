"use strict";

const pegjsJava = require("pegjs-java");
// const pegjsJava = require("../../pegjs-java/pegjs-java");

function parse(text) {
  /*parse(text, parsers, opts)*/
  try {
    return pegjsJava.parse(text);
  } catch (error) {
    throw new Error("Line " + error.location.start.line + ": " + error.message);
  }
}

module.exports = parse;
