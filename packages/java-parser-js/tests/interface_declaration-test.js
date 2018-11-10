"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("interfaceDeclaration", () => {
  it("empty", () => {
    expect(
      Parser.parse("interface A{}", parser => parser.interfaceDeclaration())
    ).to.deep.equal({
      type: "INTERFACE_DECLARATION",
      name: {
        type: "IDENTIFIER",
        value: "A"
      },
      typeParameters: undefined,
      extends: undefined,
      body: {
        type: "INTERFACE_BODY",
        declarations: []
      }
    });
  });

  it("typeParameters", () => {
    expect(
      Parser.parse("interface A<B>{}", parser => parser.interfaceDeclaration())
    ).to.deep.equal({
      type: "INTERFACE_DECLARATION",
      name: {
        type: "IDENTIFIER",
        value: "A"
      },
      typeParameters: {
        type: "TYPE_PARAMETERS",
        list: [
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
      },
      extends: undefined,
      body: {
        type: "INTERFACE_BODY",
        declarations: []
      }
    });
  });

  it("typeList", () => {
    expect(
      Parser.parse("interface A extends boolean {}", parser =>
        parser.interfaceDeclaration()
      )
    ).to.deep.equal({
      type: "INTERFACE_DECLARATION",
      name: {
        type: "IDENTIFIER",
        value: "A"
      },
      typeParameters: undefined,
      extends: {
        type: "TYPE_LIST",
        list: [
          {
            type: "PRIMITIVE_TYPE",
            value: "boolean"
          }
        ]
      },
      body: {
        type: "INTERFACE_BODY",
        declarations: []
      }
    });
  });
});
