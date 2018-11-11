const prettier = require("prettier");
const { expect } = require("chai");
const { readFileSync } = require("fs");
const { resolve, relative } = require("path");

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

module.exports = {
  testSample
};
