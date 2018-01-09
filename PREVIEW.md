# abstract_class
```java

public abstract class AbstractClass {

    abstract public void abstractMethod();

    public void method() {
        System.out.print("method");
    }

}
```
# args
```java

public class Args {

    public void none() {}

    public void one(String one) {}

    public void three(String one, Integer two, String three) {}

    public void six(
        String one,
        Integer two,
        String three,
        Integer four,
        String six
    ) {}

}
```
# complex_generic_class
```java

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
```
# constructors
```java

public class Constructors {

    public Constructors() {
        this(true);
        System.out.println("empty constructor");
    }

    Constructors(boolean one) {
        super();
        System.out.println("constructor with boolean " + one);
    }

    Constructors(boolean one, boolean two) {
        this();
        System.out.println("constructor with boolean " + one + " and " + two);
    }

}
```
# empty_class
```java

public class EmptyClass {}
```
# empty_interface
```java

public interface EmptyInterface {}
```
# empty_method
```java

public class EmptyMethod {

    public static void main(String[] args) {}

    void small() {}

}
```
# enum
```java
}
public enum Enum {

    SOME_ENUM,
    ANOTHER_ENUM,
    LAST_ENUM;

}
```
# expressions
```java

public class Expressions {

    public void equals(int i) {
        if (i == 1) {
            System.out.println("i equals 1");
        }
    }

    public void unequals(int i) {
        if (i != 1) {
            System.out.println("i equals 1");
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

}
```
# extends_abstract_class
```java

public class ExtendsAbstractClass
    extends AbstractClass {

    @Override
    public void abstractMethod() {
        System.out.println("implemented abstract method");
    }

    @Override
    public int hashCode() {
        return super.hashCode();
    }

}
```
# extends_abstract_class_and_implements_interfaces
```java

public class ExtendsAbstractClassAndImplementsInterfaces
    extends AbstractClass
    implements
        Interface1,
        Interface2,
        Interface3,
        Interface4 {

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
```
# for
```java

public class For {

    public void simpleFor(String[] array) {
        for (int i = 0; i < array.length; i++) {
            System.out.println(array[i]);
        }
    }

    public void emptyFor(String[] array) {
        for (;;) {
            System.out.println(array[i]);
        }
    }

    public void forEach(List<String> list) {
        for (String str : list) {
            System.out.println(str);
        }
    }

}
```
# generic_class
```java

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
```
# hello_world
```java

public class HelloWorld {

    public static void main(String[] args) {
        System.out.println("Hello, World");
    }

}
```
# if
```java

public class If {

    public void simpleIf(boolean one) {
        if (one) {
            System.out.println("one");
        }
    }

    public void ifElse(boolean one) {
        if (one) {
            System.out.println("one");
        } else {
            System.out.println("not one");
        }
    }

    public void shortIfElse(boolean one) {
        one ? System.out.println("one") : System.out.println("not one");
    }

    public void ifElseIfElse(boolean one, boolean two) {
        if (one) {
            System.out.println("one");
        } else if (two) {
            System.out.println("two");
        } else {
            System.out.println("not on or two");
        }
    }

    public void ifElseIfElseIfElse(boolean one, boolean two, boolean three) {
        if (one) {
            System.out.println("one");
        } else if (two) {
            System.out.println("two");
        } else if (three) {
            System.out.println("three");
        } else {
            System.out.println("not on or two or three");
        }
    }

}
```
# implements_interface
```java

public class ImplementsInterface
    implements
        Interface {

    @Override
    public void interfaceMethod() {
        System.out.println("implemented interface method");
    }

}
```
# implements_mulitple_interfaces
```java

public class ImplementsInterfaces
    implements
        Interface1,
        Interface2 {

    @Override
    public void interface1Method() {
        System.out.println("implemented interfac1 method");
    }

    @Override
    public void interface2Method() {
        System.out.println("implemented interface2 method");
    }

}
```
# marker_annotations
```java

@Bean
public class MarkerAnnotations {
    @Resource
    SomeService service;

    @PostConstruct
    public void postConstruct() {
        System.out.println("post construct");
    }

}
```
# package_and_imports
```java

package my.own.pkg;

import abc.def.Another;
import abc.def.Something;

import java.utils.*;

import something.Different;

public class PackageAndImports {}
```
# types
```java

public class Types {

    public void primitiveTypes() {
        byte byteVariable;
        short shortVariable;
        int intVariable;
        long longVariable;
        float floatVariable;
        double doubleVariable;
        char charVariable;
        boolean booleanVariable;
    }

    public void dataTypes() {
        Byte byteVariable;
        Short shortVariable;
        Integer intVariable;
        Long longVariable;
        Float floatVariable;
        Double doubleVariable;
        Char charVariable;
        Boolean booleanVariable;
        String stringVariable;
    }

}
```
# variables
```java

public class Variables {
    public static int STATIC_VARIABLE = 123;
    private static final Logger LOGGER = LoggerFactory.getLogger(ComplexFilterTest.class);
    int packageVariable = 234;
    private int privateVariable = 345;
    private Integer nullVariable = null;
    private Integer createVariable = new Integer();
    private List<
        String> genericVariable1 = new List<
        String>();
    private Bean<
        String> genericVariable2 = new Bean<
        String>(
        "abc");

    public void variableMethod(final int finalVariable) {
        int localVariable = 456;
        int castVariable = (int) (4 / 2);
    }

}
```
# while
```java

public class While {

    public void simpleWhile(boolean one) {
        while (one) {
            System.out.println("one");
        }
    }

}
```
