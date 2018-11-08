const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class EmptyMethod {

  public static void main(String[] args) {
  }

  void small() {
  }

}
`;

  const expectedOutput = `public class EmptyMethod {

  public static void main(String[] args) {}

  void small() {}

}

`;

  it("can format empty_method", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
