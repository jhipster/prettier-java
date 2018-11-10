"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("typeTypeOrVoid", () => {
  it("typeType", () => {
    expect(
      Parser.parse("boolean", parser => parser.typeTypeOrVoid())
    ).to.deep.equal({
      type: "PRIMITIVE_TYPE",
      value: "boolean"
    });
  });

  it("void", () => {
    expect(
      Parser.parse("void", parser => parser.typeTypeOrVoid())
    ).to.deep.equal({
      type: "VOID"
    });
  });
});
