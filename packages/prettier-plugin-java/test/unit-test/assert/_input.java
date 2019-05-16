public class Assert {

  public void assertBooleanExpression(String myVar) {
    assert (myVar != null);
  }

  public void assertValueExpression(String myVar) {
    assert (myVar != null) : "text";
  }

}