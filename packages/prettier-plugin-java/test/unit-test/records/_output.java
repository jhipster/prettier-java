public record Pet(
  @NotNull String name, int age, String... others, Object @Nullable... errorMessageArgs
) {
  public Pet {
    if (age < 0) {
      throw new IllegalArgumentException("Age cannot be negative");
    }

    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Name cannot be blank");
    }
  }

  public void test() {}
}

public record Pet(
  @NotNull String name, int age, String... others, Object @Nullable... errorMessageArgs
) {}

public record Pet() {}

public record Pet() {
  public void test() {}
}

class T {

  String record = "1";

  void t() {
    record = "12";
  }
}
