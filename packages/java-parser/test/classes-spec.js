import { expect } from "chai";
import * as javaParser from "../src/index.js";

describe("The Java Parser fixed bugs", () => {
  it("should handle multiple variable declaration", () => {
    const input = `int foo, bar;`;
    expect(() => javaParser.parse(input, "fieldDeclaration")).to.not.throw();
  });
});
