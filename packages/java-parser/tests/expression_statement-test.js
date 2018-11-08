"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("expressionStatement", () => {
  it("simple", () => {
    expect(
      Parser.parse("this;", parser => parser.expressionStatement())
    ).to.deep.equal({
      type: "EXPRESSION_STATEMENT",
      expression: {
        type: "THIS"
      },
      followedEmptyLine: false
    });
  });

  it("simple with line break \n", () => {
    expect(
      Parser.parse("this;\n", parser => parser.expressionStatement())
    ).to.deep.equal({
      type: "EXPRESSION_STATEMENT",
      expression: {
        type: "THIS"
      },
      followedEmptyLine: false
    });
  });

  it("simple with line break \r\n", () => {
    expect(
      Parser.parse("this;\r\n", parser => parser.expressionStatement())
    ).to.deep.equal({
      type: "EXPRESSION_STATEMENT",
      expression: {
        type: "THIS"
      },
      followedEmptyLine: false
    });
  });

  it("simple with line break \r", () => {
    expect(
      Parser.parse("this;\r", parser => parser.expressionStatement())
    ).to.deep.equal({
      type: "EXPRESSION_STATEMENT",
      expression: {
        type: "THIS"
      },
      followedEmptyLine: false
    });
  });

  it("simple with follow empty line", () => {
    expect(
      Parser.parse("this;\n\n", parser => parser.expressionStatement())
    ).to.deep.equal({
      type: "EXPRESSION_STATEMENT",
      expression: {
        type: "THIS"
      },
      followedEmptyLine: true
    });
  });

  it("simple with follow empty line and empty line has whitespaces and/or tabs", () => {
    expect(
      Parser.parse("this;\n \t\n", parser => parser.expressionStatement())
    ).to.deep.equal({
      type: "EXPRESSION_STATEMENT",
      expression: {
        type: "THIS"
      },
      followedEmptyLine: true
    });
  });

  it("simple with whitespaces and/or tabs follow empty line and empty line has whitespaces and/or tabs", () => {
    expect(
      Parser.parse("this; \t\n \t\n", parser => parser.expressionStatement())
    ).to.deep.equal({
      type: "EXPRESSION_STATEMENT",
      expression: {
        type: "THIS"
      },
      followedEmptyLine: true
    });
  });
});
