const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class Lambda {

  public void singleArgumentWithParens() {
    call((x) -> {
      System.out.println(x);
      System.out.println(x);
    });
  }

  public void singleArgumentWithoutParens() {
    call(x -> {
      System.out.println(x);
      System.out.println(x);
    });
  }

  public void multiArguments() {
    call((x, y) -> {
      System.out.println(x);
      System.out.println(y);
    });
  }

  public void multiParameters() {
    call((Object x, final String y) -> {
      System.out.println(x);
      System.out.println(y);
    });
  }

  public void emptyArguments() {
    call(() -> {
      System.out.println();
      System.out.println();
    });
  }

  public void onlyOneMethodInBodyWithCurlyBraces() {
    call(x -> {
      System.out.println(x);
    });
  }

  public void onlyOneMethodInBody() {
    call(x -> System.out.println(x));
  }

}
`;

  const expectedOutput = `public class Lambda {

  public void singleArgumentWithParens() {
    call(
      x -> {
        System.out.println(x);
        System.out.println(x);
      }
    );
  }

  public void singleArgumentWithoutParens() {
    call(
      x -> {
        System.out.println(x);
        System.out.println(x);
      }
    );
  }

  public void multiArguments() {
    call(
      (x, y) -> {
        System.out.println(x);
        System.out.println(y);
      }
    );
  }

  public void multiParameters() {
    call(
      (Object x, final String y) -> {
        System.out.println(x);
        System.out.println(y);
      }
    );
  }

  public void emptyArguments() {
    call(
      () -> {
        System.out.println();
        System.out.println();
      }
    );
  }

  public void onlyOneMethodInBodyWithCurlyBraces() {
    call(
      x -> {
        System.out.println(x);
      }
    );
  }

  public void onlyOneMethodInBody() {
    call(x -> System.out.println(x));
  }

}

`;

  it("can format lambda", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
