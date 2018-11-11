"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("lambdaExpression", () => {
  it("empty parameters", () => {
    expect(
      Parser.parse("() -> {}", parser => parser.lambdaExpression())
    ).to.deep.equal({
      type: "LAMBDA_EXPRESSION",
      parameters: {
        type: "FORMAL_PARAMETERS",
        parameters: []
      },
      body: {
        type: "BLOCK",
        statements: []
      }
    });
  });
});
