@AnnotationOne
@AnnotationTwo
@AnnotationThree
public static interface InterfaceWithModifiers {
  @AnnotationOne
  public static final String INTERFACE_CONSTANT = "abc";

  @AnnotationOne
  @AnnotationTwo
  public default @AnnotationThree String interfaceDefaultMethod() {
    return INTERFACE_CONSTANT;
  }

  @AnnotationOne
  public static @AnnotationTwo String interfaceStaticMethod() {
    return INTERFACE_CONSTANT;
  }

  @AnnotationOne
  void interfaceMethodOnlyAnnotations();
}

@AnnotationOne
@AnnotationTwo
public abstract class AbstractClassWithModifiers {
  @Annotation
  private static volatile String field;

  @AnnotationOne
  @AnnotationTwo
  protected abstract synchronized @AnnotationThree String method();

  @AnnotationOne
  void onlyAnnotations() {}
}

@AnnotationOne
@AnnotationTwo
public static final class ClassWithModifiers {
  @AnnotationOne
  @AnnotationTwo
  private static final transient String CONSTANT = "abc";

  @AnnotationOne
  @AnnotationTwo
  protected static final synchronized @AnnotationThree String method() {
    return CONSTANT;
  }

  @AnnotationOne
  void onlyAnnotations() {}
}
