"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("methodBody", () => {
  it("block", () => {
    expect(Parser.parse("{}", parser => parser.methodBody())).to.deep.equal({
      type: "BLOCK",
      statements: []
    });
  });

  it("semiColon", () => {
    expect(Parser.parse(";", parser => parser.methodBody())).to.deep.equal(
      undefined
    );
  });

  it("charLiteral", () => {
    expect(
      Parser.parse(
        "{\nif (message.indexOf('h') > 0) {}\nint destination = message.indexOf('d');\n}",
        parser => parser.methodBody()
      )
    ).to.deep.equal({
      type: "BLOCK",
      statements: [
        {
          type: "IF_STATEMENT",
          condition: {
            type: "OPERATOR_EXPRESSION",
            left: {
              type: "QUALIFIED_EXPRESSION",
              expression: {
                type: "IDENTIFIER",
                value: "message"
              },
              rest: {
                type: "METHOD_INVOCATION",
                name: {
                  type: "IDENTIFIER",
                  value: "indexOf"
                },
                parameters: {
                  list: [
                    {
                      type: "CHAR_LITERAL",
                      value: "'h'"
                    }
                  ],
                  type: "EXPRESSION_LIST"
                },
                dimensions: []
              }
            },
            operator: {
              type: "OPERATOR",
              operator: ">"
            },
            right: {
              type: "DECIMAL_LITERAL",
              value: "0"
            }
          },
          body: {
            statements: [],
            type: "BLOCK"
          },
          else: undefined
        },
        {
          type: "EXPRESSION_STATEMENT",
          expression: {
            type: "LOCAL_VARIABLE_DECLARATION",
            modifiers: [],
            typeType: { type: "PRIMITIVE_TYPE", value: "int" },
            declarators: {
              type: "VARIABLE_DECLARATORS",
              list: [
                {
                  type: "VARIABLE_DECLARATOR",
                  id: {
                    type: "VARIABLE_DECLARATOR_ID",
                    dimensions: [],
                    id: { type: "IDENTIFIER", value: "destination" }
                  },
                  init: {
                    type: "QUALIFIED_EXPRESSION",
                    expression: { type: "IDENTIFIER", value: "message" },
                    rest: {
                      dimensions: [],
                      name: { type: "IDENTIFIER", value: "indexOf" },
                      parameters: {
                        list: [
                          {
                            type: "CHAR_LITERAL",
                            value: "'d'"
                          }
                        ],
                        type: "EXPRESSION_LIST"
                      },
                      type: "METHOD_INVOCATION"
                    }
                  }
                }
              ]
            }
          },
          followedEmptyLine: false
        }
      ]
    });
  });
});
