import { expect } from "chai";
import javaParser from "../src/index.js";
import JavaLexer from "../src/lexer.js";

describe("Template expressions", () => {
  it("should parse string template expression without embedded expressions", () => {
    const input = `STR."{firstName}"`;

    expect(() => javaParser.parse(input, "primary")).to.not.throw();
  });

  it("should parse string template expression", () => {
    const input = `STR."My name is \\{name}"`;

    expect(() => javaParser.parse(input, "primary")).to.not.throw();
  });

  it("should parse string template expression with empty embedded expression", () => {
    const input = `STR."My name is \\{}"`;

    expect(() => javaParser.parse(input, "primary")).to.not.throw();
  });

  it("should tokenize string template fragments", () => {
    const input = `"begin \\{alpha} mid \\{beta} end"`;

    const { tokens } = JavaLexer.tokenize(input);

    expect(tokens.map(token => token.image)).to.have.members([
      '"begin \\{',
      "alpha",
      "} mid \\{",
      "beta",
      '} end"'
    ]);
  });

  it("should parse string template expression with binary expression", () => {
    const input = `STR."\\{x} + \\{y} = \\{x + y}"`;

    expect(() => javaParser.parse(input, "primary")).to.not.throw();
  });

  it("should parse string template expression with method invocation", () => {
    const input = `STR."You have a \\{getOfferType()} waiting for you!"`;

    expect(() => javaParser.parse(input, "primary")).to.not.throw();
  });

  it("should parse string template expression with ternary expression", () => {
    const input = `STR."The file \\{filePath} \\{file.exists() ? "does" : "does not"} exist"`;

    expect(() => javaParser.parse(input, "primary")).to.not.throw();
  });

  it("should parse nested string template expression", () => {
    const input = `STR."\\{fruit[0]}, \\{STR."\\{fruit[1]}, \\{fruit[2]}"}"`;

    expect(() => javaParser.parse(input, "primary")).to.not.throw();
  });

  it("should parse string template expression with template processor from method invocation", () => {
    const input = `my.templateProcessor()."\\{fruit[0]}, \\{STR."\\{fruit[1]}, \\{fruit[2]}"}"`;

    expect(() => javaParser.parse(input, "primary")).to.not.throw();
  });

  it("should parse text block template expression without embedded expressions", () => {
    const input = `
    STR."""
      text
    """
    `;

    expect(() => javaParser.parse(input, "primary")).to.not.throw();
  });

  it("should parse text block template expression", () => {
    const input = `
    STR."""
      begin
      \\{alpha}
      mid
      \\{beta}
      end
      """
    `;
    expect(() => javaParser.parse(input, "primary")).to.not.throw();
  });

  it("should tokenize text block template fragments", () => {
    const input = `"""
      begin
      \\{alpha}
      mid
      \\{beta}
      end
      """`;

    const { tokens } = JavaLexer.tokenize(input);

    expect(tokens.map(token => token.image)).to.have.members([
      '"""\n      begin\n      \\{',
      "alpha",
      "}\n      mid\n      \\{",
      "beta",
      '}\n      end\n      """'
    ]);
  });
});
