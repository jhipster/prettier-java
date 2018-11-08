"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("forControl", () => {
  it("basicForStatement: empty", () => {
    expect(Parser.parse(";;", parser => parser.forControl())).to.deep.equal({
      type: "BASIC_FOR_CONTROL",
      forInit: undefined,
      expression: undefined,
      expressionList: undefined
    });
  });

  it("basicForStatement: expressionList: one", () => {
    expect(Parser.parse("this;;", parser => parser.forControl())).to.deep.equal(
      {
        type: "BASIC_FOR_CONTROL",
        forInit: {
          type: "EXPRESSION_LIST",
          list: [
            {
              type: "THIS"
            }
          ]
        },
        expression: undefined,
        expressionList: undefined
      }
    );
  });

  it("basicForStatement: expressionList: multiple", () => {
    expect(
      Parser.parse("this, super;;", parser => parser.forControl())
    ).to.deep.equal({
      type: "BASIC_FOR_CONTROL",
      forInit: {
        type: "EXPRESSION_LIST",
        list: [
          {
            type: "THIS"
          },
          {
            type: "SUPER"
          }
        ]
      },
      expression: undefined,
      expressionList: undefined
    });
  });

  it("basicForStatement: variableDeclaration: simple", () => {
    expect(
      Parser.parse("int i = 0;;", parser => parser.forControl())
    ).to.deep.equal({
      type: "BASIC_FOR_CONTROL",
      forInit: {
        type: "LOCAL_VARIABLE_DECLARATION",
        modifiers: [],
        typeType: {
          type: "PRIMITIVE_TYPE",
          value: "int"
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
                  value: "i"
                },
                dimensions: []
              },
              init: {
                type: "DECIMAL_LITERAL",
                value: "0"
              }
            }
          ]
        }
      },
      expression: undefined,
      expressionList: undefined
    });
  });

  it("basicForStatement: variableDeclaration: multiple", () => {
    expect(
      Parser.parse("int i = 0, j = 0;;", parser => parser.forControl())
    ).to.deep.equal({
      type: "BASIC_FOR_CONTROL",
      forInit: {
        type: "LOCAL_VARIABLE_DECLARATION",
        modifiers: [],
        typeType: {
          type: "PRIMITIVE_TYPE",
          value: "int"
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
                  value: "i"
                },
                dimensions: []
              },
              init: {
                type: "DECIMAL_LITERAL",
                value: "0"
              }
            },
            {
              type: "VARIABLE_DECLARATOR",
              id: {
                type: "VARIABLE_DECLARATOR_ID",
                id: {
                  type: "IDENTIFIER",
                  value: "j"
                },
                dimensions: []
              },
              init: {
                type: "DECIMAL_LITERAL",
                value: "0"
              }
            }
          ]
        }
      },
      expression: undefined,
      expressionList: undefined
    });
  });

  it("basicForStatement: variableDeclaration with annotations", () => {
    expect(
      Parser.parse("@Bean final int i = 0;;", parser => parser.forControl())
    ).to.deep.equal({
      type: "BASIC_FOR_CONTROL",
      forInit: {
        type: "LOCAL_VARIABLE_DECLARATION",
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
        typeType: {
          type: "PRIMITIVE_TYPE",
          value: "int"
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
                  value: "i"
                },
                dimensions: []
              },
              init: {
                type: "DECIMAL_LITERAL",
                value: "0"
              }
            }
          ]
        }
      },
      expression: undefined,
      expressionList: undefined
    });
  });

  it("basicForStatement: optionalExpression operatorExpression", () => {
    expect(
      Parser.parse("; i < array.length;", parser => parser.forControl())
    ).to.deep.equal({
      type: "BASIC_FOR_CONTROL",
      forInit: undefined,
      expression: {
        type: "OPERATOR_EXPRESSION",
        left: {
          type: "IDENTIFIER",
          value: "i"
        },
        operator: {
          type: "OPERATOR",
          operator: "<"
        },
        right: {
          argument: {
            elements: [
              { type: "IDENTIFIER", value: "array" },
              { type: "IDENTIFIER", value: "length" }
            ],
            type: "CLASS_OR_INTERFACE_TYPE"
          },
          extends: undefined,
          super: undefined,
          type: "TYPE_ARGUMENT"
        }
      },
      expressionList: undefined
    });
  });

  it("basicForStatement: optionalExpression", () => {
    expect(Parser.parse(";this;", parser => parser.forControl())).to.deep.equal(
      {
        type: "BASIC_FOR_CONTROL",
        forInit: undefined,
        expression: {
          type: "THIS"
        },
        expressionList: undefined
      }
    );
  });

  it("basicForStatement: optionalExpressionList", () => {
    expect(Parser.parse(";;this", parser => parser.forControl())).to.deep.equal(
      {
        type: "BASIC_FOR_CONTROL",
        forInit: undefined,
        expression: undefined,
        expressionList: {
          type: "EXPRESSION_LIST",
          list: [
            {
              type: "THIS"
            }
          ]
        }
      }
    );
  });

  it("enhancedForStatement", () => {
    expect(
      Parser.parse("Bean bean : Beans", parser => parser.forControl())
    ).to.deep.equal({
      type: "ENHANCED_FOR_CONTROL",
      declaration: {
        type: "LOCAL_VARIABLE_DECLARATION",
        modifiers: [],
        typeType: {
          type: "IDENTIFIER",
          value: "Bean"
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
                  value: "bean"
                },
                dimensions: []
              },
              init: undefined
            }
          ]
        }
      },
      expression: {
        type: "IDENTIFIER",
        value: "Beans"
      }
    });
  });

  it("enhancedForStatement: multiple annotations", () => {
    expect(
      Parser.parse("@Bean final Bean bean : Beans", parser =>
        parser.forControl()
      )
    ).to.deep.equal({
      type: "ENHANCED_FOR_CONTROL",
      declaration: {
        type: "LOCAL_VARIABLE_DECLARATION",
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
        typeType: {
          type: "IDENTIFIER",
          value: "Bean"
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
                  value: "bean"
                },
                dimensions: []
              },
              init: undefined
            }
          ]
        }
      },
      expression: {
        type: "IDENTIFIER",
        value: "Beans"
      }
    });
  });
});
