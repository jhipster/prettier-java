public interface Interfaces {

	boolean isAvailable(Object propertyId);

	public static final Method METHOD = SomeStatic.findMethod();

}

public interface Interfaces extends Interface1, Interface2, Interface3, Interface4 {

    boolean isAvailable(Object propertyId);

    public static final Method METHOD = SomeStatic.findMethod();

}

public interface Interfaces extends Interface1, Interface2, Interface3, Interface4, Interface5, Interface6, Interface7, Interface8 {

    boolean isAvailable(Object propertyId);

    public static final Method METHOD = SomeStatic.findMethod();

}

private interface Interface {
  String STRING_1 = "STRING_1";
  String STRING_2 = "STRING_2";
  class T {}
  CustomClass myFirstInterfaceMethod(String string);
  CustomOtherClass mySecondInterfaceMethodWithAVeryLongName(String aVeryLongString);
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

public interface EmptyInterface {
  ;
}

public interface InterfaceWithSemicolon {
  ;
  String STRING_1 = "STRING_1";
}

sealed class Aaaaaaaaaa<Bbbbbbbbbb> extends Cccccccccc permits Dddddddddd {

  void a() {}
}

sealed class Aaaaaaaaaa<Bbbbbbbbbb, Cccccccccc> extends Dddddddddd permits Eeeeeeeeee {

  void a() {}
}

sealed class Aaaaaaaaaa<Bbbbbbbbbb, Cccccccccc> extends Dddddddddd permits Eeeeeeeeee {}

class Aaaaaaaaaa<Bbbbbbbbbb, Cccccccccc> extends Dddddddddd<Eeeeeeeeee, Ffffffffff> {

  void a() {}
}

class Aaaaaaaaaa<Bbbbbbbbbb, Cccccccccc> extends Dddddddddd<Eeeeeeeeee, Ffffffffff, Gggggggggg, Hhhhhhhhhh, Iiiiiiiiii> {

  void a() {}
}

sealed class Aaaaaaaaaa<Bbbbbbbbbb, Cccccccccc, Dddddddddd, Eeeeeeeeee, Ffffffffff, Gggggggggg> extends Hhhhhhhhhh<Iiiiiiiiii, Jjjjjjjjjj> permits Kkkkkkkkkk, Llllllllll {

  void a() {}
}

sealed class Aaaaaaaaaa<Bbbbbbbbbb, Cccccccccc, Dddddddddd, Eeeeeeeeee, Ffffffffff, Gggggggggg> extends Hhhhhhhhhh<Iiiiiiiiii, Jjjjjjjjjj> permits Kkkkkkkkkk, Llllllllll {}

sealed class Aaaaaaaaaa<Bbbbbbbbbb, Cccccccccc, Dddddddddd, Eeeeeeeeee, Ffffffffff, Gggggggggg> extends Hhhhhhhhhh<Iiiiiiiiii, Jjjjjjjjjj, Kkkkkkkkkk, Llllllllll, Mmmmmmmmmm, Nnnnnnnnnn> permits Oooooooooo, Pppppppppp, Qqqqqqqqqq, Rrrrrrrrrr, Ssssssssss, Tttttttttt, Uuuuuuuuuu {

  void a() {}
}

sealed class Aaaaaaaaaa<Bbbbbbbbbb, Cccccccccc, Dddddddddd, Eeeeeeeeee, Ffffffffff, Gggggggggg> extends Hhhhhhhhhh<Iiiiiiiiii, Jjjjjjjjjj, Kkkkkkkkkk, Llllllllll, Mmmmmmmmmm, Nnnnnnnnnn> permits Oooooooooo, Pppppppppp, Qqqqqqqqqq, Rrrrrrrrrr, Ssssssssss, Tttttttttt, Uuuuuuuuuu {}
