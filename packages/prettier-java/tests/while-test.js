const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class While {

  public void simpleWhile(boolean one) {
    while (one) {
      System.out.println("one");
    }
  }

  public void doWhile(boolean one) {
    do {
      System.out.println("one");
    } while (one);
  }

}
`;

  const expectedOutput = `public class While {

  public void simpleWhile(boolean one) {
    while (one) {
      System.out.println("one");
    }
  }

  public void doWhile(boolean one) {
    do {
      System.out.println("one");
    } while (one);
  }

}

`;

  it("can format while", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
