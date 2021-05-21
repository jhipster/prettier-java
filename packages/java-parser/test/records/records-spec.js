"use strict";

const { expect } = require("chai");
const javaParser = require("../../src/index");

describe("The Java Parser fixed bugs", () => {
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
});
