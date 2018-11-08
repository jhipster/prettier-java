const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class Assert {

  public void assertBooleanExpression(String myVar) {
    assert (myVar != null);
  }

  public void assertValueExpression(String myVar) {
    assert (myVar != null) : "text";
  }

}`;

  const expectedOutput = `public class Assert {

  public void assertBooleanExpression(String myVar) {
    assert myVar != null;
  }

  public void assertValueExpression(String myVar) {
    assert myVar != null : "text";
  }

}

`;

  it("can format assert", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
