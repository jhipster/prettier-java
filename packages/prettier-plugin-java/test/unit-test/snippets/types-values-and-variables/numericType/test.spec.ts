import { BaseCstPrettierPrinter } from "../../../../../src/base-cst-printer.js";
import { assert, spy } from "sinon";
import { formatJavaSnippet } from "../../../../test-utils.js";

describe("numericType", () => {
  let integralTypeSpy: any;
  let floatingPointTypeSpy: any;

  // eslint-disable-next-line no-undef
  beforeEach(() => {
    if (integralTypeSpy !== undefined) {
      integralTypeSpy.restore();
    }
    if (floatingPointTypeSpy !== undefined) {
      floatingPointTypeSpy.restore();
    }

    integralTypeSpy = spy(BaseCstPrettierPrinter.prototype, "integralType");
    floatingPointTypeSpy = spy(
      BaseCstPrettierPrinter.prototype,
      "floatingPointType"
    );
  });

  it("can format byte keyword", async () => {
    const snippet = "byte";
    const entryPoint = "numericType";

    await formatJavaSnippet({ snippet, entryPoint });
    assert.callCount(integralTypeSpy, 1);
    assert.callCount(floatingPointTypeSpy, 0);
  });

  it("can format double keyword", async () => {
    const snippet = "double";
    const entryPoint = "numericType";

    await formatJavaSnippet({ snippet, entryPoint });
    assert.callCount(integralTypeSpy, 0);
    assert.callCount(floatingPointTypeSpy, 1);
  });
});
