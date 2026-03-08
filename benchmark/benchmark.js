import fs from "node:fs";
import path from "node:path";
import { bench, do_not_optimize, run } from "mitata";
import prettier from "prettier";
import javaPlugin from "prettier-plugin-java";

const dir = "../packages/prettier-plugin-java/samples";
const files = fs
  .readdirSync(dir, { recursive: true })
  .filter(file => file.endsWith(".java"))
  .map(file => path.join(dir, file), "utf8");

bench("prettier-plugin-java", async () => {
  try {
    for (const file of files) {
      const out = await prettier.format(fs.readFileSync(file, "utf-8"), {
        parser: "java",
        plugins: [javaPlugin]
      });
      do_not_optimize(out);
    }
  } catch (e) {
    console.error(e);
  }
});

await run();
