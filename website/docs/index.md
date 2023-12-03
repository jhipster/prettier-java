# Introduction

Prettier Java is an opinionated Java code formatter.

It removes all original styling and ensures that all outputted code conforms to a consistent style.

Prettier Java takes your code and reprints it from scratch by taking the line length into account.

For example, take the following code:

```java
foo(arg1, arg2, arg3, arg4);
```

It fits in a single line so it's going to stay as is. However, we've all run into this situation:

<!-- prettier-ignore -->
```java
foo(reallyLongArg(), omgSoManyParameters(), IShouldRefactorThis(), isThereSeriouslyAnotherOne());
```

Suddenly our previous format for calling function breaks down because this is too long. Prettier Java is going to do the painstaking work of reprinting it like that for you:

```java
foo(
  reallyLongArg(),
  omgSoManyParameters(),
  IShouldRefactorThis(),
  isThereSeriouslyAnotherOne()
);
```

Prettier Java enforces a consistent code **style** (i.e. code formatting that won't affect the AST) across your entire codebase because it disregards the original styling by parsing it away and re-printing the parsed AST with its own rules that take the maximum line length into account, wrapping code when necessary.
