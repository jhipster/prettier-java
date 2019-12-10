// Bug Fix: #279 - See also https://prettier.io/docs/en/rationale.html#comments
class T {

  /*
   * comment
   */
  void t() {}

  /*
   * comment
   */
  void t() {}

  /*
   * comment
   */
  void t() {}

  /*
   * comment
   */
  void t() {}

  /*
      * line 1
              line 2
             */
  void t() {}

  /*

                *line 2
               */
  void t() {}
}
