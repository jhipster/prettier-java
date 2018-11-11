"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("whileStatement", () => {
  it("simple", () => {
    expect(
      Parser.parse("while (this) {}", parser => parser.whileStatement())
    ).to.deep.equal({
      type: "WHILE_STATEMENT",
      condition: {
        type: "THIS"
      },
      body: {
        type: "BLOCK",
        statements: []
      }
    });
  });
});
