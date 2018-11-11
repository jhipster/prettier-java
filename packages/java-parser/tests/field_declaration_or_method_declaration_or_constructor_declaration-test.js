"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("memberDeclaration", () => {
  it("methodDeclaration: void", () => {
    expect(
      Parser.parse("void a() {}", parser =>
        parser.fieldDeclarationOrMethodDeclarationOrConstructorDeclaration()
      )
    ).to.deep.equal({
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
    });
  });

  it("methodDeclaration: identifier", () => {
    expect(
      Parser.parse("A a() {}", parser =>
        parser.fieldDeclarationOrMethodDeclarationOrConstructorDeclaration()
      )
    ).to.deep.equal({
      type: "METHOD_DECLARATION",
      typeType: {
        type: "IDENTIFIER",
        value: "A"
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

  it("methodDeclaration: identifier with dims", () => {
    expect(
      Parser.parse("A[] a() {}", parser =>
        parser.fieldDeclarationOrMethodDeclarationOrConstructorDeclaration()
      )
    ).to.deep.equal({
      type: "METHOD_DECLARATION",
      typeType: {
        type: "TYPE_TYPE",
        modifiers: [],
        value: {
          type: "IDENTIFIER",
          value: "A"
        },
        dimensions: [
          {
            type: "DIMENSION"
          }
        ]
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

  it("methodDeclaration: identifier with typeArgument", () => {
    expect(
      Parser.parse("A<B> a() {}", parser =>
        parser.fieldDeclarationOrMethodDeclarationOrConstructorDeclaration()
      )
    ).to.deep.equal({
      type: "METHOD_DECLARATION",
      typeType: {
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
                  type: "IDENTIFIER",
                  value: "B"
                },
                extends: undefined,
                super: undefined
              }
            ]
          }
        }
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

  it("methodDeclaration: typeParameter", () => {
    expect(
      Parser.parse("boolean a() {}", parser =>
        parser.fieldDeclarationOrMethodDeclarationOrConstructorDeclaration()
      )
    ).to.deep.equal({
      type: "METHOD_DECLARATION",
      typeType: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
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

  it("methodDeclaration: single square", () => {
    expect(
      Parser.parse("void a()[] {}", parser =>
        parser.fieldDeclarationOrMethodDeclarationOrConstructorDeclaration()
      )
    ).to.deep.equal({
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

  it("methodDeclaration: multiple squares", () => {
    expect(
      Parser.parse("void a()[][] {}", parser =>
        parser.fieldDeclarationOrMethodDeclarationOrConstructorDeclaration()
      )
    ).to.deep.equal({
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

  it("methodDeclaration: throws", () => {
    expect(
      Parser.parse("void a() throws Something {}", parser =>
        parser.methodDeclaration()
      )
    ).to.deep.equal({
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

  it("constructorDeclaration: simple", () => {
    expect(
      Parser.parse("a() {}", parser =>
        parser.fieldDeclarationOrMethodDeclarationOrConstructorDeclaration()
      )
    ).to.deep.equal({
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
    });
  });

  it("constructorDeclaration: throws", () => {
    expect(
      Parser.parse("a() throws Something {}", parser =>
        parser.fieldDeclarationOrMethodDeclarationOrConstructorDeclaration()
      )
    ).to.deep.equal({
      type: "CONSTRUCTOR_DECLARATION",
      name: {
        type: "IDENTIFIER",
        value: "a"
      },
      parameters: {
        type: "FORMAL_PARAMETERS",
        parameters: []
      },
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

  it("fieldDeclaration: simple", () => {
    expect(
      Parser.parse("Abc def;", parser =>
        parser.fieldDeclarationOrMethodDeclarationOrConstructorDeclaration()
      )
    ).to.deep.equal({
      type: "FIELD_DECLARATION",
      typeType: {
        type: "IDENTIFIER",
        value: "Abc"
      },
      variableDeclarators: {
        type: "VARIABLE_DECLARATORS",
        list: [
          {
            type: "VARIABLE_DECLARATOR",
            id: {
              type: "VARIABLE_DECLARATOR_ID",
              id: {
                type: "IDENTIFIER",
                value: "def"
              },
              dimensions: []
            },
            init: undefined
          }
        ]
      },
      followedEmptyLine: false
    });
  });

  it("fieldDeclaration: with modifiers", () => {
    expect(
      Parser.parse("int STATIC_VARIABLE = 123;", parser =>
        parser.fieldDeclarationOrMethodDeclarationOrConstructorDeclaration()
      )
    ).to.deep.equal({
      type: "FIELD_DECLARATION",
      typeType: {
        type: "PRIMITIVE_TYPE",
        value: "int"
      },
      variableDeclarators: {
        type: "VARIABLE_DECLARATORS",
        list: [
          {
            type: "VARIABLE_DECLARATOR",
            id: {
              type: "VARIABLE_DECLARATOR_ID",
              id: {
                type: "IDENTIFIER",
                value: "STATIC_VARIABLE"
              },
              dimensions: []
            },
            init: {
              type: "DECIMAL_LITERAL",
              value: "123"
            }
          }
        ]
      },
      followedEmptyLine: false
    });
  });

  it("fieldDeclaration array", () => {
    expect(
      Parser.parse("int[] expandRatios;", parser =>
        parser.fieldDeclarationOrMethodDeclarationOrConstructorDeclaration()
      )
    ).to.deep.equal({
      type: "FIELD_DECLARATION",
      typeType: {
        dimensions: [
          {
            type: "DIMENSION"
          }
        ],
        modifiers: [],
        type: "TYPE_TYPE",
        value: {
          type: "PRIMITIVE_TYPE",
          value: "int"
        }
      },
      variableDeclarators: {
        type: "VARIABLE_DECLARATORS",
        list: [
          {
            type: "VARIABLE_DECLARATOR",
            id: {
              type: "VARIABLE_DECLARATOR_ID",
              dimensions: [],
              id: {
                type: "IDENTIFIER",
                value: "expandRatios"
              }
            },
            init: undefined
          }
        ]
      },
      followedEmptyLine: false
    });
  });
});
