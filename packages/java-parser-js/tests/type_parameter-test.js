"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("typeParameter", () => {
  it("identifier", () => {
    expect(Parser.parse("A", parser => parser.typeParameter())).to.deep.equal({
      type: "TYPE_PARAMETER",
      modifiers: [],
      name: {
        type: "IDENTIFIER",
        value: "A"
      },
      typeBound: undefined
    });
  });

  it("annotations", () => {
    expect(
      Parser.parse("@Bean A", parser => parser.typeParameter())
    ).to.deep.equal({
      type: "TYPE_PARAMETER",
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
      name: {
        type: "IDENTIFIER",
        value: "A"
      },
      typeBound: undefined
    });
  });

  it("typeBound", () => {
    expect(
      Parser.parse("A extends boolean", parser => parser.typeParameter())
    ).to.deep.equal({
      type: "TYPE_PARAMETER",
      modifiers: [],
      name: {
        type: "IDENTIFIER",
        value: "A"
      },
      typeBound: {
        type: "TYPE_BOUND",
        list: [
          {
            type: "PRIMITIVE_TYPE",
            value: "boolean"
          }
        ]
      }
    });
  });
});
