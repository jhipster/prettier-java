"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("forStatement", () => {
  it("basicForStatement: empty", () => {
    expect(
      Parser.parse("for (;;) {}", parser => parser.forStatement())
    ).to.deep.equal({
      type: "FOR_STATEMENT",
      forControl: {
        type: "BASIC_FOR_CONTROL",
        forInit: undefined,
        expression: undefined,
        expressionList: undefined
      },
      body: {
        type: "BLOCK",
        statements: []
      }
    });
  });
});
