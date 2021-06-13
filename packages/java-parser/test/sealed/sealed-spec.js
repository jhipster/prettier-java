"use strict";

const { expect } = require("chai");
const javaParser = require("../../src/index");

describe("Sealed Classes & Interfaces", () => {
  it("should handle sealed interfaces", () => {
    const input = `
    public sealed interface People {}
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle non-sealed interfaces", () => {
    const input = `
    public non-sealed interface People {}
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle sealed interfaces with permits", () => {
    const input = `
    public sealed interface Rectangle permits Square {}
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle sealed class", () => {
    const input = `
    public sealed class People {}
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle non-sealed class", () => {
    const input = `
    public non-sealed class People {}
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle sealed class with permits", () => {
    const input = `
    public sealed class Rectangle permits Square {}
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle sealed and permits as field names", () => {
    const input = `
    public class Rectangle {
      boolean sealed;
      boolean permits;
    }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });
});
