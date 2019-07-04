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

public class ComplexGenericClass<BEAN extends AbstractBean & BeanItemSelect<BEANTYPE>, BEANTYPE, CONFIG extends BeanConfig<BEAN, BEANTYPE, CONFIG>>
  extends AbstractBeanConfig<BEAN, CONFIG> {

  public <BEAN> List<? super BEAN> getBean(final Class<BEAN> beanClass) {
    return new ArrayList<>();
  }
}
