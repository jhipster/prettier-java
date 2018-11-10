"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("throwStatement", () => {
  it("simple", () => {
    expect(
      Parser.parse("throw this;", parser => parser.throwStatement())
    ).to.deep.equal({
      type: "THROW_STATEMENT",
      expression: {
        type: "THIS"
      }
    });
  });
});
