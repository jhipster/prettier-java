public class ExtendsAbstractClass extends AbstractClass {

  @Override
  public void abstractMethod() {
    System.out.println("implemented abstract method");
  }

  @Override
  public int hashCode() {
    return super.hashCode();
  }

}
