"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("innerCreator", () => {
  it("without typeArguments", () => {
    expect(Parser.parse("a()", parser => parser.innerCreator())).to.deep.equal({
      type: "INNER_CREATOR",
      id: {
        type: "IDENTIFIER",
        value: "a"
      },
      typeArguments: undefined,
      rest: {
        type: "CLASS_CREATOR_REST",
        arguments: {
          type: "EXPRESSION_LIST",
          list: []
        },
        body: undefined
      }
    });
  });

  it("with typeArguments", () => {
    expect(
      Parser.parse("a<>()", parser => parser.innerCreator())
    ).to.deep.equal({
      type: "INNER_CREATOR",
      id: {
        type: "IDENTIFIER",
        value: "a"
      },
      typeArguments: {
        type: "TYPE_ARGUMENTS",
        value: undefined
      },
      rest: {
        type: "CLASS_CREATOR_REST",
        arguments: {
          type: "EXPRESSION_LIST",
          list: []
        },
        body: undefined
      }
    });
  });
});
