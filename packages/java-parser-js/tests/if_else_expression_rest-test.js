"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("ifElseExpressionRest", () => {
  it("simple", () => {
    expect(
      Parser.parse("? super : null", parser => parser.ifElseExpressionRest())
    ).to.deep.equal({
      type: "IF_ELSE_EXPRESSION_REST",
      if: {
        type: "SUPER"
      },
      else: {
        type: "NULL"
      }
    });
  });
});
