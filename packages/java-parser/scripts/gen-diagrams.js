/**
 * A template for generating syntax diagrams html file.
 * See: https://github.com/SAP/chevrotain/tree/master/diagrams for more details
 *
 * usage:
 * - npm install in the parent directory (parser) to install dependencies
 * - Run this in file in node.js (node gen_diagrams.js)
 * - open the "generated_diagrams.html" that will be created in this folder using
 *   your favorite browser.
 */
import path from "path";
import fs from "fs";
import * as chevrotain from "chevrotain";
import url from "url";
import JavaParser from "../src/parser.js";

// extract the serialized grammar.
const parserInstance = new JavaParser([]);
const serializedGrammar = parserInstance.getSerializedGastProductions();

// create the HTML Text
const htmlText = chevrotain.createSyntaxDiagramsCode(serializedGrammar);

// Write the HTML file to disk
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, "./");
fs.writeFileSync(outPath + "/../diagrams.html", htmlText);
