"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("simpleCreator", () => {
  it("rest classCreatorRest", () => {
    expect(Parser.parse("a()", parser => parser.simpleCreator())).to.deep.equal(
      {
        type: "SIMPLE_CREATOR",
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
      }
    );
  });

  it("rest arrayCreatorRest", () => {
    expect(
      Parser.parse("a[]{}", parser => parser.simpleCreator())
    ).to.deep.equal({
      type: "SIMPLE_CREATOR",
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
        type: "ARRAY_CREATOR_REST",
        dimensions: [
          {
            type: "DIMENSION"
          }
        ],
        arrayInitializer: {
          type: "ARRAY_INITIALIZER",
          variableInitializers: []
        }
      }
    });
  });
});
