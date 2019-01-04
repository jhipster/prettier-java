"use strict";
/* eslint-disable import/no-extraneous-dependencies, no-console */
const javaParserChev = require("../src/index");

const input = `    private int to;`;

javaParserChev.parse(input, "classBodyDeclaration");
