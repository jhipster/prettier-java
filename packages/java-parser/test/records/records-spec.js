import { expect } from "chai";
import * as javaParser from "../../src/index.js";

describe("Records", () => {
  it("should handle Java records without body", () => {
    const input = `record Pet(String name, int age) {}`;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle Java records with simplified constructors", () => {
    const input = `
    public record Pet(String name, int age) {
      public Pet {
        if (age < 0) {
          throw new IllegalArgumentException("Age cannot be negative");
        }

        if (name == null || name.isBlank()) {
          throw new IllegalArgumentException("Name cannot be blank");
        }
      }
    }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle Java records with simplified constructors inside java class declaration", () => {
    const input = `
    public class RecordClass {
      record MyRecord(String name, int age) {
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
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle Java records with constructor inside java class declaration", () => {
    const input = `
    public class RecordClass {
      record MyRecord(String name, int age) {
          public MyRecord(String name, int age) {
            if (age < 0) {
              throw new IllegalArgumentException("Age cannot be negative");
            }

            if (name == null || name.isBlank()) {
              throw new IllegalArgumentException("Name cannot be blank");
            }
          }
      }
    }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle Java records with constructor inside java class declaration", () => {
    const input = `
    public class RecordClass {
      public record MyRecord(String name, int age) {
          @Annotation
          @Annotation2
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
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle Java records inside an interface definition", () => {
    const input = `
    public interface SomeInterface {
      record SomeRecord(
          String param
      ) { }
    }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle Java records implementing an interface inside an interface definition", () => {
    const input = `
    public interface SomeInterface {
      record SomeRecord(
          String param
      ) implements AnyInterface { }
    }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle Java records implementing an interface inside a class definition", () => {
    const input = `
    public class SomeClass {
      record SomeRecord(
          String param
      ) implements AnyInterface { }
    }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });
});
