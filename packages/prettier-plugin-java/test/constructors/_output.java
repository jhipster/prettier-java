public class Constructors {

  public Constructors() {
    this(true);
    System.out.println("empty constructor");
  }

  Constructors(boolean one) {
    super();
    System.out.println("constructor with boolean " + one);
  }

  Constructors(boolean one, boolean two) {
    this();
    System.out.println("constructor with boolean " + one + " and " + two);
  }

  Constructors() {
    super("enough parameter", "fit");
    System.out.println("constructor with super that does not wrap");
  }

  Constructors() {
    this("enough parameter", "fit");
    System.out.println("constructor with this that does not wrap");
  }
}
