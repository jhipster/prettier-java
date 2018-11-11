"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("nonWildcardCreator", () => {
  it("simple", () => {
    expect(
      Parser.parse("<boolean> a()", parser => parser.nonWildcardCreator())
    ).to.deep.equal({
      type: "NON_WILDCARD_CREATOR",
      typeArguments: {
        type: "TYPE_ARGUMENTS",
        value: {
          type: "TYPE_LIST",
          list: [
            {
              type: "PRIMITIVE_TYPE",
              value: "boolean"
            }
          ]
        }
      },
      name: {
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
