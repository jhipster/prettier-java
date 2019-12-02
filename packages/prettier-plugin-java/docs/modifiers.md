# Modifier formatting

### Modifier sorting

Class, method, and field modifiers will be sorted according to the order in the JLS (sections [8.1.1](https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-8.1.1), [8.3.1](https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-8.3.1), [8.4.3](https://docs.oracle.com/javase/specs/jls/se11/html/jls-8.html#jls-8.4.3), and [9.4](https://docs.oracle.com/javase/specs/jls/se11/html/jls-9.html#jls-9.4)).
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
protected abstract class C {}
```

Output:

```java
protected abstract class C {}
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

If an annotation precedes all modifiers, it will be formatted ahead of the modifiers on its own line. Otherwise, it will be formatted after the modifiers, on the same line.

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
final @Annotation private static String S = "abc";
```

Output:

```java
private static final @Annotation String S = "abc";
```

Input:

```java
final private static @Annotation String S = "abc";
```

Output:

```java
private static final @Annotation String S = "abc";
```
