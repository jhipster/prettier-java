"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("switchLabelCase", () => {
  it("identifier", () => {
    expect(
      Parser.parse("case a:", parser => parser.switchLabelCase())
    ).to.deep.equal({
      type: "SWITCH_LABEL_CASE",
      expression: {
        type: "IDENTIFIER",
        value: "a"
      }
    });
  });
});
