"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("postfixExpressionRest", () => {
  it("postfixExpression PlusPlus", () => {
    expect(
      Parser.parse("++", parser => parser.postfixExpressionRest())
    ).to.deep.equal({
      type: "POSTFIX_EXPRESSION_REST",
      value: "++"
    });
  });

  it("postfixExpression MinusMinus", () => {
    expect(
      Parser.parse("--", parser => parser.postfixExpressionRest())
    ).to.deep.equal({
      type: "POSTFIX_EXPRESSION_REST",
      value: "--"
    });
  });
});
