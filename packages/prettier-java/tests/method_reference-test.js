const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class MethodReference {

  public void referenceToAStaticMethod() {
    call(ContainingClass::staticMethodName);
  }

  public referenceToAConstructor() {
    call(ClassName::new);
  }

  public referenceToAnInstanceMethodOfAnArbitraryObjectOfAParticularType() {
    call(ContainingType::methodName);
  }

  public referenceToAnInstanceMethodOfAParticularObject() {
    call(containingObject::instanceMethodName);
  }

}
`;

  const expectedOutput = `public class MethodReference {

  public void referenceToAStaticMethod() {
    call(ContainingClass::staticMethodName);
  }

  public referenceToAConstructor() {
    call(ClassName::new);
  }

  public referenceToAnInstanceMethodOfAnArbitraryObjectOfAParticularType() {
    call(ContainingType::methodName);
  }

  public referenceToAnInstanceMethodOfAParticularObject() {
    call(containingObject::instanceMethodName);
  }

}

`;

  it("can format method_reference", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
