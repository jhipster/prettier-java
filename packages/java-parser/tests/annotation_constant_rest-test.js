"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("annotationConstantRest", () => {
  it("simple", () => {
    expect(
      Parser.parse("A", parser => parser.annotationConstantRest())
    ).to.deep.equal({
      type: "VARIABLE_DECLARATORS",
      list: [
        {
          type: "VARIABLE_DECLARATOR",
          id: {
            type: "VARIABLE_DECLARATOR_ID",
            id: {
              type: "IDENTIFIER",
              value: "A"
            },
            dimensions: []
          },
          init: undefined
        }
      ]
    });
  });
});
