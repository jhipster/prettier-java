"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("semiColonStatement", () => {
  it("simple", () => {
    expect(
      Parser.parse(";", parser => parser.semiColonStatement())
    ).to.deep.equal({
      type: "SEMI_COLON_STATEMENT"
    });
  });
});
