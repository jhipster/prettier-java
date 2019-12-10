  @AnnotationOne

@AnnotationTwo static public @AnnotationThree interface InterfaceWithModifiers {
  static final @AnnotationOne public String INTERFACE_CONSTANT = "abc";

    @AnnotationOne
  @AnnotationTwo default public @AnnotationThree String defaultMethod() {
    return INTERFACE_CONSTANT;
  }

  static @AnnotationOne public @AnnotationTwo String staticMethod() {
    return INTERFACE_CONSTANT;
  }

  public @AnnotationOne @AnnotationTwo void twoTrailingAnnotations();

  @AnnotationOne void onlyAnnotations();
}

@AnnotationOne abstract public @AnnotationTwo class AbstractClassWithModifiers {
  volatile private @Annotation static String field;

  @AnnotationOne
  @AnnotationTwo abstract synchronized protected @AnnotationThree String method();

  public @AnnotationOne @AnnotationTwo void twoTrailingAnnotations() {}

  @AnnotationOne void onlyAnnotations() {}
}

final @AnnotationOne static public @AnnotationTwo class ClassWithModifiers {
  transient @AnnotationOne final private @AnnotationTwo static String CONSTANT = "abc";

  final @AnnotationOne static @AnnotationTwo synchronized protected @AnnotationThree String method() {
    return CONSTANT;
  }

  public @AnnotationOne @AnnotationTwo void twoTrailingAnnotations() {}

  @AnnotationOne void onlyAnnotations() {}
}
