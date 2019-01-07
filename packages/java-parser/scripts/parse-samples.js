/* eslint-disable no-console */
"use strict";
const klawSync = require("klaw-sync");
const path = require("path");
const fs = require("fs");
const javaParser = require("../src/index");
const _ = require("lodash");

const options = {
  failFast: false,
  printProgress: false
};

let printProgress = _.noop;
if (options.printProgress) {
  printProgress = console.log;
}

const samplesDir = path.resolve(__dirname, "../samples/java-design-patterns");
const sampleFiles = klawSync(samplesDir, { nodir: true });
const javaSampleFiles = sampleFiles.filter(fileDesc =>
  fileDesc.path.endsWith(".java")
);

let success = 0;
let failed = 0;

const fullStartTime = new Date().getTime();
javaSampleFiles.forEach(fileDesc => {
  const currJavaFileString = fs.readFileSync(fileDesc.path, "utf8");
  const relativePath = path.relative(__dirname, fileDesc.path);
  try {
    const sampleStartTime = _.now();
    javaParser.parse(currJavaFileString);
    const sampleEndTime = _.now();
    const totalSampleTime = sampleEndTime - sampleStartTime;
    printProgress(
      `Success parsing: <${relativePath}> - <${totalSampleTime}ms>`
    );

    success++;
  } catch (e) {
    if (options.failFast) {
      throw e;
    }
    failed++;
    printProgress(`Failed parsing: <${relativePath}>`);
    printProgress(e.message);
  }
});
const fullEndTime = new Date().getTime();
const fullTotalTime = fullEndTime - fullStartTime;

const totalFiles = success + failed;
const successPercentage = ((success / totalFiles) * 100).toFixed(3);

console.log(`Total number of files: <${totalFiles}>`);
console.warn(`Total number of failures: <${failed}>`);
console.log(`Total time: <${fullTotalTime}ms>`);
console.log(`Success Percentage: ${successPercentage}%`);
