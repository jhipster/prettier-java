"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("identifierList", () => {
  it("one identifier", () => {
    expect(Parser.parse("a", parser => parser.identifierList())).to.deep.equal({
      type: "IDENTIFIER_LIST",
      list: ["a"]
    });
  });

  it("multiple identifiers", () => {
    expect(
      Parser.parse("a, b", parser => parser.identifierList())
    ).to.deep.equal({
      type: "IDENTIFIER_LIST",
      list: ["a", "b"]
    });
  });
});
