public class GenericClass<BEAN> {

  private BEAN bean;

  public GenericClass(BEAN bean) {
    this.bean = bean;
  }

  public BEAN setBean(BEAN bean) {
    this.bean = bean;
    return bean;
  }

  public <T> T doSomething(T t) {
    return t;
  }

}
