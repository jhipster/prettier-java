"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("interfaceBody", () => {
  it("empty", () => {
    expect(Parser.parse("{}", parser => parser.interfaceBody())).to.deep.equal({
      type: "INTERFACE_BODY",
      declarations: []
    });
  });

  it("one declaration", () => {
    expect(
      Parser.parse("{ void a() {} }", parser => parser.interfaceBody())
    ).to.deep.equal({
      type: "INTERFACE_BODY",
      declarations: [
        {
          type: "INTERFACE_BODY_DECLARATION",
          modifiers: [],
          declaration: {
            type: "INTERFACE_METHOD_DECLARATION",
            modifiers: [],
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
            },
            typeParameters: undefined
          },
          followedEmptyLine: false
        }
      ]
    });
  });

  it("multiple declarations", () => {
    expect(
      Parser.parse("{ void a() {} void b() {} }", parser =>
        parser.interfaceBody()
      )
    ).to.deep.equal({
      type: "INTERFACE_BODY",
      declarations: [
        {
          type: "INTERFACE_BODY_DECLARATION",
          modifiers: [],
          declaration: {
            type: "INTERFACE_METHOD_DECLARATION",
            modifiers: [],
            typeType: {
              type: "VOID"
            },
            typeParameters: undefined,
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
          type: "INTERFACE_BODY_DECLARATION",
          modifiers: [],
          declaration: {
            type: "INTERFACE_METHOD_DECLARATION",
            modifiers: [],
            typeType: {
              type: "VOID"
            },
            typeParameters: undefined,
            name: {
              type: "IDENTIFIER",
              value: "b"
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

  it("line comment standalone", () => {
    expect(
      Parser.parse("{\n// comment\n\n }", parser => parser.interfaceBody())
    ).to.deep.equal({
      type: "INTERFACE_BODY",
      declarations: [
        {
          type: "COMMENT_STANDALONE",
          value: "// comment"
        }
      ]
    });
  });

  it("line comment", () => {
    expect(
      Parser.parse("{\n// comment\n }", parser => parser.interfaceBody())
    ).to.deep.equal({
      type: "INTERFACE_BODY",
      declarations: [
        {
          type: "COMMENT_STANDALONE",
          value: "// comment"
        }
      ]
    });
  });
});
