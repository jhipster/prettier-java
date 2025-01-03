public abstract class Throws {

  void throwException1() throws RuntimeException {
    throw new RuntimeException();
  }

  void throwException2(String string) throws RuntimeException {
    throw new RuntimeException();
  }

  void throwException3(String string1, String string2, String string3) throws
    RuntimeException
  {
    throw new RuntimeException();
  }

  void throwException4() throws
    RuntimeException,
    RuntimeException,
    RuntimeException
  {
    throw new RuntimeException();
  }

  void throwException5(String string) throws
    RuntimeException,
    RuntimeException,
    RuntimeException
  {
    throw new RuntimeException();
  }

  void throwException6(String string1, String string2, String string3) throws
    RuntimeException,
    RuntimeException,
    RuntimeException
  {
    throw new RuntimeException();
  }

  void throwException7(
    String string1,
    String string2,
    String string3,
    String string4
  ) throws RuntimeException {
    throw new RuntimeException();
  }

  void throwException8(
    String string1,
    String string2,
    String string3,
    String string4
  ) throws RuntimeException, RuntimeException, RuntimeException {
    throw new RuntimeException();
  }

  void throwException9(
    String string1,
    String string2,
    String string3,
    String string4
  ) throws
    RuntimeException,
    RuntimeException,
    RuntimeException,
    RuntimeException
  {
    throw new RuntimeException();
  }

  void aVeryLongNameForAMethodWichShouldBreakTheExpression() throws
    aVeryLongException
  {}

  void aVeryLongNameForAMethodWichShouldBreakTheExpression() throws
    aVeryLongException,
    aVeryLongException
  {}

  void aVeryLongNameForAMethodWichShouldBreakTheExpression() throws
    Exception,
    Exception,
    Exception,
    Exception,
    Exception,
    Exception,
    Exception
  {}

  abstract void absThrowException1() throws RuntimeException;

  abstract void absThrowException2(String string) throws RuntimeException;

  abstract void absThrowException3(
    String string1,
    String string2,
    String string3
  ) throws RuntimeException;

  abstract void absThrowException4() throws
    RuntimeException,
    RuntimeException,
    RuntimeException;

  abstract void absThrowException5(String string) throws
    RuntimeException,
    RuntimeException,
    RuntimeException;

  abstract void absThrowException6(
    String string1,
    String string2,
    String string3
  ) throws RuntimeException, RuntimeException, RuntimeException;

  abstract void absThrowException7(
    String string1,
    String string2,
    String string3,
    String string4
  ) throws RuntimeException, RuntimeException, RuntimeException;

  abstract void absThrowException8(
    String string1,
    String string2,
    String string3,
    String string4
  ) throws
    RuntimeException,
    RuntimeException,
    RuntimeException,
    RuntimeException;

  public Throws(String string1) throws RuntimeException {
    System.out.println("Constructor with throws that should not wrap");
  }

  public Throws(String string1, String string2, String string3) throws
    RuntimeException
  {
    System.out.println("Constructor with throws that should wrap");
  }

  public Throws(
    String string1,
    String string2,
    String string3,
    String string4,
    String string5
  ) throws RuntimeException {
    System.out.println("Constructor with throws that should wrap");
  }

  public Throws(
    String string1,
    String string2,
    String string3,
    String string4,
    String string5
  ) throws
    RuntimeException,
    RuntimeException,
    RuntimeException,
    RuntimeException
  {
    System.out.println("Constructor with throws that should wrap");
  }
}

interface Example {
  void example1(String arg1, String arg2) throws
    RuntimeException,
    RuntimeException,
    RuntimeException,
    RuntimeException;

  void example2(
    String arg1,
    String arg2,
    String arg3,
    String arg4,
    String arg5,
    String arg6
  ) throws RuntimeException, RuntimeException, RuntimeException;

  void example3(
    String arg1,
    String arg2,
    String arg3,
    String arg4,
    String arg5,
    String arg6
  ) throws
    RuntimeException,
    RuntimeException,
    RuntimeException,
    RuntimeException;

  default void example1(String arg1, String arg2) throws
    RuntimeException,
    RuntimeException,
    RuntimeException,
    RuntimeException
  {
    throw new RuntimeException();
  }

  default void example2(
    String arg1,
    String arg2,
    String arg3,
    String arg4,
    String arg5,
    String arg6
  ) throws RuntimeException, RuntimeException, RuntimeException {
    throw new RuntimeException();
  }

  default void example3(
    String arg1,
    String arg2,
    String arg3,
    String arg4,
    String arg5,
    String arg6
  ) throws
    RuntimeException,
    RuntimeException,
    RuntimeException,
    RuntimeException
  {
    throw new RuntimeException();
  }
}
