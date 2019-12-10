public class ExtendsAbstractClassAndImplementsInterfaces
  extends AbstractClass
  implements Interface1, Interface2, Interface3, Interface4 {

  @Override
  public void abstractMethod() {
    System.out.println("implemented abstract method");
  }

  @Override
  public void interface1Method() {
    System.out.println("implemented interfac1 method");
  }

  @Override
  public void interface2Method() {
    System.out.println("implemented interface2 method");
  }
}

public class ExtendsAbstractClassAndImplementsInterfaces
  extends AbstractClass
  implements
    Interface1,
    Interface2,
    Interface3,
    Interface4,
    Interface5,
    Interface6,
    Interface7,
    Interface8 {}
