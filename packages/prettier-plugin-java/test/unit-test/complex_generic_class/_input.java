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

public abstract class AbstractGenericClass<Value extends AbstractValue, Value1 extends AbstractValue, Value2 extends AbstractValue, Value3 extends AbstractValue, Value4 extends AbstractValue, Value5 extends AbstractValue> {
    public Value getValue() {
        return new Value();
    }
}
