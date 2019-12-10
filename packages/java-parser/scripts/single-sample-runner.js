/**
 * This Script is used to debug the parsing of **small** code snippets.
 */
"use strict";

const javaParserChev = require("../src/index");

const input = `
@Anno byte @Nullable ... test
`;

javaParserChev.parse(input, "variableArityParameter");
