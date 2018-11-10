"use strict";
const Parser = require("../src/index");
const { expect } = require("chai");

describe("literal", () => {
  it("integerLiteral: positive", () => {
    expect(Parser.parse("10", parser => parser.literal())).to.deep.equal({
      type: "DECIMAL_LITERAL",
      value: "10"
    });
  });

  it("integerLiteral: negative", () => {
    expect(Parser.parse("-10", parser => parser.literal())).to.deep.equal({
      type: "DECIMAL_LITERAL",
      value: "-10"
    });
  });

  it("floatLiteral: positive", () => {
    expect(Parser.parse("0.1", parser => parser.literal())).to.deep.equal({
      type: "FLOAT_LITERAL",
      value: "0.1"
    });
  });

  it("floatLiteral: negative", () => {
    expect(Parser.parse("-0.1", parser => parser.literal())).to.deep.equal({
      type: "FLOAT_LITERAL",
      value: "-0.1"
    });
  });

  it("charLiteral: small letter", () => {
    expect(Parser.parse("'a'", parser => parser.literal())).to.deep.equal({
      type: "CHAR_LITERAL",
      value: "'a'"
    });
  });

  it("charLiteral: big letter", () => {
    expect(Parser.parse("'A'", parser => parser.literal())).to.deep.equal({
      type: "CHAR_LITERAL",
      value: "'A'"
    });
  });

  it("charLiteral: number", () => {
    expect(Parser.parse("'A'", parser => parser.literal())).to.deep.equal({
      type: "CHAR_LITERAL",
      value: "'A'"
    });
  });

  it("charLiteral: colon", () => {
    expect(Parser.parse("':'", parser => parser.literal())).to.deep.equal({
      type: "CHAR_LITERAL",
      value: "':'"
    });
  });

  // tbnrf'\
  it("charLiteral: t", () => {
    expect(Parser.parse("'\t'", parser => parser.literal())).to.deep.equal({
      type: "CHAR_LITERAL",
      value: "'\\t'"
    });
  });
  it("charLiteral: n", () => {
    expect(Parser.parse("'\n'", parser => parser.literal())).to.deep.equal({
      type: "CHAR_LITERAL",
      value: "'\\n'"
    });
  });
  it("charLiteral: r", () => {
    expect(Parser.parse("'\r'", parser => parser.literal())).to.deep.equal({
      type: "CHAR_LITERAL",
      value: "'\\r'"
    });
  });
  it("charLiteral: f", () => {
    expect(Parser.parse("'\f'", parser => parser.literal())).to.deep.equal({
      type: "CHAR_LITERAL",
      value: "'\\f'"
    });
  });
  it("charLiteral: '", () => {
    expect(Parser.parse("'''", parser => parser.literal())).to.deep.equal({
      type: "CHAR_LITERAL",
      value: "'\\''"
    });
  });
  it("charLiteral: \\", () => {
    expect(Parser.parse("'\\'", parser => parser.literal())).to.deep.equal({
      type: "CHAR_LITERAL",
      value: "'\\\\'"
    });
  });

  // TODO unicode not supported
  // it("charLiteral: unicode", () => {
  //   expect(Parser.parse("'\uFFFF'", parser => parser.literal())).to.deep.equal({
  //     type: "CHAR_LITERAL",
  //     value: "'\\uFFFF'"
  //   });
  // });

  it("stringLiteral", () => {
    expect(Parser.parse('"A"', parser => parser.literal())).to.deep.equal({
      type: "STRING_LITERAL",
      value: '"A"'
    });
  });

  it("booleanLiteral", () => {
    expect(Parser.parse("true", parser => parser.literal())).to.deep.equal({
      type: "BOOLEAN_LITERAL",
      value: "true"
    });
  });

  it("nullLiteral", () => {
    expect(Parser.parse("null", parser => parser.literal())).to.deep.equal({
      type: "NULL"
    });
  });
});
