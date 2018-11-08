"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("lambdaBody", () => {
  it("block", () => {
    expect(Parser.parse("{}", parser => parser.lambdaBody())).to.deep.equal({
      type: "BLOCK",
      statements: []
    });
  });

  it("expression", () => {
    expect(Parser.parse("this", parser => parser.lambdaBody())).to.deep.equal({
      type: "THIS"
    });
  });
});
