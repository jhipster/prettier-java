"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("import", () => {
  it("single qualifiers", () => {
    expect(
      Parser.parse("import imp;", parser => parser.importDeclaration())
    ).to.deep.equal({
      type: "IMPORT_DECLARATION",
      static: false,
      name: {
        type: "QUALIFIED_NAME",
        name: [
          {
            type: "IDENTIFIER",
            value: "imp"
          }
        ]
      }
    });
  });

  it("multiple qualifiers", () => {
    expect(
      Parser.parse("import imp.name;", parser => parser.importDeclaration())
    ).to.deep.equal({
      type: "IMPORT_DECLARATION",
      static: false,
      name: {
        type: "QUALIFIED_NAME",
        name: [
          {
            type: "IDENTIFIER",
            value: "imp"
          },
          {
            type: "IDENTIFIER",
            value: "name"
          }
        ]
      }
    });
  });

  it("star qualifier", () => {
    expect(
      Parser.parse("import java.util.*;", parser => parser.importDeclaration())
    ).to.deep.equal({
      type: "IMPORT_DECLARATION",
      static: false,
      name: {
        type: "QUALIFIED_NAME",
        name: [
          {
            type: "IDENTIFIER",
            value: "java"
          },
          {
            type: "IDENTIFIER",
            value: "util"
          },
          {
            type: "IDENTIFIER",
            value: "*"
          }
        ]
      }
    });
  });

  it("static", () => {
    expect(
      Parser.parse("import static imp;", parser => parser.importDeclaration())
    ).to.deep.equal({
      type: "IMPORT_DECLARATION",
      static: true,
      name: {
        type: "QUALIFIED_NAME",
        name: [
          {
            type: "IDENTIFIER",
            value: "imp"
          }
        ]
      }
    });
  });
});
