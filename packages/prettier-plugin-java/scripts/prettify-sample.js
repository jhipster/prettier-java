/* eslint-disable no-console */
"use strict";
const klawSync = require("klaw-sync");
const path = require("path");
const fs = require("fs");
const prettier = require("prettier");

const write = process.argv.indexOf("--write");

if (process.argv.length < 3) {
  console.log("node prettify-samples <path> [--write]");
  process.exit(1);
}
const samplesDir = process.argv[2];
const sampleFiles = klawSync(samplesDir, { nodir: true });
const javaSampleFiles = sampleFiles.filter(fileDesc =>
  fileDesc.path.endsWith(".java")
);

let failures = 0;

javaSampleFiles.forEach(fileDesc => {
  const javaFileText = fs.readFileSync(fileDesc.path, "utf8");

  try {
    console.log(`Reading <${fileDesc.path}>`);
    const newExpectedText = prettier.format(javaFileText, {
      parser: "java",
      plugins: [path.resolve(__dirname, "../")],
      tabWidth: 2
    });
    if (write !== -1) {
      console.log(`writing <${fileDesc.path}>`);
      fs.writeFileSync(fileDesc.path, newExpectedText);
    } else {
      console.log(newExpectedText);
    }
  } catch (e) {
    failures++;
    console.log(`Failed parsing: <${fileDesc.path}>`);
    console.log(e);
    process.exit(1);
  }
});

if (failures > 0) {
  process.exit(1);
}
