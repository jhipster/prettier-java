"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("identifierArguments", () => {
  it("simple", () => {
    expect(
      Parser.parse("a()", parser => parser.identifierArguments())
    ).to.deep.equal({
      type: "IDENTIFIER_ARGUMENTS",
      name: {
        type: "IDENTIFIER",
        value: "a"
      },
      arguments: {
        type: "EXPRESSION_LIST",
        list: []
      }
    });
  });
});
