public class BreakLongFunctionCall {

  public void doSomething() {
    return new Object().something().more();
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
}
