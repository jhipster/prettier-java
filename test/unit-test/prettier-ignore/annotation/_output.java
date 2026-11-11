public class PrettierIgnoreAnnotation {

  @Marker
  // prettier-ignore
  @SuppressFBWarnings({ "AFBR_ABNORMAL_FINALLY_BLOCK_RETURN", "LEST_LOST_EXCEPTION_STACK_TRACE", "BC_UNCONFIRMED_CAST_OF_RETURN_VALUE" })
  @Another({ "a", "b" })
  void method() {}

  @Marker
  /* prettier-ignore */
  @SuppressFBWarnings({ "AFBR_ABNORMAL_FINALLY_BLOCK_RETURN", "LEST_LOST_EXCEPTION_STACK_TRACE", "BC_UNCONFIRMED_CAST_OF_RETURN_VALUE" })
  int field = 1;

  @Marker
  // prettier-ignore
  @Other
  public static class Nested {

    int x;
  }

  @Marker
  // just a comment
  @Other({ "a", "b" })
  void other() {}
}
