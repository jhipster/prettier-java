"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("identifierNameElement", () => {
  it("without typeArguments", () => {
    expect(
      Parser.parse("a", parser => parser.identifierNameElement())
    ).to.deep.equal({
      type: "IDENTIFIER_NAME_ELEMENT",
      id: {
        type: "IDENTIFIER",
        value: "a"
      },
      typeArguments: undefined
    });
  });

  it("with typeArguments", () => {
    expect(
      Parser.parse("a<>", parser => parser.identifierNameElement())
    ).to.deep.equal({
      type: "IDENTIFIER_NAME_ELEMENT",
      id: {
        type: "IDENTIFIER",
        value: "a"
      },
      typeArguments: {
        type: "TYPE_ARGUMENTS",
        value: undefined
      }
    });
  });
});
