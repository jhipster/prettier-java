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

  void multiResourceTryWithTrailingSemi() {
    try (
      FirstResource firstResource = new FirstResource();
      SecondResource secondResource = new SecondResource();
    ) {
      return br.readLine();
    } catch (ArithmeticException | ArrayIndexOutOfBoundsException e) {
      System.out.println("Warning: Not breaking multi exceptions");
    }
  }

  void emptyBlocks() {
    try {
    } catch (Exception e) {}
    try (var a = new A()) {
    } catch (Exception e) {}
    try {
    } finally {
    }
    try (var a = new A()) {
    } finally {
    }
    try {
    } catch (Exception e) {
    } finally {
    }
    try (var a = new A()) {
    } catch (Exception e) {
    } finally {
    }
    try {
    } catch (Exception e) {
    } catch (Exception e) {
    }
    try (var a = new A()) {
    } catch (Exception e) {
    } catch (Exception e) {
    }
    try {
    } catch (Exception e) {
    } catch (Exception e) {
    } finally {
    }
    try (var a = new A()) {
    } catch (Exception e) {
    } catch (Exception e) {
    } finally {
    }
  }

  void lineComments() {
    try {
    } finally {
      // a
    } // b

    try {
    } catch (Exception b) {
      // a
    } catch (Exception c) {
      // b
    } finally {
      // c
    } // d

    try {
      // a1
      a;
    } finally {
      // a2
      // b1
      b;
    } // b2

    try {
      // a1
      a;
    } catch (Exception b) {
      // a2
      // b1
      b;
    } catch (Exception c) {
      // b2
      // c1
      c;
    } finally {
      // c2
      // d1
      d;
    } // d2
  }
}
