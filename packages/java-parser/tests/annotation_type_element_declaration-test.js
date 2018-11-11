"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("annotationTypeElementDeclaration", () => {
  it("without modifiers", () => {
    expect(
      Parser.parse("class A{}", parser =>
        parser.annotationTypeElementDeclaration()
      )
    ).to.deep.equal({
      type: "ANNOTATION_TYPE_ELEMENT_DECLARATION",
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
    });
  });

  it("modifiers", () => {
    expect(
      Parser.parse("native transient class A{}", parser =>
        parser.annotationTypeElementDeclaration()
      )
    ).to.deep.equal({
      type: "ANNOTATION_TYPE_ELEMENT_DECLARATION",
      modifiers: [
        { type: "MODIFIER", value: "native" },
        { type: "MODIFIER", value: "transient" }
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
    });
  });
});
