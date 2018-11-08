const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class HelloWorld {

  public static void main(String[] args) {
    System.out.println("Hello, World");
  }

}
`;

  const expectedOutput = `public class HelloWorld {

  public static void main(String[] args) {
    System.out.println("Hello, World");
  }

}

`;

  it("can format hello_world", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
