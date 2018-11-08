const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class ClassBodyBlock {

	static {
		
	}

	{
		
	}

}
`;

  const expectedOutput = `public class ClassBodyBlock {

  static {}

  {}

}

`;

  it("can format class_body_block", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
