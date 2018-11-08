"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("memberDeclaration", () => {
  it("methodDeclaration", () => {
    expect(
      Parser.parse("void a() {}", parser => parser.memberDeclaration())
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

  it("constructorDeclaration", () => {
    expect(
      Parser.parse("a() {}", parser => parser.memberDeclaration())
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

  it("interfaceDeclaration", () => {
    expect(
      Parser.parse("interface A{}", parser => parser.memberDeclaration())
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

  it("annotationTypeDeclaration", () => {
    expect(
      Parser.parse("@interface A{}", parser => parser.memberDeclaration())
    ).to.deep.equal({
      type: "ANNOTATION_TYPE_DECLARATION",
      name: {
        type: "IDENTIFIER",
        value: "A"
      },
      body: {
        type: "ANNOTATION_TYPE_BODY",
        declarations: []
      }
    });
  });

  it("classDeclaration", () => {
    expect(
      Parser.parse("class A{}", parser => parser.memberDeclaration())
    ).to.deep.equal({
      type: "CLASS_DECLARATION",
      name: {
        type: "IDENTIFIER",
        value: "A"
      },
      extends: undefined,
      implements: undefined,
      typeParameters: undefined,
      body: {
        type: "CLASS_BODY",
        declarations: []
      }
    });
  });

  it("enumDeclaration", () => {
    expect(
      Parser.parse("enum A{}", parser => parser.memberDeclaration())
    ).to.deep.equal({
      type: "ENUM_DECLARATION",
      name: {
        type: "IDENTIFIER",
        value: "A"
      },
      implements: undefined,
      enumConstants: undefined,
      body: undefined
    });
  });

  it("genericMethodDeclarationOrGenericConstructorDeclaration", () => {
    expect(
      Parser.parse("<A> void a() {}", parser => parser.memberDeclaration())
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

  it("fieldDeclaration", () => {
    expect(
      Parser.parse("Abc def;", parser => parser.memberDeclaration())
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
});
