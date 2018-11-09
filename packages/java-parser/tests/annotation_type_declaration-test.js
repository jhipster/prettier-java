"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("annotationTypeDeclaration", () => {
  it("empty", () => {
    expect(
      Parser.parse("@interface A{}", parser =>
        parser.annotationTypeDeclaration()
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
