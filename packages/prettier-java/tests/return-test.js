const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public abstract class Return {

  Object returnThis() {
    return this;
  }

  Object returnNull() {
    return null;
  }

  void exit() {
    return;
  }

  Object returnCast() {
    return (BeanItemContainer<BEANTYPE>) super.getContainerDataSource();
  }

}
`;

  const expectedOutput = `public abstract class Return {

  Object returnThis() {
    return this;
  }

  Object returnNull() {
    return null;
  }

  void exit() {
    return;
  }

  Object returnCast() {
    return (BeanItemContainer<BEANTYPE>) super.getContainerDataSource();
  }

}

`;

  it("can format return", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
