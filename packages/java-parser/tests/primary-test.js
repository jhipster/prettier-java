"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("primary", () => {
  it("this", () => {
    expect(Parser.parse("this", parser => parser.primary())).to.deep.equal({
      type: "THIS"
    });
  });

  it("this invocation", () => {
    expect(Parser.parse("this()", parser => parser.primary())).to.deep.equal({
      type: "THIS",
      arguments: {
        type: "EXPRESSION_LIST",
        list: []
      }
    });
  });

  it("super", () => {
    expect(Parser.parse("super", parser => parser.primary())).to.deep.equal({
      type: "SUPER"
    });
  });

  it("super invocation", () => {
    expect(Parser.parse("super()", parser => parser.primary())).to.deep.equal({
      type: "SUPER",
      arguments: {
        type: "EXPRESSION_LIST",
        list: []
      }
    });
  });

  it("floatLiteral", () => {
    expect(Parser.parse("0.1", parser => parser.primary())).to.deep.equal({
      type: "FLOAT_LITERAL",
      value: "0.1"
    });
  });

  it("void", () => {
    expect(Parser.parse("void", parser => parser.primary())).to.deep.equal({
      type: "VOID"
    });
  });

  it("identifier", () => {
    expect(Parser.parse("A", parser => parser.primary())).to.deep.equal({
      type: "IDENTIFIER",
      value: "A"
    });
  });

  it("identifier with typeArguments", () => {
    expect(Parser.parse("A<B>", parser => parser.primary())).to.deep.equal({
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
    });
  });

  it("genericInvocation", () => {
    expect(
      Parser.parse("<boolean> this()", parser => parser.primary())
    ).to.deep.equal({
      type: "GENERIC_INVOCATION",
      typeArguments: {
        type: "TYPE_ARGUMENTS",
        value: {
          type: "TYPE_LIST",
          list: [
            {
              type: "PRIMITIVE_TYPE",
              value: "boolean"
            }
          ]
        }
      },
      invocation: {
        type: "THIS",
        arguments: {
          type: "EXPRESSION_LIST",
          list: []
        }
      }
    });
  });

  it("identifier with annotation", () => {
    expect(
      Parser.parse("@Bean A", parser => parser.expression())
    ).to.deep.equal({
      type: "TYPE_TYPE",
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
      value: {
        type: "IDENTIFIER",
        value: "A"
      },
      dimensions: []
    });
  });
});
