/* eslint-disable no-console */
"use strict";
const klawSync = require("klaw-sync");
const path = require("path");
const fs = require("fs");
const prettier = require("prettier");

const samplesDir = path.resolve(__dirname, "./single-printer-run");

const sampleFiles = klawSync(samplesDir, { nodir: true });
const javaSampleFiles = sampleFiles.filter(fileDesc =>
  fileDesc.path.endsWith("input.java")
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
    const outputFilePath = fileDesc.path.replace(/input.java$/, "output.java");
    console.log(`writing <${outputFilePath}>`);
    fs.writeFileSync(outputFilePath, newExpectedText);
  } catch (e) {
    failures++;
    console.log(`Failed parsing: <${fileDesc.path}>`);
    console.log(e.message);
  }
});

if (failures > 0) {
  process.exit(1);
}
