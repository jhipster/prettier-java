"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("formalParameter", () => {
  it("simple", () => {
    expect(
      Parser.parse("boolean a", parser => parser.formalParameter())
    ).to.deep.equal({
      type: "FORMAL_PARAMETER",
      modifiers: [],
      typeType: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      dotDotDot: false,
      id: {
        type: "VARIABLE_DECLARATOR_ID",
        id: {
          type: "IDENTIFIER",
          value: "a"
        },
        dimensions: []
      }
    });
  });

  it("one annotation", () => {
    expect(
      Parser.parse("final boolean a", parser => parser.formalParameter())
    ).to.deep.equal({
      type: "FORMAL_PARAMETER",
      modifiers: [{ type: "MODIFIER", value: "final" }],
      typeType: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      dotDotDot: false,
      id: {
        type: "VARIABLE_DECLARATOR_ID",
        id: {
          type: "IDENTIFIER",
          value: "a"
        },
        dimensions: []
      }
    });
  });

  it("two annotation", () => {
    expect(
      Parser.parse("@Bean final boolean a", parser => parser.formalParameter())
    ).to.deep.equal({
      type: "FORMAL_PARAMETER",
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
        { type: "MODIFIER", value: "final" }
      ],
      typeType: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      dotDotDot: false,
      id: {
        type: "VARIABLE_DECLARATOR_ID",
        id: {
          type: "IDENTIFIER",
          value: "a"
        },
        dimensions: []
      }
    });
  });

  it("dotDotDot", () => {
    expect(
      Parser.parse("boolean... a", parser => parser.formalParameter())
    ).to.deep.equal({
      type: "FORMAL_PARAMETER",
      modifiers: [],
      typeType: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      dotDotDot: true,
      id: {
        type: "VARIABLE_DECLARATOR_ID",
        id: {
          type: "IDENTIFIER",
          value: "a"
        },
        dimensions: []
      }
    });
  });
});
