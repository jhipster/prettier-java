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

  itOrItOnly(`can format <${relativeInputPath}>`, () => {
    const inputContents = readFileSync(inputPath, "utf8");
    const expectedContents = readFileSync(expectedPath, "utf8");
    const actual = prettier.format(inputContents, {
      parser: "java",
      plugins: [pluginPath]
    });

    expect(actual).to.equal(expectedContents);
  });

  // it(`Won't cause any semantic change when formatting <${sampleName}>`, () => {
  //   // TODO: TBD evaluate if this can be implemented.
  // });
}

module.exports = {
  testSample
};
