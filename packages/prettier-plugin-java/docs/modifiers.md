# Modifier formatting

### Modifier sorting

Class, method, and field modifiers will be sorted according to the order in the
JLS (sections [8.1.1](https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-8.1.1),
[8.3.1](https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-8.3.1),
[8.4.3](https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-8.4.3),
and [9.4](https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-9.4)).
The overall ordering is:

- public
- protected
- private
- abstract
- default
- static
- final
- transient
- volatile
- synchronized
- native
- strictfp

#### Examples

Input:

```java
final private static String S = "abc";
```

Output:

```java
private static final String S = "abc";
```

Input:

```java
final public class C {...}
```

Output:

```java
public final class C {...}
```

Input:

```java
static private void foo() {}
```

Output:

```java
private static void foo() {}
```

### Interaction with annotations

Class, field, and method annotations will be moved ahead of modifier keywords
and placed on a separate line. The exception is method annotations that come
after all modifier keywords, in which case the annotation will maintain the
same position. This is to support annotations whose intent is to qualify the
method's return type, rather than the method itself (for example: `public @Nullable String myMethod()`).

#### Examples

Input:

```java
@Annotation final private static String S = "abc";
```

Output:

```java
@Annotation
private static final String S = "abc";
```

Input:

```java
final private static @Annotation String S = "abc";
```

Output:

```java
@Annotation
private static final String S = "abc";
```

Input:

```java
final public @Nullable String myMethod {}
```

Output:

```java
public final @Nullable String myMethod {}
```

Input:

```java
final @Override public String myMethod {}
```

Output:

```java
@Override
public final String myMethod {}
```
