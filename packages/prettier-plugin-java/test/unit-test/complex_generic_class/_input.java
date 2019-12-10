public class GenericClass<BEAN extends Comparable<BEAN>> {
  private BEAN bean;

  public GenericClass(BEAN bean) {
    this.bean = bean;
  }

  public BEAN setBean(BEAN bean) {
    this.bean = bean;
    return bean;
  }

  public <T extends Comparable<T>> T doSomething(T t) {
    return t;
  }

  public void addAll(final Collection<? extends E> c) {
		for (final E e : c) {
			add(e);
		}
  }

}
