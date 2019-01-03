"use strict";
/* eslint-disable import/no-extraneous-dependencies, no-console */
const Benchmark = require("benchmark");
const javaParserChev = require("../src/index");
const fs = require("fs-extra");
const path = require("path");
const klawSync = require("klaw-sync");
const JavaLexer = require("../src/lexer");

// clone repo with benchmark samples
const samplesDir = path.resolve(__dirname, "../samples/java-design-patterns");
const sampleFiles = klawSync(samplesDir, { nodir: true });
const javaSampleFiles = sampleFiles.filter(fileDesc =>
  fileDesc.path.endsWith(".java")
);

// Avoid IO affecting benchmark results by reading all the files to memory in advance.
const javaSamplesContent = javaSampleFiles.map(fileDesc => {
  return { text: fs.readFileSync(fileDesc.path, "utf8"), file: fileDesc };
});
const suite = new Benchmark.Suite();

const failFast = false;

let success = 0;
javaSamplesContent.forEach(sample => {
  try {
    console.log(sample.file.path);
    javaParserChev.parse(sample.text);
    success++;
  } catch (e) {
    if (failFast === true) {
      throw e;
    }
  }
});

const total = javaSamplesContent.length;
console.log((success / total) * 100);
