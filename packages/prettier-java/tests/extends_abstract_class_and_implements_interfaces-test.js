const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class ExtendsAbstractClassAndImplementsInterfaces extends AbstractClass implements Interface1, Interface2, Interface3, Interface4 {

  @Override
  public void abstractMethod() {
    System.out.println("implemented abstract method");
  }

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

  const expectedOutput = `public class ExtendsAbstractClassAndImplementsInterfaces
  extends AbstractClass
  implements
    Interface1,
    Interface2,
    Interface3,
    Interface4 {

  @Override
  public void abstractMethod() {
    System.out.println("implemented abstract method");
  }

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

  it("can format extends_abstract_class_and_implements_interfaces", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
