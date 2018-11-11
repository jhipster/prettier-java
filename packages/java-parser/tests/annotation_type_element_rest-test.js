"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("annotationTypeElementRest", () => {
  it("annotationTypeElementRest", () => {
    expect(
      Parser.parse("boolean a();", parser => parser.annotationTypeElementRest())
    ).to.deep.equal({
      type: "ANNOTATION_TYPE_ELEMENT_REST",
      typeType: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      name: {
        type: "ANNOTATION_METHOD_REST",
        name: {
          type: "IDENTIFIER",
          value: "a"
        },
        defaultValue: undefined
      }
    });
  });
  it("class", () => {
    expect(
      Parser.parse("class A{}", parser => parser.annotationTypeElementRest())
    ).to.deep.equal({
      type: "CLASS_DECLARATION",
      extends: undefined,
      implements: undefined,
      typeParameters: undefined,
      name: {
        type: "IDENTIFIER",
        value: "A"
      },
      body: {
        type: "CLASS_BODY",
        declarations: []
      }
    });
  });

  it("enum", () => {
    expect(
      Parser.parse("enum A{}", parser => parser.annotationTypeElementRest())
    ).to.deep.equal({
      type: "ENUM_DECLARATION",
      body: undefined,
      enumConstants: undefined,
      name: {
        type: "IDENTIFIER",
        value: "A"
      },
      implements: undefined
    });
  });

  it("interface", () => {
    expect(
      Parser.parse("interface A{}", parser =>
        parser.annotationTypeElementRest()
      )
    ).to.deep.equal({
      type: "INTERFACE_DECLARATION",
      extends: undefined,
      typeParameters: undefined,
      name: {
        type: "IDENTIFIER",
        value: "A"
      },
      body: {
        type: "INTERFACE_BODY",
        declarations: []
      }
    });
  });

  it("annotationType", () => {
    expect(
      Parser.parse("@interface A{}", parser =>
        parser.annotationTypeElementRest()
      )
    ).to.deep.equal({
      type: "ANNOTATION_TYPE_DECLARATION",
      name: {
        type: "IDENTIFIER",
        value: "A"
      },
      body: {
        type: "ANNOTATION_TYPE_BODY",
        declarations: []
      }
    });
  });
});
