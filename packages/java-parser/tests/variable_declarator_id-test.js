"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("variableDeclaratorId", () => {
  it("primitiveType", () => {
    expect(
      Parser.parse("A", parser => parser.variableDeclaratorId())
    ).to.deep.equal({
      type: "VARIABLE_DECLARATOR_ID",
      id: {
        type: "IDENTIFIER",
        value: "A"
      },
      dimensions: []
    });
  });

  it("one square", () => {
    expect(
      Parser.parse("A[]", parser => parser.variableDeclaratorId())
    ).to.deep.equal({
      type: "VARIABLE_DECLARATOR_ID",
      id: {
        type: "IDENTIFIER",
        value: "A"
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
      Parser.parse("A[][]", parser => parser.variableDeclaratorId())
    ).to.deep.equal({
      type: "VARIABLE_DECLARATOR_ID",
      id: {
        type: "IDENTIFIER",
        value: "A"
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
});
