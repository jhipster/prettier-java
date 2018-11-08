const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public interface Interfaces {

	boolean isAvailable(Object propertyId);

	public static final Method METHOD = SomeStatic.findMethod();

}`;

  const expectedOutput = `public interface Interfaces {

  boolean isAvailable(Object propertyId);

  public static final Method METHOD = SomeStatic.findMethod();
}

`;

  it("can format interface", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
