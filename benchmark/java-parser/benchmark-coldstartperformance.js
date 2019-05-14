/* eslint no-console: 0 */
"use strict";
const benchmark = require("benchmark");
const cp = require("child_process");
const niv = require("npm-install-version");

const version = cp
  .execSync("npm show java-parser version")
  .toString()
  .replace("\n", "");
niv.install(`java-parser@${version}`);

const npmparser = require(`java-parser@${version}/src/parser`);
const currentparser = require("../../packages/java-parser/src/index");

//TODO Change this function if npm version gets cold start performance feature
function benchmarkParser(parser) {
  if (parser.initializeParser) {
    parser.initializeParser();
  } else {
    new parser();
  }
}

new benchmark.Suite("Java parser benchmark", {
  onStart: () => console.log(`Java parser benchmark`),
  onCycle: event => console.log(String(event.target)),
  onComplete: function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  }
})
  .add(`NPM Java Parser (v${version})`, () => benchmarkParser(npmparser))
  .add("Local Repository Java Parser", () => benchmarkParser(currentparser))
  .run();
