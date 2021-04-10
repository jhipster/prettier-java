"use strict";

const { expect } = require("chai");
const javaParser = require("../../src/index");

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
});
