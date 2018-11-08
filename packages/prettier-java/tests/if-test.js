const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class If {

  public void simpleIf(boolean one) {
    if (one) {
      System.out.println("one");
    }
  }

  public void ifElse(boolean one) {
    if (one) {
      System.out.println("one");
    } else {
      System.out.println("not one");
    }
  }

  public boolean shortIfElse(boolean one) {
    return one ? true : false;
  }

  public void ifElseIfElse(boolean one, boolean two) {
    if (one) {
      System.out.println("one");
    } else if (two) {
      System.out.println("two");
    } else {
      System.out.println("not on or two");
    }
  }

  public void ifElseIfElseIfElse(boolean one, boolean two, boolean three) {
    if (one) {
      System.out.println("one");
    } else if (two) {
      System.out.println("two");
    } else if (three) {
      System.out.println("three");
    } else {
      System.out.println("not on or two or three");
    }
  }

}
`;

  const expectedOutput = `public class If {

  public void simpleIf(boolean one) {
    if (one) {
      System.out.println("one");
    }
  }

  public void ifElse(boolean one) {
    if (one) {
      System.out.println("one");
    } else {
      System.out.println("not one");
    }
  }

  public boolean shortIfElse(boolean one) {
    return one ? true : false;
  }

  public void ifElseIfElse(boolean one, boolean two) {
    if (one) {
      System.out.println("one");
    } else if (two) {
      System.out.println("two");
    } else {
      System.out.println("not on or two");
    }
  }

  public void ifElseIfElseIfElse(boolean one, boolean two, boolean three) {
    if (one) {
      System.out.println("one");
    } else if (two) {
      System.out.println("two");
    } else if (three) {
      System.out.println("three");
    } else {
      System.out.println("not on or two or three");
    }
  }

}

`;

  it("can format if", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
