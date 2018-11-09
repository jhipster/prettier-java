"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("variableDeclarators", () => {
  it("single", () => {
    expect(
      Parser.parse("A", parser => parser.variableDeclarators())
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

  it("multiple", () => {
    expect(
      Parser.parse("A, B", parser => parser.variableDeclarators())
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
        },
        {
          type: "VARIABLE_DECLARATOR",
          id: {
            type: "VARIABLE_DECLARATOR_ID",
            id: {
              type: "IDENTIFIER",
              value: "B"
            },
            dimensions: []
          },
          init: undefined
        }
      ]
    });
  });
});
