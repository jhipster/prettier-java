// Bug Fix: #279 - See also https://prettier.io/docs/en/rationale.html#comments
class T {
  /*
                  * comment
          */
  void t() {

  }

  /*
 * comment
*/
  void t() {

  }

  /*
   * comment
   */
  void t() {

  }

               /*
   * comment
        */
  void t() {

  }

  /*
      * line 1
              line 2
             */
  void t() {

  }

    /*

                *line 2
               */
    void t() {

    }

    public static final List<Object> XXXXXXXXXXXXXXXXXX = Collections.unmodifiableList(
        Arrays.asList(// a
                      // b
                      // c
                      // d
        )
    );

    public static final List<Object> XXXXXXXXXXXXXXXXXX = Collections.unmodifiableList(
        Arrays.asList(// a
                      // b
                      // c
                      // d
        /*e*/)
    );
}
