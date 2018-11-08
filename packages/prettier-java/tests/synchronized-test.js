const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `class Synchronized {
    void doSomething() {
        synchronized (this.var) {
            doSynchronized();
        }
    }
}`;

  const expectedOutput = `class Synchronized {

  void doSomething() {
    synchronized (this.var) {
      doSynchronized();
    }
  }

}

`;

  it("can format synchronized", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
