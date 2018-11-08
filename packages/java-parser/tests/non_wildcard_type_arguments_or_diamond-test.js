"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("nonWildcardTypeArgumentsOrDiamond", () => {
  it("nonWildcardTypeArguments", () => {
    expect(
      Parser.parse("<boolean>", parser =>
        parser.nonWildcardTypeArgumentsOrDiamond()
      )
    ).to.deep.equal({
      type: "TYPE_ARGUMENTS",
      value: {
        type: "TYPE_LIST",
        list: [
          {
            type: "PRIMITIVE_TYPE",
            value: "boolean"
          }
        ]
      }
    });
  });

  it("emptyDiamond", () => {
    expect(
      Parser.parse("<>", parser => parser.nonWildcardTypeArgumentsOrDiamond())
    ).to.deep.equal({
      type: "TYPE_ARGUMENTS",
      value: undefined
    });
  });
});
