"use strict";
/* eslint-disable import/no-extraneous-dependencies, no-console */
const Benchmark = require("benchmark");
const javaParserChev = require("../src/index");
const javaParserPeg = require("java-parser");
const fs = require("fs");
const klawSync = require("klaw-sync");
const path = require("path");

const suite = new Benchmark.Suite();
const samplesDir = path.resolve(__dirname, "../samples/jsjavaparser");

const sampleFiles = klawSync(samplesDir, { nodir: true });
const javaSampleFiles = sampleFiles.filter(fileDesc =>
  fileDesc.path.endsWith(".java")
);

const javaSamplesContent = javaSampleFiles.map(fileDesc =>
  fs.readFileSync(fileDesc.path, "utf8")
);

// add tests
suite
  .add("Chevrotain Based Parser", () => {
    try {
      javaSamplesContent.forEach(input => {
        javaParserChev.parse(input);
      });
    } catch (e) {
      console.log(e);
    }
  })
  .add("peg Based Parser", () => {
    try {
      javaSamplesContent.forEach(input => {
        javaParserPeg.parse(input);
      });
    } catch (e) {
      console.log(e);
    }
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
