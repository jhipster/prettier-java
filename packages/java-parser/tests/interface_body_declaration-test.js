"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("interfaceBodyDeclaration", () => {
  it("simple", () => {
    expect(
      Parser.parse("void a() {}", parser => parser.interfaceBodyDeclaration())
    ).to.deep.equal({
      type: "INTERFACE_BODY_DECLARATION",
      modifiers: [],
      declaration: {
        type: "INTERFACE_METHOD_DECLARATION",
        modifiers: [],
        typeParameters: undefined,
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
      },
      followedEmptyLine: false
    });
  });

  it("one modifier", () => {
    expect(
      Parser.parse("@Bean void a() {}", parser =>
        parser.interfaceBodyDeclaration()
      )
    ).to.deep.equal({
      type: "INTERFACE_BODY_DECLARATION",
      modifiers: [
        {
          type: "ANNOTATION",
          name: {
            type: "QUALIFIED_NAME",
            name: [
              {
                type: "IDENTIFIER",
                value: "Bean"
              }
            ]
          },
          hasBraces: false,
          values: []
        }
      ],
      declaration: {
        type: "INTERFACE_METHOD_DECLARATION",
        modifiers: [],
        typeParameters: undefined,
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
      },
      followedEmptyLine: false
    });
  });

  it("multiple modifiers", () => {
    expect(
      Parser.parse("@Bean public void a() {}", parser =>
        parser.interfaceBodyDeclaration()
      )
    ).to.deep.equal({
      type: "INTERFACE_BODY_DECLARATION",
      modifiers: [
        {
          type: "ANNOTATION",
          name: {
            type: "QUALIFIED_NAME",
            name: [
              {
                type: "IDENTIFIER",
                value: "Bean"
              }
            ]
          },
          hasBraces: false,
          values: []
        },
        {
          type: "MODIFIER",
          value: "public"
        }
      ],
      declaration: {
        type: "INTERFACE_METHOD_DECLARATION",
        modifiers: [],
        typeParameters: undefined,
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
      },
      followedEmptyLine: false
    });
  });
});
