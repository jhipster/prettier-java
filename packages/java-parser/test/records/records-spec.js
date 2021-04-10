"use strict";

const { expect } = require("chai");
const javaParser = require("../../src/index");

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
});
