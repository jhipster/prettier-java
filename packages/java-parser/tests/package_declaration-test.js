"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("package", () => {
  it("single qualifiers", () => {
    expect(
      Parser.parse("package pkg;", parser => parser.packageDeclaration())
    ).to.deep.equal({
      type: "PACKAGE_DECLARATION",
      modifiers: [],
      name: {
        type: "QUALIFIED_NAME",
        name: [
          {
            type: "IDENTIFIER",
            value: "pkg"
          }
        ]
      }
    });
  });

  it("multiple qualifiers", () => {
    expect(
      Parser.parse("package pkg.name;", parser => parser.packageDeclaration())
    ).to.deep.equal({
      type: "PACKAGE_DECLARATION",
      modifiers: [],
      name: {
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
      }
    });
  });
});
