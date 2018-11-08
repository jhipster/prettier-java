const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class ExtendsAbstractClass extends AbstractClass {

  @Override
  public void abstractMethod() {
    System.out.println("implemented abstract method");
  }

  @Override
  public int hashCode() {
    return super.hashCode();
  }

}
`;

  const expectedOutput = `public class ExtendsAbstractClass
  extends AbstractClass {

  @Override
  public void abstractMethod() {
    System.out.println("implemented abstract method");
  }

  @Override
  public int hashCode() {
    return super.hashCode();
  }

}

`;

  it("can format extends_abstract_class", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
