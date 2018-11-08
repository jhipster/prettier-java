"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("booleanLiteral", () => {
  it("true", () => {
    expect(
      Parser.parse("true", parser => parser.booleanLiteral())
    ).to.deep.equal({
      type: "BOOLEAN_LITERAL",
      value: "true"
    });
  });

  it("false", () => {
    expect(
      Parser.parse("false", parser => parser.booleanLiteral())
    ).to.deep.equal({
      type: "BOOLEAN_LITERAL",
      value: "false"
    });
  });
});
