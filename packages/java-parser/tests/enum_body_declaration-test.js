"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("enumBodyDeclarations", () => {
  it("empty", () => {
    expect(
      Parser.parse(";", parser => parser.enumBodyDeclarations())
    ).to.deep.equal({
      type: "ENUM_BODY_DECLARATIONS",
      declarations: []
    });
  });

  it("one declaration", () => {
    expect(
      Parser.parse("; void a() {}", parser => parser.enumBodyDeclarations())
    ).to.deep.equal({
      type: "ENUM_BODY_DECLARATIONS",
      declarations: [
        {
          type: "CLASS_BODY_MEMBER_DECLARATION",
          modifiers: [],
          declaration: {
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
          },
          followedEmptyLine: false
        }
      ]
    });
  });

  it("multiple declarations", () => {
    expect(
      Parser.parse("; void a() {} {}", parser => parser.enumBodyDeclarations())
    ).to.deep.equal({
      type: "ENUM_BODY_DECLARATIONS",
      declarations: [
        {
          type: "CLASS_BODY_MEMBER_DECLARATION",
          modifiers: [],
          declaration: {
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
          },
          followedEmptyLine: false
        },
        {
          type: "CLASS_BODY_BLOCK",
          static: false,
          block: {
            type: "BLOCK",
            statements: []
          }
        }
      ]
    });
  });
});
