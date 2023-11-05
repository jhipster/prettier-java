import { expect } from "chai";
import javaParser from "../src/index.js";

describe("String literals", () => {
  it("should parse unicode", () => {
    const inputs = [
      '"π or \\u03c0"',
      '"\\uD83C\\uDF4F"',
      '"\\uD83C\\uDF4C"',
      '"\\uD83C\\uDF52"',
      '"🍎"'
    ];
    inputs.forEach(input => {
      expect(() => javaParser.parse(input, "literal")).to.not.throw();
    });
  });

  it("should parse octal literals", () => {
    const inputs = ['"\\52"', '"\\133"'];
    inputs.forEach(input => {
      expect(() => javaParser.parse(input, "literal")).to.not.throw();
    });
  });

  it("should parse escaped sequence", () => {
    const inputs = [
      '"\\b"',
      '"\\s"',
      '"\\t"',
      '"\\n"',
      '"\\f"',
      '"\\r"',
      '"\\""',
      '"\\\'"',
      '"\\\\"'
    ];
    inputs.forEach(input => {
      expect(() => javaParser.parse(input, "literal")).to.not.throw();
    });
  });
});
