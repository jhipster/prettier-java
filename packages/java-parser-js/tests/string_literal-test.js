"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("stringLiteral", () => {
  it("simple", () => {
    expect(
      Parser.parse('"something"', parser => parser.stringLiteral())
    ).to.deep.equal({
      type: "STRING_LITERAL",
      value: '"something"'
    });
  });

  it("with space", () => {
    expect(
      Parser.parse('"something else"', parser => parser.stringLiteral())
    ).to.deep.equal({
      type: "STRING_LITERAL",
      value: '"something else"'
    });
  });

  it("just some extrems", () => {
    expect(
      Parser.parse('"!? and ()$%&"', parser => parser.stringLiteral())
    ).to.deep.equal({
      type: "STRING_LITERAL",
      value: '"!? and ()$%&"'
    });
  });
});
