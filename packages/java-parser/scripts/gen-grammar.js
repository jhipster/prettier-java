/* eslint no-console: 0 */
"use strict";

const fs_extra = require("fs-extra");
const fs = require("fs");
const path = require("path");
const JavaParser = require("../src/parser");

const grammarDir = path.resolve(__dirname, "../src/gen");
fs_extra.emptyDirSync(grammarDir);
const parser = new JavaParser();
const grammar = parser.getSerializedGastProductions();
try { 
    fs.writeFileSync(
        path.join(grammarDir, "/grammar.json"),
        JSON.stringify(grammar, null , 2)
    );
} catch (error) {
    throw Error("An error has occured : " + error)
}