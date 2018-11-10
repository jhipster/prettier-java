"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("assertStatement", () => {
  it("one expression", () => {
    expect(
      Parser.parse("assert this;", parser => parser.assertStatement())
    ).to.deep.equal({
      type: "ASSERT_STATEMENT",
      booleanExpression: {
        type: "THIS"
      },
      valueExpression: undefined
    });
  });

  it("multiple expressions", () => {
    expect(
      Parser.parse("assert this:super;", parser => parser.assertStatement())
    ).to.deep.equal({
      type: "ASSERT_STATEMENT",
      booleanExpression: {
        type: "THIS"
      },
      valueExpression: {
        type: "SUPER"
      }
    });
  });
});
