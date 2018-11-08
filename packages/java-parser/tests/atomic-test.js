"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("atomic", () => {
  it("primary", () => {
    expect(Parser.parse("this", parser => parser.atomic())).to.deep.equal({
      type: "THIS"
    });
  });

  it("creator", () => {
    expect(Parser.parse("new a()", parser => parser.atomic())).to.deep.equal({
      type: "SIMPLE_CREATOR",
      name: {
        type: "IDENTIFIER_NAME",
        elements: [
          {
            type: "IDENTIFIER_NAME_ELEMENT",
            id: {
              type: "IDENTIFIER",
              value: "a"
            },
            typeArguments: undefined
          }
        ]
      },
      rest: {
        type: "CLASS_CREATOR_REST",
        arguments: {
          type: "EXPRESSION_LIST",
          list: []
        },
        body: undefined
      }
    });
  });

  it("methodInvocation", () => {
    expect(Parser.parse("a()", parser => parser.atomic())).to.deep.equal({
      type: "METHOD_INVOCATION",
      name: {
        type: "IDENTIFIER",
        value: "a"
      },
      parameters: undefined,
      dimensions: []
    });
  });
});
