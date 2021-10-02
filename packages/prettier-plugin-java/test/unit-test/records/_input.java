public record Pet(
@NotNull String name
    ) {}

    public record Pet(
@NotNull String name, int age
    ) {}

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
    ) {

    }

public record Pet(

    ) {

    }

public record Pet(

    ) {
public void test() {}
    }

class T {
    String record = "1";

    void t() {
        record = "12";
    }

class MyRecordSimplifiedConstructor {
    record MyRecord(String name, int age
    ) {
public MyRecord {
            if (age < 0) {
              throw new IllegalArgumentException("Age cannot be negative");
            }

      if (name == null || name.isBlank()) {
              throw new IllegalArgumentException("Name cannot be blank");
       }
          }
      }
}

class MyRecordConstructor {
    record MyRecord(String name,
     int age) {
          public MyRecord(String name,
           int age) {
            if (age < 0) {
  throw new IllegalArgumentException("Age cannot be negative");
            }
                if (name == null || name.isBlank()) {
              throw new IllegalArgumentException("Name cannot be blank");
        }
          }
      }
}

public class MyRecordWithAnnotationAndModifiers {
                public record MyRecord(
          String name,
          int age) {
                @Annotation
          @Annotation2
          public MyRecord {
            if (
                age < 0)
            {
              throw new IllegalArgumentException("Age cannot be negative");
            }

            if (name == null ||
            name.isBlank()) {
              throw new IllegalArgumentException("Name cannot be blank");
            }
          }
      }
    }
}

class MySplitRecordConstructor {
    record MyRecord(String name,
     int age, String name,
     int age,String name,
     int age) {
          public MyRecord(String name,
           int age) {
            if (age < 0) {
  throw new IllegalArgumentException("Age cannot be negative");
            }
                if (name == null || name.isBlank()) {
              throw new IllegalArgumentException("Name cannot be blank");
        }
          }
      }
}

public interface MyInterface {
    record MyRecord(
        String param) implements MyInterface {

         }
}

public interface MyInterface {
  record MySplitRecord(String param, String param, String param, String param, String param, String param) implements MyInterface {}
}