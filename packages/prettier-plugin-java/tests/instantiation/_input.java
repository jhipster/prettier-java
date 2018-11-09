public class Instantiation {

  public void instantiation() {
    new Constructor("few", "arguments");

    new Constructor(
      "a", "really", "big", "quantity", "of", "arguments",
      new Nested("that", "have", "nested", new Nested("instantiation"), "everywhere", "!"),
      "should", "wrap"
    );
  }

}
