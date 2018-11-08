const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class EmptyClass {}

public class EmptyClass {
    
}
`;

  const expectedOutput = `public class EmptyClass {}

public class EmptyClass {}

`;

  it("can format empty_class", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
