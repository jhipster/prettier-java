"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("createdName", () => {
  it("identifierName", () => {
    expect(Parser.parse("a", parser => parser.createdName())).to.deep.equal({
      type: "IDENTIFIER_NAME",
      elements: [
        {
          type: "IDENTIFIER_NAME_ELEMENT",
          id: {
            type: "IDENTIFIER",
            value: "a"
          },
          typeArguments: undefined
        }
      ]
    });
  });

  it("primitiveType", () => {
    expect(
      Parser.parse("boolean", parser => parser.createdName())
    ).to.deep.equal({
      type: "PRIMITIVE_TYPE",
      value: "boolean"
    });
  });
});
