"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("typeArgument", () => {
  it("primitiveType", () => {
    expect(
      Parser.parse("boolean", parser => parser.typeArgument())
    ).to.deep.equal({
      type: "TYPE_ARGUMENT",
      argument: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      super: undefined,
      extends: undefined
    });
  });

  it("questionmark", () => {
    expect(Parser.parse("?", parser => parser.typeArgument())).to.deep.equal({
      type: "TYPE_ARGUMENT",
      argument: {
        type: "QUESTIONMARK"
      },
      super: undefined,
      extends: undefined
    });
  });

  it("primitiveType extends primitiveType", () => {
    expect(
      Parser.parse("boolean extends char", parser => parser.typeArgument())
    ).to.deep.equal({
      type: "TYPE_ARGUMENT",
      argument: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      super: undefined,
      extends: {
        type: "PRIMITIVE_TYPE",
        value: "char"
      }
    });
  });

  it("primitiveType super primitiveType", () => {
    expect(
      Parser.parse("boolean super char", parser => parser.typeArgument())
    ).to.deep.equal({
      type: "TYPE_ARGUMENT",
      argument: {
        type: "PRIMITIVE_TYPE",
        value: "boolean"
      },
      super: {
        type: "PRIMITIVE_TYPE",
        value: "char"
      },
      extends: undefined
    });
  });

  it("questionmark extends primitiveType", () => {
    expect(
      Parser.parse("? extends char", parser => parser.typeArgument())
    ).to.deep.equal({
      type: "TYPE_ARGUMENT",
      argument: {
        type: "QUESTIONMARK"
      },
      super: undefined,
      extends: {
        type: "PRIMITIVE_TYPE",
        value: "char"
      }
    });
  });

  it("questionmark super primitiveType", () => {
    expect(
      Parser.parse("? super char", parser => parser.typeArgument())
    ).to.deep.equal({
      type: "TYPE_ARGUMENT",
      argument: {
        type: "QUESTIONMARK"
      },
      super: {
        type: "PRIMITIVE_TYPE",
        value: "char"
      },
      extends: undefined
    });
  });
});
