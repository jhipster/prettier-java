"use strict";

const { expect } = require("chai");
const javaParser = require("../../src/index");

describe("The Java Parser fixed bugs", () => {
  it("should handle Java 13 switch rules", () => {
    const input = `switch (k) {
      case 1 -> System.out.println("one");
      case 2 -> {System.out.println("two");}
      case 3 -> throw new Exception(e);
    }`;
    expect(() => javaParser.parse(input, "switchStatement")).to.not.throw();
  });

  it("should not handle Java 13 switch blocks with mixed rules and classic statements", () => {
    const input = `switch (k) {
      case 1 -> System.out.println("one");
      case 2 -> {System.out.println("two");}
      case 3 -> throw new Exception(e);
      case 4: System.out.println("four");
    }`;
    expect(() => javaParser.parse(input, "switchStatement")).to.throw();
  });

  it("should not handle Java 13 switch blocks with mixed rules and classic statements (2)", () => {
    const input = `switch (k) {
      case 1: System.out.println("one");
      case 2 -> {System.out.println("two");}
      case 3 -> throw new Exception(e);
      case 4 -> System.out.println("four");
    }`;
    expect(() => javaParser.parse(input, "switchStatement")).to.throw();
  });

  it("should not handle Java 13 switch blocks with mixed rules and classic statements (2)", () => {
    const input = `switch (k) {
      case SATURDAY -> zd.ordinal;
    }`;
    expect(() => javaParser.parse(input, "switchStatement")).to.not.throw();
  });
});
