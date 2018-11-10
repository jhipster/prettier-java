"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("compilationUnit", () => {
  it("empty", () => {
    expect(Parser.parse("", parser => parser.compilationUnit())).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: []
    });
  });

  it("package", () => {
    expect(
      Parser.parse("package pkg.name;", parser => parser.compilationUnit())
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: {
        type: "PACKAGE_DECLARATION",
        modifiers: [],
        name: {
          type: "QUALIFIED_NAME",
          name: [
            {
              type: "IDENTIFIER",
              value: "pkg"
            },
            {
              type: "IDENTIFIER",
              value: "name"
            }
          ]
        }
      },
      imports: [],
      types: []
    });
  });

  it("single import", () => {
    expect(
      Parser.parse("import pkg.name;", parser => parser.compilationUnit())
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [
        {
          type: "IMPORT_DECLARATION",
          static: false,
          name: {
            type: "QUALIFIED_NAME",
            name: [
              {
                type: "IDENTIFIER",
                value: "pkg"
              },
              {
                type: "IDENTIFIER",
                value: "name"
              }
            ]
          }
        }
      ],
      types: []
    });
  });

  it("multiple imports", () => {
    expect(
      Parser.parse("import pkg.name;\nimport static some.other;", parser =>
        parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [
        {
          type: "IMPORT_DECLARATION",
          static: false,
          name: {
            type: "QUALIFIED_NAME",
            name: [
              {
                type: "IDENTIFIER",
                value: "pkg"
              },
              {
                type: "IDENTIFIER",
                value: "name"
              }
            ]
          }
        },
        {
          type: "IMPORT_DECLARATION",
          static: true,
          name: {
            type: "QUALIFIED_NAME",
            name: [
              {
                type: "IDENTIFIER",
                value: "some"
              },
              {
                type: "IDENTIFIER",
                value: "other"
              }
            ]
          }
        }
      ],
      types: []
    });
  });

  it("single class", () => {
    expect(
      Parser.parse("class A{}", parser => parser.compilationUnit())
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
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            extends: undefined,
            implements: undefined,
            typeParameters: undefined
          }
        }
      ]
    });
  });

  it("single class annotation", () => {
    expect(
      Parser.parse("@Annotation class A{}", parser => parser.compilationUnit())
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: [
        {
          type: "TYPE_DECLARATION",
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
              hasBraces: false,
              values: []
            }
          ],
          declaration: {
            type: "CLASS_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            extends: undefined,
            implements: undefined,
            typeParameters: undefined
          }
        }
      ]
    });
  });

  it("multiple classes", () => {
    expect(
      Parser.parse("class A{}\nclass B{}", parser => parser.compilationUnit())
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
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            extends: undefined,
            implements: undefined,
            typeParameters: undefined
          }
        },
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "CLASS_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "B"
            },
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            extends: undefined,
            implements: undefined,
            typeParameters: undefined
          }
        }
      ]
    });
  });

  it("single enum", () => {
    expect(
      Parser.parse("enum A{}", parser => parser.compilationUnit())
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "ENUM_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            body: undefined,
            enumConstants: undefined,
            implements: undefined
          }
        }
      ]
    });
  });

  it("multiple enums", () => {
    expect(
      Parser.parse("enum A{}\nenum B{}", parser => parser.compilationUnit())
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "ENUM_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            body: undefined,
            enumConstants: undefined,
            implements: undefined
          }
        },
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "ENUM_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "B"
            },
            body: undefined,
            enumConstants: undefined,
            implements: undefined
          }
        }
      ]
    });
  });

  it("single interface", () => {
    expect(
      Parser.parse("interface A{}", parser => parser.compilationUnit())
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "INTERFACE_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            body: {
              type: "INTERFACE_BODY",
              declarations: []
            },
            extends: undefined,
            typeParameters: undefined
          }
        }
      ]
    });
  });

  it("multiple interfaces", () => {
    expect(
      Parser.parse("interface A{}\ninterface B{}", parser =>
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
            type: "INTERFACE_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            body: {
              type: "INTERFACE_BODY",
              declarations: []
            },
            extends: undefined,
            typeParameters: undefined
          }
        },
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "INTERFACE_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "B"
            },
            body: {
              type: "INTERFACE_BODY",
              declarations: []
            },
            extends: undefined,
            typeParameters: undefined
          }
        }
      ]
    });
  });

  it("single annotationTypeInterface", () => {
    expect(
      Parser.parse("@interface A{}", parser => parser.compilationUnit())
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: undefined,
      imports: [],
      types: [
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "ANNOTATION_TYPE_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            body: {
              type: "ANNOTATION_TYPE_BODY",
              declarations: []
            }
          }
        }
      ]
    });
  });

  it("multiple annotationTypeInterface", () => {
    expect(
      Parser.parse("@interface A{}\n@interface B{}", parser =>
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
            type: "ANNOTATION_TYPE_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            body: {
              type: "ANNOTATION_TYPE_BODY",
              declarations: []
            }
          }
        },
        {
          type: "TYPE_DECLARATION",
          modifiers: [],
          declaration: {
            type: "ANNOTATION_TYPE_DECLARATION",
            name: {
              type: "IDENTIFIER",
              value: "B"
            },
            body: {
              type: "ANNOTATION_TYPE_BODY",
              declarations: []
            }
          }
        }
      ]
    });
  });

  it("package single annotation", () => {
    expect(
      Parser.parse("@Annotation package pkg;", parser =>
        parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: {
        type: "PACKAGE_DECLARATION",
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
            hasBraces: false,
            values: []
          }
        ],
        name: {
          type: "QUALIFIED_NAME",
          name: [
            {
              type: "IDENTIFIER",
              value: "pkg"
            }
          ]
        }
      },
      imports: [],
      types: []
    });
  });

  it("package multiple annotation", () => {
    expect(
      Parser.parse("@Annotation1 @Annotation2 package pkg;", parser =>
        parser.compilationUnit()
      )
    ).to.deep.equal({
      type: "COMPILATION_UNIT",
      package: {
        type: "PACKAGE_DECLARATION",
        modifiers: [
          {
            type: "ANNOTATION",
            name: {
              name: [
                {
                  type: "IDENTIFIER",
                  value: "Annotation1"
                }
              ],
              type: "QUALIFIED_NAME"
            },
            hasBraces: false,
            values: []
          },
          {
            type: "ANNOTATION",
            name: {
              name: [
                {
                  type: "IDENTIFIER",
                  value: "Annotation2"
                }
              ],
              type: "QUALIFIED_NAME"
            },
            hasBraces: false,
            values: []
          }
        ],
        name: {
          type: "QUALIFIED_NAME",
          name: [
            {
              type: "IDENTIFIER",
              value: "pkg"
            }
          ]
        }
      },
      imports: [],
      types: []
    });
  });
});
