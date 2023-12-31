public class For {

  public void simpleFor(String[] array) {
    for (int i = 0; i < array.length; i++) {
      System.out.println(array[i]);
    }
  }

  public void emptyFor(String[] array) {
    for (;;) {
      System.out.println(array[i]);
    }
  }

  public void forEach(List<String> list) {
    for (String str : list) {
      System.out.println(str);
    }
  }

  public void continueSimple() {
    for (int i = 0; i < 10; i++) {
      if (i % 2 == 0) {
        continue;
      }
      System.out.println(i);
    }
  }

  public void continueWithIdentifier() {
    for (int i = 0; i < 10; i++) {
      if (i % 2 == 0) {
        continue id;
      }
      System.out.println(i);
    }
  }

  void basicLineComments() {
    for (
      int i = 0;
      i < 1;
      i++ // comment
    )
      System.out.println("Oops");

    for (int i = 0; i < 1; i++) {
      // comment
    }

    for (
      int i = 0; //comment
      ;

    );

    for (
      int i = 0;
      i < 1; // comment

    ) {}

    // comment
    for (;;) {}

    for (
      ;
      i < 1; // comment

    ) {}

    for (
      ;
      ;
      i++ // comment
    ) {}

    for (
      int i = 0;
      i < 1;
      i++ // hi
      // comment
    ) {
      System.out.println("Oops");
    }

    for (
      int i = 0;
      i < 1;
      i++ // comment
    ) {
      if (true) {}
    }
  }

  void basicBlockComments() {
    /*comment*/
    for (;;);

    for (int i = 0; i < 1; i++/*comment*/);
  }

  void eachLineComments() {
    for (String s : strings)
      // comment
      System.out.println("Oops");

    for (String s : strings) {
      // comment
    }

    for (String s : strings) {
      // comment
    }

    for (String s : strings) {} // comment

    for (String s : strings) {
      // comment
      System.out.println("Oops");
    }

    for (String s : strings) {
      // comment
      if (true) {}
    }
  }

  void eachBlockComments() {
    for (String s : strings/*comment*/);
  }
}
