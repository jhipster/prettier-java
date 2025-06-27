/*eslint no-console: ["error", { allow: ["error"] }] */

import { expect } from "chai";
import { spawnSync } from "child_process";
import fs from "fs-extra";
import klawSync from "klaw-sync";
import { basename, dirname, relative, resolve } from "path";
import { format } from "prettier";
import url from "url";
import plugin from "../src/index.js";

const { readFileSync, existsSync, removeSync, copySync } = fs;

const __dirname = dirname(url.fileURLToPath(import.meta.url));
export function testSampleWithOptions({
  testFolder,
  exclusive
}: {
  testFolder: string;
  exclusive?: boolean;
}) {
  const itOrItOnly = exclusive ? it.only : it;
  const inputPath = resolve(testFolder, "_input.java");
  const expectedPath = resolve(testFolder, "_output.java");
  const relativeInputPath = relative(__dirname, inputPath);

  let inputContents: string;
  let expectedContents: string;

  const prettierrcPath = resolve(testFolder, ".prettierrc.json");
  const prettierOptions = existsSync(prettierrcPath)
    ? fs.readJsonSync(prettierrcPath)
    : {};

  // @ts-ignore
  before(() => {
    inputContents = readFileSync(inputPath, "utf8");
    expectedContents = readFileSync(expectedPath, "utf8");
  });

  itOrItOnly(`can format <${relativeInputPath}>`, async () => {
    const actual = await formatJavaSnippet({
      snippet: inputContents,
      prettierOptions
    });

    expect(actual).to.equal(expectedContents);
  });

  it(`Performs a stable formatting for <${relativeInputPath}>`, async () => {
    const onePass = await formatJavaSnippet({
      snippet: inputContents,
      prettierOptions
    });

    const secondPass = await formatJavaSnippet({
      snippet: onePass,
      prettierOptions
    });
    expect(onePass).to.equal(secondPass);
  });
}

export function testSample(testFolder: string, exclusive?: boolean) {
  testSampleWithOptions({ testFolder, exclusive });
}

export function testRepositorySample(
  testFolder: string,
  command: string,
  args: string[]
) {
  describe(`Prettify the repository <${testFolder}>`, function () {
    this.timeout(0);

    const testsamples = resolve(__dirname, "../test-samples");
    const samplesDir = resolve(testsamples, basename(testFolder));

    if (existsSync(samplesDir)) {
      removeSync(samplesDir);
    }
    copySync(testFolder, samplesDir);

    const sampleFiles = klawSync(resolve(__dirname, samplesDir), {
      nodir: true
    });
    const javaSampleFiles = sampleFiles.filter(fileDesc =>
      fileDesc.path.endsWith(".java")
    );

    javaSampleFiles.forEach(fileDesc => {
      it(`Performs a stable formatting for <${relative(
        samplesDir,
        fileDesc.path
      )}>`, async () => {
        const javaFileText = readFileSync(fileDesc.path, "utf8");

        const onePass = await formatJavaSnippet({ snippet: javaFileText });
        const secondPass = await formatJavaSnippet({ snippet: onePass });
        expect(onePass).to.equal(secondPass);
      });
    });

    it(`verify semantic validity ${testFolder}`, function () {
      const code = spawnSync(command, args, {
        cwd: samplesDir,
        maxBuffer: Infinity
      });
      if (code.status !== 0) {
        console.log("error", code.error);
        console.log("stderr", code.stderr);
        (code.output ?? []).forEach(out => console.log("output", out));

        expect.fail(
          `Cannot build ${testFolder}, please check the output below:\n${code.error ?? code.stderr}`
        );
      }
    });
  });
}

export async function formatJavaSnippet({
  snippet,
  entryPoint,
  prettierOptions = {}
}: {
  snippet: string;
  entryPoint?: string;
  prettierOptions?: any;
}) {
  return await format(snippet, {
    parser: "java",
    plugins: [plugin],
    entrypoint: entryPoint,
    ...prettierOptions
  });
}

export async function expectSnippetToBeFormatted({
  snippet,
  expectedOutput,
  entryPoint,
  prettierOptions = {}
}: {
  snippet: string;
  expectedOutput: string;
  entryPoint: string;
  prettierOptions?: any;
}) {
  const onePass = await formatJavaSnippet({
    snippet,
    entryPoint,
    prettierOptions
  });
  const secondPass = await formatJavaSnippet({
    snippet: onePass,
    entryPoint,
    prettierOptions
  });

  expect(onePass).to.equal(expectedOutput);
  expect(secondPass).to.equal(expectedOutput);
}
