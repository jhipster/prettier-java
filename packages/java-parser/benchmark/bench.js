"use strict";
/* eslint-disable import/no-extraneous-dependencies, no-console */
const Benchmark = require("benchmark");
const javaParserChev = require("../src/index");
const fs = require("fs-extra");
const path = require("path");
const klawSync = require("klaw-sync");

// clone repo with benchmark samples
const samplesDir = path.resolve(__dirname, "../samples/java-design-patterns");
const sampleFiles = klawSync(samplesDir, { nodir: true });
const javaSampleFiles = sampleFiles.filter(fileDesc =>
  fileDesc.path.endsWith(".java")
);

// Avoid IO affecting benchmark results by reading all the files to memory in advance.
const javaSamplesContent = javaSampleFiles.map(fileDesc =>
  fs.readFileSync(fileDesc.path, "utf8")
);
const suite = new Benchmark.Suite();

// The bench suite
suite
  .add("Chevrotain Based Parser", () => {
    javaSamplesContent.forEach(sampleText => javaParserChev.parse(sampleText));
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
