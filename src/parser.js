"use strict";

const japa = require("java-parser");

function parse(text) {
  /*parse(text, parsers, opts)*/
  return japa.parse(text);
}

module.exports = parse;
