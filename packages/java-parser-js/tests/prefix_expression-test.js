"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("prefixExpression", () => {
  it("Plus", () => {
    expect(
      Parser.parse("+this", parser => parser.prefixExpression())
    ).to.deep.equal({
      type: "PREFIX_EXPRESSION",
      prefix: "+",
      expression: {
        type: "THIS"
      }
    });
  });

  it("Minus", () => {
    expect(
      Parser.parse("-this", parser => parser.prefixExpression())
    ).to.deep.equal({
      type: "PREFIX_EXPRESSION",
      prefix: "-",
      expression: {
        type: "THIS"
      }
    });
  });

  it("PlusPlus", () => {
    expect(
      Parser.parse("++this", parser => parser.prefixExpression())
    ).to.deep.equal({
      type: "PREFIX_EXPRESSION",
      prefix: "++",
      expression: {
        type: "THIS"
      }
    });
  });

  it("MinusMinus", () => {
    expect(
      Parser.parse("--this", parser => parser.prefixExpression())
    ).to.deep.equal({
      type: "PREFIX_EXPRESSION",
      prefix: "--",
      expression: {
        type: "THIS"
      }
    });
  });

  it("Tilde", () => {
    expect(
      Parser.parse("~this", parser => parser.prefixExpression())
    ).to.deep.equal({
      type: "PREFIX_EXPRESSION",
      prefix: "~",
      expression: {
        type: "THIS"
      }
    });
  });

  it("Exclamationmark", () => {
    expect(
      Parser.parse("!this", parser => parser.prefixExpression())
    ).to.deep.equal({
      type: "PREFIX_EXPRESSION",
      prefix: "!",
      expression: {
        type: "THIS"
      }
    });
  });
});
