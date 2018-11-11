"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("variableInitializer", () => {
  it("expression", () => {
    expect(
      Parser.parse("this", parser => parser.variableInitializer())
    ).to.deep.equal({
      type: "THIS"
    });
  });

  it("arrayInitializer", () => {
    expect(
      Parser.parse("{}", parser => parser.variableInitializer())
    ).to.deep.equal({
      type: "ARRAY_INITIALIZER",
      variableInitializers: []
    });
  });

  it("ifElseExpression", () => {
    expect(
      Parser.parse("this ? true : false", parser =>
        parser.variableInitializer()
      )
    ).to.deep.equal({
      type: "IF_ELSE_EXPRESSION",
      condition: { type: "THIS" },
      if: {
        type: "BOOLEAN_LITERAL",
        value: "true"
      },
      else: {
        type: "BOOLEAN_LITERAL",
        value: "false"
      }
    });
  });
});
