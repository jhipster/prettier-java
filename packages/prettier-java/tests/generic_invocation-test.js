const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class GenericInvocation {

  public void genericInvocation() {
    <Bean>doSomething();

    <Bean>doSomething2(abc, def);
  }

}
`;

  const expectedOutput = `public class GenericInvocation {

  public void genericInvocation() {
    <Bean>doSomething();

    <Bean>doSomething2(abc, def);
  }

}

`;

  it("can format generic_invocation", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
