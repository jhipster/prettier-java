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

  void multiResourceTry() {
    try (FirstResource firstResource = new FirstResource(); SecondResource secondResource = new SecondResource()) {
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
    try {} catch (Exception e) {}
    try (var a = new A()) {} catch (Exception e) {}
    try {} finally {}
    try (var a = new A()) {} finally {}
    try {} catch (Exception e) {} finally {}
    try (var a = new A()) {} catch (Exception e) {} finally {}
    try {} catch (Exception e) {} catch (Exception e) {}
    try (var a = new A()) {} catch (Exception e) {} catch (Exception e) {}
    try {} catch (Exception e) {} catch (Exception e) {} finally {}
    try (var a = new A()) {} catch (Exception e) {} catch (Exception e) {} finally {}
  }

  void lineComments() {
    try {} // a
    finally {} // b

    try {} // a
    catch (Exception b) {} // b
    catch (Exception c) {} // c
    finally {} // d

    try { // a1
      a;
    } // a2
    finally { // b1
      b;
    } // b2

    try { // a1
      a;
    } // a2
    catch (Exception b) { // b1
      b;
    } // b2
    catch (Exception c) { // c1
      c;
    } // c2
    finally { // d1
      d;
    } // d2
  }
}
