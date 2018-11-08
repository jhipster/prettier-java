const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class GenericClass<BEAN extends Comparable<BEAN>> {
  private BEAN bean;

  public GenericClass(BEAN bean) {
    this.bean = bean;
  }

  public BEAN setBean(BEAN bean) {
    this.bean = bean;
    return bean;
  }

  public <T extends Comparable<T>> T doSomething(T t) {
    return t;
  }

  public void addAll(final Collection<? extends E> c) {
		for (final E e : c) {
			add(e);
		}
  }

}
`;

  const expectedOutput = `public class GenericClass<BEAN extends Comparable<BEAN>> {
  private BEAN bean;

  public GenericClass(BEAN bean) {
    this.bean = bean;
  }

  public BEAN setBean(BEAN bean) {
    this.bean = bean;
    return bean;
  }

  public <T extends Comparable<T>> T doSomething(T t) {
    return t;
  }

  public void addAll(final Collection<? extends E> c) {
    for (final E e : c) {
      add(e);
    }
  }

}

`;

  it("can format complex_generic_class", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
