"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("formalParameterList", () => {
  it("one formalParameter", () => {
    expect(
      Parser.parse("boolean a", parser => parser.formalParameterList())
    ).to.deep.equal([
      {
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
      }
    ]);
  });

  it("multiple formalParameters", () => {
    expect(
      Parser.parse("boolean a, boolean b", parser =>
        parser.formalParameterList()
      )
    ).to.deep.equal([
      {
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
      },
      {
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
            value: "b"
          },
          dimensions: []
        }
      }
    ]);
  });

  it("last is dotDotDot", () => {
    expect(
      Parser.parse("boolean a, boolean... b", parser =>
        parser.formalParameterList()
      )
    ).to.deep.equal([
      {
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
      },
      {
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
            value: "b"
          },
          dimensions: []
        }
      }
    ]);
  });

  it("not last is dotDotDot -> expect error", () => {
    expect(() =>
      Parser.parse("boolean... a, boolean b", parser =>
        parser.formalParameterList()
      )
    ).to.throw('Only last parameter is allowed with "..."');
  });
});
