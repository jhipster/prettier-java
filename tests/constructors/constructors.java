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

}
