public class BlankLines {
  public int i = 1;
  public int j = 2;

  public int k = 3;
  public int l = 4;

  public int m = 4;

  public Constructors() {
    this(true);
    System.out.println("empty constructor");
  }

  public void shouldAddLineBefore() {
    System.out.println("Should add empty line before method");
  }

  public void shouldAddOnlyOneLineBefore() {
    System.out.println(
      "Should add only one empty line between the two methods"
    );
  }

  private C c;

  public void shouldAlsoAddOnlyOneLineBefore() {
    System.out.println(
      "Should add only one empty line between the two class statement"
    );
  }

  public void shouldHandleBlankLinesInBlock() {
    int i = 1;
    int j = 2;

    int k = 3;
    int l = 4;

    int m = 4;

    // Add a line before comment
    int n = 4;
    for (int p = 0; p < 3; p++);
  }
}
