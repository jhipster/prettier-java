"use strict";
/* eslint-disable import/no-extraneous-dependencies, no-console */
const Benchmark = require("benchmark");
const javaParserChev = require("../src/index");
const javaParserChevOld = require("../../java-parser");
const fs = require("fs-extra");
const path = require("path");
const klawSync = require("klaw-sync");
const JavaLexer = require("../src/lexer");

// clone repo with benchmark samples
const samplesDir = path.resolve(
  __dirname,
  "../samples/java-design-patterns/visitor"
);
const sampleFiles = klawSync(samplesDir, { nodir: true });
const javaSampleFiles = sampleFiles.filter(fileDesc =>
  fileDesc.path.endsWith(".java")
);

// Avoid IO affecting benchmark results by reading all the files to memory in advance.
const javaSamplesContent = javaSampleFiles.map(fileDesc => {
  return { text: fs.readFileSync(fileDesc.path, "utf8"), file: fileDesc };
});

const suite = new Benchmark.Suite();
suite
  .add("Lex Only", () => {
    javaSamplesContent.forEach(sample => JavaLexer.tokenize(sample.text));
  })
  .add("Full Flow - old", () => {
    javaSamplesContent.forEach(sample => {
      javaParserChevOld.parse(sample.text);
    });
  })
  .add("Full Flow - new", () => {
    javaSamplesContent.forEach(sample => {
      javaParserChev.parse(sample.text);
    });
  })
  // add listeners
  .on("cycle", event => {
    console.log(String(event.target));
  })
  .on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  // run async
  .run({ async: true });
