"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("floatLiteral", () => {
  it("floatLiteral", () => {
    expect(Parser.parse("0.1", parser => parser.floatLiteral())).to.deep.equal({
      type: "FLOAT_LITERAL",
      value: "0.1"
    });
  });

  it("hexFloatLiteral", () => {
    expect(
      Parser.parse("0x1.8p1", parser => parser.floatLiteral())
    ).to.deep.equal({
      type: "HEX_FLOAT_LITERAL",
      value: "0x1.8p1"
    });
  });
});
