import { expect } from "chai";
import * as javaParser from "../../src/index.js";

describe("Unnamed Class Compilation Unit", () => {
  it("should handle UnnamedClassCompilationUnit", () => {
    const input = `
      void main() {
          System.out.println("Hello, World!");
      }
    `;
    javaParser.parse(input, "compilationUnit");
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle UnnamedClassCompilationUnit with only method", () => {
    const input = `
      void main() {
          System.out.println("Hello, World!");
      }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle UnnamedClassCompilationUnit with fields", () => {
    const input = `
      String greeting = "Hello world!";
      String hourra = "Hourra!";

      void main() {
          System.out.println(greeting);
          System.out.println(hourra);
      }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle UnnamedClassCompilationUnit with class declaration", () => {
    const input = `
      class Test { static String greetings() { return "Hello world!"; } }

      void main() {
          System.out.println(Test.greetings());
      }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle UnnamedClassCompilationUnit with interface declaration", () => {
    const input = `
      interface Test { default String greetings() { return "Hello world!"; } }

      void main() {
          System.out.println(Test.greetings());
      }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle UnnamedClassCompilationUnit with semicolons", () => {
    const input = `
      ;

      void main() {
          System.out.println("Hello World!");
      }
    `;
    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle UnnamedClassCompilationUnit with class member declarations", () => {
    const input = `
      String greeting() { return "Hello, World!"; }

      void main() {
          System.out.println(greeting());
      }
    `;

    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });

  it("should handle UnnamedClassCompilationUnit with imports", () => {
    const input = `
      import com.toto.titi.Test;
      import com.toto.titi.Toast;

      void main() {
          System.out.println(Test.greeting());
      }
    `;

    expect(() => javaParser.parse(input, "compilationUnit")).to.not.throw();
  });
});
