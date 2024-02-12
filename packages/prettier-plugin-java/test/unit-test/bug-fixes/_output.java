class T {

  // Fix for https://github.com/jhipster/prettier-java/issues/453
  SomeClass.@Valid SomeInnerClass someInnerClass = someClass
    .getInteractions()
    .get(0);

  // Fix for https://github.com/jhipster/prettier-java/issues/444
  void process(
    Map.@NonNull Entry<String, SkeletonConfiguration> entry,
    @NonNull Map<String, Object> context
  ) {}
}

// Fix for https://github.com/jhipster/prettier-java/issues/607
class Currency {

  Currency(Currency this) {}

  Currency(Currency this, Currency other) {}

  Currency(@AnnotatedUsage Currency this, Currency other) {}

  Currency(
    @AnnotatedUsage Currency this,
    String aaaaaaaaaa,
    String bbbbbbbbbb
  ) {}

  String getCode(Currency this) {}

  int compareTo(Currency this, Currency other) {}

  int compareTo(@AnnotatedUsage Currency this, Currency other) {}

  int compareTo(
    @AnnotatedUsage Currency this,
    String aaaaaaaaaa,
    String bbbbbbbbbb
  ) {}

  class Inner {

    Inner(Currency Currency.this) {}

    String getCode(Currency Currency.this) {}
  }
}
