"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("interfaceMethodDeclaration", () => {
  it("void", () => {
    expect(
      Parser.parse("void a() {}", parser => parser.interfaceMethodDeclaration())
    ).to.deep.equal({
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
    });
  });

  it("one modifier", () => {
    expect(
      Parser.parse("public void a() {}", parser =>
        parser.interfaceMethodDeclaration()
      )
    ).to.deep.equal({
      type: "INTERFACE_METHOD_DECLARATION",
      modifiers: [{ type: "MODIFIER", value: "public" }],
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
    });
  });

  it("multiple modifier", () => {
    expect(
      Parser.parse("public static void a() {}", parser =>
        parser.interfaceMethodDeclaration()
      )
    ).to.deep.equal({
      type: "INTERFACE_METHOD_DECLARATION",
      modifiers: [
        { type: "MODIFIER", value: "public" },
        { type: "MODIFIER", value: "static" }
      ],
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
    });
  });

  it("typeParameter", () => {
    expect(
      Parser.parse("<Abc> void a() {}", parser =>
        parser.interfaceMethodDeclaration()
      )
    ).to.deep.equal({
      type: "INTERFACE_METHOD_DECLARATION",
      modifiers: [],
      typeParameters: {
        type: "TYPE_PARAMETERS",
        list: [
          {
            type: "TYPE_PARAMETER",
            modifiers: [],
            name: {
              type: "IDENTIFIER",
              value: "Abc"
            },
            typeBound: undefined
          }
        ]
      },
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
    });
  });

  it("single square", () => {
    expect(
      Parser.parse("void a()[] {}", parser =>
        parser.interfaceMethodDeclaration()
      )
    ).to.deep.equal({
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
      dimensions: [
        {
          type: "DIMENSION"
        }
      ],
      throws: undefined,
      body: {
        type: "BLOCK",
        statements: []
      }
    });
  });

  it("multiple squares", () => {
    expect(
      Parser.parse("void a()[][] {}", parser =>
        parser.interfaceMethodDeclaration()
      )
    ).to.deep.equal({
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
      dimensions: [
        {
          type: "DIMENSION"
        },
        {
          type: "DIMENSION"
        }
      ],
      throws: undefined,
      body: {
        type: "BLOCK",
        statements: []
      }
    });
  });

  it("throws", () => {
    expect(
      Parser.parse("void a() throws Something {}", parser =>
        parser.interfaceMethodDeclaration()
      )
    ).to.deep.equal({
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
      throws: {
        type: "QUALIFIED_NAME_LIST",
        list: [
          {
            type: "QUALIFIED_NAME",
            name: [
              {
                type: "IDENTIFIER",
                value: "Something"
              }
            ]
          }
        ]
      },
      body: {
        type: "BLOCK",
        statements: []
      }
    });
  });

  it("genericInterfaceMethodDeclaration", () => {
    expect(
      Parser.parse("<A> void a() {}", parser =>
        parser.interfaceMethodDeclaration()
      )
    ).to.deep.equal({
      type: "INTERFACE_METHOD_DECLARATION",
      modifiers: [],
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
    });
  });
});
