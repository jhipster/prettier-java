/* eslint no-console: 0 */
"use strict";
const path = require("path");
const klawSync = require("klaw-sync");
const _ = require("lodash");
const fs = require("fs");
const benchmark = require("benchmark");
const cp = require("child_process");
const niv = require("npm-install-version");

const version = cp
  .execSync("npm show java-parser version")
  .toString()
  .replace("\n", "");
niv.install(`java-parser@${version}`);

const npmparser = require(`java-parser@${version}`);
const currentparser = require("../../packages/java-parser/src/index");

const samplesDir = path.resolve(
  __dirname,
  "../../packages/java-parser/samples/java-design-patterns/flux"
);
const sampleFiles = klawSync(samplesDir, { nodir: true });
const javaSampleFiles = sampleFiles.filter(fileDesc =>
  fileDesc.path.endsWith(".java")
);

const javaPathAndText = _.map(javaSampleFiles, fileDesc => {
  const currJavaFileString = fs.readFileSync(fileDesc.path, "utf8");
  const relativePath = path.relative(__dirname, fileDesc.path);

  return { path: relativePath, text: currJavaFileString };
});

function benchmarkParser(parser) {
  _.forEach(javaPathAndText, javaText => {
    try {
      parser(javaText.text);
    } catch (e) {
      console.log(e);
    }
  });
}

new benchmark.Suite("Java parser benchmark", {
  onStart: () => console.log(`Java parser benchmark`),
  onCycle: event => console.log(String(event.target)),
  onComplete: function () {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  }
})
  .add(`NPM Java Parser (v${version})`, () => benchmarkParser(npmparser.parse))
  .add("Local Repository Java Parser", () =>
    benchmarkParser(currentparser.parse)
  )
  .run();
