"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("superSuffix", () => {
  it("arguments", () => {
    expect(Parser.parse("()", parser => parser.superSuffix())).to.deep.equal({
      type: "EXPRESSION_LIST",
      list: []
    });
  });

  it("with arguments", () => {
    expect(Parser.parse(".a", parser => parser.superSuffix())).to.deep.equal({
      type: "DOT_IDENTIFIER_ARGUMENTS",
      name: {
        type: "IDENTIFIER",
        value: "a"
      },
      arguments: undefined
    });
  });
});
