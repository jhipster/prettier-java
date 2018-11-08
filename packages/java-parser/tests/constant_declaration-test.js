"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("constantDeclaration", () => {
  it("single declaration", () => {
    expect(
      Parser.parse("boolean A = this;", parser => parser.constantDeclaration())
    ).to.deep.equal({
      type: "CONSTANT_DECLARATION",
      typeType: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      declarators: [
        {
          type: "CONSTANT_DECLARATOR",
          name: {
            type: "IDENTIFIER",
            value: "A"
          },
          dimensions: [],
          init: {
            type: "THIS"
          }
        }
      ],
      followedEmptyLine: false
    });
  });

  it("mutiple declarations", () => {
    expect(
      Parser.parse("boolean A = this, B = super;", parser =>
        parser.constantDeclaration()
      )
    ).to.deep.equal({
      type: "CONSTANT_DECLARATION",
      typeType: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      declarators: [
        {
          type: "CONSTANT_DECLARATOR",
          name: {
            type: "IDENTIFIER",
            value: "A"
          },
          dimensions: [],
          init: {
            type: "THIS"
          }
        },
        {
          type: "CONSTANT_DECLARATOR",
          name: {
            type: "IDENTIFIER",
            value: "B"
          },
          dimensions: [],
          init: {
            type: "SUPER"
          }
        }
      ],
      followedEmptyLine: false
    });
  });
});
