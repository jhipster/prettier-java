"use strict";

const { expect } = require("chai");
const javaParser = require("../src/index");
const JavaLexer = require("../src/lexer");

describe("Template expressions", () => {
  it("should parse template expression with string literals", () => {
    const input = `
    STR."{firstName}"
    `;
    expect(() => javaParser.parse(input, "templateExpression")).to.not.throw();
  });

  it("should parse template expression with text blocks", () => {
    const input = `
    STR."""
      toto
    """
    `;
    expect(() => javaParser.parse(input, "templateExpression")).to.not.throw();
  });

  it("should tokenise string template fragments", () => {
    const input = `"begin\\{alpha} mid \\{beta} end"`;

    const { tokens } = JavaLexer.tokenize(input);

    expect(tokens).to.have.length(5);
    expect(tokens.map(token => token.image)).to.have.members(["\"begin\\{", "alpha", "} mid \\{", "beta", "} end\""]);
  });

  it("should parse template expression with string templates", () => {
    const input = `STR."begin\\{alpha} mid \\{beta} end"`;

    expect(() => javaParser.parse(input, "templateExpression")).to.not.throw();
  });

  it("should tokenise text block templates fragments", () => {
    const input = `"""
      begin
      \\{alpha}
      mid "
      \\{beta}

      end
      """`;

    const { tokens } = JavaLexer.tokenize(input);

    expect(tokens).to.have.length(5);
    expect(tokens.map(token => token.image)).to.have.members([
      '"""\n      begin\n      \\{',
      "alpha",
      '}\n      mid "\n      \\{',
      "beta",
      '}\n\n      end\n      """'
    ]);
  });

  it("should parse template expression with text block templates", () => {
    const input = `STR."""
      begin
      \\{alpha}
      mid "
      \\{beta}

      end
      """`;

    expect(() => javaParser.parse(input, "templateExpression")).to.not.throw();
  });

  it("should parse template expression with text block templates without quote inside", () => {
    const input = `STR."""
      begin
      \\{alpha}
      mid
      \\{beta}

      end
      """`;

    expect(() => javaParser.parse(input, "templateExpression")).to.not.throw();
  });

  it("should still parse simple if/else", () => {
    const input = `
      String formatted = "unknown";
      if (o instanceof Integer i) {
          formatted = String.format("int %d", i);
      } else if (o instanceof Double d) {
          formatted = String.format("double %f", d);
      }
      `;

    javaParser.parse(input, "methodDeclaration");
    expect(() => javaParser.parse(input, "methodDeclaration")).to.not.throw();
  });
});
