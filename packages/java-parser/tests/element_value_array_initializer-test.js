"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("elementValueArrayInitializer", () => {
  it("single", () => {
    expect(
      Parser.parse("{@Something}", parser =>
        parser.elementValueArrayInitializer()
      )
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

  it("multiple", () => {
    expect(
      Parser.parse("{@Something, @Another}", parser =>
        parser.elementValueArrayInitializer()
      )
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
        },
        {
          type: "ANNOTATION",
          name: {
            type: "QUALIFIED_NAME",
            name: [
              {
                type: "IDENTIFIER",
                value: "Another"
              }
            ]
          },
          hasBraces: false,
          values: []
        }
      ]
    });
  });
  it("comma at the end", () => {
    expect(
      Parser.parse("{@Something,}", parser =>
        parser.elementValueArrayInitializer()
      )
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
