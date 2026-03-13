public class PrettierIgnoreClass {
  public void myMethod(int param1, int param2, int param3, int param4, int param5, int param6, int param7, int param8, int param9, int param10) {
    // @formatter:off
    System.out.println("This operation with two very long string should not break because the formatter is off");
    // @formatter:on
    System.out.println("This operation with two very long string should break because the formatter is on");
  }
}
