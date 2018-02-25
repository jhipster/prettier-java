public abstract class Return {

  Object returnThis() {
    return this;
  }

  Object returnNull() {
    return null;
  }

  void exit() {
    return;
  }

  Object returnCast() {
    return (BeanItemContainer<BEANTYPE>) super.getContainerDataSource();
  }

}
