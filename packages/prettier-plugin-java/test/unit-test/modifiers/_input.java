static public interface InterfaceWithModifiers {
  static final public String INTERFACE_CONSTANT = "abc";

  default public String interfaceDefaultMethod() {
    return INTERFACE_CONSTANT;
  }

  static public String interfaceStaticMethod() {
    return INTERFACE_CONSTANT;
  }
}

abstract public class AbstractClassWithModifiers {
  volatile private static String field;

  abstract synchronized protected String method();
}

final static public class ClassWithModifiers {
  transient final private static String CONSTANT = "abc";

  final static synchronized protected String method() {
    return CONSTANT;
  }
}
