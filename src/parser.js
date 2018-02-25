"use strict";

// const chevrotainJava = require("pegjs-java");
const chevrotainJava = require("../../chevrotain-java/src/index");

function parse(text) {
  /*parse(text, parsers, opts)*/
  // try {
  return chevrotainJava.parse(text);
  // } catch (error) {
  //   throw new Error("Line " + error.location.start.line + ": " + error.message);
  // }
}

module.exports = parse;
