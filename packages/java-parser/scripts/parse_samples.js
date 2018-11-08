/* eslint-disable no-console */
"use strict";
const klawSync = require("klaw-sync");
const path = require("path");
const fs = require("fs");
const javaParser = require("../src/index");

const samplesDir = path.resolve(__dirname, "../samples");

const sampleFiles = klawSync(samplesDir, { nodir: true });
const javaSampleFiles = sampleFiles.filter(fileDesc =>
  fileDesc.path.endsWith(".java")
);

let success = 0;
let failed = 0;
javaSampleFiles.forEach(fileDesc => {
  const currJavaFileString = fs.readFileSync(fileDesc.path, "utf8");

  try {
    // console.log(`parsing <${fileDesc.path}>`);
    javaParser.parse(currJavaFileString);
    success++;
  } catch (e) {
    failed++;
    console.log(`Failed parsing: <${fileDesc.path}>`);
    console.log(e.message);
  }
});

const totalFiles = success + failed;
const successPercentage = Math.floor((success / totalFiles) * 100);

console.log(`Total number of files: <${totalFiles}>`);
console.log(`Success Percentage: ${successPercentage}%`);
