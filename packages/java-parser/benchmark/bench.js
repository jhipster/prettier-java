"use strict";
/* eslint-disable import/no-extraneous-dependencies, no-console */
const Benchmark = require("benchmark");
const javaParserChev = require("../src/index");
const fs = require("fs-extra");
const path = require("path");
const cp = require("child_process");

// clone repo with benchmark samples
const samplesDir = path.resolve(__dirname, "../samples");
fs.emptyDirSync(path.resolve(samplesDir, "jsjavaparser"));
fs.emptyDirSync(samplesDir);
cp.execSync(
  `git clone https://github.com/mazko/jsjavaparser.git --branch master --depth 1`,
  {
    cwd: samplesDir,
    stdio: [0, 1, 2]
  }
);

const suite = new Benchmark.Suite();
const samplePath = path.resolve(
  __dirname,
  "../samples/jsjavaparser/tools/EclipseAST/Indenter.java"
);

// Clone repository that contains the samples for benching.
const sampleContent = fs.readFileSync(samplePath, "utf8");

// The bench suite
suite
  .add("Chevrotain Based Parser", () => {
    javaParserChev.parse(sampleContent);
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
