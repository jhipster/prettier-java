"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("finallyBlock", () => {
  it("empty", () => {
    expect(
      Parser.parse("finally {}", parser => parser.finallyBlock())
    ).to.deep.equal({
      type: "FINALLY_BLOCK",
      block: {
        type: "BLOCK",
        statements: []
      }
    });
  });
});
