"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("expression", () => {
  it("primary", () => {
    expect(Parser.parse("this", parser => parser.expression())).to.deep.equal({
      type: "THIS"
    });
  });

  it("identifier", () => {
    expect(Parser.parse("abc", parser => parser.expression())).to.deep.equal({
      type: "IDENTIFIER",
      value: "abc"
    });
  });

  it("instanceofExpression", () => {
    expect(
      Parser.parse("this instanceof boolean", parser => parser.expression())
    ).to.deep.equal({
      type: "INSTANCEOF_EXPRESSION",
      expression: {
        type: "THIS"
      },
      instanceof: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      }
    });
  });

  it("instanceofExpression and operatorExpression", () => {
    expect(
      Parser.parse("this instanceof boolean && true", parser =>
        parser.expression()
      )
    ).to.deep.equal({
      type: "OPERATOR_EXPRESSION",
      left: {
        type: "INSTANCEOF_EXPRESSION",
        expression: {
          type: "THIS"
        },
        instanceof: {
          type: "PRIMITIVE_TYPE",
          value: "boolean"
        }
      },
      operator: {
        type: "OPERATOR",
        operator: "&&"
      },
      right: {
        type: "BOOLEAN_LITERAL",
        value: "true"
      }
    });
  });

  it("squareExpression", () => {
    expect(
      Parser.parse("this[super]", parser => parser.expression())
    ).to.deep.equal({
      type: "SQUARE_EXPRESSION",
      expression: {
        type: "THIS"
      },
      squareExpression: {
        type: "SUPER"
      }
    });
  });

  it("postfixExpression", () => {
    expect(Parser.parse("this++", parser => parser.expression())).to.deep.equal(
      {
        type: "POSTFIX_EXPRESSION",
        postfix: "++",
        expression: {
          type: "THIS"
        }
      }
    );
  });

  it("ifElseExpression", () => {
    expect(
      Parser.parse("this ? super : null", parser => parser.expression())
    ).to.deep.equal({
      type: "IF_ELSE_EXPRESSION",
      condition: {
        type: "THIS"
      },
      if: {
        type: "SUPER"
      },
      else: {
        type: "NULL"
      }
    });
  });

  it("qualifiedExpression", () => {
    expect(
      Parser.parse("this.a()", parser => parser.expression())
    ).to.deep.equal({
      type: "QUALIFIED_EXPRESSION",
      expression: {
        type: "THIS"
      },
      rest: {
        type: "METHOD_INVOCATION",
        name: {
          type: "IDENTIFIER",
          value: "a"
        },
        parameters: undefined,
        dimensions: []
      }
    });
  });

  it("qualifiedExpression with postfixExpression", () => {
    expect(
      Parser.parse("this.a++", parser => parser.expression())
    ).to.deep.equal({
      type: "POSTFIX_EXPRESSION",
      postfix: "++",
      expression: {
        type: "QUALIFIED_EXPRESSION",
        expression: {
          type: "THIS"
        },
        rest: {
          type: "IDENTIFIER",
          value: "a"
        }
      }
    });
  });

  it("qualifiedExpression with starting identifier", () => {
    expect(Parser.parse("a.b()", parser => parser.expression())).to.deep.equal({
      type: "QUALIFIED_EXPRESSION",
      expression: {
        type: "IDENTIFIER",
        value: "a"
      },
      rest: {
        type: "METHOD_INVOCATION",
        name: {
          type: "IDENTIFIER",
          value: "b"
        },
        parameters: undefined,
        dimensions: []
      }
    });
  });

  it("qualifiedExpression and operator", () => {
    expect(
      Parser.parse("a.b() < c.d", parser => parser.expression())
    ).to.deep.equal({
      type: "OPERATOR_EXPRESSION",
      left: {
        type: "QUALIFIED_EXPRESSION",
        expression: {
          type: "IDENTIFIER",
          value: "a"
        },
        rest: {
          type: "METHOD_INVOCATION",
          name: {
            type: "IDENTIFIER",
            value: "b"
          },
          parameters: undefined,
          dimensions: []
        }
      },
      operator: {
        type: "OPERATOR",
        operator: "<"
      },
      right: {
        type: "QUALIFIED_EXPRESSION",
        expression: {
          type: "IDENTIFIER",
          value: "c"
        },
        rest: {
          type: "IDENTIFIER",
          value: "d"
        }
      }
    });
  });

  it("qualifiedExpression and operatorExpression and if else", () => {
    expect(
      Parser.parse('this.list.isEmpty() && true ? "a" : "b"', parser =>
        parser.expression()
      )
    ).to.deep.equal({
      type: "OPERATOR_EXPRESSION",
      left: {
        type: "QUALIFIED_EXPRESSION",
        expression: { type: "THIS" },
        rest: {
          type: "QUALIFIED_EXPRESSION",
          expression: { type: "IDENTIFIER", value: "list" },
          rest: {
            type: "METHOD_INVOCATION",
            name: {
              type: "IDENTIFIER",
              value: "isEmpty"
            },
            parameters: undefined,
            dimensions: []
          }
        }
      },
      operator: {
        type: "OPERATOR",
        operator: "&&"
      },
      right: {
        type: "IF_ELSE_EXPRESSION",
        condition: {
          type: "BOOLEAN_LITERAL",
          value: "true"
        },
        if: {
          type: "STRING_LITERAL",
          value: '"a"'
        },
        else: {
          type: "STRING_LITERAL",
          value: '"b"'
        }
      }
    });
  });

  it("qualifiedExpression and operatorExpression Less and if else", () => {
    expect(
      Parser.parse('this.list.isEmpty() < true ? "a" : "b"', parser =>
        parser.expression()
      )
    ).to.deep.equal({
      type: "OPERATOR_EXPRESSION",
      left: {
        type: "QUALIFIED_EXPRESSION",
        expression: { type: "THIS" },
        rest: {
          type: "QUALIFIED_EXPRESSION",
          expression: { type: "IDENTIFIER", value: "list" },
          rest: {
            type: "METHOD_INVOCATION",
            name: {
              type: "IDENTIFIER",
              value: "isEmpty"
            },
            parameters: undefined,
            dimensions: []
          }
        }
      },
      operator: {
        type: "OPERATOR",
        operator: "<"
      },
      right: {
        type: "IF_ELSE_EXPRESSION",
        condition: {
          type: "BOOLEAN_LITERAL",
          value: "true"
        },
        if: {
          type: "STRING_LITERAL",
          value: '"a"'
        },
        else: {
          type: "STRING_LITERAL",
          value: '"b"'
        }
      }
    });
  });

  it("qualifiedExpression and if else", () => {
    expect(
      Parser.parse('this.list.isEmpty() ? "a" : "b"', parser =>
        parser.expression()
      )
    ).to.deep.equal({
      type: "IF_ELSE_EXPRESSION",
      condition: {
        type: "QUALIFIED_EXPRESSION",
        expression: { type: "THIS" },
        rest: {
          type: "QUALIFIED_EXPRESSION",
          expression: { type: "IDENTIFIER", value: "list" },
          rest: {
            type: "METHOD_INVOCATION",
            name: {
              type: "IDENTIFIER",
              value: "isEmpty"
            },
            parameters: undefined,
            dimensions: []
          }
        }
      },
      if: {
        type: "STRING_LITERAL",
        value: '"a"'
      },
      else: {
        type: "STRING_LITERAL",
        value: '"b"'
      }
    });
  });

  it("instanceofExpression with qualifiedExpression", () => {
    expect(
      Parser.parse("this.b instanceof Boolean", parser => parser.expression())
    ).to.deep.equal({
      type: "INSTANCEOF_EXPRESSION",
      expression: {
        type: "QUALIFIED_EXPRESSION",
        expression: {
          type: "THIS"
        },
        rest: {
          type: "IDENTIFIER",
          value: "b"
        }
      },
      instanceof: {
        type: "IDENTIFIER",
        value: "Boolean"
      }
    });
  });

  it("operatorExpression Star", () => {
    expect(
      Parser.parse("this*super", parser => parser.expression())
    ).to.deep.equal({
      type: "OPERATOR_EXPRESSION",
      left: {
        type: "THIS"
      },
      operator: {
        type: "OPERATOR",
        operator: "*"
      },
      right: {
        type: "SUPER"
      }
    });
  });

  it("operatorExpression with qualifiedNameExpressiona and if else statement", () => {
    expect(
      Parser.parse('a = some.call() ? "a" : "b"', parser => parser.expression())
    ).to.deep.equal({
      type: "OPERATOR_EXPRESSION",
      left: {
        type: "IDENTIFIER",
        value: "a"
      },
      operator: {
        type: "OPERATOR",
        operator: "="
      },
      right: {
        type: "IF_ELSE_EXPRESSION",
        condition: {
          type: "QUALIFIED_EXPRESSION",
          expression: {
            type: "IDENTIFIER",
            value: "some"
          },
          rest: {
            type: "METHOD_INVOCATION",
            name: {
              type: "IDENTIFIER",
              value: "call"
            },
            parameters: undefined,
            dimensions: []
          }
        },
        else: {
          type: "STRING_LITERAL",
          value: '"b"'
        },
        if: {
          type: "STRING_LITERAL",
          value: '"a"'
        }
      }
    });
  });

  it("operatorExpression with right side in parExpression", () => {
    expect(
      Parser.parse("a < (b - c)", parser => parser.expression())
    ).to.deep.equal({
      type: "OPERATOR_EXPRESSION",
      left: {
        type: "IDENTIFIER",
        value: "a"
      },
      operator: {
        type: "OPERATOR",
        operator: "<"
      },
      right: {
        type: "PAR_EXPRESSION",
        expression: {
          type: "OPERATOR_EXPRESSION",
          left: {
            type: "IDENTIFIER",
            value: "b"
          },
          operator: {
            type: "OPERATOR",
            operator: "-"
          },
          right: {
            type: "IDENTIFIER",
            value: "c"
          }
        }
      }
    });
  });

  it("operatorExpression Less", () => {
    expect(
      Parser.parse("i < array.length", parser => parser.expression())
    ).to.deep.equal({
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
    });
  });

  it("multiple operatorExpressions", () => {
    expect(
      Parser.parse("this*super+null", parser => parser.expression())
    ).to.deep.equal({
      type: "OPERATOR_EXPRESSION",
      left: {
        type: "THIS"
      },
      operator: {
        type: "OPERATOR",
        operator: "*"
      },
      right: {
        type: "OPERATOR_EXPRESSION",
        left: {
          type: "SUPER"
        },
        operator: {
          type: "OPERATOR",
          operator: "+"
        },
        right: {
          type: "NULL"
        }
      }
    });
  });

  it("PrefixExpression", () => {
    expect(Parser.parse("+this", parser => parser.expression())).to.deep.equal({
      type: "PREFIX_EXPRESSION",
      prefix: "+",
      expression: {
        type: "THIS"
      }
    });
  });

  it("parExpression", () => {
    expect(Parser.parse("(this)", parser => parser.expression())).to.deep.equal(
      {
        type: "PAR_EXPRESSION",
        expression: {
          type: "THIS"
        }
      }
    );
  });

  it("lambdaExpression: one identifier with parens", () => {
    expect(
      Parser.parse("(a) -> {}", parser => parser.expression())
    ).to.deep.equal({
      type: "LAMBDA_EXPRESSION",
      parameters: {
        type: "IDENTIFIERS",
        identifiers: {
          type: "IDENTIFIER_LIST",
          list: [
            {
              type: "IDENTIFIER",
              value: "a"
            }
          ]
        }
      },
      body: {
        type: "BLOCK",
        statements: []
      }
    });
  });

  it("lambdaExpression: one identifier without parens", () => {
    expect(
      Parser.parse("a -> {}", parser => parser.expression())
    ).to.deep.equal({
      type: "LAMBDA_EXPRESSION",
      parameters: {
        type: "IDENTIFIERS",
        identifiers: {
          type: "IDENTIFIER_LIST",
          list: [
            {
              type: "IDENTIFIER",
              value: "a"
            }
          ]
        }
      },
      body: {
        type: "BLOCK",
        statements: []
      }
    });
  });

  it("methodReference: identifier", () => {
    expect(Parser.parse("B.C::A", parser => parser.expression())).to.deep.equal(
      {
        type: "QUALIFIED_EXPRESSION",
        expression: {
          type: "IDENTIFIER",
          value: "B"
        },
        rest: {
          type: "METHOD_REFERENCE",
          reference: {
            type: "IDENTIFIER",
            value: "C"
          },
          name: {
            type: "IDENTIFIER",
            value: "A"
          },
          typeArguments: undefined
        }
      }
    );
  });

  it("identifier.identifier", () => {
    expect(Parser.parse("A.B", parser => parser.expression())).to.deep.equal({
      type: "QUALIFIED_EXPRESSION",
      expression: {
        type: "IDENTIFIER",
        value: "A"
      },
      rest: {
        type: "IDENTIFIER",
        value: "B"
      }
    });
  });

  it("identifier.class", () => {
    expect(
      Parser.parse("A.class", parser => parser.expression())
    ).to.deep.equal({
      type: "QUALIFIED_EXPRESSION",
      expression: {
        type: "IDENTIFIER",
        value: "A"
      },
      rest: {
        type: "CLASS"
      }
    });
  });

  it("identifier.class with annotation", () => {
    expect(
      Parser.parse("@Bean A.class", parser => parser.expression())
    ).to.deep.equal({
      type: "QUALIFIED_EXPRESSION",
      expression: {
        type: "TYPE_TYPE",
        modifiers: [
          {
            hasBraces: false,
            name: {
              name: [
                {
                  type: "IDENTIFIER",
                  value: "Bean"
                }
              ],
              type: "QUALIFIED_NAME"
            },
            type: "ANNOTATION",
            values: []
          }
        ],
        value: {
          type: "IDENTIFIER",
          value: "A"
        },
        dimensions: []
      },
      rest: { type: "CLASS" }
    });
  });

  it("identifier.identifier.class", () => {
    expect(
      Parser.parse("A.B.class", parser => parser.expression())
    ).to.deep.equal({
      type: "QUALIFIED_EXPRESSION",
      expression: {
        type: "IDENTIFIER",
        value: "A"
      },
      rest: {
        type: "QUALIFIED_EXPRESSION",
        expression: {
          type: "IDENTIFIER",
          value: "B"
        },
        rest: { type: "CLASS" }
      }
    });
  });

  it("array[i]", () => {
    expect(
      Parser.parse("array[i]", parser => parser.expression())
    ).to.deep.equal({
      type: "TYPE_TYPE",
      modifiers: [],
      value: {
        type: "IDENTIFIER",
        value: "array"
      },
      dimensions: [
        {
          expression: {
            type: "IDENTIFIER",
            value: "i"
          },
          type: "DIMENSION"
        }
      ]
    });
  });
});
