public class BreakLongFunctionCall {

  public void doSomething() {
    return new Object().something().more();
  }

  public void doSomethingNewWithComment() {
    // comment
    new Object().something().more();

    new Object() // comment
      .something()
      .more();

    new Object()
      // comment
      .something()
      .more();

    new Object()
      .something() // comment
      .more();

    new Object()
      .something()
      // comment
      .more();

    new Object().something().more(); // comment

    new Object().something().more();
    // comment
  }

  public void doSomethingWithComment() {
    Object
      // comment
      .something()
      .more();

    java.Object
      // comment
      .something()
      .more();

    java.averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong.Object
      // comment
      .something()
      .more();

    java// comment
    .averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong.Object.something()
      .more();

    java.averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong// comment
    .Object.something()
      .more();

    java.averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong.Object.something().more();

    Object.something()
      // comment
      .more();

    averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong.java
      // comment
      .util()
      .java.java();

    averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong// comment
    .java
      .util()
      .java.java();

    averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong.java
      /* comment */
      .util()
      .java.java();

    averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong.java /* comment */
      .util()
      .java.java();

    averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong.java
      /* comment */ .util()
      .java.java();
  }

  public void doSomethingWithComment() {
    object
      // comment
      .something()
      .more();

    object
      .something()
      // comment
      .more();
  }

  public void doSomethingNewWithComment() {
    return new Object()
      /* comment */
      .something()
      .more();
  }

  public void doSomethingWithComment() {
    return Object
      /* comment */
      .something()
      .more();
  }

  public void doSomethingWithComment() {
    return object
      /* comment */
      .something()
      .more();
  }

  public void genericMethodWithLeadingComment() {
    a
      // 1
      .b()
      // 2
      .<C>c();
  }

  public void doSomethingLongNew() {
    return something()
      .more()
      .and()
      .that()
      .as()
      .well()
      .but()
      .not()
      .something()
      .something();
  }

  public void doSomethingLongWithArgument() {
    return something()
      .more(firstArgument, secondArgument)
      .and(
        firstArgument,
        secondArgument,
        thirdArgument,
        fourthArgument,
        fifthArgument
      );
  }

  public void doSomethingLongNew2() {
    return new Object()
      .something()
      .more()
      .and()
      .that()
      .as()
      .well()
      .but()
      .not()
      .something();
  }

  public void doSomethingLongStatic() {
    return Object.something()
      .more()
      .and()
      .that()
      .as()
      .well()
      .but()
      .not()
      .something();
  }

  public void singleInvocationOnNewExpression() {
    new Instance(
      aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa,
      aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    ).invocation(
      aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa,
      aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    );
  }

  public void multipleInvocationsOnNewExpression() {
    new Instance(
      aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa,
      aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
    )
      .invocation(
        aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa,
        aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
      )
      .andAnother();
  }

  void methodReferences() {
    dtoEntities.stream().map(UserDto::toString).forEach(LOGGER::info);
  }

  void classLiteralArgument() {
    a().b(C.class).d();
  }

  void argumentComment() {
    a(
      // comment
      b.c
    );

    a(
      // comment
      b.c[0]
    );

    a(
      // comment
      b.c()
    );

    a(
      b.c // comment
    );

    a(
      b.c[0] // comment
    );

    a(
      b.c() // comment
    );

    a(
      b, // comment
      c.d
    );

    a(
      b, // comment
      c.d[0]
    );

    a(
      b, // comment
      c.d()
    );
  }

  void prettierIgnore() {
    a ->
      // prettier-ignore
      b
        .c().d()
        .e().f();
  }

  void complexArguments() {
    "SOME TEXT"
      .replace("SOME", "OTHER")
      .replace("TEXT", "OTHER")
      .replace(
        "SOME",
        """
        FOO"""
      );
  }

  void typeArguments() {
    a()
      .b()
      .<Cccccccccc>dddddddddd(
        "eeeeeeeeee",
        "ffffffffff",
        "gggggggggg",
        "hhhhhhhhhh"
      );

    a()
      .b()
      .<Cccccccccccccccccccccccccccccccccccccccc>dddddddddddddddddddddddddddddddddddddddd(
        "eeeeeeeeee"
      );

    a()
      .b()
      .<
        Cccccccccc,
        Dddddddddd,
        Eeeeeeeeee,
        Ffffffffff,
        Gggggggggg
      >hhhhhhhhhh("iiiiiiiiii");

    a()
      .b()
      .<
        Cccccccccc,
        Dddddddddd,
        Eeeeeeeeee,
        Ffffffffff,
        Gggggggggg,
        Hhhhhhhhhh
      >iiiiiiiiii("jjjjjjjjjj");

    a()
      .b()
      .<
        Cccccccccc,
        Dddddddddd,
        Eeeeeeeeee,
        Ffffffffff,
        Gggggggggg,
        Hhhhhhhhhh
      >iiiiiiiiii("jjjjjjjjjj", "kkkkkkkkkk", "llllllllll", "mmmmmmmmmm", "nnnnnnnnnn");
  }
}
