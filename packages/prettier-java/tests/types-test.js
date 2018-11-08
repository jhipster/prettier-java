const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class Types {

  public void primitiveTypes() {
    byte byteVariable;
    short shortVariable;
    int intVariable;
    long longVariable;
    float floatVariable;
    double doubleVariable;
    char charVariable;
    boolean booleanVariable;
  }

  public void dataTypes() {
    Byte byteVariable;
    Short shortVariable;
    Integer intVariable;
    Long longVariable;
    Float floatVariable;
    Double doubleVariable;
    Char charVariable;
    Boolean booleanVariable;
    String stringVariable;
  }

}
`;

  const expectedOutput = `public class Types {

  public void primitiveTypes() {
    byte byteVariable;
    short shortVariable;
    int intVariable;
    long longVariable;
    float floatVariable;
    double doubleVariable;
    char charVariable;
    boolean booleanVariable;
  }

  public void dataTypes() {
    Byte byteVariable;
    Short shortVariable;
    Integer intVariable;
    Long longVariable;
    Float floatVariable;
    Double doubleVariable;
    Char charVariable;
    Boolean booleanVariable;
    String stringVariable;
  }

}

`;

  it("can format types", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
