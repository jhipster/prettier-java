"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("nonWildcardTypeArguments", () => {
  it("simple", () => {
    expect(
      Parser.parse("<boolean>", parser => parser.nonWildcardTypeArguments())
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
});
