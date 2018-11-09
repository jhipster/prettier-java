"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("enumConstants", () => {
  it("single", () => {
    expect(Parser.parse("A", parser => parser.enumConstants())).to.deep.equal({
      type: "ENUM_CONSTANTS",
      list: [
        {
          type: "ENUM_CONSTANT",
          modifiers: [],
          name: {
            type: "IDENTIFIER",
            value: "A"
          },
          arguments: undefined,
          body: undefined
        }
      ]
    });
  });

  it("multiple", () => {
    expect(
      Parser.parse("A, B", parser => parser.enumConstants())
    ).to.deep.equal({
      type: "ENUM_CONSTANTS",
      list: [
        {
          type: "ENUM_CONSTANT",
          modifiers: [],
          name: {
            type: "IDENTIFIER",
            value: "A"
          },
          arguments: undefined,
          body: undefined
        },
        {
          type: "ENUM_CONSTANT",
          modifiers: [],
          name: {
            type: "IDENTIFIER",
            value: "B"
          },
          arguments: undefined,
          body: undefined
        }
      ]
    });
  });
});
