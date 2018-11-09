"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("switchBlockStatementGroup", () => {
  it("single", () => {
    expect(
      Parser.parse("case a: boolean A;", parser =>
        parser.switchBlockStatementGroup()
      )
    ).to.deep.equal({
      type: "SWITCH_BLOCK_STATEMENT_GROUP",
      labels: [
        {
          type: "SWITCH_LABEL_CASE",
          expression: {
            type: "IDENTIFIER",
            value: "a"
          }
        }
      ],
      statements: [
        {
          type: "EXPRESSION_STATEMENT",
          expression: {
            type: "LOCAL_VARIABLE_DECLARATION",
            modifiers: [],
            typeType: {
              type: "PRIMITIVE_TYPE",
              value: "boolean"
            },
            declarators: {
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
            }
          },
          followedEmptyLine: false
        }
      ]
    });
  });

  it("multiple", () => {
    expect(
      Parser.parse("case a: case b: default: boolean A; a:this;", parser =>
        parser.switchBlockStatementGroup()
      )
    ).to.deep.equal({
      type: "SWITCH_BLOCK_STATEMENT_GROUP",
      labels: [
        {
          type: "SWITCH_LABEL_CASE",
          expression: {
            type: "IDENTIFIER",
            value: "a"
          }
        },
        {
          type: "SWITCH_LABEL_CASE",
          expression: {
            type: "IDENTIFIER",
            value: "b"
          }
        },
        {
          type: "SWITCH_LABEL_DEFAULT"
        }
      ],
      statements: [
        {
          type: "EXPRESSION_STATEMENT",
          expression: {
            type: "LOCAL_VARIABLE_DECLARATION",
            modifiers: [],
            typeType: {
              type: "PRIMITIVE_TYPE",
              value: "boolean"
            },
            declarators: {
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
            }
          },
          followedEmptyLine: false
        },
        {
          type: "IDENTIFIER_STATEMENT",
          identifier: {
            type: "IDENTIFIER",
            value: "a"
          },
          statement: {
            type: "EXPRESSION_STATEMENT",
            expression: {
              type: "THIS"
            },
            followedEmptyLine: false
          }
        }
      ]
    });
  });

  it("no statements", () => {
    expect(
      Parser.parse("case a:", parser => parser.switchBlockStatementGroup())
    ).to.deep.equal({
      type: "SWITCH_BLOCK_STATEMENT_GROUP",
      labels: [
        {
          type: "SWITCH_LABEL_CASE",
          expression: {
            type: "IDENTIFIER",
            value: "a"
          }
        }
      ],
      statements: []
    });
  });
});
