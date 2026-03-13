import path from "path";
import url from "url";
import { testSample } from "../../test-utils.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

describe("prettier-java", () => {
  testSample(path.resolve(__dirname, "./class"));
  testSample(path.resolve(__dirname, "./edge"));
  testSample(path.resolve(__dirname, "./expression"));
  testSample(path.resolve(__dirname, "./interface"));
  testSample(path.resolve(__dirname, "./package"));
  testSample(
    path.resolve(__dirname, "./comments-blocks-and-statements/complex")
  );
  testSample(
    path.resolve(__dirname, "./comments-blocks-and-statements/if-statement")
  );
  testSample(
    path.resolve(
      __dirname,
      "./comments-blocks-and-statements/labeled-statement"
    )
  );
  testSample(path.resolve(__dirname, "./comments-only"));
  testSample(path.resolve(__dirname, "./bug-fixes"));
});
