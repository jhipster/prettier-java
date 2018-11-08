const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `class A {}

class B {}



class C {}
`;

  const expectedOutput = `class A {}

class B {}

class C {}

`;

  it("can format multiple_classes", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
