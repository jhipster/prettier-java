"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("continueStatement", () => {
  it("with identifier", () => {
    expect(
      Parser.parse("continue a;", parser => parser.continueStatement())
    ).to.deep.equal({
      type: "CONTINUE_STATEMENT",
      identifier: {
        type: "IDENTIFIER",
        value: "a"
      }
    });
  });

  it("without identifier", () => {
    expect(
      Parser.parse("continue;", parser => parser.continueStatement())
    ).to.deep.equal({
      type: "CONTINUE_STATEMENT",
      identifier: undefined
    });
  });
});
