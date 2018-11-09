"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("classOrInterfaceTypeElement", () => {
  it("identifier", () => {
    expect(
      Parser.parse("A", parser => parser.classOrInterfaceTypeElement())
    ).to.deep.equal({
      type: "IDENTIFIER",
      value: "A"
    });
  });

  it("typeArguments", () => {
    expect(
      Parser.parse("A<boolean>", parser => parser.classOrInterfaceTypeElement())
    ).to.deep.equal({
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
    });
  });
});
