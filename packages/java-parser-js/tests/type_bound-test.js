"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("typeBound", () => {
  it("single", () => {
    expect(Parser.parse("boolean", parser => parser.typeBound())).to.deep.equal(
      {
        type: "TYPE_BOUND",
        list: [
          {
            type: "PRIMITIVE_TYPE",
            value: "boolean"
          }
        ]
      }
    );
  });

  it("multiple", () => {
    expect(
      Parser.parse("boolean & char", parser => parser.typeBound())
    ).to.deep.equal({
      type: "TYPE_BOUND",
      list: [
        {
          type: "PRIMITIVE_TYPE",
          value: "boolean"
        },
        {
          type: "PRIMITIVE_TYPE",
          value: "char"
        }
      ]
    });
  });
});
