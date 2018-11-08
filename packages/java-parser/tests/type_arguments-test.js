"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("typeArguments", () => {
  it("single", () => {
    expect(
      Parser.parse("<boolean>", parser => parser.typeArguments())
    ).to.deep.equal({
      type: "TYPE_ARGUMENTS",
      value: {
        type: "TYPE_LIST",
        list: [
          {
            type: "TYPE_ARGUMENT",
            argument: {
              type: "PRIMITIVE_TYPE",
              value: "boolean"
            },
            super: undefined,
            extends: undefined
          }
        ]
      }
    });
  });

  it("multi", () => {
    expect(
      Parser.parse("<boolean, char>", parser => parser.typeArguments())
    ).to.deep.equal({
      type: "TYPE_ARGUMENTS",
      value: {
        type: "TYPE_LIST",
        list: [
          {
            type: "TYPE_ARGUMENT",
            argument: {
              type: "PRIMITIVE_TYPE",
              value: "boolean"
            },
            super: undefined,
            extends: undefined
          },
          {
            type: "TYPE_ARGUMENT",
            argument: {
              type: "PRIMITIVE_TYPE",
              value: "char"
            },
            super: undefined,
            extends: undefined
          }
        ]
      }
    });
  });
});
