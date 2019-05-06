/*eslint no-console: ["error", { allow: ["error"] }] */
"use strict";

const prettier = require("prettier");
const { expect } = require("chai");
const { readFileSync, writeFileSync } = require("fs");
const { resolve, relative } = require("path");
const klawSync = require("klaw-sync");
const { spawnSync } = require("child_process");

const pluginPath = resolve(__dirname, "../");
function testSample(testFolder, exclusive) {
  const itOrItOnly = exclusive ? it.only : it;
  const inputPath = resolve(testFolder, "_input.java");
  const expectedPath = resolve(testFolder, "_output.java");
  const relativeInputPath = relative(__dirname, inputPath);

  let inputContents;
  let expectedContents;

  before(() => {
    inputContents = readFileSync(inputPath, "utf8");
    expectedContents = readFileSync(expectedPath, "utf8");
  });

  itOrItOnly(`can format <${relativeInputPath}>`, () => {
    const actual = prettier.format(inputContents, {
      parser: "java",
      plugins: [pluginPath]
    });

    expect(actual).to.equal(expectedContents);
  });

  it(`Performs a stable formatting for <${relativeInputPath}>`, () => {
    const onePass = prettier.format(inputContents, {
      parser: "java",
      plugins: [pluginPath]
    });

    const secondPass = prettier.format(onePass, {
      parser: "java",
      plugins: [pluginPath]
    });
    expect(onePass).to.equal(secondPass);
  });
}

function testRepositorySample(testFolder, command, args, options) {
  describe(`Prettify the repository <${testFolder}>`, () => {
    const sampleFiles = klawSync(resolve(__dirname, testFolder), {
      nodir: true
    });
    const javaSampleFiles = sampleFiles.filter(fileDesc =>
      fileDesc.path.endsWith(".java")
    );

    javaSampleFiles.forEach(fileDesc => {
      it(`try to prettify ${fileDesc.path}`, () => {
        const javaFileText = readFileSync(fileDesc.path, "utf8");
        expect(() => {
          try {
            const newExpectedText = prettier.format(javaFileText, {
              parser: "java",
              plugins: [resolve(__dirname, "../")],
              tabWidth: 2
            });
            writeFileSync(fileDesc.path, newExpectedText);
          } catch (e) {
            console.error(e);
            throw e;
          }
        }).to.not.throw();
      });
    });

    it(`verify semantic validity ${testFolder}`, function(done) {
      this.timeout(0);
      const code = spawnSync(command, args, options);
      if (code.status !== 0) {
        console.error(code.stdout);
        expect.fail(
          `Cannot build ${testFolder}, please check the output above.`
        );
      }
      done();
    });
  });
}
module.exports = {
  testSample,
  testRepositorySample
};
