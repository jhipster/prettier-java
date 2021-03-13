class T {
    // Fix for https://github.com/jhipster/prettier-java/issues/453
    SomeClass.@Valid SomeInnerClass someInnerClass = someClass.getInteractions().get(0);

    // Fix for https://github.com/jhipster/prettier-java/issues/444
    void process(
        Map.@NonNull Entry<String, SkeletonConfiguration> entry,
        @NonNull Map<String, Object> context
    ) {}
}
