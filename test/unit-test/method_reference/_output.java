public class MethodReference {

  public void referenceToAStaticMethod() {
    call(ContainingClass::staticMethodName);
  }

  public referenceToAConstructor() {
    call(ClassName::new);
  }

  public referenceToAnInstanceMethodOfAnArbitraryObjectOfAParticularType() {
    call(ContainingType::methodName);
  }

  public referenceToAnInstanceMethodOfAParticularObject() {
    call(containingObject::instanceMethodName);
  }
}
