const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `class Switch {

    void simple(Answer answer) {
        switch (answer) {
            case YES:
                System.out.println("YES");
                break;
            case NO:
                System.out.println("NO");
                break;
            default:
                break;
        }
    }

}
`;

  const expectedOutput = `class Switch {

  void simple(Answer answer) {
    switch (answer) {
      case YES:
        System.out.println("YES");
        break;
      case NO:
        System.out.println("NO");
        break;
      default:
        break;
    }
  }

}

`;

  it("can format switch", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
