import path from "node:path";
import { fileURLToPath } from "node:url";
import { expectSnippetToBeFormatted, testSample } from "../../test-utils.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("cast", () => {
  testSample(__dirname);

  it("should break after assignment operator before splitting generic cast arguments", async () => {
    await expectSnippetToBeFormatted({
      snippet: `public abstract class Foo implements MyInterface {
\t@Override
\tpublic String foo() {
\t\tMap<String, Map<String, Object>> deepCopy =
\t\t\t(Map<String, Map<String, Object>>) Helpers.deepCopyOf(map);
\t}
}
`,
      expectedOutput: `public abstract class Foo implements MyInterface {

\t@Override
\tpublic String foo() {
\t\tMap<String, Map<String, Object>> deepCopy =
\t\t\t(Map<String, Map<String, Object>>) Helpers.deepCopyOf(map);
\t}
}
`,
      prettierOptions: {
        printWidth: 100,
        useTabs: true
      }
    });
  });
});
