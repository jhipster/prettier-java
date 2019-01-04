"use strict";
/* eslint-disable import/no-extraneous-dependencies, no-console */
const javaParserChev = require("../src/index");
const fs = require("fs-extra");
const path = require("path");
const klawSync = require("klaw-sync");

// clone repo with benchmark samples
const samplesDir = path.resolve(
  __dirname,
  "../samples/java-design-patterns/async-method-invocation/src/test/java/com/iluwatar//async//method/invocation"
);
const sampleFiles = klawSync(samplesDir, { nodir: true });
const javaSampleFiles = sampleFiles.filter(fileDesc =>
  fileDesc.path.endsWith(".java")
);
// Avoid IO affecting benchmark results by reading all the files to memory in advance.
const javaSamplesContent = javaSampleFiles.map(fileDesc => {
  return { text: fs.readFileSync(fileDesc.path, "utf8"), file: fileDesc };
});

const failFast = true;
let i = 0;
let success = 0;
const start = new Date().getTime();

for (let i = 0; i < 20; i++) {
  javaSamplesContent.forEach(sample => {
    try {
      const fileStart = new Date().getTime();
      javaParserChev.parse(sample.text);
      const fileEnd = new Date().getTime();
      console.log("file-time: " + (fileEnd - fileStart) + "ms");
      success++;
    } catch (e) {
      if (failFast === true) {
        throw e;
      }
    }
  });
}

const end = new Date().getTime();

console.log((end - start) / 1000);
