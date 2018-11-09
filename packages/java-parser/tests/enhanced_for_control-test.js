"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("enhancedForControl", () => {
  it("empty", () => {
    expect(
      Parser.parse("boolean a : this", parser => parser.enhancedForControl())
    ).to.deep.equal({
      type: "ENHANCED_FOR_CONTROL",
      modifiers: [],
      typeType: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      id: {
        type: "VARIABLE_DECLARATOR_ID",
        id: {
          type: "IDENTIFIER",
          value: "a"
        },
        dimensions: []
      },
      iterator: {
        type: "THIS"
      }
    });
  });

  it("one modifier", () => {
    expect(
      Parser.parse("@Bean boolean a : this", parser =>
        parser.enhancedForControl()
      )
    ).to.deep.equal({
      type: "ENHANCED_FOR_CONTROL",
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
      typeType: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      id: {
        type: "VARIABLE_DECLARATOR_ID",
        id: {
          type: "IDENTIFIER",
          value: "a"
        },
        dimensions: []
      },
      iterator: {
        type: "THIS"
      }
    });
  });

  it("multiple modifiers", () => {
    expect(
      Parser.parse("@Bean final boolean a : this", parser =>
        parser.enhancedForControl()
      )
    ).to.deep.equal({
      type: "ENHANCED_FOR_CONTROL",
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
          value: "final"
        }
      ],
      typeType: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      id: {
        type: "VARIABLE_DECLARATOR_ID",
        id: {
          type: "IDENTIFIER",
          value: "a"
        },
        dimensions: []
      },
      iterator: {
        type: "THIS"
      }
    });
  });
});
