"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("arguments", () => {
  it("empty", () => {
    expect(Parser.parse("()", parser => parser.arguments())).to.deep.equal({
      type: "EXPRESSION_LIST",
      list: []
    });
  });

  it("with true parameter", () => {
    expect(Parser.parse("(true)", parser => parser.arguments())).to.deep.equal({
      type: "EXPRESSION_LIST",
      list: [
        {
          type: "BOOLEAN_LITERAL",
          value: "true"
        }
      ]
    });
  });
});
