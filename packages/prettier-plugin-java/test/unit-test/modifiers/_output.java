@Annotation(annotationAttribute = CONSTANT_STRING)
public static interface InterfaceWithModifiers {
  public static final @Annotation(
    annotationAttribute = CONSTANT_STRING
  ) String INTERFACE_CONSTANT = "abc";

  @Annotation(annotationAttribute = CONSTANT_STRING)
  public default String interfaceDefaultMethod() {
    return INTERFACE_CONSTANT;
  }

  public static @Annotation(
    annotationAttribute = CONSTANT_STRING
  ) String interfaceStaticMethod() {
    return INTERFACE_CONSTANT;
  }
}

@Annotation(annotationAttribute = CONSTANT_STRING)
public abstract class AbstractClassWithModifiers {
  private static volatile @Annotation(
    annotationAttribute = CONSTANT_STRING
  ) String field;

  @Annotation(annotationAttribute = CONSTANT_STRING)
  protected abstract synchronized String method();
}

public static final @Annotation(
  annotationAttribute = CONSTANT_STRING
) class ClassWithModifiers {
  private static final transient @Annotation(
    annotationAttribute = CONSTANT_STRING
  ) String CONSTANT = "abc";

  protected static final synchronized @Annotation(
    annotationAttribute = CONSTANT_STRING
  ) String method() {
    return CONSTANT;
  }
}
