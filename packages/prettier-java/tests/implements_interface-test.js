const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class ImplementsInterface implements Interface {

  @Override
  public void interfaceMethod() {
    System.out.println("implemented interface method");
  }

}
`;

  const expectedOutput = `public class ImplementsInterface implements Interface {

  @Override
  public void interfaceMethod() {
    System.out.println("implemented interface method");
  }

}

`;

  it("can format implements_interface", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
