  @AnnotationOne

@AnnotationTwo static public @AnnotationThree interface InterfaceWithModifiers {
  static final @AnnotationOne public String INTERFACE_CONSTANT = "abc";

    @AnnotationOne
  @AnnotationTwo default public @AnnotationThree String interfaceDefaultMethod() {
    return INTERFACE_CONSTANT;
  }

  static @AnnotationOne public @AnnotationTwo String interfaceStaticMethod() {
    return INTERFACE_CONSTANT;
  }

  @AnnotationOne void interfaceMethodOnlyAnnotations();
}

@AnnotationOne abstract public @AnnotationTwo class AbstractClassWithModifiers {
  volatile private @Annotation static String field;

  @AnnotationOne
  @AnnotationTwo abstract synchronized protected @AnnotationThree String method();

  @AnnotationOne void onlyAnnotations() {}
}

final @AnnotationOne static public @AnnotationTwo class ClassWithModifiers {
  transient @AnnotationOne final private @AnnotationTwo static String CONSTANT = "abc";

  final @AnnotationOne static @AnnotationTwo synchronized protected @AnnotationThree String method() {
    return CONSTANT;
  }

  @AnnotationOne void onlyAnnotations() {}
}
