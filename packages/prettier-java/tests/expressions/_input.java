public class Expressions {

  public void equals(int i) {
    if (i == 1) {
      System.out.println("i equals 1");
    }
  }

  public void unequals(int i) {
    if (i != 1) {
      System.out.println("i equals 1");
    }
  }

  public void equalsComplex(String str) {
    if (str.equals("String")) {
      System.out.println("string equals String");
    }
  }

  public void greater(int i) {
    if (i > 1) {
      System.out.println("i greater 1");
    }
  }

  public void less(int i) {
    if (i < 1) {
      System.out.println("i less 1");
    }
  }

  public void greaterEquals(int i) {
    if (i >= 1) {
      System.out.println("i greater/equals 1");
    }
  }

  public void lessEquals(int i) {
    if (i <= 1) {
      System.out.println("i less/equals 1");
    }
  }

  public void and() {
    if (true && true) {
      System.out.println("and");
    }
  }

  public void or() {
    if (true || false) {
      System.out.println("or");
    }
  }

  public void not() {
    if (!false) {
      System.out.println("not");
    }
  }

  public void parenthesized() {
    if (true && (false || true)) {
      System.out.println("parenthesized");
    }
  }

  public void instanceOf() {
    if (var instanceof Object) {
      System.out.println("instanceOf");
    }
  }

}

