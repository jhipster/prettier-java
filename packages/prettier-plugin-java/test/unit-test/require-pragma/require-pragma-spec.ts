import path from "path";
import url from "url";
import fs from "fs-extra";
import { testSampleWithOptions } from "../../test-utils.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

describe("prettier-java: require-pragma option", () => {
  [
    path.resolve(__dirname, "./format-pragma"),
    path.resolve(__dirname, "./prettier-pragma"),
    path.resolve(__dirname, "./invalid-pragma")
  ].forEach(testFolder => {
    const optionsPath = path.join(testFolder, "prettier-options.json");
    const options = fs.existsSync(optionsPath)
      ? fs.readJsonSync(optionsPath)
      : { requirePragma: true };

    testSampleWithOptions({
      testFolder,
      prettierOptions: options
    });
  });
});
