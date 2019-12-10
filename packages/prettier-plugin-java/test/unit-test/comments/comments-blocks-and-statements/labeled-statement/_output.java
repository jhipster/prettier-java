class LabeledStatements {

  void commentsLabeledStatementLineComment() {
    // Label statement
    // comment1
    loop:for (int num : arr) {}

    // Label statement
    // comment1
    // comment2
    loop:for (int num : arr) {}

    // Label statement
    // comment1
    // comment2
    loop:for (int num : arr) {}

    // comment1
    // comment2
    loop:for (int num : arr) {}

    // comment1
    loop:for (int num : arr) {}

    // comment1
    loop:for (int num : arr) {}

    loop:for (int num : arr) {}
  }

  void commentsLabeledStatementBlockComment() {
    /* Label statement */
    /* comment1 */
    loop:for (int num : arr) {}

    /* Label statement */
    /* comment1 */
    /* comment2 */
    loop:for (int num : arr) {}

    /* Label statement */
    /* comment1 */
    /* comment2 */
    loop:for (int num : arr) {}

    /* comment1 */
    /* comment2 */
    loop:for (int num : arr) {}

    /* comment1 */
    loop:for (int num : arr) {}

    /* comment1 */
    loop:for (int num : arr) {}

    loop:for (int num : arr) {}
  }

  void commentsLabeledStatementMixedComment() {
    // Label statement
    /* comment1 */
    loop:for (int num : arr) {}

    /* Label statement */
    // comment1
    loop:for (int num : arr) {}

    /* Label statement */
    // comment1
    // comment2
    loop:for (int num : arr) {}

    // Label statement
    /* comment1 */
    // comment2
    loop:for (int num : arr) {}

    // Label statement
    // comment1
    /* comment2 */
    loop:for (int num : arr) {}

    /* Label statement */
    // comment1
    /* comment2 */
    loop:for (int num : arr) {}

    // Label statement
    /* comment1 */
    /* comment2 */
    loop:for (int num : arr) {}

    /* Label statement */
    /* comment1 */
    // comment2
    loop:for (int num : arr) {}

    // comment1
    /* comment2 */
    loop:for (int num : arr) {}

    /* comment1 */
    // comment2
    oop:for (int num : arr) {}
  }
}
