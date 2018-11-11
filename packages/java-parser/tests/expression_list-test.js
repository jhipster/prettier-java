"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("expressionList", () => {
  it("single", () => {
    expect(
      Parser.parse("this", parser => parser.expressionList())
    ).to.deep.equal({
      type: "EXPRESSION_LIST",
      list: [
        {
          type: "THIS"
        }
      ]
    });
  });

  it("multiple", () => {
    expect(
      Parser.parse("this, null", parser => parser.expressionList())
    ).to.deep.equal({
      type: "EXPRESSION_LIST",
      list: [
        {
          type: "THIS"
        },
        {
          type: "NULL"
        }
      ]
    });
  });
});
