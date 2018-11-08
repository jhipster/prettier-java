"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("classType", () => {
  it("simple", () => {
    expect(Parser.parse("A", parser => parser.classType())).to.deep.equal({
      type: "CLASS_TYPE",
      annotations: [],
      classOrInterfaceType: {
        type: "IDENTIFIER",
        value: "A"
      }
    });
  });

  it("classOrInterfaceType", () => {
    expect(Parser.parse("A.B.C", parser => parser.classType())).to.deep.equal({
      type: "CLASS_TYPE",
      annotations: [],
      classOrInterfaceType: {
        type: "CLASS_OR_INTERFACE_TYPE",
        elements: [
          {
            type: "IDENTIFIER",
            value: "A"
          },
          {
            type: "IDENTIFIER",
            value: "B"
          },
          {
            type: "IDENTIFIER",
            value: "C"
          }
        ]
      }
    });
  });
});
