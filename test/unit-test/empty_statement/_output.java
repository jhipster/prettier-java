public class EmptyStament {

  class EmptyStament2 {}

  public void emptyStatementWithoutComment() {}

  public void emptyStatementWithComment() {
    //EmptyStatement
  }

  public void simpleForWithEmptyStatement() {
    for (;;);

    /*test*/
    for (;;);

    for (;;); /*test*/

    /*test*/
    for (;;); /*test*/
  }

  public void simpleForWithEmptyStatement() {
    for (;;);

    /*test*/
    for (;;);

    for (;;); /*test*/

    /*test*/
    for (;;); /*test*/
  }

  public void forEachWithEmptyStatement(List<String> list) {
    for (String str : list);

    for (String str : list /*test*/);

    for (String str : list); /*test*/
  }

  public void ifElseWithEmptyStatements() {
    if (test);
    else {
      System.out.println("one");
    }

    if (test) {
      System.out.println("two");
    } else;

    if (test);
    else;
  }

  public void ifElseWithEmptyStatementsWithComments() {
    if (test /*test*/);
    else {
      System.out.println("one");
    }

    if (test /*test*/);
    else {
      System.out.println("one");
    }

    if (test) {
      System.out.println("two");
    } /*test*/ else;

    if (test) {
      System.out.println("two");
    } else; /*test*/

    if (test /*test*/);
    else; /*test*/

    if (test /*test*/ /*test*/);
    else;
  }

  public void simpleWhileWithEmptyStatement(boolean one) {
    while (one);

    while (one /*test*/);

    while (one); /*test*/
  }

  public void doWhileWithEmptyStatement(boolean one) {
    do; while (one);
    do; while (/*test*/ one);
    do; while (/*test*/ one);
  }
}

// Bug Fix: #356
public class Test {

  public TestField testField;

  @Override
  public void someMethod() {}
}
