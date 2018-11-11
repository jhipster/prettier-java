"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("identifierStatement", () => {
  it("simple", () => {
    expect(
      Parser.parse("a:this;", parser => parser.identifierStatement())
    ).to.deep.equal({
      type: "IDENTIFIER_STATEMENT",
      identifier: {
        type: "IDENTIFIER",
        value: "a"
      },
      statement: {
        type: "EXPRESSION_STATEMENT",
        expression: {
          type: "THIS"
        },
        followedEmptyLine: false
      }
    });
  });
});
