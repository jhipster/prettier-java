const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class ImplementsInterfaces implements Interface1, Interface2 {

  @Override
  public void interface1Method() {
    System.out.println("implemented interfac1 method");
  }

  @Override
  public void interface2Method() {
    System.out.println("implemented interface2 method");
  }

}
`;

  const expectedOutput = `public class ImplementsInterfaces implements Interface1, Interface2 {

  @Override
  public void interface1Method() {
    System.out.println("implemented interfac1 method");
  }

  @Override
  public void interface2Method() {
    System.out.println("implemented interface2 method");
  }

}

`;

  it("can format implements_multiple_interfaces", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
