"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("identifiers", () => {
  it("empty", () => {
    expect(Parser.parse("()", parser => parser.identifiers())).to.deep.equal({
      type: "IDENTIFIERS",
      identifiers: undefined
    });
  });

  it("identifierList", () => {
    expect(Parser.parse("(a)", parser => parser.identifiers())).to.deep.equal({
      type: "IDENTIFIERS",
      identifiers: {
        type: "IDENTIFIER_LIST",
        list: ["a"]
      }
    });
  });
});
