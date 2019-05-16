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

  Constructors(
    boolean one,
    boolean two,
    boolean three,
    boolean four,
    boolean five,
    boolean six
  ) {
    this();
    System.out.println("constructor with six parameters that should wrap");
  }

  Constructors() {
    super(
      "lots",
      "of",
      "parameters",
      "when there is not enough space",
      "should wrap well"
    );
    System.out.println("constructor with super that wraps");
  }

  Constructors() {
    super("enough parameter", "fit");
    System.out.println("constructor with super that does not wrap");
  }

  Constructors() {
    this(
      "lots",
      "of",
      "parameters",
      "when there is not enough space",
      "should wrap well"
    );
    System.out.println("constructor with this that wraps");
  }

  Constructors() {
    this("enough parameter", "fit");
    System.out.println("constructor with this that does not wrap");
  }
}
