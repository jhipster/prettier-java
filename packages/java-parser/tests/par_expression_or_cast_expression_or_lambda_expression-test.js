"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("parExpressionOrCastExpressionOrLambdaExpression", () => {
  it("parExpression", () => {
    expect(
      Parser.parse("(this)", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "PAR_EXPRESSION",
      expression: {
        type: "THIS"
      }
    });
  });

  it("error: parExpression with annotation", () => {
    expect(() =>
      Parser.parse("(@Bean this)", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.throw("Expecting --> ')' <-- but found --> 'this' <--");
  });

  it("error: parExpression with typeArguments", () => {
    expect(() =>
      Parser.parse("(@Bean this<boolean>)", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.throw("Expecting --> ')' <-- but found --> 'this' <--");
  });

  it("error: parExpression with Squares", () => {
    expect(() =>
      Parser.parse("(@Bean this[])", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.throw("Expecting --> ')' <-- but found --> 'this' <--");
  });

  it("castExpression: primitiveType", () => {
    expect(
      Parser.parse("(boolean) this", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "CAST_EXPRESSION",
      castType: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      expression: {
        type: "THIS"
      }
    });
  });

  it("castExpression: identifier", () => {
    expect(
      Parser.parse("(A) this", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "CAST_EXPRESSION",
      castType: {
        type: "IDENTIFIER",
        value: "A"
      },
      expression: { type: "THIS" }
    });
  });

  it("castExpression: identifier with typeArguments", () => {
    expect(
      Parser.parse("(A<B>) this", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "CAST_EXPRESSION",
      castType: {
        type: "CLASS_OR_INTERFACE_TYPE_ELEMENT",
        name: {
          type: "IDENTIFIER",
          value: "A"
        },
        typeArguments: {
          type: "TYPE_ARGUMENTS",
          value: {
            type: "TYPE_LIST",
            list: [
              {
                type: "TYPE_ARGUMENT",
                argument: {
                  type: "IDENTIFIER",
                  value: "B"
                },
                extends: undefined,
                super: undefined
              }
            ]
          }
        }
      },
      expression: { type: "THIS" }
    });
  });

  it("castExpression: annotation", () => {
    expect(
      Parser.parse("(@Bean A) this", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "CAST_EXPRESSION",
      castType: {
        type: "TYPE_TYPE",
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
        dimensions: [],
        value: {
          type: "IDENTIFIER",
          value: "A"
        }
      },
      expression: { type: "THIS" }
    });
  });

  it("castExpression: one square", () => {
    expect(
      Parser.parse("(boolean[]) this", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "CAST_EXPRESSION",
      castType: {
        type: "TYPE_TYPE",
        modifiers: [],
        value: {
          type: "PRIMITIVE_TYPE",
          value: "boolean"
        },
        dimensions: [
          {
            type: "DIMENSION"
          }
        ]
      },
      expression: {
        type: "THIS"
      }
    });
  });

  it("castExpression: multiple squares", () => {
    expect(
      Parser.parse("(boolean[][]) this", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "CAST_EXPRESSION",
      castType: {
        type: "TYPE_TYPE",
        modifiers: [],
        value: {
          type: "PRIMITIVE_TYPE",
          value: "boolean"
        },
        dimensions: [
          {
            type: "DIMENSION"
          },
          {
            type: "DIMENSION"
          }
        ]
      },
      expression: {
        type: "THIS"
      }
    });
  });

  it("castExpression: followed by qualifiedExpressionRest and operatorExpressionRest", () => {
    expect(
      Parser.parse(
        "((LazyObject) obj).getIdentifier() == getIdentifier()",
        parser => parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "OPERATOR_EXPRESSION",
      left: {
        type: "QUALIFIED_EXPRESSION",
        expression: {
          type: "PAR_EXPRESSION",
          expression: {
            type: "CAST_EXPRESSION",
            castType: {
              type: "IDENTIFIER",
              value: "LazyObject"
            },
            expression: {
              type: "IDENTIFIER",
              value: "obj"
            }
          }
        },
        rest: {
          type: "METHOD_INVOCATION",
          name: {
            type: "IDENTIFIER",
            value: "getIdentifier"
          },
          parameters: undefined,
          dimensions: []
        }
      },
      operator: {
        type: "OPERATOR",
        operator: "=="
      },
      right: {
        type: "METHOD_INVOCATION",
        name: {
          type: "IDENTIFIER",
          value: "getIdentifier"
        },
        parameters: undefined,
        dimensions: []
      }
    });
  });

  it("castExpression: cast contains dots", () => {
    expect(
      Parser.parse("(java.lang.Exception) cause", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "CAST_EXPRESSION",
      castType: {
        type: "QUALIFIED_EXPRESSION",
        expression: {
          type: "IDENTIFIER",
          value: "java"
        },
        rest: {
          type: "QUALIFIED_EXPRESSION",
          expression: {
            type: "IDENTIFIER",
            value: "lang"
          },
          rest: {
            type: "IDENTIFIER",
            value: "Exception"
          }
        }
      },
      expression: {
        type: "IDENTIFIER",
        value: "cause"
      }
    });
  });

  it("error castExpression: cast expression is not an identifier", () => {
    expect(() =>
      Parser.parse("(1+1) this", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.throw(
      "Found cast expression but cast expression is not an Identifier"
    );
  });

  it("lambdaExpression: empty parameters", () => {
    expect(
      Parser.parse("() -> {}", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "LAMBDA_EXPRESSION",
      parameters: {
        type: "IDENTIFIERS",
        identifiers: undefined
      },
      body: {
        type: "BLOCK",
        statements: []
      }
    });
  });

  it("lambdaExpression: one identifier with parens", () => {
    expect(
      Parser.parse("(a) -> {}", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
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

  it("lambdaExpression: multiple identifiers", () => {
    expect(
      Parser.parse("(a, b) -> {}", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
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
            },
            {
              type: "IDENTIFIER",
              value: "b"
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

  it("lambdaExpression: one formalParameter", () => {
    expect(
      Parser.parse("(boolean a) -> {}", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "LAMBDA_EXPRESSION",
      parameters: {
        type: "FORMAL_PARAMETERS",
        parameters: [
          {
            modifiers: [],
            type: "FORMAL_PARAMETER",
            typeType: {
              type: "PRIMITIVE_TYPE",
              value: "boolean"
            },
            id: {
              type: "VARIABLE_DECLARATOR_ID",
              id: {
                type: "IDENTIFIER",
                value: "a"
              },
              dimensions: []
            },
            dotDotDot: false
          }
        ]
      },
      body: {
        type: "BLOCK",
        statements: []
      }
    });
  });

  it("lambdaExpression: multiple formalParameters", () => {
    expect(
      Parser.parse("(boolean a, double b) -> {}", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "LAMBDA_EXPRESSION",
      parameters: {
        type: "FORMAL_PARAMETERS",
        parameters: [
          {
            modifiers: [],
            type: "FORMAL_PARAMETER",
            typeType: {
              type: "PRIMITIVE_TYPE",
              value: "boolean"
            },
            id: {
              type: "VARIABLE_DECLARATOR_ID",
              id: {
                type: "IDENTIFIER",
                value: "a"
              },
              dimensions: []
            },
            dotDotDot: false
          },
          {
            modifiers: [],
            type: "FORMAL_PARAMETER",
            typeType: {
              type: "PRIMITIVE_TYPE",
              value: "double"
            },
            id: {
              type: "VARIABLE_DECLARATOR_ID",
              id: {
                type: "IDENTIFIER",
                value: "b"
              },
              dimensions: []
            },
            dotDotDot: false
          }
        ]
      },
      body: {
        type: "BLOCK",
        statements: []
      }
    });
  });

  it("lambdaExpression: final modifier", () => {
    expect(
      Parser.parse("(final boolean a) -> {}", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "LAMBDA_EXPRESSION",
      parameters: {
        type: "FORMAL_PARAMETERS",
        parameters: [
          {
            modifiers: [
              {
                type: "MODIFIER",
                value: "final"
              }
            ],
            type: "FORMAL_PARAMETER",
            typeType: {
              type: "PRIMITIVE_TYPE",
              value: "boolean"
            },
            id: {
              type: "VARIABLE_DECLARATOR_ID",
              id: {
                type: "IDENTIFIER",
                value: "a"
              },
              dimensions: []
            },
            dotDotDot: false
          }
        ]
      },
      body: {
        type: "BLOCK",
        statements: []
      }
    });
  });

  it("lambdaExpression: final only on the second", () => {
    expect(
      Parser.parse("(boolean a, final double b) -> {}", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "LAMBDA_EXPRESSION",
      parameters: {
        type: "FORMAL_PARAMETERS",
        parameters: [
          {
            modifiers: [],
            type: "FORMAL_PARAMETER",
            typeType: {
              type: "PRIMITIVE_TYPE",
              value: "boolean"
            },
            id: {
              type: "VARIABLE_DECLARATOR_ID",
              id: {
                type: "IDENTIFIER",
                value: "a"
              },
              dimensions: []
            },
            dotDotDot: false
          },
          {
            modifiers: [
              {
                type: "MODIFIER",
                value: "final"
              }
            ],
            type: "FORMAL_PARAMETER",
            typeType: {
              type: "PRIMITIVE_TYPE",
              value: "double"
            },
            id: {
              type: "VARIABLE_DECLARATOR_ID",
              id: {
                type: "IDENTIFIER",
                value: "b"
              },
              dimensions: []
            },
            dotDotDot: false
          }
        ]
      },
      body: {
        type: "BLOCK",
        statements: []
      }
    });
  });

  it("parExpression with following operator expression", () => {
    expect(
      Parser.parse("(a - (b * c)) < d", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "OPERATOR_EXPRESSION",
      left: {
        type: "OPERATOR_EXPRESSION",
        left: {
          type: "IDENTIFIER",
          value: "a"
        },
        operator: {
          type: "OPERATOR",
          operator: "-"
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
              operator: "*"
            },
            right: { type: "IDENTIFIER", value: "c" }
          }
        }
      },
      operator: {
        type: "OPERATOR",
        operator: "<"
      },
      right: { type: "IDENTIFIER", value: "d" }
    });
  });

  it("parExpression with following method call", () => {
    expect(
      Parser.parse("((Cast) obj).call()", parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "QUALIFIED_EXPRESSION",
      expression: {
        type: "PAR_EXPRESSION",
        expression: {
          type: "CAST_EXPRESSION",
          castType: {
            type: "IDENTIFIER",
            value: "Cast"
          },
          expression: {
            type: "IDENTIFIER",
            value: "obj"
          }
        }
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
    });
  });

  it("parExpression with following method call followed by short if else", () => {
    expect(
      Parser.parse('((Cast) obj).call() ? "a" : "b"', parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "IF_ELSE_EXPRESSION",
      condition: {
        type: "QUALIFIED_EXPRESSION",
        expression: {
          type: "PAR_EXPRESSION",
          expression: {
            type: "CAST_EXPRESSION",
            castType: {
              type: "IDENTIFIER",
              value: "Cast"
            },
            expression: {
              type: "IDENTIFIER",
              value: "obj"
            }
          }
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

  it("parExpression with qualifiedExpression following operatorExpression followed by short if else", () => {
    expect(
      Parser.parse('((Cast) obj).call() && true ? "a" : "b"', parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "OPERATOR_EXPRESSION",
      left: {
        type: "QUALIFIED_EXPRESSION",
        expression: {
          expression: {
            type: "CAST_EXPRESSION",
            castType: {
              type: "IDENTIFIER",
              value: "Cast"
            },
            expression: {
              type: "IDENTIFIER",
              value: "obj"
            }
          },
          type: "PAR_EXPRESSION"
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

  it("parExpression followed by short if else", () => {
    expect(
      Parser.parse('(true) ? "a" : "b"', parser =>
        parser.parExpressionOrCastExpressionOrLambdaExpression()
      )
    ).to.deep.equal({
      type: "IF_ELSE_EXPRESSION",
      condition: {
        type: "PAR_EXPRESSION",
        expression: {
          type: "BOOLEAN_LITERAL",
          value: "true"
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
    });
  });
});
