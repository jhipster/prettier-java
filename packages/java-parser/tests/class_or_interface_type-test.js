"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("classOrInterfaceType", () => {
  it("identifiers", () => {
    expect(
      Parser.parse("A.B", parser => parser.classOrInterfaceType())
    ).to.deep.equal({
      type: "CLASS_OR_INTERFACE_TYPE",
      elements: [
        {
          type: "IDENTIFIER",
          value: "A"
        },
        {
          type: "IDENTIFIER",
          value: "B"
        }
      ]
    });
  });

  it("typeArguments", () => {
    expect(
      Parser.parse("A<boolean>.B<char>", parser =>
        parser.classOrInterfaceType()
      )
    ).to.deep.equal({
      type: "CLASS_OR_INTERFACE_TYPE",
      elements: [
        {
          type: "CLASS_OR_INTERFACE_TYPE_ELEMENT",
          name: {
            type: "IDENTIFIER",
            value: "A"
          },
          typeArguments: {
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
          }
        },
        {
          type: "CLASS_OR_INTERFACE_TYPE_ELEMENT",
          name: {
            type: "IDENTIFIER",
            value: "B"
          },
          typeArguments: {
            type: "TYPE_ARGUMENTS",
            value: {
              type: "TYPE_LIST",
              list: [
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
          }
        }
      ]
    });
  });
});
