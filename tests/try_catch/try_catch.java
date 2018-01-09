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

}
