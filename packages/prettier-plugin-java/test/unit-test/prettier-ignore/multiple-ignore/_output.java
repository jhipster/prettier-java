public class PrettierIgnoreClass {
  int myInteger;

  public void myPrettierIgnoreMethod(
    int param1,
    MyClass param2,
    int param3,
    int param4,
    int param5,
    int param6,
    int param7,
    int param8,
    int param9,
    int param10
  ) {
    for (int i = 0; i < param1; i++) {
      param2
        .methodcall()
        .methodcall()
        .methodcall()
        .methodcall()
        .methodcall()
        .methodcall()
        .methodcall()
        .methodcall()
        .methodcall()
        .methodcall()
        .methodcall();
    }
  }

  // prettier-ignore
  public void myPrettierIgnoreMethod(int param1, MyClass param2, int param3, int param4, int param5, int param6, int param7, int param8, int param9, int param10) {
    for          (int i = 0; i < param1; i++)                                     {
      param2.methodcall().methodcall().methodcall().methodcall().methodcall().methodcall().methodcall().methodcall().methodcall().methodcall().methodcall();
    }    
  }
}
