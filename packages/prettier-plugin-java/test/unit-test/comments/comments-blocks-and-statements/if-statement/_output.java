class IfStatements {

  void commentsIfLineComment() {
    if (
      // test
      t
    ) {}

    if (
      t // test
    ) {}

    if (t) {} // test

    if (
      // test
      t
    ) {}

    if (
      true // comment
    ) {
      System.out.println("Oops");
    }
  }

  void commentsIfBlockComment() {
    if (/* test */ t) {}

    if (t /* test */) {}

    if (t) /* test */ {}

    if (/* test */ t) {}
  }

  void commentsElseLineComment() {
    if (t) {}
    // test
    else {}

    if (t) {} else {} // test
  }

  void commentsElseBlockComment() {
    if (t) {} /* test */ else {}

    if (t) {} else /* test */ {}
  }
}
