public abstract class Throws {

  void returnThis() {
    return this;
  }

  void returnNull() {
    return null;
  }

  void exit() {
    return;
  }

  void returnCast() {
    return (BeanItemContainer<BEANTYPE>) super.getContainerDataSource();
  }

}
