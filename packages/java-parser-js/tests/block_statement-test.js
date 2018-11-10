"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("blockStatement", () => {
  it("localVariableDeclaration: primitive", () => {
    expect(
      Parser.parse("boolean A;", parser => parser.blockStatement())
    ).to.deep.equal({
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
    });
  });

  it("localVariableDeclaration: complex", () => {
    expect(
      Parser.parse("Byte byteVariable;", parser => parser.blockStatement())
    ).to.deep.equal({
      type: "EXPRESSION_STATEMENT",
      expression: {
        type: "LOCAL_VARIABLE_DECLARATION",
        modifiers: [],
        typeType: { type: "IDENTIFIER", value: "Byte" },
        declarators: {
          type: "VARIABLE_DECLARATORS",
          list: [
            {
              type: "VARIABLE_DECLARATOR",
              id: {
                dimensions: [],
                id: {
                  type: "IDENTIFIER",
                  value: "byteVariable"
                },
                type: "VARIABLE_DECLARATOR_ID"
              },
              init: undefined
            }
          ]
        }
      },
      followedEmptyLine: false
    });
  });

  it("localVariableDeclaration: one modifier", () => {
    expect(
      Parser.parse("@Bean boolean A;", parser => parser.blockStatement())
    ).to.deep.equal({
      type: "EXPRESSION_STATEMENT",
      expression: {
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
          }
        ],
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
    });
  });

  it("localVariableDeclaration: wrong modifier 'public'", () => {
    expect(() =>
      Parser.parse("public boolean A;", parser => parser.blockStatement())
    ).to.throw(
      "Locale variable declaration can't have" +
        " a public, protected, private, static, abstract or strictfp modifier."
    );
  });

  it("localVariableDeclaration: wrong modifier 'protected'", () => {
    expect(() =>
      Parser.parse("protected boolean A;", parser => parser.blockStatement())
    ).to.throw(
      "Locale variable declaration can't have a" +
        " public, protected, private, static, abstract or strictfp modifier."
    );
  });

  it("localVariableDeclaration: wrong modifier 'private'", () => {
    expect(() =>
      Parser.parse("private boolean A;", parser => parser.blockStatement())
    ).to.throw(
      "Locale variable declaration can't have a public, protected, " +
        "private, static, abstract or strictfp modifier."
    );
  });

  it("localVariableDeclaration: wrong modifier 'static'", () => {
    expect(() =>
      Parser.parse("static boolean A;", parser => parser.blockStatement())
    ).to.throw(
      "Locale variable declaration can't have a public, protected, " +
        "private, static, abstract or strictfp modifier."
    );
  });

  it("localVariableDeclaration: wrong modifier 'abstract'", () => {
    expect(() =>
      Parser.parse("abstract boolean A;", parser => parser.blockStatement())
    ).to.throw(
      "Locale variable declaration can't have a public, protected, " +
        "private, static, abstract or strictfp modifier."
    );
  });

  it("localVariableDeclaration: wrong modifier 'strictfp'", () => {
    expect(() =>
      Parser.parse("strictfp boolean A;", parser => parser.blockStatement())
    ).to.throw(
      "Locale variable declaration can't have a public, protected, " +
        "private, static, abstract or strictfp modifier."
    );
  });

  it("classDeclaration", () => {
    expect(
      Parser.parse("class A{}", parser => parser.blockStatement())
    ).to.deep.equal({
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
    });
  });

  it("localTypeDeclaration: interface", () => {
    expect(
      Parser.parse("interface A{}", parser => parser.blockStatement())
    ).to.deep.equal({
      type: "LOCAL_TYPE_DECLARATION",
      modifiers: [],
      declaration: {
        type: "INTERFACE_DECLARATION",
        name: {
          type: "IDENTIFIER",
          value: "A"
        },
        typeParameters: undefined,
        extends: undefined,
        body: {
          type: "INTERFACE_BODY",
          declarations: []
        }
      }
    });
  });

  it("localTypeDeclaration: class", () => {
    expect(
      Parser.parse("class A{}", parser => parser.blockStatement())
    ).to.deep.equal({
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
    });
  });

  it("localTypeDeclaration: one modifier", () => {
    expect(
      Parser.parse("public class A{}", parser => parser.blockStatement())
    ).to.deep.equal({
      type: "LOCAL_TYPE_DECLARATION",
      modifiers: [
        {
          type: "MODIFIER",
          value: "public"
        }
      ],
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
    });
  });

  it("localTypeDeclaration: multiple modifiers", () => {
    expect(
      Parser.parse("public static class A{}", parser => parser.blockStatement())
    ).to.deep.equal({
      type: "LOCAL_TYPE_DECLARATION",
      modifiers: [
        {
          type: "MODIFIER",
          value: "public"
        },
        {
          type: "MODIFIER",
          value: "static"
        }
      ],
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
    });
  });

  it("identifierStatement", () => {
    expect(
      Parser.parse("a:this;", parser => parser.blockStatement())
    ).to.deep.equal({
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
    });
  });

  it("expressionStatement this", () => {
    expect(
      Parser.parse("this;", parser => parser.blockStatement())
    ).to.deep.equal({
      type: "EXPRESSION_STATEMENT",
      expression: {
        type: "THIS"
      },
      followedEmptyLine: false
    });
  });

  it("expressionStatement this()", () => {
    expect(
      Parser.parse("this();", parser => parser.blockStatement())
    ).to.deep.equal({
      type: "EXPRESSION_STATEMENT",
      expression: {
        type: "THIS",
        arguments: {
          type: "EXPRESSION_LIST",
          list: []
        }
      },
      followedEmptyLine: false
    });
  });

  it('System.out.println("please work")', () => {
    expect(
      Parser.parse('System.out.println("please work");', parser =>
        parser.blockStatement()
      )
    ).to.deep.equal({
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
    });
  });

  it("return ", () => {
    expect(
      Parser.parse("return this;", parser => parser.blockStatement())
    ).to.deep.equal({
      type: "RETURN_STATEMENT",
      expression: {
        type: "THIS"
      }
    });
  });

  it("variableDeclaration", () => {
    expect(
      Parser.parse(
        "final List<Filter> filterList = new ArrayList<>();",
        parser => parser.blockStatement()
      )
    ).to.deep.equal({
      type: "FIELD_DECLARATION",
      typeType: {
        type: "TYPE_TYPE",
        modifiers: [
          {
            type: "MODIFIER",
            value: "final"
          }
        ],
        value: {
          type: "CLASS_OR_INTERFACE_TYPE_ELEMENT",
          name: {
            type: "IDENTIFIER",
            value: "List"
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
                    value: "Filter"
                  },
                  extends: undefined,
                  super: undefined
                }
              ]
            }
          }
        },
        dimensions: []
      },
      variableDeclarators: {
        type: "VARIABLE_DECLARATORS",
        list: [
          {
            type: "VARIABLE_DECLARATOR",
            id: {
              type: "VARIABLE_DECLARATOR_ID",
              id: { type: "IDENTIFIER", value: "filterList" },
              dimensions: []
            },
            init: {
              type: "SIMPLE_CREATOR",
              name: {
                type: "IDENTIFIER_NAME",
                elements: [
                  {
                    type: "IDENTIFIER_NAME_ELEMENT",
                    id: {
                      type: "IDENTIFIER",
                      value: "ArrayList"
                    },
                    typeArguments: {
                      type: "TYPE_ARGUMENTS",
                      value: undefined
                    }
                  }
                ]
              },
              rest: {
                type: "CLASS_CREATOR_REST",
                arguments: {
                  type: "EXPRESSION_LIST",
                  list: []
                },
                body: undefined
              }
            }
          }
        ]
      },
      followedEmptyLine: false
    });
  });
});
