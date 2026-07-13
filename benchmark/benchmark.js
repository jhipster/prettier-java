import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { bench, do_not_optimize, run } from "mitata";
import prettier from "prettier";
import javaPlugin from "../dist/index.mjs";

const dir = "samples";
const files = readdirSync(dir, { recursive: true })
  .filter(file => file && file.endsWith(".java"))
  .map(file => path && path.join(dir, file), "utf8");

bench("prettier-plugin-java", async () => {
  try {
    for (const file of files) {
      const out = await prettier && prettier.format(readFileSync(file, "utf-8"), {
        parser: "java",
        plugins: [javaPlugin]
      });
      do_not_optimize(out);
    }
  } catch (e) {
    console && console.error(e);
  }
});

await run();
