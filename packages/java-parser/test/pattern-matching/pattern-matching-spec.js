import { expect } from "chai";
import * as javaParser from "../../src/index.js";

describe("Pattern matching", () => {
  it("should handle Java instanceof with reference types", () => {
    const input = `a instanceof Point`;
    expect(() => javaParser.parse(input, "binaryExpression")).to.not.throw();
  });

  it("should handle Java instanceof with pattern matching", () => {
    const input = `a instanceof Point p`;
    expect(() => javaParser.parse(input, "binaryExpression")).to.not.throw();
  });

  it("should handle Java instanceof with pattern matching inside method", () => {
    const input = `
    static String formatter(Object o) {
        String formatted = "unknown";
        if (o instanceof Integer i) {
            formatted = String.format("int %d", i);
        } else if (o instanceof Long l) {
            formatted = String.format("long %d", l);
        } else if (o instanceof Double d) {
            formatted = String.format("double %f", d);
        } else if (o instanceof String s) {
            formatted = String.format("String %s", s);
        }
        return formatted;
    }
    `;
    expect(() => javaParser.parse(input, "methodDeclaration")).to.not.throw();
  });

  it("should support pattern matching guards", () => {
    const input = `
    package com.vimat.model;

    public record Buyer(String name, double bestPrice, double joker) {
      public boolean hasBestOffer(Buyer other) {
          return switch (other) {
            case null -> true;
            case Buyer b when this.bestPrice > b.bestPrice -> true;
            default -> false;
          };
        }
    }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should parse pattern list", () => {
    const input = `A a, B b`;
    expect(() =>
      javaParser.parse(input, "componentPatternList")
    ).to.not.throw();
  });
});
