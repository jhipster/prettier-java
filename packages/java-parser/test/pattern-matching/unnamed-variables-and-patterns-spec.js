import { expect } from "chai";
import * as javaParser from "../../src/index.js";

describe("Unnamed Variables & Patterns", () => {
  it("should parse enhanced for loop with unnamed variable", () => {
    const input = `
      for (Order _ : orders) {}
    `;
    expect(() => javaParser.parse(input, "forStatement")).to.not.throw();
  });

  it("should parse simple for loop with unnamed variable", () => {
    const input = `
      for (int i = 0, _ = sideEffect(); i < 10; i++) {}
    `;
    expect(() => javaParser.parse(input, "forStatement")).to.not.throw();
  });

  it("should parse unnamed variable assignment", () => {
    const input = `
      var _ = q.remove();
    `;
    expect(() =>
      javaParser.parse(input, "localVariableDeclarationStatement")
    ).to.not.throw();
  });

  it("should parse multiple unnamed variable assignments", () => {
    const input = `
      var _ = q.remove();
      var _ = q.remove();
    `;
    expect(() => javaParser.parse(input, "blockStatements")).to.not.throw();
  });

  it("should parse unnamed caught exception", () => {
    const input = `
      try {
        int i = Integer.parseInt(s);
      } catch (NumberFormatException _) {
        System.out.println("Bad number: " + s);
      }
    `;
    expect(() => javaParser.parse(input, "tryStatement")).to.not.throw();
  });

  it("should parse multiple unnamed caught exceptions", () => {
    const input = `
      try {}
      catch (Exception _) {}
      catch (Throwable _) {}
    `;
    expect(() => javaParser.parse(input, "tryStatement")).to.not.throw();
  });

  it("should parse try-with-resources with unnamed resource", () => {
    const input = `
      try (var _ = ScopedContext.acquire()) {}
    `;
    expect(() =>
      javaParser.parse(input, "tryWithResourcesStatement")
    ).to.not.throw();
  });

  it("should parse lambda with unnamed parameter", () => {
    const input = `
      stream.collect(Collectors.toMap(String::toUpperCase, _ -> "NODATA"))
    `;
    expect(() => javaParser.parse(input, "primary")).to.not.throw();
  });

  it("should parse switch labels with unnamed pattern variables", () => {
    const input = `
      switch (ball) {
        case RedBall _   -> process(ball);
        case BlueBall _  -> process(ball);
        case GreenBall _ -> stopProcessing();
      }
    `;
    expect(() => javaParser.parse(input, "switchStatement")).to.not.throw();
  });

  it("should parse switch labels with unnamed variables in record patterns", () => {
    const input = `
      switch (box) {
        case Box(RedBall _)   -> processBox(box);
        case Box(BlueBall _)  -> processBox(box);
        case Box(GreenBall _) -> stopProcessing();
        case Box(var _)       -> pickAnotherBox();
      }
    `;
    expect(() => javaParser.parse(input, "switchStatement")).to.not.throw();
  });

  it("should parse switch label with multiple patterns", () => {
    const input = `
      switch (box) {
        case Box(RedBall _), Box(BlueBall _) -> processBox(box);
        case Box(GreenBall _)                -> stopProcessing();
        case Box(var _)                      -> pickAnotherBox();
      }
    `;
    expect(() => javaParser.parse(input, "switchStatement")).to.not.throw();
  });

  it("should parse switch label with multiple patterns and guard", () => {
    const input = `
      case Box(RedBall _), Box(BlueBall _) when x == 42 -> processBox(b);
    `;
    expect(() => javaParser.parse(input, "switchRule")).to.not.throw();
  });

  it("should not parse switch label with multiple guards", () => {
    const input = `
      case Box(RedBall _) when x == 0, Box(BlueBall _) when x == 42 -> processBox(b);
    `;
    expect(() => javaParser.parse(input, "switchRule")).to.throw();
  });

  it("should parse instanceof expression with unnamed pattern", () => {
    const input = `
      if (r instanceof ColoredPoint(Point(int x, int y), _)) {}
    `;
    expect(() => javaParser.parse(input, "ifStatement")).to.not.throw();
  });

  it("should parse switch label with unnamed pattern", () => {
    const input = `
      switch (box) {
        case Box(RedBall _), Box(BlueBall _) -> processBox(box);
        case Box(GreenBall _)                -> stopProcessing();
        case Box(_)                          -> pickAnotherBox();
      }
    `;
    expect(() => javaParser.parse(input, "switchStatement")).to.not.throw();
  });
});
