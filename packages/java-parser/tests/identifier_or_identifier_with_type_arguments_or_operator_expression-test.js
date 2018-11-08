"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("identifierOrIdentifierWithTypeArgumentsOrOperatorExpression", () => {
  it("identifier", () => {
    expect(
      Parser.parse("i", parser =>
        parser.identifierOrIdentifierWithTypeArgumentsOrOperatorExpression()
      )
    ).to.deep.equal({
      type: "IDENTIFIER",
      value: "i"
    });
  });

  it("identifier with typeArguments", () => {
    expect(
      Parser.parse("i<boolean>", parser =>
        parser.identifierOrIdentifierWithTypeArgumentsOrOperatorExpression()
      )
    ).to.deep.equal({
      type: "CLASS_OR_INTERFACE_TYPE_ELEMENT",
      name: {
        type: "IDENTIFIER",
        value: "i"
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
              extends: undefined,
              super: undefined
            }
          ]
        }
      }
    });
  });

  it("operatorExpression Less", () => {
    expect(
      Parser.parse("i < array.length", parser =>
        parser.identifierOrIdentifierWithTypeArgumentsOrOperatorExpression()
      )
    ).to.deep.equal({
      type: "OPERATOR_EXPRESSION",
      left: {
        type: "IDENTIFIER",
        value: "i"
      },
      operator: {
        type: "OPERATOR",
        operator: "<"
      },
      right: {
        type: "TYPE_ARGUMENT",
        argument: {
          type: "CLASS_OR_INTERFACE_TYPE",
          elements: [
            {
              type: "IDENTIFIER",
              value: "array"
            },
            {
              type: "IDENTIFIER",
              value: "length"
            }
          ]
        },
        extends: undefined,
        super: undefined
      }
    });
  });
});
