"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("variableDeclarator", () => {
  it("without init", () => {
    expect(
      Parser.parse("A", parser => parser.variableDeclarator())
    ).to.deep.equal({
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
    });
  });

  it("with init", () => {
    expect(
      Parser.parse("A = this", parser => parser.variableDeclarator())
    ).to.deep.equal({
      type: "VARIABLE_DECLARATOR",
      id: {
        type: "VARIABLE_DECLARATOR_ID",
        id: {
          type: "IDENTIFIER",
          value: "A"
        },
        dimensions: []
      },
      init: {
        type: "THIS"
      }
    });
  });
});
