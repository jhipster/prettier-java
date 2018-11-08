const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class Args {

  public void none() {}

  public void one(String one) {}

  public void three(String one, Integer two, String three) {}

  public void six(
    String one,
    Integer two,
    String three,
    Integer four,
    String six
  ) {}

}
`;

  const expectedOutput = `public class Args {

  public void none() {}

  public void one(String one) {}

  public void three(String one, Integer two, String three) {}

  public void six(
    String one,
    Integer two,
    String three,
    Integer four,
    String six
  ) {}

}

`;

  it("can format args", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
