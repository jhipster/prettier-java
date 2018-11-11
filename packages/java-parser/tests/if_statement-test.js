"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("ifStatement", () => {
  it("if", () => {
    expect(
      Parser.parse("if (this) {}", parser => parser.ifStatement())
    ).to.deep.equal({
      type: "IF_STATEMENT",
      condition: {
        type: "THIS"
      },
      body: {
        type: "BLOCK",
        statements: []
      },
      else: undefined
    });
  });

  it("else", () => {
    expect(
      Parser.parse("if (this) {} else {}", parser => parser.ifStatement())
    ).to.deep.equal({
      type: "IF_STATEMENT",
      condition: {
        type: "THIS"
      },
      body: {
        type: "BLOCK",
        statements: []
      },
      else: {
        type: "BLOCK",
        statements: []
      }
    });
  });
});
