/* eslint-disable import/no-extraneous-dependencies, no-console */
/**
 * This Script is used to debug the parsing of **small** code snippets.
 */
"use strict";

const javaParserChev = require("../src/index");

const input = `  @RequestMapping("/product")
  public Void put(String key, Object value) {
    properties.put(key, value);
    return null;
  }`;

javaParserChev.parse(input, "classBodyDeclaration");
