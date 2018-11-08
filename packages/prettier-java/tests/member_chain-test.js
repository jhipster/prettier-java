const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class BreakLongFunctionCall {

	public void doSomething() {
		return new Object().something().more();
	}

	public void doSomethingLongNew() {
		return something().more().and().that().as().well().but().not().something().something();
	}
	
	public void doSomethingLongNew2() {
		return new Object().something().more().and().that().as().well().but().not().something();
	}
	
	public void doSomethingLongStatic() {
		return Object.something().more().and().that().as().well().but().not().something();
  }

}
`;

  const expectedOutput = `public class BreakLongFunctionCall {

  public void doSomething() {
    return new Object().something().more();
  }

  public void doSomethingLongNew() {
    return something().more().and().that().as().well().but().not().something(

    ).something();
  }

  public void doSomethingLongNew2() {
    return new Object().something().more().and().that().as().well().but().not(

    ).something();
  }

  public void doSomethingLongStatic() {
    return Object.something().more().and().that().as().well().but().not(

    ).something();
  }

}

`;

  it("can format member_chain", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
