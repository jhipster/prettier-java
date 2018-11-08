const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class GenericExtends<BEAN extends Bean<?>> {}

public class Simple {

  public void converter(final Converter<?> converter) {}

}`;

  const expectedOutput = `public class GenericExtends<BEAN extends Bean<?>> {}

public class Simple {

  public void converter(final Converter<?> converter) {}

}

`;

  it("can format generic_questionmark", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
