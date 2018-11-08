const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class Methods {

  public static void main(String[] args) {
  }

  void noParameters() {
  }

  void oneParameters(String str1) {
  }

  void breakingParameters(String str1, String str2, String str3, String str4, String str5) {
  }

  void lastParameterDotDotDot(String str1, String... str2) {
  }

}
`;

  const expectedOutput = `public class Methods {

  public static void main(String[] args) {}

  void noParameters() {}

  void oneParameters(String str1) {}

  void breakingParameters(
    String str1,
    String str2,
    String str3,
    String str4,
    String str5
  ) {}

  void lastParameterDotDotDot(String str1, String... str2) {}

}

`;

  it("can format methods", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
