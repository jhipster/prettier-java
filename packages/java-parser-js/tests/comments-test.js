"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("comment", () => {
  it("line comment before class", () => {
    expect(
      Parser.parse("// comment\nclass A {}", parser => parser.compilationUnit())
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "CLASS_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            extends: undefined,
            implements: undefined,
            comments: [
              {
                ast_type: "comment",
                leading: true,
                trailing: false,
                value: "// comment"
              }
            ]
          }
        }
      ]
    });
  });

  it("line comment standalone before class", () => {
    expect(
      Parser.parse("// comment\n\nclass A {}", parser =>
        parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "CLASS_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            extends: undefined,
            implements: undefined,
            comments: [
              {
                ast_type: "comment",
                leading: true,
                trailing: false,
                value: "// comment"
              }
            ]
          }
        }
      ]
    });
  });

  it("line comment between class and name", () => {
    expect(
      Parser.parse("class \n// comment\n A {}", parser =>
        parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "CLASS_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            extends: undefined,
            implements: undefined,
            comments: [
              {
                ast_type: "comment",
                leading: true,
                trailing: false,
                value: "// comment"
              }
            ]
          }
        }
      ]
    });
  });

  it("multiple line comment before class", () => {
    expect(
      Parser.parse("// comment1\n// comment2\nclass A {}", parser =>
        parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "CLASS_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            extends: undefined,
            implements: undefined,
            comments: [
              {
                ast_type: "comment",
                leading: true,
                trailing: false,
                value: "// comment1"
              },
              {
                ast_type: "comment",
                leading: true,
                trailing: false,
                value: "// comment2"
              }
            ]
          }
        }
      ]
    });
  });

  it("line comment after", () => {
    expect(
      Parser.parse("class A {\nint i = 0; // GHI\n}", parser =>
        parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      imports: [],
      package: undefined,
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],

          declaration: {
            type: "CLASS_DECLARATION",
            name: { type: "IDENTIFIER", value: "A" },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: [
                {
                  type: "CLASS_BODY_MEMBER_DECLARATION",
                  modifiers: [],
                  declaration: {
                    type: "FIELD_DECLARATION",
                    typeType: { type: "PRIMITIVE_TYPE", value: "int" },
                    variableDeclarators: {
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
                    },
                    followedEmptyLine: false,
                    comments: [
                      {
                        ast_type: "comment",
                        leading: false,
                        trailing: true,
                        value: "// GHI"
                      }
                    ]
                  },
                  followedEmptyLine: false
                }
              ]
            },
            extends: undefined,
            implements: undefined
          }
        }
      ]
    });
  });

  it("complex line comment", () => {
    expect(
      Parser.parse("// ABC\nclass A {\n// DEF\nint i = 0; // GHI\n}", parser =>
        parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      imports: [],
      package: undefined,
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],

          declaration: {
            type: "CLASS_DECLARATION",
            name: { type: "IDENTIFIER", value: "A" },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: [
                {
                  type: "CLASS_BODY_MEMBER_DECLARATION",
                  modifiers: [],
                  declaration: {
                    type: "FIELD_DECLARATION",
                    typeType: {
                      type: "PRIMITIVE_TYPE",
                      value: "int",
                      comments: [
                        {
                          ast_type: "comment",
                          leading: true,
                          trailing: false,
                          value: "// DEF"
                        }
                      ]
                    },
                    variableDeclarators: {
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
                    },
                    followedEmptyLine: false,
                    comments: [
                      {
                        ast_type: "comment",
                        leading: false,
                        trailing: true,
                        value: "// GHI"
                      }
                    ]
                  },
                  followedEmptyLine: false
                }
              ]
            },
            extends: undefined,
            implements: undefined,
            comments: [
              {
                ast_type: "comment",
                leading: true,
                trailing: false,
                value: "// ABC"
              }
            ]
          }
        }
      ]
    });
  });

  it("line comments standalone in class body", () => {
    expect(
      Parser.parse("class A {\n// Abc\n\n// XYZ\n\n// Something\n}", parser =>
        parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      imports: [],
      package: undefined,
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],

          declaration: {
            type: "CLASS_DECLARATION",
            name: { type: "IDENTIFIER", value: "A" },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: [
                {
                  type: "COMMENT_STANDALONE",
                  value: "// Abc"
                },
                {
                  type: "COMMENT_STANDALONE",
                  value: "// XYZ"
                },
                {
                  type: "COMMENT_STANDALONE",
                  value: "// Something"
                }
              ]
            },
            extends: undefined,
            implements: undefined
          }
        }
      ]
    });
  });

  it("line comments standalone in interface body", () => {
    expect(
      Parser.parse(
        "interface A {\n// Abc\n\n// XYZ\n\n// Something\n}",
        parser => parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      imports: [],
      package: undefined,
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "INTERFACE_DECLARATION",
            name: { type: "IDENTIFIER", value: "A" },
            typeParameters: undefined,
            body: {
              type: "INTERFACE_BODY",
              declarations: [
                {
                  type: "COMMENT_STANDALONE",
                  value: "// Abc"
                },
                {
                  type: "COMMENT_STANDALONE",
                  value: "// XYZ"
                },
                {
                  type: "COMMENT_STANDALONE",
                  value: "// Something"
                }
              ]
            },
            extends: undefined
          }
        }
      ]
    });
  });

  it("line comments empty", () => {
    expect(
      Parser.parse("class A {\n//         \n}", parser =>
        parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      imports: [],
      package: undefined,
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],

          declaration: {
            type: "CLASS_DECLARATION",
            name: { type: "IDENTIFIER", value: "A" },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            extends: undefined,
            implements: undefined
          }
        }
      ]
    });
  });

  it("line comment between package and class", () => {
    expect(
      Parser.parse("package abc;\n\n// ABC\nclass A {}", parser =>
        parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      imports: [],
      package: {
        type: "PACKAGE_DECLARATION",
        modifiers: [],
        name: {
          type: "QUALIFIED_NAME",
          name: [
            {
              type: "IDENTIFIER",
              value: "abc"
            }
          ]
        }
      },
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],

          declaration: {
            type: "CLASS_DECLARATION",
            name: { type: "IDENTIFIER", value: "A" },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            extends: undefined,
            implements: undefined,
            comments: [
              {
                ast_type: "comment",
                leading: true,
                trailing: false,
                value: "// ABC"
              }
            ]
          }
        }
      ]
    });
  });

  it("javadoc comment before class", () => {
    expect(
      Parser.parse("/** comment \n comment \n */\nclass A {}", parser =>
        parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "CLASS_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            extends: undefined,
            implements: undefined,
            comments: [
              {
                ast_type: "comment",
                leading: true,
                trailing: false,
                value: "/** comment \n comment \n */"
              }
            ]
          }
        }
      ]
    });
  });

  it("javadoc comment empty", () => {
    expect(
      Parser.parse("class A {\n/**     \n   \r     */\n}", parser =>
        parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      imports: [],
      package: undefined,
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],

          declaration: {
            type: "CLASS_DECLARATION",
            name: { type: "IDENTIFIER", value: "A" },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            extends: undefined,
            implements: undefined
          }
        }
      ]
    });
  });

  it("traditional comment before class", () => {
    expect(
      Parser.parse("/* comment \n comment \n */\nclass A {}", parser =>
        parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "CLASS_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            extends: undefined,
            implements: undefined,
            comments: [
              {
                ast_type: "comment",
                leading: true,
                trailing: false,
                value: "/* comment \n comment \n */"
              }
            ]
          }
        }
      ]
    });
  });

  it("traditional comment empty", () => {
    expect(
      Parser.parse("class A {\n/*     \n   \r     */\n}", parser =>
        parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      imports: [],
      package: undefined,
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],

          declaration: {
            type: "CLASS_DECLARATION",
            name: { type: "IDENTIFIER", value: "A" },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            extends: undefined,
            implements: undefined
          }
        }
      ]
    });
  });

  it("comment before variable declaration with annotation", () => {
    expect(
      Parser.parse(
        "class A {\n// comment\n@Annotation\nprivate String str;\n}",
        parser => parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "CLASS_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: [
                {
                  type: "CLASS_BODY_MEMBER_DECLARATION",
                  modifiers: [
                    {
                      type: "ANNOTATION",
                      name: {
                        name: [
                          {
                            type: "IDENTIFIER",
                            value: "Annotation"
                          }
                        ],
                        type: "QUALIFIED_NAME"
                      },
                      values: [],
                      hasBraces: false,
                      comments: [
                        {
                          ast_type: "comment",
                          leading: true,
                          trailing: false,
                          value: "// comment"
                        }
                      ]
                    },
                    {
                      type: "MODIFIER",
                      value: "private"
                    }
                  ],
                  declaration: {
                    type: "FIELD_DECLARATION",
                    typeType: {
                      type: "IDENTIFIER",
                      value: "String"
                    },
                    variableDeclarators: {
                      type: "VARIABLE_DECLARATORS",
                      list: [
                        {
                          type: "VARIABLE_DECLARATOR",
                          id: {
                            type: "VARIABLE_DECLARATOR_ID",
                            id: {
                              type: "IDENTIFIER",
                              value: "str"
                            },
                            dimensions: []
                          },
                          init: undefined
                        }
                      ]
                    },
                    followedEmptyLine: false
                  },
                  followedEmptyLine: false
                }
              ]
            },
            extends: undefined,
            implements: undefined
          }
        }
      ]
    });
  });

  it("line comment standalone in function", () => {
    expect(
      Parser.parse(
        "class A {\nvoid doSomething() {\n// comment\n\n}\n}",
        parser => parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "CLASS_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: [
                {
                  type: "CLASS_BODY_MEMBER_DECLARATION",
                  modifiers: [],
                  declaration: {
                    type: "METHOD_DECLARATION",
                    typeType: { type: "VOID" },
                    name: { type: "IDENTIFIER", value: "doSomething" },
                    parameters: { parameters: [], type: "FORMAL_PARAMETERS" },
                    throws: undefined,
                    body: {
                      type: "BLOCK",
                      statements: [
                        {
                          type: "COMMENT_STANDALONE",
                          value: "// comment"
                        }
                      ]
                    },
                    dimensions: []
                  },
                  followedEmptyLine: false
                }
              ]
            },
            extends: undefined,
            implements: undefined
          }
        }
      ]
    });
  });

  it("comment between variable declaration and annotation", () => {
    expect(
      Parser.parse(
        "class A {\n@Annotation\n// comment\r\nprivate String str;\n}",
        parser => parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "CLASS_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: [
                {
                  type: "CLASS_BODY_MEMBER_DECLARATION",
                  modifiers: [
                    {
                      type: "ANNOTATION",
                      name: {
                        name: [
                          {
                            type: "IDENTIFIER",
                            value: "Annotation"
                          }
                        ],
                        type: "QUALIFIED_NAME"
                      },
                      values: [],
                      hasBraces: false
                    },
                    {
                      type: "MODIFIER",
                      value: "private",
                      comments: [
                        {
                          ast_type: "comment",
                          leading: true,
                          trailing: false,
                          value: "// comment"
                        }
                      ]
                    }
                  ],
                  declaration: {
                    type: "FIELD_DECLARATION",
                    typeType: {
                      type: "IDENTIFIER",
                      value: "String"
                    },
                    variableDeclarators: {
                      type: "VARIABLE_DECLARATORS",
                      list: [
                        {
                          type: "VARIABLE_DECLARATOR",
                          id: {
                            type: "VARIABLE_DECLARATOR_ID",
                            id: {
                              type: "IDENTIFIER",
                              value: "str"
                            },
                            dimensions: []
                          },
                          init: undefined
                        }
                      ]
                    },
                    followedEmptyLine: false
                  },
                  followedEmptyLine: false
                }
              ]
            },
            extends: undefined,
            implements: undefined
          }
        }
      ]
    });
  });

  it("traditional comments standalone in class body", () => {
    expect(
      Parser.parse(
        "class A {\n/* Abc */\n\n/* XYZ */\n\n/* Something */\n}",
        parser => parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      imports: [],
      package: undefined,
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],

          declaration: {
            type: "CLASS_DECLARATION",
            name: { type: "IDENTIFIER", value: "A" },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: [
                {
                  type: "COMMENT_STANDALONE",
                  value: "/* Abc */"
                },
                {
                  type: "COMMENT_STANDALONE",
                  value: "/* XYZ */"
                },
                {
                  type: "COMMENT_STANDALONE",
                  value: "/* Something */"
                }
              ]
            },
            extends: undefined,
            implements: undefined
          }
        }
      ]
    });
  });

  it("multi line comment as standalone comment", () => {
    expect(
      Parser.parse(
        "class A {\n/** Something   \n * on two lines  */\n}",
        parser => parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "CLASS_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            typeParameters: undefined,
            body: {
              type: "CLASS_BODY",
              declarations: [
                {
                  type: "COMMENT_STANDALONE",
                  value: "/** Something   \n * on two lines  */"
                }
              ]
            },
            extends: undefined,
            implements: undefined
          }
        }
      ]
    });
  });

  it("comment inside of if statement", () => {
    expect(
      Parser.parse(
        'if (true\n// this is a sample comment\n|| true)\nx = "foo";',
        parser => parser.ifStatement()
      )
    ).to.deep.equal({
      type: "IF_STATEMENT",
      condition: {
        type: "OPERATOR_EXPRESSION",
        left: {
          type: "BOOLEAN_LITERAL",
          value: "true"
        },
        operator: {
          type: "OPERATOR",
          operator: "||",
          comments: [
            {
              ast_type: "comment",
              value: "// this is a sample comment",
              leading: true,
              trailing: false
            }
          ]
        },
        right: {
          type: "BOOLEAN_LITERAL",
          value: "true"
        }
      },
      body: {
        type: "EXPRESSION_STATEMENT",
        expression: {
          type: "OPERATOR_EXPRESSION",
          left: { type: "IDENTIFIER", value: "x" },
          operator: {
            type: "OPERATOR",
            operator: "="
          },
          right: { type: "STRING_LITERAL", value: '"foo"' }
        },
        followedEmptyLine: false
      },
      else: undefined
    });
  });
});
