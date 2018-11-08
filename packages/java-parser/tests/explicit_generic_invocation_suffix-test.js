"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("explicitGenericInvocationSuffix", () => {
  it("super", () => {
    expect(
      Parser.parse("super ()", parser =>
        parser.explicitGenericInvocationSuffix()
      )
    ).to.deep.equal({
      type: "SUPER",
      arguments: {
        type: "EXPRESSION_LIST",
        list: []
      }
    });
  });

  it("identifierArguments", () => {
    expect(
      Parser.parse("a()", parser => parser.explicitGenericInvocationSuffix())
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
