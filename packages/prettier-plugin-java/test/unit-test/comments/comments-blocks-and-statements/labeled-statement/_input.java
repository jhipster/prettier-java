class LabeledStatements {

  void commentsLabeledStatementLineComment() {
    loop: // Label statement

    // comment1
    for (int num : arr) {
    }

    loop: // Label statement
    // comment1
    // comment2
    for (int num : arr) {
    }

    // Label statement
    loop:
    // comment1
    // comment2
    for (int num : arr) {
    }

    loop:
    // comment1
    // comment2
    for (int num : arr) {
    }

    loop:
    // comment1
    for (int num : arr) {
    }

    loop: // comment1
    for (int num : arr) {
    }

    loop:
    for (int num : arr) {
    }
  }

  void commentsLabeledStatementBlockComment() {
    loop: /* Label statement */

    /* comment1 */
    for (int num : arr) {
    }

    loop: /* Label statement */
    /* comment1 */
    /* comment2 */
    for (int num : arr) {
    }

    /* Label statement */
    loop:
    /* comment1 */
    /* comment2 */
    for (int num : arr) {
    }

    loop:
    /* comment1 */
    /* comment2 */
    for (int num : arr) {
    }

    loop:
    /* comment1 */
    for (int num : arr) {
    }

    loop: /* comment1 */
    for (int num : arr) {
    }

    loop: for (int num : arr) {
    }
  }

  void commentsLabeledStatementMixedComment() {
    loop: // Label statement

    /* comment1 */
    for (int num : arr) {
    }

    loop: /* Label statement */

    // comment1
    for (int num : arr) {
    }

    loop: /* Label statement */
    // comment1
    // comment2
    for (int num : arr) {
    }

    loop: // Label statement
    /* comment1 */
    // comment2
    for (int num : arr) {
    }

    loop: // Label statement
    // comment1
    /* comment2 */
    for (int num : arr) {
    }

    loop: /* Label statement */
    // comment1
    /* comment2 */
    for (int num : arr) {
    }

    loop: // Label statement
    /* comment1 */
    /* comment2 */
    for (int num : arr) {
    }

    loop: /* Label statement */
    /* comment1 */
    // comment2
    for (int num : arr) {
    }

    loop:
    // comment1
    /* comment2 */
    for (int num : arr) {
    }

    oop:
    /* comment1 */
    // comment2
    for (int num : arr) {
    }
  }
}

