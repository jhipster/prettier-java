"use strict";

const { expect } = require("chai");
const javaParser = require("../src/index");

describe("The Java Parser fixed bugs", () => {
  it("issue #112 - Special handling of transitive keyword in module requires statement", () => {
    const input = `module foo {
      // Regular requires statement (without modifier)
      requires java.base;
      // "transitive" as keyword
      requires transitive java.compiler;
      // "transitive" as Identifier
      requires transitive.foo;
    }
    `;
    expect(() => javaParser.parse(input)).to.not.throw();
  });

  it("issue #113 - Bit shifting operators must not include whitespace - >>", () => {
    const input = "public class Foo{int hello = 1 >> 5;}";
    expect(() => javaParser.parse(input)).to.not.throw();
  });

  it("issue #113 - Bit shifting operators must not include whitespace - >>>", () => {
    const input = "public class Foo{int hello = 1 >>> 5;}";
    expect(() => javaParser.parse(input)).to.not.throw();
  });

  it("issue #113 - Bit shifting operators must not include whitespace - <<", () => {
    const input = "public class Foo{int hello = 1 << 5;}";
    expect(() => javaParser.parse(input)).to.not.throw();
  });

  it("issue #113 - Bit shifting operators must not include whitespace - space after first >", () => {
    const input = "public class Foo{int hello = 1 > >> 5;}";
    expect(() => javaParser.parse(input)).to.throw();
  });

  it("issue #113 - Bit shifting operators must not include whitespace - space after second >", () => {
    const input = "public class Foo{int hello = 1 >> > 5;}";
    expect(() => javaParser.parse(input)).to.throw();
  });
  it("issue #113 - Bit shifting operators must not include whitespace - space on all >", () => {
    const input = "public class Foo{int hello = 1 > > > 5;}";
    expect(() => javaParser.parse(input)).to.throw();
  });

  it("issue #113 - Bit shifting operators must not include whitespace - space after first <", () => {
    const input = "public class Foo{int hello = 1 < < 5;}";
    expect(() => javaParser.parse(input)).to.throw();
  });

  it("issue #129 - this.<bar>.baz()", () => {
    const input = "this.<Number>anyIterableType()";
    expect(() => javaParser.parse(input, "expression")).to.not.throw();
  });

  it("issue #131 - 1.0e-10", () => {
    const input = "1.0e-10";
    expect(() => javaParser.parse(input, "expression")).to.not.throw();
  });

  it("issue #130 - enumConstantList", () => {
    const input = "enum Foo { BAR, }";
    expect(() => javaParser.parse(input)).to.not.throw();
  });

  it("issue #158 - semicolons inside imports", () => {
    const input = "import Foo;;import Bar;";
    expect(() =>
      javaParser.parse(input, "ordinaryCompilationUnit")
    ).to.not.throw();
  });

  it("issue #177 - annotation in packageDeclaration", () => {
    const input = "@Test public class Foo{}";
    expect(() => javaParser.parse(input)).to.not.throw();
  });

  it("cast expression, parenthesis and binary shift", () => {
    const input = "(left) << right";
    expect(() => javaParser.parse(input, "expression")).to.not.throw();
  });

  it("cast expression, parenthesis and lessThan", () => {
    const input = "(left) < right";
    expect(() => javaParser.parse(input, "expression")).to.not.throw();
  });

  it("issue #412 - should parse a double[][] as primaryPrefix", () => {
    const input = "double[][]";
    expect(() => javaParser.parse(input, "primaryPrefix")).to.not.throw();
  });

  it("issue #498 - should not throw on yield static imports", () => {
    const inputs = ["Thread.yield();", "yield();", "yield(a);"];
    inputs.forEach(input => {
      expect(() => javaParser.parse(input, "statement")).to.not.throw();
    });
  });
});
