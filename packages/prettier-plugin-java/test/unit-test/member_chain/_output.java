public class BreakLongFunctionCall {

  public void doSomething() {
    return new Object().something().more();
  }

  public void doSomethingNewWithComment() {
    new Object()
      // comment
      .something()
      .more();

    new Object()
      .something()
      // comment
      .more();
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

    java
      // comment
      .averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong.Object.something()
      .more();

    java.averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong
      // comment
      .Object.something()
      .more();

    java.averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong.Object.something()
      .more();

    Object.something()
      // comment
      .more();

    averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong.java
      // comment
      .util()
      .java.java();

    averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong
      // comment
      .java
      .util()
      .java.java();

    averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong.java
      /* comment */
      .util()
      .java.java();

    averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong.java/* comment */
      .util()
      .java.java();

    averyveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryverylong.java
      /* comment */.util()
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
}
