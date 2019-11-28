public static interface InterfaceWithModifiers {
  public static final String INTERFACE_CONSTANT = "abc";

  public default String interfaceDefaultMethod() {
    return INTERFACE_CONSTANT;
  }

  public static String interfaceStaticMethod() {
    return INTERFACE_CONSTANT;
  }
}

public abstract class AbstractClassWithModifiers {
  private static volatile String field;

  protected abstract synchronized String method();
}

public static final class ClassWithModifiers {
  private static final transient String CONSTANT = "abc";

  protected static final synchronized String method() {
    return CONSTANT;
  }
}
