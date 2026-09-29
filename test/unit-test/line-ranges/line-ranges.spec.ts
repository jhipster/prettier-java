import { expect } from "chai";
import { formatJavaSnippet } from "../../test-utils.ts";

const unformatted = `package a;
import   java.util.List;
import   java.util.ArrayList;
class A {
    private int  x=1;


    void a( ) {   int x=1;   }
    /** About b. */
    void b( ) {
        int y=2; // two
        if(y>1){y++;}
    }
    void c( ) {   int z=3;   }

}
`;

async function format(code: string, lineRanges: string) {
  return formatJavaSnippet({
    snippet: code,
    prettierOptions: { tabWidth: 4, lineRanges }
  });
}

describe("prettier-java: lineRanges", () => {
  it("formats only the declarations within the ranges", async () => {
    expect(await format(unformatted, "10-13")).to.equal(`package a;
import   java.util.List;
import   java.util.ArrayList;
class A {
    private int  x=1;


    void a( ) {   int x=1;   }
    /** About b. */
    void b() {
        int y = 2; // two
        if (y > 1) {
            y++;
        }
    }

    void c( ) {   int z=3;   }

}
`);
  });

  it("formats only the statements within the ranges", async () => {
    expect(await format(unformatted, "12")).to.equal(`package a;
import   java.util.List;
import   java.util.ArrayList;
class A {
    private int  x=1;


    void a( ) {   int x=1;   }
    /** About b. */
    void b() {
        int y=2; // two
        if (y > 1) {
            y++;
        }
    }
    void c( ) {   int z=3;   }

}
`);
  });

  it("keeps the original spacing and import order around unchanged code", async () => {
    const output = await format(unformatted, "8");
    expect(output).to.contain(
      "import   java.util.List;\nimport   java.util.ArrayList;\nclass A {"
    );
    expect(output).to.contain("private int  x=1;\n\n\n    void a() {");
    expect(output).to.contain("void c( ) {   int z=3;   }\n\n}\n");
  });

  it("formats all imports when one of them is within the ranges", async () => {
    const output = await format(unformatted, "3");
    expect(output).to.contain(
      "package a;\n\nimport java.util.ArrayList;\nimport java.util.List;\n\nclass A {"
    );
    expect(output).to.contain("private int  x=1;");
  });

  it("formats like without ranges when the ranges cover the whole file", async () => {
    const lines = unformatted.split("\n").length;
    expect(await format(unformatted, `1-${lines}`)).to.equal(
      await format(unformatted, "")
    );
  });

  it("leaves a file without changes in the ranges unchanged", async () => {
    const code = `class A {
    void a( ) {   int x=1;   }
}
`;
    expect(await format(code, "5")).to.equal(code);
  });

  it("keeps comments of unchanged code", async () => {
    const code = `class A {
    /**
     * Javadoc.
     */
    void a( ) {   // trailing
        /* block */ int x=1;
    }
    void b( ) {   int y=2;   }
}
`;
    const output = await format(code, "8");
    expect(output).to.contain(`    /**
     * Javadoc.
     */
    void a( ) {   // trailing
        /* block */ int x=1;
    }`);
    expect(output).to.contain("void b() {\n        int y = 2;\n    }");
  });

  it("still respects prettier-ignore within the ranges", async () => {
    const code = `class A {
    // prettier-ignore
    void a( ) {   int x=1;   }
    void b( ) {   int y=2;   }
}
`;
    const output = await format(code, "2-4");
    expect(output).to.contain("void a( ) {   int x=1;   }");
    expect(output).to.contain("void b() {");
  });

  it("formats members of nested classes", async () => {
    const code = `class A {
    class B {
        void a( ) {   int x=1;   }
        void b( ) {   int y=2;   }
    }
}
`;
    const output = await format(code, "4");
    expect(output).to.contain("void a( ) {   int x=1;   }");
    expect(output).to.contain("void b() {\n            int y = 2;\n        }");
  });

  it("accepts single lines and spaces", async () => {
    await format(unformatted, " 2 , 5 - 6 ");
  });

  for (const invalid of ["0", "5-3", "a", "1-2-3", "1,"]) {
    it(`rejects the invalid value "${invalid}"`, async () => {
      let error: unknown;
      try {
        await format(unformatted, invalid);
      } catch (e) {
        error = e;
      }
      expect(String(error)).to.contain("Invalid lineRanges");
    });
  }
});
