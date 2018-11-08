"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("arrayInitializer", () => {
  it("empty", () => {
    expect(
      Parser.parse("{}", parser => parser.arrayInitializer())
    ).to.deep.equal({
      type: "ARRAY_INITIALIZER",
      variableInitializers: []
    });
  });

  it("with variable initializer", () => {
    expect(
      Parser.parse("{this}", parser => parser.arrayInitializer())
    ).to.deep.equal({
      type: "ARRAY_INITIALIZER",
      variableInitializers: [
        {
          type: "THIS"
        }
      ]
    });
  });

  it("comma after last element", () => {
    expect(
      Parser.parse("{this,super,}", parser => parser.arrayInitializer())
    ).to.deep.equal({
      type: "ARRAY_INITIALIZER",
      variableInitializers: [
        {
          type: "THIS"
        },
        {
          type: "SUPER"
        }
      ]
    });
  });
});
