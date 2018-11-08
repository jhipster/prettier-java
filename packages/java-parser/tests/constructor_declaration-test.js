"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("constructorDeclaration", () => {
  it("simple", () => {
    expect(
      Parser.parse("a() {}", parser => parser.constructorDeclaration())
    ).to.deep.equal({
      type: "CONSTRUCTOR_DECLARATION",
      name: {
        type: "IDENTIFIER",
        value: "a"
      },
      parameters: {
        type: "FORMAL_PARAMETERS",
        parameters: []
      },
      throws: undefined,
      body: {
        type: "BLOCK",
        statements: []
      }
    });
  });

  it("throws", () => {
    expect(
      Parser.parse("a() throws Something {}", parser =>
        parser.constructorDeclaration()
      )
    ).to.deep.equal({
      type: "CONSTRUCTOR_DECLARATION",
      name: {
        type: "IDENTIFIER",
        value: "a"
      },
      parameters: {
        type: "FORMAL_PARAMETERS",
        parameters: []
      },
      throws: {
        type: "QUALIFIED_NAME_LIST",
        list: [
          {
            type: "QUALIFIED_NAME",
            name: [
              {
                type: "IDENTIFIER",
                value: "Something"
              }
            ]
          }
        ]
      },
      body: {
        type: "BLOCK",
        statements: []
      }
    });
  });
});
