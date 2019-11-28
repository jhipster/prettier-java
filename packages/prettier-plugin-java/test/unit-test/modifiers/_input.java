@Annotation(annotationAttribute = CONSTANT_STRING) static public interface InterfaceWithModifiers {
  static final @Annotation(annotationAttribute = CONSTANT_STRING) public String INTERFACE_CONSTANT = "abc";

  @Annotation(annotationAttribute = CONSTANT_STRING) default public String interfaceDefaultMethod() {
    return INTERFACE_CONSTANT;
  }

  static @Annotation(annotationAttribute = CONSTANT_STRING) public String interfaceStaticMethod() {
    return INTERFACE_CONSTANT;
  }
}

@Annotation(annotationAttribute = CONSTANT_STRING) abstract public class AbstractClassWithModifiers {
  volatile private @Annotation(annotationAttribute = CONSTANT_STRING) static String field;

  @Annotation(annotationAttribute = CONSTANT_STRING) abstract synchronized protected String method();
}

final static public @Annotation(annotationAttribute = CONSTANT_STRING) class ClassWithModifiers {
  transient @Annotation(annotationAttribute = CONSTANT_STRING) final private static String CONSTANT = "abc";

  final static synchronized protected @Annotation(annotationAttribute = CONSTANT_STRING) String method() {
    return CONSTANT;
  }
}
