"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("interfaceMemberDeclaration", () => {
  it("interfaceMethodDeclaration", () => {
    expect(
      Parser.parse("void a() {}", parser => parser.interfaceMemberDeclaration())
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

  it("interfaceDeclaration", () => {
    expect(
      Parser.parse("interface A{}", parser =>
        parser.interfaceMemberDeclaration()
      )
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

  it("classDeclaration", () => {
    expect(
      Parser.parse("class A{}", parser => parser.interfaceMemberDeclaration())
    ).to.deep.equal({
      type: "CLASS_DECLARATION",
      name: {
        type: "IDENTIFIER",
        value: "A"
      },
      body: {
        type: "CLASS_BODY",
        declarations: []
      },
      extends: undefined,
      implements: undefined,
      typeParameters: undefined
    });
  });

  it("enumDeclaration", () => {
    expect(
      Parser.parse("enum A{}", parser => parser.interfaceMemberDeclaration())
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
});
