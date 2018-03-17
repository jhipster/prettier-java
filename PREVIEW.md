# abstract_class
```java

public abstract class AbstractClass {

    abstract public void abstractMethod();

    public void method() {
        System.out.print("method");
    }

}
```
# annotation_type_declaration
```java
}
public @interface AnnotationTypeDeclaration {
    public String value() default "";
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
# class_body_block
```java

public class ClassBodyBlock {

    static {}

    {}

}
```
# comment_javadoc
```java

```
# comment_line
```java

```
# comment_traditional
```java

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

public class EmptyClass {}
```
# empty_interface
```java

public interface EmptyInterface {}

public interface EmptyInterface {}
```
# empty_lines
```java

class ClassEmpty {}

class ClassEmptyLinesAtBeginning {
    int i;
}

class ClassEmptyLinesAtEnd {
    int i;
}

class ClassEmptyLinesBetween {
    int i;

    int j;
}

class ClassEmptyLinesInFrontOfMethod {

    void doSomething() {}

}

class ClassEmptyLinesAfterOfMethod {

    void doSomething() {}

}

class ClassNoEmptyLinesBetweenTwoMethods {

    void doSomething() {}

    void doElse() {}

}

class ClassNoEmptyLinesBetweenFieldDeclarationAndMethod {
    int i;

    void doElse() {}

}

class ClassEmptyLinesBetweenFieldDeclarationAndMethod {
    int i;

    void doElse() {}

}

class ClassMethodEmpty {

    void method() {}

}

class ClassMethodEmptyLinesAtBeginning {

    void method() {
        int i;
    }

}

class ClassMethodEmptyLinesAtEnd {

    void method() {
        int i;
    }

}

class ClassMethodEmptyLinesBetween {

    void method() {
        int i;

        int j;
    }

}

interface InterfaceEmpty {}

interface InterfaceEmptyLinesAtBeginning {
    int i = 1;
}

interface InterfaceEmptyLinesAtEnd {
    int i = 1;
}

interface InterfaceEmptyLinesBetween {
    int i = 1;

    int j = 2;
}

interface InterfaceEmptyLinesInFrontOfMethod {

    void doSomething();

}

interface InterfaceEmptyLinesAfterOfMethod {

    void doSomething();

}

interface InterfaceNoEmptyLinesBetweenTwoMethods {

    void doSomething();

    void doElse();

}

interface InterfaceNoEmptyLinesBetweenFieldDeclarationAndMethod {
    int i = 1;

    void doElse();

}

interface InterfaceEmptyLinesBetweenFieldDeclarationAndMethod {
    int i = 1;

    void doElse();

}

interface InterfaceMethodEmpty {

    default void method() {}

}

interface InterfaceMethodEmptyLinesAtBeginning {

    default void method() {
        int i;
    }

}

interface InterfaceMethodEmptyLinesAtEnd {

    default void method() {
        int i;
    }

}

interface InterfaceMethodEmptyLinesBetween {

