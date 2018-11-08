"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("classBodyDeclaration", () => {
  it("classBodyBlock", () => {
    expect(
      Parser.parse("{}", parser => parser.classBodyDeclaration())
    ).to.deep.equal({
      type: "CLASS_BODY_BLOCK",
      static: false,
      block: {
        type: "BLOCK",
        statements: []
      }
    });
  });

  it("classBodyBlock - static", () => {
    expect(
      Parser.parse("static {}", parser => parser.classBodyDeclaration())
    ).to.deep.equal({
      type: "CLASS_BODY_BLOCK",
      static: true,
      block: {
        type: "BLOCK",
        statements: []
      }
    });
  });

  it("classBodyMemberDeclaration", () => {
    expect(
      Parser.parse("void a() {}", parser => parser.classBodyDeclaration())
    ).to.deep.equal({
      type: "CLASS_BODY_MEMBER_DECLARATION",
      modifiers: [],
      declaration: {
        type: "METHOD_DECLARATION",
        typeType: {
          type: "VOID"
        },
        name: {
          type: "IDENTIFIER",
          value: "a"
        },
        parameters: {
          type: "FORMAL_PARAMETERS",
          parameters: []
        },
        dimensions: [],
        throws: undefined,
        body: {
          type: "BLOCK",
          statements: []
        }
      },
      followedEmptyLine: false
    });
  });

  it("classBodyMemberDeclaration - one modifier", () => {
    expect(
      Parser.parse("@Bean void a() {}", parser => parser.classBodyDeclaration())
    ).to.deep.equal({
      type: "CLASS_BODY_MEMBER_DECLARATION",
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
      declaration: {
        type: "METHOD_DECLARATION",
        typeType: {
          type: "VOID"
        },
        name: {
          type: "IDENTIFIER",
          value: "a"
        },
        parameters: {
          type: "FORMAL_PARAMETERS",
          parameters: []
        },
        dimensions: [],
        throws: undefined,
        body: {
          type: "BLOCK",
          statements: []
        }
      },
      followedEmptyLine: false
    });
  });

  it("classBodyMemberDeclaration - multiple modifiers", () => {
    expect(
      Parser.parse("@Bean public void a() {}", parser =>
        parser.classBodyDeclaration()
      )
    ).to.deep.equal({
      type: "CLASS_BODY_MEMBER_DECLARATION",
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
          value: "public"
        }
      ],
      declaration: {
        type: "METHOD_DECLARATION",
        typeType: {
          type: "VOID"
        },
        name: {
          type: "IDENTIFIER",
          value: "a"
        },
        parameters: {
          type: "FORMAL_PARAMETERS",
          parameters: []
        },
        dimensions: [],
        throws: undefined,
        body: {
          type: "BLOCK",
          statements: []
        }
      },
      followedEmptyLine: false
    });
  });

  it("classBodyMemberDeclaration - static modifier", () => {
    expect(
      Parser.parse("static void a() {}", parser =>
        parser.classBodyDeclaration()
      )
    ).to.deep.equal({
      type: "CLASS_BODY_MEMBER_DECLARATION",
      modifiers: [
        {
          type: "MODIFIER",
          value: "static"
        }
      ],
      declaration: {
        type: "METHOD_DECLARATION",
        typeType: {
          type: "VOID"
        },
        name: {
          type: "IDENTIFIER",
          value: "a"
        },
        parameters: {
          type: "FORMAL_PARAMETERS",
          parameters: []
        },
        dimensions: [],
        throws: undefined,
        body: {
          type: "BLOCK",
          statements: []
        }
      },
      followedEmptyLine: false
    });
  });

  it("semiColon", () => {
    expect(
      Parser.parse(";", parser => parser.classBodyDeclaration())
    ).to.deep.equal({
      type: "SEMI_COLON_STATEMENT"
    });
  });
});
