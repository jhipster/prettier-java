public interface Interfaces {
  boolean isAvailable(Object propertyId);

  public static final Method METHOD = SomeStatic.findMethod();
}

public interface Interfaces
  extends Interface1, Interface2, Interface3, Interface4 {
  boolean isAvailable(Object propertyId);

  public static final Method METHOD = SomeStatic.findMethod();
}

public interface Interfaces
  extends
    Interface1,
    Interface2,
    Interface3,
    Interface4,
    Interface5,
    Interface6,
    Interface7,
    Interface8 {
  boolean isAvailable(Object propertyId);

  public static final Method METHOD = SomeStatic.findMethod();
}

private interface Interface {
  String STRING_1 = "STRING_1";
  String STRING_2 = "STRING_2";

  class T {}

  CustomClass myFirstInterfaceMethod(String string);
  CustomOtherClass mySecondInterfaceMethodWithAVeryLongName(
    String aVeryLongString
  );

  interface I {}

  CustomClass myThirdInterfaceMethod(String string);

  @Annotation(annotationAttribute = CONSTANT_STRING)
  CustomClass annotatedInterfaceMethod(String string);

  @Annotation(annotationAttribute = CONSTANT_STRING)
  CustomClass otherAnnotatedInterfaceMethod(String string);

  CustomClass myFourthInterfaceMethod(String string);

  @Annotation(annotationAttribute = CONSTANT_STRING)
  String STRING_3 = "STRING_3";

  String STRING_4 = "STRING_4";
}

public interface EmptyInterface {}

public interface InterfaceWithSemicolon {
  String STRING_1 = "STRING_1";
}