    default void method() {
        int i;

        int j;
    }

}
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

    public void instanceOf() {
        if (var instanceof Object) {
            System.out.println("instanceOf");
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

    public void continueSimple() {
        for (int i = 0; i < 10; i++) {
            if (i % 2 == 0) {
                continue;
            }
            System.out.println(i);
        }
    }

    public void continueWithIdentifier() {
        for (int i = 0; i < 10; i++) {
            if (i % 2 == 0) {
                continue id;
            }
            System.out.println(i);
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

public class ComplexGenericClass<BEAN extends AbstractBean &
BeanItemSelect<BEANTYPE>,
BEANTYPE,
CONFIG extends BeanConfig<BEAN,
BEANTYPE,
CONFIG>>
    extends AbstractBeanConfig<BEAN,
    CONFIG> {

    public <BEAN> List<? super BEAN> getBean(final Class<BEAN> beanClass) {
        return new ArrayList<>();
    }

}
```
# generic_invocation
```java

public class GenericInvocation {

    public void genericInvocation() {
        <Bean>doSomething();

        <Bean>doSomething2(abc,
        def);
    }

}
```
# generic_questionmark
```java
}
public class GenericExtends<BEAN extends Bean<?>> {}

public class Simple {

    public void converter(final Converter<?> converter) {}

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

    public boolean shortIfElse(boolean one) {
        return one ? true : false;
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

public class ImplementsInterface implements Interface {

    @Override
    public void interfaceMethod() {
        System.out.println("implemented interface method");
    }

}
```
# implements_mulitple_interfaces
```java

public class ImplementsInterfaces implements Interface1, Interface2 {

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
# interface
```java
}
public interface Interfaces {

    boolean isAvailable(Object propertyId);

    public static final Method METHOD = SomeStatic.findMethod();
}
```
# lambda
```java

public class Lambda {

    public void singleArgumentWithParens() {
        call(x -> {
            System.out.println(x);
            System.out.println(x);
        });
    }

    public void singleArgumentWithoutParens() {
        call(x -> {
            System.out.println(x);
            System.out.println(x);
        });
    }

    public void multiArguments() {
        call((x,
        y) -> {
            System.out.println(x);
            System.out.println(y);
        });
    }

    public void multiParameters() {
        call((Object x, final String y) -> {
            System.out.println(x);
            System.out.println(y);
        });
    }

    public void emptyArguments() {
        call(() -> {
            System.out.println();
            System.out.println();
        });
    }

    public void onlyOneMethodInBodyWithCurlyBraces() {
        call(x -> {
            System.out.println(x);
        });
    }

    public void onlyOneMethodInBody() {
        call(x -> System.out.println(x));
    }

}
```
# marker_annotations
```java

@SingleMemberAnnotation2(
    name = "Something much long that breaks",
    date = "01/01/2018"
)
@SingleMemberAnnotation1(name = "Thorben von Hacht", date = "01/01/2018")
@NormalAnnotation("value")
@MarkerAnnotation
public class MarkerAnnotations {
    @SingleMemberAnnotation2(
        name = "Something much long that breaks",
        date = "01/01/2018"
    )
    @SingleMemberAnnotation1(name = "Thorben von Hacht", date = "01/01/2018")
    @NormalAnnotation("value")
    @MarkerAnnotation
    SomeService service;

    @SingleMemberAnnotation2(
        name = "Something much long that breaks",
        date = "01/01/2018"
    )
    @SingleMemberAnnotation1(name = "Thorben von Hacht", date = "01/01/2018")
    @NormalAnnotation("value")
    @MarkerAnnotation
    public void postConstruct() {
        System.out.println("post construct");
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    @SuppressWarnings2(
        {
            "rawtypes",
            "unchecked",
            "something",
            "something2",
            "something3",
            "something4"
        }
    )
    public void elementValueArrayInitializer() {
        System.out.println("element value array initializer");
    }

    @ArrayInitializersWithKey(
        key = { "abc", "def"
        },
        key2 = { "ghi", "jkl"
        },
        key3 = { "mno", "pqr"
        }
    )
    public void arrayInitializerWithKey() {
        System.out.println("element value array initializer with key");
    }

}
```
# member_chain
```java

public class BreakLongFunctionCall {

    public void doSomething() {
        return new Object().something().more();
    }

    public void doSomethingLongNew() {
        return something().more().and().that().as().well().but().not().something().something();
    }

    public void doSomethingLongNew2() {
        return new Object().something().more().and().that().as().well().but().not().something();
    }

    public void doSomethingLongStatic() {
        return Object.something().more().and().that().as().well().but().not().something();
    }

}
```
# method_reference
```java

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
```
# methods
```java

public class Methods {

    public static void main(String[] args) {}

    void noParameters() {}

    void oneParameters(String str1) {}

    void breakingParameters(
        String str1,
        String str2,
        String str3,
        String str4,
        String str5
    ) {}

    void lastParameterDotDotDot(String str1, String... str2) {}

}
```
# multiple_classes
```java

class A {}

class B {}

class C {}
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
# return
```java

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
```
# switch
```java

class Switch {

    void simple(Answer answer) {
        switch (answer) {
            case YES:
                System.out.println("YES");
                break;
            case NO:
                System.out.println("NO");
                break;
            default:
                break;
        }
    }

}
```
# synchronized
```java
}
class Synchronized {

    void doSomething() {
        synchronized (this.var) {
            doSynchronized();
        }
    }

}
```
# throws
```java

public abstract class Throws {

    void throwException1() throws RuntimeException {
        throw new RuntimeException();
    }

    void throwException2(String string) throws RuntimeException {
        throw new RuntimeException();
    }

    void throwException3(String string1, String string2, String string3)
        throws
            RuntimeException {
        throw new RuntimeException();
    }

    void throwException4()
        throws
            RuntimeException,
            RuntimeException,
            RuntimeException {
        throw new RuntimeException();
    }

    void throwException5(String string)
        throws
            RuntimeException,
            RuntimeException,
            RuntimeException {
        throw new RuntimeException();
    }

    void throwException6(String string1, String string2, String string3)
        throws
            RuntimeException,
            RuntimeException,
            RuntimeException {
        throw new RuntimeException();
    }

    abstract void absThrowException1() throws RuntimeException;

    abstract void absThrowException2(String string) throws RuntimeException;

    abstract void absThrowException3(
        String string1,
        String string2,
        String string3
    )
        throws
            RuntimeException;

    abstract void absThrowException4()
        throws
            RuntimeException,
            RuntimeException,
            RuntimeException;

    abstract void absThrowException5(String string)
        throws
            RuntimeException,
            RuntimeException,
            RuntimeException;

    abstract void absThrowException6(
        String string1,
        String string2,
        String string3
    )
        throws
            RuntimeException,
            RuntimeException,
            RuntimeException;

}
```
# try_catch
```java

public class TryCatch {

    void tryFinally() {
        try {
            System.out.println("Try something");
        } finally {
            System.out.println("Finally do something");
        }
    }

    void tryCatch() {
        try {
            System.out.println("Try something");
        } catch(ArithmeticException e) {
            System.out.println("Warning: ArithmeticException");
        } catch(ArrayIndexOutOfBoundsException e) {
            System.out.println("Warning: ArrayIndexOutOfBoundsException");
        } catch(Exception e) {
            System.out.println("Warning: Some Other exception");
        }
    }

    void tryCatchFinally() {
        try {
            System.out.println("Try something");
        } catch(ArithmeticException e) {
            System.out.println("Warning: ArithmeticException");
        } catch(ArrayIndexOutOfBoundsException e) {
            System.out.println("Warning: ArrayIndexOutOfBoundsException");
        } catch(Exception e) {
            System.out.println("Warning: Some Other exception");
        } finally {
            System.out.println("Finally do something");
        }
    }

    void tryMultiCatchFinally() {
        try {
            System.out.println("Try something");
        } catch(ArithmeticException | ArrayIndexOutOfBoundsException e) {
            System.out.println("Warning: Not breaking multi exceptions");
        } catch(
            ArithmeticException |
            ArrayIndexOutOfBoundsException |
            SomeOtherException e
        ) {
            System.out.println("Warning: Breaking multi exceptions");
        } finally {
            System.out.println("Finally do something");
        }
    }

}
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
    private float privateVariable = 0.9f;

    private Integer nullVariable = null;
    private Integer createVariable = new Integer();

    private List<String> genericVariable1 = new ArrayList<>();
    private final Map<String,
    Button> buttonMap = new HashMap<>();
    private Bean<String> genericVariable2 = new Bean<String>("abc");
    private Bean<String> genericVariable2 = new Bean<String>("abc",
    "def",
    "ghi",
    "jkl");
    private Map<Integer,
    String> genericVariable4 = new HashMap<Integer,
    String>();
    private Map<Integer,
    String,
    Integer,
    String> genericVariable5 = new HashMap<Integer,
    String,
    Integer>();

    private Object[] arrayVariable1[] = new Object[3];
    private Object[][] arrayVariable2[][] = new Object[3][3];
    private Object[] arrayVariable3[] = new Object[] {};
    private Object[] arrayVariable4[] = new Object[] { "abc", "def", "ghi" };
    private Object[] arrayVariable5[] = new Object[] {
        "abc",
        "def",
        "ghi",
        "jkl",
        "mno"
    };
    private Object[] arrayVariable6[] = { "abc", "def", "ghi" };

    private Range creator1 = this.dateRangeField.new Range(from,
    to);
    private Range creator2 = this.dateRangeField.new <Integer>Range(from,
    to);
    private Range<Date> creator3 = this.dateRangeField.new <Integer>Range<>(from,
    to);
    private Range<Date> creator3 = new <Integer>Range<>(from,
    to);

    private Interface anonymousClassVariable = new Interface() {

        @Override
        void doSomething() {
            System.out.println("do something");
        }

    };

    public void variableMethod(final int finalVariable) {
        int localVariable = 456;
        int castVariable = (int) (4 / 2);
    }

    public void localVariables(

    ) {final List<Filter> filterList = new ArrayList<>();
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
