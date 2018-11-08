"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("interfaceMethodModifier", () => {
  it("public", () => {
    expect(
      Parser.parse("public", parser => parser.interfaceMethodModifier())
    ).to.deep.equal({
      type: "MODIFIER",
      value: "public"
    });
  });

  it("protected", () => {
    expect(
      Parser.parse("default", parser => parser.interfaceMethodModifier())
    ).to.deep.equal({
      type: "MODIFIER",
      value: "default"
    });
  });

  it("static", () => {
    expect(
      Parser.parse("static", parser => parser.interfaceMethodModifier())
    ).to.deep.equal({
      type: "MODIFIER",
      value: "static"
    });
  });

  it("abstract", () => {
    expect(
      Parser.parse("abstract", parser => parser.interfaceMethodModifier())
    ).to.deep.equal({
      type: "MODIFIER",
      value: "abstract"
    });
  });

  it("strictfp", () => {
    expect(
      Parser.parse("strictfp", parser => parser.interfaceMethodModifier())
    ).to.deep.equal({
      type: "MODIFIER",
      value: "strictfp"
    });
  });

  it("annotation", () => {
    expect(
      Parser.parse("@Bean", parser => parser.interfaceMethodModifier())
    ).to.deep.equal({
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
    });
  });
});
