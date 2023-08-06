public class While {

  public void simpleWhile(boolean one) {
    while (one) {
      System.out.println("one");
    }
  }

  public void doWhile(boolean one) {
    do {
      System.out.println("one");
    } while (one);
  }

  void whileLineComments() {
    while (true) // comment
      System.out.println("Oops");

    while (true) throw new RuntimeException();

    while (true) {
      // comment
    }

    while (true) // comment
    {}

    while (true) // comment
    {
      System.out.println("Oops");
    }

    while (
      true // test
    ) // comment
    {
      if (true) {}
    }

    while (true) // comment
    ;
  }

  void whileBlockComments() {
    while (true) /*comment*/;
  }

  void doWhileLineComments() {
    do {
      // comment
    } while (true);

    do // comment
    {} while (true);

    do // comment
    {
      System.out.println("Oops");
    } while (true);

    do // comment
    {
      if (true) {}
    } while (true);

    do {} while (true) // comment
    ;

    do {
      System.out.println("Oops");
    } while (true) // comment
    ;

    do {
      if (true) {}
    } while (true) // comment
    ;
  }

  void doWhileBlockComments() {
    do {} while (true) /*comment*/;
  }
}
