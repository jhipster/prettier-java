"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("variableModifier", () => {
  it("final", () => {
    expect(
      Parser.parse("final", parser => parser.variableModifier())
    ).to.deep.equal({
      type: "MODIFIER",
      value: "final"
    });
  });

  it("annotation", () => {
    expect(
      Parser.parse("@Bean", parser => parser.classOrInterfaceModifier())
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
