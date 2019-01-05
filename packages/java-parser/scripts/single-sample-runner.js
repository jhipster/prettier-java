/* eslint-disable import/no-extraneous-dependencies, no-console */
/**
 * This Script is used to debug the parsing of **small** code snippets.
 */
"use strict";

const javaParserChev = require("../src/index");

const input = `private int to;`;

javaParserChev.parse(input, "classBodyDeclaration");
