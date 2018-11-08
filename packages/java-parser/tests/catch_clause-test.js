"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("catchClause", () => {
  it("simple", () => {
    expect(
      Parser.parse("catch (A e) {}", parser => parser.catchClause())
    ).to.deep.equal({
      type: "CATCH_CLAUSE",
      modifiers: [],
      catchType: {
        type: "CATCH_TYPE",
        list: [
          {
            type: "QUALIFIED_NAME",
            name: [
              {
                type: "IDENTIFIER",
                value: "A"
              }
            ]
          }
        ]
      },
      id: {
        type: "IDENTIFIER",
        value: "e"
      },
      block: {
        type: "BLOCK",
        statements: []
      }
    });
  });

  it("one modifier", () => {
    expect(
      Parser.parse("catch (@Bean A e) {}", parser => parser.catchClause())
    ).to.deep.equal({
      type: "CATCH_CLAUSE",
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
      catchType: {
        type: "CATCH_TYPE",
        list: [
          {
            type: "QUALIFIED_NAME",
            name: [
              {
                type: "IDENTIFIER",
                value: "A"
              }
            ]
          }
        ]
      },
      id: {
        type: "IDENTIFIER",
        value: "e"
      },
      block: {
        type: "BLOCK",
        statements: []
      }
    });
  });

  it("multiple modifiers", () => {
    expect(
      Parser.parse("catch (@Bean final A e) {}", parser => parser.catchClause())
    ).to.deep.equal({
      type: "CATCH_CLAUSE",
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
        },
        {
          type: "MODIFIER",
          value: "final"
        }
      ],
      catchType: {
        type: "CATCH_TYPE",
        list: [
          {
            type: "QUALIFIED_NAME",
            name: [
              {
                type: "IDENTIFIER",
                value: "A"
              }
            ]
          }
        ]
      },
      id: {
        type: "IDENTIFIER",
        value: "e"
      },
      block: {
        type: "BLOCK",
        statements: []
      }
    });
  });
});
