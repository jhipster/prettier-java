public abstract class Throws {

  void throwException1() throws RuntimeException {
    throw new RuntimeException();
  }

  void throwException2(String string) throws RuntimeException {
    throw new RuntimeException();
  }

  void throwException3(String string1, String string2, String string3)
    throws RuntimeException {
    throw new RuntimeException();
  }

  void throwException4()
    throws RuntimeException, RuntimeException, RuntimeException {
    throw new RuntimeException();
  }

  void throwException5(String string)
    throws RuntimeException, RuntimeException, RuntimeException {
    throw new RuntimeException();
  }

  void throwException6(String string1, String string2, String string3)
    throws RuntimeException, RuntimeException, RuntimeException {
    throw new RuntimeException();
  }

  abstract void absThrowException1() throws RuntimeException;

  abstract void absThrowException2(String string) throws RuntimeException;

  abstract void absThrowException3(
    String string1,
    String string2,
    String string3
  )
    throws RuntimeException;

  abstract void absThrowException4()
    throws RuntimeException, RuntimeException, RuntimeException;

  abstract void absThrowException5(String string)
    throws RuntimeException, RuntimeException, RuntimeException;

  abstract void absThrowException6(
    String string1,
    String string2,
    String string3
  )
    throws RuntimeException, RuntimeException, RuntimeException;

  public Throws(String string1) throws RuntimeException {
    System.out.println("Constructor with throws that should not wrap");
  }

  public Throws(String string1, String string2, String string3)
    throws RuntimeException {
    System.out.println("Constructor with throws that should wrap");
  }
}
