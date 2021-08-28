public class Expressions {

  public void equals(int i) {
    if (i == 1) {
      System.out.println("i equals 1");
    }
  }

  public void unequals(int i) {
    if (i != 1) {
      System.out.println("i not equals 1");
    }
  }

  public void equalsComplex(String str) {
    if (str.equals("String")) {
      System.out.println("string equals String");
    }
  }

  public void greater(int i) {
    if (i > 1) {
      System.out.println("i greater 1");
    }
  }

  public void less(int i) {
    if (i < 1) {
      System.out.println("i less 1");
    }
  }

  public void greaterEquals(int i) {
    if (i >= 1) {
      System.out.println("i greater/equals 1");
    }
  }

  public void lessEquals(int i) {
    if (i <= 1) {
      System.out.println("i less/equals 1");
    }
  }

  public void and() {
    if (true && true) {
      System.out.println("and");
    }
  }

  public void or() {
    if (true || false) {
      System.out.println("or");
    }
  }

  public void not() {
    if (!false) {
      System.out.println("not");
    }
  }

  public void parenthesized() {
    if (true && (false || true)) {
      System.out.println("parenthesized");
    }
  }

  public void instanceOf() {
    if (var instanceof Object) {
      System.out.println("instanceOf");
    }
  }

  public void printSimple() {
    if(myValue == 42) {
    }

    if(myValue != 42) {
      System.out.println("Why not 42 !");
    }
  }

  public void printIf() {
    Object myObject = new PrettierObject().getSingleton().getAuthentication().getCredentials().getRights().getName();

    if(myValue == 42 || myValue == 42 && myValue == 42 && myValue == 42 || myValue == 42 && myValue == 42) {

    }

    if(myValue != 42 && 42/42 || myValue & 42 && myValue > 42 || myValue < 42 && myValue == 42) {

    }

    if(myValue != 42 && myValue == 42) {

    }
  }

  public void printSwitch() {
    switch(myValue == 42 || myValue == 42 && myValue == 42 && myValue == 42 || myValue == 42 && myValue == 42) {

    }

    switch(myValue != 42 && 42/42 || myValue & 42 && myValue > 42 || myValue < 42 && myValue == 42) {

    }

    switch(myValue != 42) {

    }

    switch(myValue != 42 && myValue == 42) {

    }
  }

  public void printWhile() {
    while/*infinite*/ (true) /*stop the program*/throw new RuntimeException();

    while(myValue == 42 || myValue == 42 && myValue == 42 && myValue == 42 || myValue == 42 && myValue == 42) {

    }

    while(myValue != 42 && 42/42 || myValue & 42 && myValue > 42 || myValue < 42 && myValue == 42) {

    }

    while(myValue != 42) {

    }

    while(myValue != 42 && myValue == 42) {

    }
  }

  public void printDoWhile() {
    do{
      System.out.println("Prettier-java is cool !");
    }
    while(myValue == 42 || myValue == 42 && myValue == 42 && myValue == 42 || myValue == 42 && myValue == 42);

    do {
      System.out.println("Prettier-java is cool !");
    }
    while(myValue != 42 && 42/42 || myValue & 42 && myValue > 42 || myValue < 42 && myValue == 42);

    do {
      System.out.println("Prettier-java is cool !");
    }
    while(myValue != 42);

    do {
      System.out.println("Prettier-java is cool !");
    }while(myValue != 42 && myValue == 42);
  }

  public void printSynchronized() {
    synchronized(myValue == 42 || myValue == 42 && myValue == 42 && myValue == 42 || myValue == 42 && myValue == 42) {
      System.out.println("Prettier-java is cool !");
    }

    synchronized(myValue != 42 && 42/42 || myValue & 42 && myValue > 42 || myValue < 42 && myValue == 42) {
      System.out.println("Prettier-java is cool !");
    }

    synchronized(myValue == 42) {
      System.out.println("Prettier-java is cool !");
    }

    synchronized(myValue != 42 && myValue == 42) {
      System.out.println("Prettier-java is cool !");
    }
  }

  public void longFullyQualifiedName() {
    com
      .me.very.very.very.very.very.very.very.very.very.very.very.very.very.longg.fully.qualified.name.FullyQualifiedName.builder()
      .build();

    com.FullyQualifiedName.builder();
  }

  public void unannTypePrimitiveWithMethodReferenceSuffix(String[] args) {
    List.of(new double[][] { 1,2,3,4.1,5.6846465}, new double[][] { 1,2,3,4.1,5.6846465}, new double[][] { 1,2,3,4.1,5.6846465}).toArray(double[][]::new);
  }

  public void typeExpressionsInFqnParts() {
    var myVariable = ImmutableMap.<R, V>of<T>::a();
  }
}

