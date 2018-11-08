"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("super", () => {
  it("simple", () => {
    expect(Parser.parse("super ()", parser => parser.super())).to.deep.equal({
      type: "SUPER",
      arguments: {
        type: "EXPRESSION_LIST",
        list: []
      }
    });
  });
});
