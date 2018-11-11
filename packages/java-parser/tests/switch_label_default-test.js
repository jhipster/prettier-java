"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("switchLabelDefault", () => {
  it("simple", () => {
    expect(
      Parser.parse("default :", parser => parser.switchLabelDefault())
    ).to.deep.equal({
      type: "SWITCH_LABEL_DEFAULT"
    });
  });
});
