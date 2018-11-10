"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("parExpression", () => {
  it("simple", () => {
    expect(
      Parser.parse("(this)", parser => parser.parExpression())
    ).to.deep.equal({
      type: "PAR_EXPRESSION",
      expression: {
        type: "THIS"
      }
    });
  });
});
