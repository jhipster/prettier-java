/* eslint-disable no-useless-escape */

const prettier = require("prettier");
const { expect } = require("chai");
describe("prettier-java", () => {
  const input = `public class CharLiteral {

  final char singleQuote = '\'';
  
  final char backslash = '\\';
  
}`;

  const expectedOutput = `public class CharLiteral {
  final char singleQuote = '\\'';

  final char backslash = '\\\\';
}

`;

  it("can format char_literal", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
