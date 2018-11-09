"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("elementValuePair", () => {
  it("elementValuePair", () => {
    expect(
      Parser.parse("key=@Value", parser => parser.elementValuePair())
    ).to.deep.equal({
      type: "ELEMENT_VALUE_PAIR",
      key: {
        type: "IDENTIFIER",
        value: "key"
      },
      value: {
        type: "ANNOTATION",
        name: {
          type: "QUALIFIED_NAME",
          name: [
            {
              type: "IDENTIFIER",
              value: "Value"
            }
          ]
        },
        hasBraces: false,
        values: []
      }
    });
  });
});
