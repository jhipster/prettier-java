import { expect } from "chai";
import * as javaParser from "../../src/index.js";

describe("Switch cases", () => {
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

  it("should handle pattern matching in switch rules", () => {
    const input = `switch (o) {
      case Integer i -> String.format("int %d", i);
      case Long l -> String.format("long %d", l);
      case Double d -> String.format("double %f", d);
      case String s -> String.format("String %s", s);
      case TOTO -> String.format("TOTO %s", o);
      case null -> String.format("Null !");
      case null, default -> String.format("Default !");
      default -> o.toString();
    }`;
    expect(() => javaParser.parse(input, "switchStatement")).to.not.throw();
  });

  it("should handle pattern matching in classic switch cases", () => {
    const input = `switch (o) {
        case Integer i :
          yield  "It is an integer";
        case Double d :
        case String s:
          yield  "It is an something else";
    }`;
    expect(() => javaParser.parse(input, "switchStatement")).to.not.throw();
  });

  it("should handle switch cases with empty blocks at the end", () => {
    const input = `switch (o) {
        case String s:
          yield  "It is an something";
        default:
    }`;
    expect(() => javaParser.parse(input, "switchStatement")).to.not.throw();
  });
});
