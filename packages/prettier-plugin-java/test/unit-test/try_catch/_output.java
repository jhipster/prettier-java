public class TryCatch {

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
    } catch (
      ArithmeticException
      | ArrayIndexOutOfBoundsException
      | SomeOtherException e
    ) {
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

  void multiResourceTry() {
    try (
      FirstResource firstResource = new FirstResource();
      SecondResource secondResource = new SecondResource()
    ) {
      return br.readLine();
    } catch (ArithmeticException | ArrayIndexOutOfBoundsException e) {
      System.out.println("Warning: Not breaking multi exceptions");
    }
  }

  void catchComments() {
    try {} catch (Exception e) {
      // comment
    }

    try {} catch (
      Exception e // comment
    ) {}

    try {} catch (
      Exception e // comment
    ) {
      System.out.println("Oops");
    }

    try {} catch (
      Exception e // comment
    ) {
      if (true) {}
    }
  }

  void resourcesComments() {
    try (InputStream in = getClass().getResourceAsStream("file.txt")) {
      // comment
    }

    try (InputStream in = getClass().getResourceAsStream("file.txt")) {} // comment

    try (InputStream in = getClass().getResourceAsStream("file.txt")) { // comment
      System.out.println("Oops");
    }

    try (InputStream in = getClass().getResourceAsStream("file.txt")) { // comment
      if (true) {}
    }
  }
}
