"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("squareExpressionRest", () => {
  it("squareExpression", () => {
    expect(
      Parser.parse("[super]", parser => parser.squareExpressionRest())
    ).to.deep.equal({
      type: "SQUARE_EXPRESSION_REST",
      expression: {
        type: "SUPER"
      }
    });
  });
});
