const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class Instantiation {

  public void instantiation() {
    new Constructor("few", "arguments");

    new Constructor(
      "a", "really", "big", "quantity", "of", "arguments",
      new Nested("that", "have", "nested", new Nested("instantiation"), "everywhere", "!"),
      "should", "wrap"
    );
  }

}
`;

  const expectedOutput = `public class Instantiation {

  public void instantiation() {
    new Constructor("few", "arguments");

    new Constructor(
      "a",
      "really",
      "big",
      "quantity",
      "of",
      "arguments",
      new Nested(
        "that",
        "have",
        "nested",
        new Nested("instantiation"),
        "everywhere",
        "!"
      ),
      "should",
      "wrap"
    );
  }

}

`;

  it("can format instantiation", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
