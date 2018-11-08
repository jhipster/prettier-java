"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("block", () => {
  it("empty", () => {
    expect(Parser.parse("{}", parser => parser.block())).to.deep.equal({
      type: "BLOCK",
      statements: []
    });
  });

  it("single statement", () => {
    expect(
      Parser.parse("{ boolean A; }", parser => parser.block())
    ).to.deep.equal({
      type: "BLOCK",
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

  it("multiple statement", () => {
    expect(
      Parser.parse("{ boolean A; class A {} }", parser => parser.block())
    ).to.deep.equal({
      type: "BLOCK",
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
          type: "LOCAL_TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "CLASS_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            typeParameters: undefined,
            extends: undefined,
            implements: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: []
            }
          }
        }
      ]
    });
  });

  it("this()", () => {
    expect(Parser.parse("{ this(); }", parser => parser.block())).to.deep.equal(
      {
        type: "BLOCK",
        statements: [
          {
            type: "EXPRESSION_STATEMENT",
            expression: {
              type: "THIS",
              arguments: {
                type: "EXPRESSION_LIST",
                list: []
              }
            },
            followedEmptyLine: false
          }
        ]
      }
    );
  });

  it('System.out.println("please work")', () => {
    expect(
      Parser.parse('{ System.out.println("please work"); }', parser =>
        parser.block()
      )
    ).to.deep.equal({
      type: "BLOCK",
      statements: [
        {
          type: "EXPRESSION_STATEMENT",
          expression: {
            type: "QUALIFIED_EXPRESSION",
            expression: {
              type: "IDENTIFIER",
              value: "System"
            },
            rest: {
              type: "QUALIFIED_EXPRESSION",
              expression: {
                type: "IDENTIFIER",
                value: "out"
              },
              rest: {
                type: "METHOD_INVOCATION",
                name: {
                  type: "IDENTIFIER",
                  value: "println"
                },
                parameters: {
                  type: "EXPRESSION_LIST",
                  list: [
                    {
                      type: "STRING_LITERAL",
                      value: '"please work"'
                    }
                  ]
                },
                dimensions: []
              }
            }
          },
          followedEmptyLine: false
        }
      ]
    });
  });

  it('System.out.println("please work"); this();', () => {
    expect(
      Parser.parse('{ System.out.println("please work"); this(); }', parser =>
        parser.block()
      )
    ).to.deep.equal({
      type: "BLOCK",
      statements: [
        {
          type: "EXPRESSION_STATEMENT",
          expression: {
            type: "QUALIFIED_EXPRESSION",
            expression: {
              type: "IDENTIFIER",
              value: "System"
            },
            rest: {
              type: "QUALIFIED_EXPRESSION",
              expression: {
                type: "IDENTIFIER",
                value: "out"
              },
              rest: {
                type: "METHOD_INVOCATION",
                name: {
                  type: "IDENTIFIER",
                  value: "println"
                },
                parameters: {
                  type: "EXPRESSION_LIST",
                  list: [
                    {
                      type: "STRING_LITERAL",
                      value: '"please work"'
                    }
                  ]
                },
                dimensions: []
              }
            }
          },
          followedEmptyLine: false
        },
        {
          type: "EXPRESSION_STATEMENT",
          expression: {
            type: "THIS",
            arguments: {
              type: "EXPRESSION_LIST",
              list: []
            }
          },
          followedEmptyLine: false
        }
      ]
    });
  });

  it('this(); System.out.println("please work")', () => {
    expect(
      Parser.parse('{ this(); System.out.println("please work"); }', parser =>
        parser.block()
      )
    ).to.deep.equal({
      type: "BLOCK",
      statements: [
        {
          type: "EXPRESSION_STATEMENT",
          expression: {
            type: "THIS",
            arguments: {
              type: "EXPRESSION_LIST",
              list: []
            }
          },
          followedEmptyLine: false
        },
        {
          type: "EXPRESSION_STATEMENT",
          expression: {
            type: "QUALIFIED_EXPRESSION",
            expression: {
              type: "IDENTIFIER",
              value: "System"
            },
            rest: {
              type: "QUALIFIED_EXPRESSION",
              expression: {
                type: "IDENTIFIER",
                value: "out"
              },
              rest: {
                type: "METHOD_INVOCATION",
                name: {
                  type: "IDENTIFIER",
                  value: "println"
                },
                parameters: {
                  type: "EXPRESSION_LIST",
                  list: [
                    {
                      type: "STRING_LITERAL",
                      value: '"please work"'
                    }
                  ]
                },
                dimensions: []
              }
            }
          },
          followedEmptyLine: false
        }
      ]
    });
  });

  it("line comment standalone", () => {
    expect(
      Parser.parse("{\n// comment\n\n }", parser => parser.block())
    ).to.deep.equal({
      type: "BLOCK",
      statements: [
        {
          type: "COMMENT_STANDALONE",
          value: "// comment"
        }
      ]
    });
  });

  it("line comment", () => {
    expect(
      Parser.parse("{\n// comment\n }", parser => parser.block())
    ).to.deep.equal({
      type: "BLOCK",
      statements: [
        {
          type: "COMMENT_STANDALONE",
          value: "// comment"
        }
      ]
    });
  });
});
