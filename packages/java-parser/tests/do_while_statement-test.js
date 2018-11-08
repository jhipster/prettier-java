"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("doWhileStatement", () => {
  it("simple", () => {
    expect(
      Parser.parse("do {} while (this);", parser => parser.doWhileStatement())
    ).to.deep.equal({
      type: "DO_WHILE_STATEMENT",
      body: {
        type: "BLOCK",
        statements: []
      },
      condition: {
        type: "THIS"
      }
    });
  });
});
