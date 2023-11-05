import { assert, spy } from "sinon";
import { BaseCstPrettierPrinter } from "../../../../../src/base-cst-printer.js";
import { expectSnippetToBeFormatted } from "../../../../test-utils.js";

describe("Wildcard Bounds", () => {
  let referenceTypeSpy: any;

  // eslint-disable-next-line no-undef
  beforeEach(() => {
    if (referenceTypeSpy !== undefined) {
      referenceTypeSpy.restore();
    }
    referenceTypeSpy = spy(BaseCstPrettierPrinter.prototype, "referenceType");
  });

  it("can format a wildcardBounds with extends", async () => {
    await expectSnippetToBeFormatted({
      snippet: "extends int[]",
      expectedOutput: "extends int[]",
      entryPoint: "wildcardBounds"
    });
    assert.callCount(referenceTypeSpy, 2);
  });

  it("can format a wildcardBounds with super", async () => {
    await expectSnippetToBeFormatted({
      snippet: "super int[]",
      expectedOutput: "super int[]",
      entryPoint: "wildcardBounds"
    });
    assert.callCount(referenceTypeSpy, 2);
  });
});
