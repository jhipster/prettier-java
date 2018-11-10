"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("explicitGenericInvocation", () => {
  it("simple", () => {
    expect(
      Parser.parse("<boolean> super()", parser =>
        parser.explicitGenericInvocation()
      )
    ).to.deep.equal({
      type: "GENERIC_INVOCATION",
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
      invocation: {
        type: "SUPER",
        arguments: {
          type: "EXPRESSION_LIST",
          list: []
        }
      }
    });
  });
});
