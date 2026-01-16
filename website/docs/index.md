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

## Lambdas are supported well

Prettier Java is handling lambdas properly.
When formatting the example by [palantir-java-format](https://github.com/palantir/palantir-java-format#motivation--examples), one get this result:

```java
private static void configureResolvedVersionsWithVersionMapping(
  Project project
) {
  project
    .getPluginManager()
    .withPlugin("maven-publish", (plugin) -> {
      project
        .getExtensions()
        .getByType(PublishingExtension.class)
        .getPublications()
        .withType(MavenPublication.class)
        .configureEach((publication) ->
          publication.versionMapping((mapping) -> {
            mapping.allVariants(
              VariantVersionMappingStrategy::fromResolutionResult
            );
          })
        );
    });
}
```

## Optmized for reading

The aim is to keep the code within 80 characters.
There might be "mart" exeptions, but as [Prettier states](https://prettier.io/docs/options#print-width), 80 characters are recommended for readability.

The [chained example by Palantir](https://github.com/palantir/palantir-java-format#optimised-for-code-review) is reformatted as follows:

```java
var foo = SomeType.builder()
  .thing1(thing1)
  .thing2(thing2)
  .thing3(thing3)
  .build();
```

## Configurable

Although, Prettier Java is opinionated, there are tweaks.

The most used seetings `.prettierrc.yaml` are

- `tabWidth: 4` to have an indent of `4` (instead of `2`) and
- `experimentalOperatorPosition: start` to have operators at the beginning of a code line (and not at the end).
