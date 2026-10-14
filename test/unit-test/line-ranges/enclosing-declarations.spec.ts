import { expect } from "chai";
import { formatJavaSnippet } from "../../test-utils.ts";

// Regression cases for lines outside `lineRanges` that were formatted anyway:
// an edit inside a method body reformatted the annotations of the enclosing
// method and class, and adding one import re-sorted the whole import block.
// Each case changes a single line and expects every other line to be kept.

async function format(code: string, lineRanges: string) {
  return formatJavaSnippet({
    snippet: code,
    prettierOptions: { tabWidth: 4, printWidth: 120, lineRanges }
  });
}

describe("prettier-java: lineRanges on enclosing declarations", () => {
  it("keeps the class annotation when only a statement in a method changes", async () => {
    const code = `@SomeAnnotation(
        first = "a",
        second = "b",
        methods = {"POST"}
)
public class Demo {

    public String run(Optional<String> value) {
        if (value.isPresent()) {
            return value.get();
        }
        return  "empty";
    }
}
`;
    expect(await format(code, "12")).to.equal(
      code.replace('return  "empty";', 'return "empty";')
    );
  });

  it("keeps the method annotation when only a statement in its body changes", async () => {
    const code = `public class Demo {
    @Deprecated(
            since = "1",
            forRemoval = true
    )
    public String first() {
        final var x = 1;
        return  "a";
    }
}
`;
    expect(await format(code, "8")).to.equal(
      code.replace('return  "a";', 'return "a";')
    );
  });

  it("keeps the other imports when a single import is added", async () => {
    const code = `package demo;

import java.util.Optional;

import org.example.Zeta;
import com.example.Alpha;
import com.example.Beta;

import static java.util.Objects.requireNonNull;

public class Demo {}
`;
    expect(await format(code, "7")).to.equal(code);
  });

  it("keeps the annotation of a sibling method", async () => {
    const code = `public class Demo {
    @Deprecated(
            since = "1",
            forRemoval = true
    )
    public String first() {
        return "a";
    }

    public String second() {
        return  "b";
    }
}
`;
    expect(await format(code, "11")).to.equal(
      code.replace('return  "b";', 'return "b";')
    );
  });
});
