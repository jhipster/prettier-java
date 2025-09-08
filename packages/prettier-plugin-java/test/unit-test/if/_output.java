public class If {

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

  void longIfElseChain() {
    if (1) {
      // 1
    } else if (2) {
      // 2
    } else if (3) {
      // 3
    } else if (4) {
      // 4
    } else if (5) {
      // 5
    } else if (6) {
      // 6
    } else if (7) {
      // 7
    } else if (8) {
      // 8
    } else if (9) {
      // 9
    } else if (10) {
      // 10
    } else if (11) {
      // 11
    } else if (12) {
      // 12
    } else if (13) {
      // 13
    } else if (14) {
      // 14
    } else if (15) {
      // 15
    } else if (16) {
      // 16
    } else if (17) {
      // 17
    } else if (18) {
      // 18
    } else if (19) {
      // 19
    } else if (20) {
      // 20
    }
  }
}
