import path from "node:path";
import { fileURLToPath } from "node:url";
import { testSample } from "../../test-utils.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("arrays", () => {
  testSample(__dirname);
});
