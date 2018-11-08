const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public interface EmptyInterface {}

public interface EmptyInterface {

}
`;

  const expectedOutput = `public interface EmptyInterface {}

public interface EmptyInterface {}

`;

  it("can format empty_interface", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
