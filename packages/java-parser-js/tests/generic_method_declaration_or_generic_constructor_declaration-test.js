"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("genericMethodDeclarationOrGenericConstructorDeclaration", () => {
  it("genericMethodDeclaration: simple", () => {
    expect(
      Parser.parse("<A> void a() {}", parser =>
        parser.genericMethodDeclarationOrGenericConstructorDeclaration()
      )
    ).to.deep.equal({
      type: "GENERIC_METHOD_DECLARATION",
      typeParameters: {
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
      },
      methodDeclaration: {
        type: "METHOD_DECLARATION",
        typeType: {
          type: "VOID"
        },
        name: {
          type: "IDENTIFIER",
          value: "a"
        },
        parameters: {
          type: "FORMAL_PARAMETERS",
          parameters: []
        },
        dimensions: [],
        throws: undefined,
        body: {
          type: "BLOCK",
          statements: []
        }
      }
    });
  });

  it("genericConstructorDeclaration: simple", () => {
    expect(
      Parser.parse("<A> a() {}", parser =>
        parser.genericMethodDeclarationOrGenericConstructorDeclaration()
      )
    ).to.deep.equal({
      type: "GENERIC_CONSTRUCTOR_DECLARATION",
      typeParameters: {
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
      },
      constructorDeclaration: {
        type: "CONSTRUCTOR_DECLARATION",
        name: {
          type: "IDENTIFIER",
          value: "a"
        },
        parameters: {
          type: "FORMAL_PARAMETERS",
          parameters: []
        },
        throws: undefined,
        body: {
          type: "BLOCK",
          statements: []
        }
      }
    });
  });
});
