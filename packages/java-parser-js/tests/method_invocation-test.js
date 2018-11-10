"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("methodInvocation", () => {
  it("empty parameters", () => {
    expect(
      Parser.parse("a()", parser => parser.methodInvocation())
    ).to.deep.equal({
      type: "METHOD_INVOCATION",
      name: {
        type: "IDENTIFIER",
        value: "a"
      },
      parameters: undefined,
      dimensions: []
    });
  });

  it("with parameters", () => {
    expect(
      Parser.parse("a(this)", parser => parser.methodInvocation())
    ).to.deep.equal({
      type: "METHOD_INVOCATION",
      name: {
        type: "IDENTIFIER",
        value: "a"
      },
      parameters: {
        type: "EXPRESSION_LIST",
        list: [
          {
            type: "THIS"
          }
        ]
      },
      dimensions: []
    });
  });

  it("with dimensions", () => {
    expect(
      Parser.parse("a()[0]", parser => parser.methodInvocation())
    ).to.deep.equal({
      type: "METHOD_INVOCATION",
      name: {
        type: "IDENTIFIER",
        value: "a"
      },
      parameters: undefined,
      dimensions: [
        {
          type: "DIMENSION",
          expression: {
            type: "DECIMAL_LITERAL",
            value: "0"
          }
        }
      ]
    });
  });
});
