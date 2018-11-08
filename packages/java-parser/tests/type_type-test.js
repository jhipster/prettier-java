"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("typeType", () => {
  it("primitiveType", () => {
    expect(Parser.parse("boolean", parser => parser.typeType())).to.deep.equal({
      type: "PRIMITIVE_TYPE",
      value: "boolean"
    });
  });

  it("identifier", () => {
    expect(Parser.parse("A", parser => parser.typeType())).to.deep.equal({
      type: "IDENTIFIER",
      value: "A"
    });
  });

  it("identifier with annotation", () => {
    expect(
      Parser.parse("@Bean boolean", parser => parser.typeType())
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
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      dimensions: []
    });
  });

  it("one square", () => {
    expect(
      Parser.parse("boolean[]", parser => parser.typeType())
    ).to.deep.equal({
      type: "TYPE_TYPE",
      modifiers: [],
      value: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      dimensions: [
        {
          type: "DIMENSION"
        }
      ]
    });
  });

  it("multiple square", () => {
    expect(
      Parser.parse("boolean[][]", parser => parser.typeType())
    ).to.deep.equal({
      type: "TYPE_TYPE",
      modifiers: [],
      value: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      dimensions: [
        {
          type: "DIMENSION"
        },
        {
          type: "DIMENSION"
        }
      ]
    });
  });

  it("annotation", () => {
    expect(Parser.parse("@Bean", parser => parser.typeType())).to.deep.equal({
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
    });
  });
});
