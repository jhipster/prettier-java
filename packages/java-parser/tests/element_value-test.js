"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("elementValue", () => {
  it("elementValue is annotation", () => {
    expect(
      Parser.parse("@Bean", parser => parser.elementValue())
    ).to.deep.equal({
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

  it("elementValue is expression", () => {
    expect(Parser.parse("this", parser => parser.elementValue())).to.deep.equal(
      {
        type: "THIS"
      }
    );
  });

  it("elementValue is elementValueArrayInitializer", () => {
    expect(
      Parser.parse("{@Something}", parser => parser.elementValue())
    ).to.deep.equal({
      type: "ELEMENT_VALUE_ARRAY_INITIALIZER",
      values: [
        {
          type: "ANNOTATION",
          name: {
            type: "QUALIFIED_NAME",
            name: [
              {
                type: "IDENTIFIER",
                value: "Something"
              }
            ]
          },
          hasBraces: false,
          values: []
        }
      ]
    });
  });
});
