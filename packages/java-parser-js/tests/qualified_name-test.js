"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("qualifiedName", () => {
  it("single", () => {
    expect(Parser.parse("pkg", parser => parser.qualifiedName())).to.deep.equal(
      {
        type: "QUALIFIED_NAME",
        name: [
          {
            type: "IDENTIFIER",
            value: "pkg"
          }
        ]
      }
    );
  });

  it("multiple", () => {
    expect(
      Parser.parse("pkg.name", parser => parser.qualifiedName())
    ).to.deep.equal({
      type: "QUALIFIED_NAME",
      name: [
        {
          type: "IDENTIFIER",
          value: "pkg"
        },
        {
          type: "IDENTIFIER",
          value: "name"
        }
      ]
    });
  });
});
