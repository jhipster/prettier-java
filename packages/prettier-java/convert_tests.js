const fs = require("fs-extra");
const path = require("path");
const prettier = require("prettier");
const klawSync = require("klaw-sync");

const files = klawSync("./tests", { nodir: true });
const javaSamples = files.filter(file => {
  return file.path.endsWith(".java");
});

javaSamples.forEach(sample => {
  const testName = /(\w+)\.java$/.exec(sample.path)[1];
  const input = fs.readFileSync(sample.path, "utf8");
  const expected = prettier.format(input, {
    parser: "java",
    plugins: ["."]
  });

  const mochaTestContents = `
  const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = \`${input}\`;

  const expectedOutput = \`${expected}\`;

  it("can format ${testName}", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
  `;

  const mochaTestPath = `./new_tests/${testName}-test.js`;

  fs.outputFileSync(mochaTestPath, mochaTestContents);
});
