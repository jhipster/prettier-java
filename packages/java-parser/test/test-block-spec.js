import { expect } from "chai";

import * as javaParser from "../src/index.js";

describe("The Java Parser should parse TextBlocks", () => {
  it("should not parse a one word 'TextBlock'", () => {
    const input = `"""word"""`;

    expect(() => javaParser.parse(input, "literal")).to.throw();
  });

  it("should not parse a one word 'TextBlock' with starting spaces", () => {
    const input = `"""   word"""`;

    expect(() => javaParser.parse(input, "literal")).to.throw();
  });

  it("should parse a one word 'TextBlock' starting with new line", () => {
    const input = `"""
    one"""`;

    expect(() => javaParser.parse(input, "literal")).to.not.throw();
  });

  it("should parse a one word 'TextBlock' starting with spaces and new line", () => {
    const input = `"""${"    "}
    one"""`;

    expect(() => javaParser.parse(input, "literal")).to.not.throw();
  });

  it("should parse a one line 'TextBlock' starting with new line", () => {
    const input = `"""
    one sentence"""`;

    expect(() => javaParser.parse(input, "literal")).to.not.throw();
  });

  it("should parse a one line 'TextBlock' starting with spaces and new line", () => {
    const input = `"""${"    "}
    one sentence"""`;

    expect(() => javaParser.parse(input, "literal")).to.not.throw();
  });

  it("should parse a multiline 'TextBlock'", () => {
    const input = `"""
    one word

    sentence

    """`;

    expect(() => javaParser.parse(input, "literal")).to.not.throw();
  });

  it("should not parse a multiline 'TextBlock' which do not start with new line", () => {
    const input = `"""one word

    sentence

    """`;

    expect(() => javaParser.parse(input, "literal")).to.throw();
  });

  it("should parse a multiline 'TextBlock' with ", () => {
    const input = `"""
    one word

    "sentence"

    """`;

    expect(() => javaParser.parse(input, "literal")).to.not.throw();
  });

  it("should not parse a 'TextBlock' ending with 4x\"", () => {
    const input = `"""
    one word

    "sentence"

    """"`;

    expect(() => javaParser.parse(input, "literal")).to.throw();
  });

  it("should not parse a 'TextBlock' ending with 4x\"", () => {
    const input = `"""
    one word

    "sentence"""

    ""`;

    expect(() => javaParser.parse(input, "literal")).to.throw();
  });

  it("should not parse a 'TextBlock' ending with 4x\"", () => {
    const input = `"""
    my text


    sentence\\"""

    """
    `;
    expect(() => javaParser.parse(input, "literal")).to.not.throw();
  });
});
