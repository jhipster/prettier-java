"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("annotationTypeBody", () => {
  it("empty", () => {
    expect(
      Parser.parse("{}", parser => parser.annotationTypeBody())
    ).to.deep.equal({
      type: "ANNOTATION_TYPE_BODY",
      declarations: []
    });
  });

  it("single", () => {
    expect(
      Parser.parse("{class A{}}", parser => parser.annotationTypeBody())
    ).to.deep.equal({
      type: "ANNOTATION_TYPE_BODY",
      declarations: [
        {
          type: "ANNOTATION_TYPE_ELEMENT_DECLARATION",
          modifiers: [],
          declaration: {
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            type: "CLASS_DECLARATION",
            extends: undefined,
            implements: undefined,
            typeParameters: undefined
          }
        }
      ]
    });
  });

  it("multi", () => {
    expect(
      Parser.parse("{class A{}; class B{}}", parser =>
        parser.annotationTypeBody()
      )
    ).to.deep.equal({
      type: "ANNOTATION_TYPE_BODY",
      declarations: [
        {
          type: "ANNOTATION_TYPE_ELEMENT_DECLARATION",
          modifiers: [],
          declaration: {
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            name: {
              type: "IDENTIFIER",
              value: "A"
            },
            type: "CLASS_DECLARATION",
            extends: undefined,
            implements: undefined,
            typeParameters: undefined
          }
        },
        {
          type: "ANNOTATION_TYPE_ELEMENT_DECLARATION",
          modifiers: [],
          declaration: {
            body: {
              type: "CLASS_BODY",
              declarations: []
            },
            name: {
              type: "IDENTIFIER",
              value: "B"
            },
            type: "CLASS_DECLARATION",
            extends: undefined,
            implements: undefined,
            typeParameters: undefined
          }
        }
      ]
    });
  });
});
