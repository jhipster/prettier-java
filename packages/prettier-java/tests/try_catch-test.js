const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public class TryCatch {

  void tryFinally() {
    try {
      System.out.println("Try something");
    } finally {
      System.out.println("Finally do something");
    }
  }

  void tryCatch() {
    try {
      System.out.println("Try something");
    } catch (ArithmeticException e) {
      System.out.println("Warning: ArithmeticException");
    } catch (ArrayIndexOutOfBoundsException e) {
      System.out.println("Warning: ArrayIndexOutOfBoundsException");
    } catch (Exception e) {
      System.out.println("Warning: Some Other exception");
    }
  }

  void tryCatchFinally() {
    try {
      System.out.println("Try something");
    } catch (ArithmeticException e) {
      System.out.println("Warning: ArithmeticException");
    } catch (ArrayIndexOutOfBoundsException e) {
      System.out.println("Warning: ArrayIndexOutOfBoundsException");
    } catch (Exception e) {
      System.out.println("Warning: Some Other exception");
    } finally {
      System.out.println("Finally do something");
    }
  }

  void tryMultiCatchFinally() {
    try {
      System.out.println("Try something");
    } catch (ArithmeticException | ArrayIndexOutOfBoundsException e) {
      System.out.println("Warning: Not breaking multi exceptions");
    } catch (ArithmeticException | ArrayIndexOutOfBoundsException | SomeOtherException e) {
      System.out.println("Warning: Breaking multi exceptions");
    } finally {
      System.out.println("Finally do something");
    }
  }

  void resourceTry() {
    try (Resource r = new Resource()) {
        return br.readLine();
    } catch (ArithmeticException | ArrayIndexOutOfBoundsException e) {
      System.out.println("Warning: Not breaking multi exceptions");
    }
  }

}
`;

  const expectedOutput = `public class TryCatch {

  void tryFinally() {
    try {
      System.out.println("Try something");
    } finally {
      System.out.println("Finally do something");
    }
  }

  void tryCatch() {
    try {
      System.out.println("Try something");
    } catch(ArithmeticException e) {
      System.out.println("Warning: ArithmeticException");
    } catch(ArrayIndexOutOfBoundsException e) {
      System.out.println("Warning: ArrayIndexOutOfBoundsException");
    } catch(Exception e) {
      System.out.println("Warning: Some Other exception");
    }
  }

  void tryCatchFinally() {
    try {
      System.out.println("Try something");
    } catch(ArithmeticException e) {
      System.out.println("Warning: ArithmeticException");
    } catch(ArrayIndexOutOfBoundsException e) {
      System.out.println("Warning: ArrayIndexOutOfBoundsException");
    } catch(Exception e) {
      System.out.println("Warning: Some Other exception");
    } finally {
      System.out.println("Finally do something");
    }
  }

  void tryMultiCatchFinally() {
    try {
      System.out.println("Try something");
    } catch(ArithmeticException | ArrayIndexOutOfBoundsException e) {
      System.out.println("Warning: Not breaking multi exceptions");
    } catch(
      ArithmeticException |
      ArrayIndexOutOfBoundsException |
      SomeOtherException e
    ) {
      System.out.println("Warning: Breaking multi exceptions");
    } finally {
      System.out.println("Finally do something");
    }
  }

  void resourceTry() {
    try (Resource r = new Resource()){
      return br.readLine();
    } catch(ArithmeticException | ArrayIndexOutOfBoundsException e) {
      System.out.println("Warning: Not breaking multi exceptions");
    }
  }

}

`;

  it("can format try_catch", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
