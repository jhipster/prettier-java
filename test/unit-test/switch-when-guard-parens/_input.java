class T {
  boolean f(Object x) {
    return switch (x) {
      case A a when a.equals(a.aaaa) -> true;
      default -> false;
    };
  }
}
