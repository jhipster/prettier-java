"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("typeParameters", () => {
  it("single", () => {
    expect(
      Parser.parse("<A>", parser => parser.typeParameters())
    ).to.deep.equal({
      type: "TYPE_PARAMETERS",
      list: [
        {
          type: "TYPE_PARAMETER",
          modifiers: [],
          name: {
            type: "IDENTIFIER",
            value: "A"
          },
          typeBound: undefined
        }
      ]
    });
  });

  it("multiple", () => {
    expect(
      Parser.parse("<A, B>", parser => parser.typeParameters())
    ).to.deep.equal({
      type: "TYPE_PARAMETERS",
      list: [
        {
          type: "TYPE_PARAMETER",
          modifiers: [],
          name: {
            type: "IDENTIFIER",
            value: "A"
          },
          typeBound: undefined
        },
        {
          type: "TYPE_PARAMETER",
          modifiers: [],
          name: {
            type: "IDENTIFIER",
            value: "B"
          },
          typeBound: undefined
        }
      ]
    });
  });
});
