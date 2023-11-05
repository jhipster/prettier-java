import { expect } from "chai";
import * as javaParser from "../../src/index.js";

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

  it("should handle sealed classes and interfaces inside class declarations", () => {
    const input = `
    public class SealedClasses {
        sealed interface SealedParent {}

        public static sealed abstract class SealedParent permits SealedChild {}

        final static class SealedChild extends SealedParent {}
    }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle non-sealed classes and interfaces inside class declarations", () => {
    const input = `
    public class SealedClasses {
        non-sealed interface SealedParent {}

        public static non-sealed abstract class SealedParent {}

        final static class SealedChild extends SealedParent {}
    }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle sealed classes and interfaces inside interface declarations", () => {
    const input = `
    public interface Test {
        sealed interface Inner {}

        public static sealed abstract class SealedParent {}
    }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle non-sealed classes and interfaces inside interface declarations", () => {
    const input = `
    public interface SealedClasses {
        non-sealed interface Inner {}

        public static non-sealed abstract class SealedParent {}

        final static class SealedChild extends SealedParent {}
    }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });
});
