class IfStatements {

  void commentsIfLineComment() {
    if ( // test
    t) {
    }

    if (t // test
    ) {
    }

    if (t) {
    } // test

    if ( // test
    t) {
    }

    if (true) // comment
      System.out.println("Oops");

    if (true) {
      // comment
    }

    if (true) // comment
    {}

    if (true) // comment
    {
      System.out.println("Oops");
    }

    if (true) // comment
    {
      if (true) {}
    }

    if (true) // comment
    ;
  }

  void commentsIfBlockComment() {
    if (/* test */
    t) {
    }

    if (t/* test */
    ) {
    }

    if (t)/* test */ {
    }

    if/* test */ (t) {
    }

    if (true) /*comment*/;
  }

  void commentsElseLineComment() {
    if (t) {
    } // test
    else {
    }

    if (t) {
    } else {
    } // test
  }

  void commentsElseBlockComment() {
    if (t) {
    } /* test */ else {
    }

    if (t) {
    } else/* test */ {
    }
  }
}
