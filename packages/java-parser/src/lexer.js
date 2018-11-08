"use strict";
const chevrotain = require("chevrotain");
const { allTokens } = require("./tokens");

const Lexer = chevrotain.Lexer;

const JavaLexer = new Lexer(allTokens, { ensureOptimizations: true });

module.exports = JavaLexer;
