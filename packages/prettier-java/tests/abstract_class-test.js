const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class ClassDeclaration {

  public void testMethod() {

      class LocalClassDeclaration {
      }

  }
  
}`;

  const expectedOutput = `public class ClassDeclaration {

  public void testMethod() {

    class LocalClassDeclaration {}

  }

}

`;

  it("can format abstract_class", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
